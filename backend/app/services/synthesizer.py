import re
from typing import List, Dict, Any, Optional
from app.services.report_generator import ReportGenerator

class Synthesizer:
    """
    Governance Layer for BeeYield AI.
    Ensures structured synthesis and factual grounding before output.
    """

    @staticmethod
    async def synthesize_response(
        raw_context: Dict[str, Any], 
        query: str, 
        user_intent: str = "GENERAL"
    ) -> str:
        """
        Synthesizes a structured response from partitioned namespaces.
        """
        # --- 1. NAMESPACE PARTITIONING ---
        # Isolate data based on source metadata to prevent 'Model Metadata Null' errors
        global_research = []
        company_internal = []
        iot_telemetry = []
        
        # simulated partitioning logic
        for node in raw_context.get("top_hits", []):
            source_type = node.get("type", "SEMANTIC")
            if source_type == "METADATA":
                iot_telemetry.append(node)
            elif node.get("is_internal") or "BeeYield" in node.get("content", ""):
                company_internal.append(node)
            else:
                global_research.append(node)

        # --- 2. THE FIVE-PILLAR FRAMEWORK ---
        prompt = (
            f"USER QUERY: {query}\n"
            f"INTENT CATEGORY: {user_intent}\n\n"
            f"--- DATA ARCHIVE ---\n"
            f"UNIVERSITY RESEARCH (400+ papers): {global_research[:3]}\n"
            f"INTERNAL BUSINESS LOGS: {company_internal[:2]}\n"
            f"IOT & SENSOR DATA (BeeHero/APISENSE): {iot_telemetry[:2]}\n\n"
            f"--- MANDATORY GOVERNANCE PROTOCOL ---\n"
            f"STRUCTURE YOUR OUTPUT INTO THESE FIVE SECTIONS:\n"
            f"I. INTELLIGENCE BRIEF: Technical 2-paragraph summary.\n"
            f"II. DIAGNOSIS & PREVENTION: Methodology using APISENSE VOC metrics.\n"
            f"III. REGIONAL CONTEXT: Findings from PLOS One (2025-2026).\n"
            f"IV. INTERNAL OPERATIONS: Correlate query with BeeYield harvest yields.\n"
            f"V. VERIFIED BIBLIOGRAPHY: Clickable links with Doi verification.\n\n"
            f"RULES:\n"
            f"- If a link is not verified in context, do not display it.\n"
            f"- Use numbered citations [X] throughout the text."
        )
        
        return prompt # The AIService will use this in the LLM call

    @staticmethod
    def verify_governance(output: str) -> bool:
        """Checks if the output meets the 5-Pillar requirement."""
        pillars = ["I. INTELLIGENCE BRIEF", "II. DIAGNOSIS", "III. REGIONAL", "IV. INTERNAL", "V. VERIFIED"]
        return all(p in output.upper() for p in pillars)
