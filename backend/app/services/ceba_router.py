"""
CEBA AI Complexity Router & Distillation Dispatcher (Stage 5)
Directs incoming agronomic/apiculture requests to either the fine-tuned
Local Edge Student (Llama 3.1 8B / Qwen 2.5 7B via Ollama/vLLM) or
escalates to the Cloud Teacher (Claude 3.5 Sonnet).

Provides continuous logging for the active distillation feedback loop.
"""

import os
import json
import time
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import httpx

from app.core.config import settings
from app.services.ceba_context_engine import (
    ScopedContextPayload,
    execute_ceba_ai_engine,
    validate_and_sanitize_output,
)
from app.schemas.diagnostic import (
    parse_and_standardize_diagnostic_output,
    post_process_and_lint_diagnostic,
)

logger = logging.getLogger("beeyield.ceba_router")

# Filepath for capturing escalated queries to augment the student's training corpus
DISTILLATION_LOG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "distillation_candidates.jsonl"
)


class ComplexityDecision:
    """Encapsulates the routing evaluation decision and telemetry findings."""
    def __init__(
        self,
        target: str,  # "STUDENT" or "TEACHER"
        reason: str,
        anomaly_flags: Optional[List[str]] = None,
        confidence: float = 1.0,
    ):
        self.target = target
        self.reason = reason
        self.anomaly_flags = anomaly_flags or []
        self.confidence = confidence

    def to_dict(self) -> Dict[str, Any]:
        return {
            "target": self.target,
            "reason": self.reason,
            "anomaly_flags": self.anomaly_flags,
            "confidence": self.confidence,
        }


class ComplexityRouter:
    """
    Evaluates incoming telemetry metrics and semantic query triggers
    to determine whether the request can be fulfilled by the 8B student model
    at single-digit ms/token, or requires Claude 3.5 Sonnet's deep multi-step reasoning.
    """

    def __init__(self):
        # Biosecurity & Telemetry Thresholds
        self.CRITICAL_TEMP_HIGH = 37.0       # Brood fever / hyperthermia
        self.CRITICAL_TEMP_LOW = 32.0        # Chilled brood / thermoregulation failure
        self.MAX_WEIGHT_DROP_24H = 1.0       # kg/24h (Swarming / severe robbing indicator)
        self.CRITICAL_ACOUSTIC_HZ = 270.0    # Queenless distress / piping frequency
        self.MIN_INSPECTION_TEMP_C = 12.0    # Ambient minimum for opening hive

        # Semantic Escalation Keywords
        self.COMPLEX_TRIGGERS = [
            "disease",
            "foulbrood",
            "afb",
            "efb",
            "pesticide",
            "poisoning",
            "deadout",
            "unknown",
            "colony collapse",
            "ccd",
            "varroa destructor",
            "queenless",
            "chalkbrood",
            "nosema",
            "legal compliance",
            "export certification",
        ]
        self.router_mode = getattr(settings, "CEBA_ROUTER_MODE", "hybrid")

    def assess_complexity(
        self,
        context: ScopedContextPayload,
        query: str
    ) -> ComplexityDecision:
        """
        Determines routing target (STUDENT vs. TEACHER) based on telemetry
        anomalies and query semantic risk.
        """
        if getattr(self, "router_mode", "hybrid") == "teacher_only":
            return ComplexityDecision(target="TEACHER", reason="Config override: teacher_only", confidence=1.0)
        if getattr(self, "router_mode", "hybrid") == "student_only":
            return ComplexityDecision(target="STUDENT", reason="Config override: student_only", confidence=1.0)

        lower_query = query.lower()
        anomalies: List[str] = []

        # 1. Semantic Risk & Keyword Checks
        matched_triggers = [t for t in self.COMPLEX_TRIGGERS if t in lower_query]
        if matched_triggers:
            return ComplexityDecision(
                target="TEACHER",
                reason=f"Query contains high-complexity biosecurity keywords: {', '.join(matched_triggers)}",
                anomaly_flags=matched_triggers,
                confidence=0.98,
            )

        # 2. Telemetry In-Hive Anomaly Evaluation
        hives = context.queried_hives_telemetry or []
        for hive in hives:
            m = hive.in_hive_metrics
            hive_name = hive.hive_name

            # Temperature checks
            if m.brood_temp_c >= self.CRITICAL_TEMP_HIGH:
                anomalies.append(f"{hive_name}: Critical high brood temp ({m.brood_temp_c}°C >= {self.CRITICAL_TEMP_HIGH}°C)")
            elif m.brood_temp_c <= self.CRITICAL_TEMP_LOW:
                anomalies.append(f"{hive_name}: Critical low brood temp ({m.brood_temp_c}°C <= {self.CRITICAL_TEMP_LOW}°C)")

            # Weight drop checks
            if m.daily_weight_delta_kg <= -self.MAX_WEIGHT_DROP_24H:
                anomalies.append(f"{hive_name}: Severe 24h weight loss ({m.daily_weight_delta_kg}kg <= -{self.MAX_WEIGHT_DROP_24H}kg)")

            # Acoustic distress checks
            if m.acoustic_frequency_hz >= self.CRITICAL_ACOUSTIC_HZ:
                anomalies.append(f"{hive_name}: Elevated acoustic frequency ({m.acoustic_frequency_hz}Hz >= {self.CRITICAL_ACOUSTIC_HZ}Hz)")

            # Pest flag
            pest_lower = (m.pest_flag or "").lower()
            if "positive" in pest_lower or "detected" in pest_lower or "warning" in pest_lower:
                anomalies.append(f"{hive_name}: Pest flagged: {m.pest_flag}")

        # 3. Ambient Weather Constraints
        for apiary in context.active_apiaries or []:
            node = apiary.inland_weather_node
            if node.temp_c < self.MIN_INSPECTION_TEMP_C and ("inspect" in lower_query or "open" in lower_query):
                anomalies.append(
                    f"{apiary.apiary_name}: Critical cold ambient risk: Inspection requested at cold ambient temp ({node.temp_c}°C < {self.MIN_INSPECTION_TEMP_C}°C)"
                )

        # 4. Multi-Anomaly Escalation Policy
        # Single mild anomaly can be handled by student, but multiple simultaneous anomalies require Teacher synthesis
        if len(anomalies) >= 2 or any("Critical" in a for a in anomalies):
            return ComplexityDecision(
                target="TEACHER",
                reason=f"Multiple or severe telemetry anomalies detected ({len(anomalies)} triggers)",
                anomaly_flags=anomalies,
                confidence=0.95,
            )

        # 5. Default to Distilled Student
        return ComplexityDecision(
            target="STUDENT",
            reason="Telemetry metrics nominal; routine inquiry handled by 8B student model",
            anomaly_flags=anomalies,
            confidence=0.92,
        )

    async def execute_student(
        self,
        query: str,
        context: ScopedContextPayload
    ) -> Optional[str]:
        """
        Executes query against local fine-tuned student running via Ollama / vLLM.
        Falls back to None if the edge daemon is unreachable.
        """
        ollama_url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
        payload_json = json.dumps(context.model_dump(), indent=2)

        prompt = (
            f"### Hive Telemetry Context:\n{payload_json}\n\n"
            f"### User Query:\n{query}\n\n"
            f"### Assistant Diagnostic Reasoning & Action Plan:"
        )

        system_instruction = (
            "You are CEBA AI, an authoritative edge-optimized apiculture diagnostic system deployed on a BeeYield gateway.\n\n"
            "Operating Rules:\n"
            "1. Evaluate telemetry systematically (temperature, weight dynamics, acoustics, brood state).\n"
            "2. Adhere strictly to biosecurity thresholds: never recommend synthetic chemical miticides during an active honey flow, "
            "and never advise opening hives or inspecting brood frames when ambient temperature is below 12°C.\n\n"
            "Formatting & Grammar Rules:\n"
            "1. Use professional, active-voice English. Ensure flawless grammar and punctuation.\n"
            "2. Structure the diagnostic rationale as a numbered Markdown list.\n"
            "3. Structure the action plan as an array of concise, active-voice actionable steps.\n"
            "4. Do not include conversational filler, greetings, or sign-offs.\n"
            "5. Emit your diagnostic reasoning first, followed by valid JSON containing alert_level (INFO, WARNING, or CRITICAL), "
            "primary_issue, formatted_rationale, action_plan, and telemetry_snapshot."
        )

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(
                    ollama_url,
                    json={
                        "model": settings.CEBA_STUDENT_MODEL,
                        "prompt": prompt,
                        "system": system_instruction,
                        "stream": False,
                        "options": {
                            "temperature": 0.2,
                            "top_p": 0.9,
                            "num_predict": 512,
                        }
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    response_text = data.get("response", "").strip()
                    if response_text:
                        return response_text
        except Exception as e:
            logger.warning("Local edge student model unreachable via Ollama (%s). Returning None to escalate without guessing.", e)
            return None

        return None

    async def execute_student_inference(
        self,
        query: str,
        context: ScopedContextPayload
    ) -> Optional[str]:
        """Delegates to execute_student ensuring test patches apply consistently."""
        return await self.execute_student(query, context)

    async def log_distillation_candidate(
        self,
        query: str,
        context: ScopedContextPayload,
        decision: ComplexityDecision,
        teacher_response: str,
    ) -> None:
        """
        Appends complex/escalated samples to a JSONL file to feed continuous
        knowledge distillation for future student model iterations.
        """
        try:
            os.makedirs(os.path.dirname(DISTILLATION_LOG_PATH), exist_ok=True)
            record = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "query": query,
                "reason": decision.reason,
                "anomalies": decision.anomaly_flags,
                "telemetry_summary": {
                    "hives_count": len(context.queried_hives_telemetry),
                    "apiaries_count": len(context.active_apiaries),
                },
                "teacher_response": teacher_response,
            }
            with open(DISTILLATION_LOG_PATH, "a", encoding="utf-8") as f:
                f.write(json.dumps(record) + "\n")
        except Exception as err:
            logger.warning("Failed to log distillation candidate: %s", err)

    async def route_and_execute(
        self,
        query: str,
        context: ScopedContextPayload
    ) -> Dict[str, Any]:
        """
        Main entry point: assesses complexity, dispatches to appropriate model,
        sanitizes response, logs distillation metrics, and returns payload.
        """
        start_time = time.perf_counter()
        decision = self.assess_complexity(context, query)
        response_text: str = ""
        model_used: str = ""

        if decision.target == "STUDENT":
            logger.info("ComplexityRouter: Routing to Student (Llama 3.1 8B). Reason: %s", decision.reason)
            res = await self.execute_student_inference(query, context)
            if res:
                response_text = res
                model_used = f"{settings.CEBA_STUDENT_MODEL} (Edge Student)"
            else:
                # Emergency fallback to Teacher if student failed completely
                logger.warning("ComplexityRouter: Student failed, escalating fallback to Teacher")
                response_text = await execute_ceba_ai_engine(query, context)
                model_used = "claude-3-5-sonnet (Teacher Fallback)"
        else:
            logger.info("ComplexityRouter: Escalating to Teacher (Claude 3.5 Sonnet). Reason: %s", decision.reason)
            response_text = await execute_ceba_ai_engine(query, context)
            model_used = "claude-3-5-sonnet (Cloud Teacher)"

            # Log candidate query & response for continuous distillation
            await self.log_distillation_candidate(query, context, decision, response_text)

        # Sanitize output through security rules
        sanitized_response = validate_and_sanitize_output(response_text)
        latency_ms = int((time.perf_counter() - start_time) * 1000)

        # Enforce strict output schema & post-processing grammar linter (PRD Sections 4.2 & 4.3)
        default_alert = "CRITICAL" if any("critical" in a.lower() for a in decision.anomaly_flags) else (
            "WARNING" if decision.anomaly_flags else "INFO"
        )
        standardized_diag = parse_and_standardize_diagnostic_output(
            raw_text=sanitized_response,
            context=context,
            query=query,
            default_alert_level=default_alert,
        )
        standardized_diag = post_process_and_lint_diagnostic(standardized_diag)
        ui_markdown = standardized_diag.to_markdown()

        return {
            "response": ui_markdown,
            "standardized_response": standardized_diag.model_dump(),
            "diagnostic": standardized_diag,
            "raw_response": sanitized_response,
            "model": model_used,
            "model_used": model_used,
            "decision": decision.target,
            "reason": decision.reason,
            "anomalies": decision.anomaly_flags,
            "latency_ms": latency_ms,
        }


# Singleton router instance for high efficiency
complexity_router = ComplexityRouter()

def get_complexity_router() -> ComplexityRouter:
    """Returns the singleton ComplexityRouter instance."""
    return complexity_router
