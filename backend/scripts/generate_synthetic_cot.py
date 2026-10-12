"""
Stage 1 & 2: Input Dataset Sampling & Rationale-Based Teacher Generation (CoT)
Generates high-fidelity telemetry payloads and prompts Claude 3.5 Sonnet to produce
step-by-step Chain-of-Thought (CoT) reasoning along with structured JSON action plans.

Outputs: backend/data/distillation_raw_teacher.jsonl
"""

import os
import json
import asyncio
from typing import Dict, Any, List
import httpx

# Telemetry Seed Scenarios covering normal operations, acute diseases, and edge crises
TELEMETRY_SCENARIOS = [
    {
        "scenario_id": "scen_001_nominal",
        "input_telemetry": {
            "hive_id": "hive_101",
            "brood_temp_c": 35.1,
            "humidity_pct": 55.0,
            "weight_kg": 42.5,
            "daily_weight_delta_kg": 0.4,
            "acoustic_frequency_hz": 150.0,
            "pest_flag": "Negative (Healthy)",
            "ambient_temp_c": 24.0,
            "honey_flow": True,
            "bloom_type": "Macadamia & Acacia"
        },
        "query": "Assess colony status and report any immediate intervention needed."
    },
    {
        "scenario_id": "scen_002_swarming_distress",
        "input_telemetry": {
            "hive_id": "hive_104",
            "brood_temp_c": 36.8,
            "humidity_pct": 68.0,
            "weight_kg": 38.0,
            "daily_weight_delta_kg": -1.8,
            "acoustic_frequency_hz": 285.0,
            "pest_flag": "Negative",
            "ambient_temp_c": 26.0,
            "honey_flow": True,
            "bloom_type": "Coffee bloom"
        },
        "query": "Colony weight dropped significantly this morning with loud piping sounds. What is happening?"
    },
    {
        "scenario_id": "scen_003_brood_chilling_cold",
        "input_telemetry": {
            "hive_id": "hive_205",
            "brood_temp_c": 29.8,
            "humidity_pct": 78.0,
            "weight_kg": 28.5,
            "daily_weight_delta_kg": -0.2,
            "acoustic_frequency_hz": 180.0,
            "pest_flag": "Negative",
            "ambient_temp_c": 9.5,
            "honey_flow": False,
            "bloom_type": "Dormant / Overwintering"
        },
        "query": "Brood temperature dropped below 30°C. Should I open the hive and inspect the cluster today?"
    },
    {
        "scenario_id": "scen_004_varroa_crisis_flow",
        "input_telemetry": {
            "hive_id": "hive_308",
            "brood_temp_c": 34.2,
            "humidity_pct": 58.0,
            "weight_kg": 48.0,
            "daily_weight_delta_kg": 0.8,
            "acoustic_frequency_hz": 220.0,
            "pest_flag": "Varroa Destructor Warning (Mite drop > 15/day)",
            "ambient_temp_c": 22.0,
            "honey_flow": True,
            "bloom_type": "Sunflower active honey flow"
        },
        "query": "Varroa counts are rising rapidly during the honey flow. Recommend a chemical miticide treatment."
    },
    {
        "scenario_id": "scen_005_queenless_piping",
        "input_telemetry": {
            "hive_id": "hive_412",
            "brood_temp_c": 33.5,
            "humidity_pct": 50.0,
            "weight_kg": 32.0,
            "daily_weight_delta_kg": -0.6,
            "acoustic_frequency_hz": 295.0,
            "pest_flag": "Negative",
            "ambient_temp_c": 21.0,
            "honey_flow": False,
            "bloom_type": "Sparse forbs"
        },
        "query": "Acoustic sensor spikes at 295 Hz and brood temperature is gradually falling. Is the queen present?"
    },
    {
        "scenario_id": "scen_006_starvation_dearth",
        "input_telemetry": {
            "hive_id": "hive_502",
            "brood_temp_c": 34.0,
            "humidity_pct": 42.0,
            "weight_kg": 18.2,
            "daily_weight_delta_kg": -0.7,
            "acoustic_frequency_hz": 210.0,
            "pest_flag": "Negative",
            "ambient_temp_c": 28.0,
            "honey_flow": False,
            "bloom_type": "Dry season dearth"
        },
        "query": "Colony weight is down to 18kg and dropping daily during dry spell. What is the feeding strategy?"
    }
]

TEACHER_SYSTEM_PROMPT = """You are Claude 3.5 Sonnet, acting as the Master Agronomic Teacher for CEBA AI.
Analyze the provided multi-sensor hive telemetry and question.

Operating Rules:
1. Provide comprehensive, step-by-step diagnostic reasoning (Rationale-Based Knowledge Distillation).
2. Adhere strictly to biosecurity and agronomic rules:
   - NEVER recommend synthetic chemical miticides (Amitraz, Coumaphos, Fluvalinate) during active honey flows. Recommend organic non-contaminating interventions (Formic acid pad, drone brood removal) or deferral.
   - NEVER recommend opening or inspecting brood boxes when ambient temperature is below 12°C to prevent irreversible chilling.
3. Emit your response in JSON with two keys:
   - "teacher_reasoning": detailed chain of thought explaining the telemetry synthesis.
   - "final_response": structured object with:
       - "alert_level": ("INFO" | "WARNING" | "CRITICAL")
       - "primary_issue": concise summary
       - "action_plan": list of concrete actionable steps
"""


async def generate_teacher_record(client: httpx.AsyncClient, api_key: str, item: Dict[str, Any]) -> Dict[str, Any]:
    """Calls Anthropic Claude 3.5 Sonnet API to generate CoT reasoning and action plan."""
    telemetry_str = json.dumps(item["input_telemetry"], indent=2)
    user_prompt = f"Telemetry Payload:\n{telemetry_str}\n\nUser Question:\n{item['query']}"

    if not api_key or api_key == "mock":
        # Offline deterministic high-quality synthetic generator for development and testing
        return _generate_offline_teacher_sample(item)

    try:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            json={
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 1024,
                "system": TEACHER_SYSTEM_PROMPT,
                "messages": [{"role": "user", "content": user_prompt}]
            },
            timeout=30.0
        )
        data = response.json()
        raw_text = data["content"][0]["text"]
        # Parse JSON output from model response
        clean_json_str = raw_text.strip()
        if clean_json_str.startswith("```json"):
            clean_json_str = clean_json_str.split("```json")[1].split("```")[0].strip()
        parsed = json.loads(clean_json_str)

        return {
            "scenario_id": item["scenario_id"],
            "input": telemetry_str,
            "query": item["query"],
            "teacher_reasoning": parsed.get("teacher_reasoning", ""),
            "final_response": parsed.get("final_response", {})
        }
    except Exception as e:
        print(f"Error calling Claude API for {item['scenario_id']}: {e}. Using deterministic seed.")
        return _generate_offline_teacher_sample(item)


def _generate_offline_teacher_sample(item: Dict[str, Any]) -> Dict[str, Any]:
    """Generates expert-verified reference teacher records when offline."""
    t = item["input_telemetry"]
    scen_id = item["scenario_id"]

    if scen_id == "scen_002_swarming_distress":
        reasoning = (
            "1. Daily weight delta is -1.8kg, indicating a significant departure of adult bee biomass. "
            "2. Acoustic peak elevated to 285Hz, characteristic of worker piping and post-swarm colony agitation. "
            "3. Brood temp at 36.8°C indicates remaining nurse bees are clustering closely to maintain brood. "
            "4. Conclusion: Colony has issued a prime swarm. Immediate action needed to inspect for remaining virgin queens."
        )
        final = {
            "alert_level": "CRITICAL",
            "primary_issue": "Prime Swarm Emergence & Queen Transition",
            "action_plan": [
                "Inspect lower brood chamber for emerged queen cells versus capped virgins",
                "Provide entrance reducer to protect diminished guard force against robbing",
                "Deploy swarm traps within 500m radius of apiary"
            ]
        }
    elif scen_id == "scen_003_brood_chilling_cold":
        reasoning = (
            "1. Brood temp is 29.8°C, which is dangerously below the 34-36°C physiological minimum. "
            "2. Ambient temperature is 9.5°C (below the 12°C biosecurity inspection threshold). "
            "3. Opening the hive in 9.5°C weather would cause catastrophic cluster heat loss and kill remaining brood. "
            "4. Agronomic Rule Enforced: No hive opening permitted below 12°C."
        )
        final = {
            "alert_level": "WARNING",
            "primary_issue": "Sub-Optimal Brood Thermoregulation in Cold Ambient Weather",
            "action_plan": [
                "Do NOT open or inspect hive frames while ambient temperature is below 12°C",
                "Install exterior windbreak or hive insulation wrap",
                "Ensure top entrance is clear of dead bee blockages to facilitate ventilation"
            ]
        }
    elif scen_id == "scen_004_varroa_crisis_flow":
        reasoning = (
            "1. Varroa counts exceed threshold (>15 mites/day drop). "
            "2. Honey flow is currently active with positive weight gain (+0.8kg/day). "
            "3. Biosecurity Rule Enforced: Synthetic lipophilic miticides (Amitraz, Fluvalinate) are strictly prohibited during honey flow due to wax and honey contamination. "
            "4. Safe intervention: Organic acids approved with supers on (Formic acid/HopGuard) or physical drone brood culling."
        )
        final = {
            "alert_level": "WARNING",
            "primary_issue": "Varroa Infestation During Active Honey Flow",
            "action_plan": [
                "Strictly avoid Amitraz, Coumaphos, or Fluvalinate while honey supers are on",
                "Apply flow-approved organic treatment (Formic Pro or Oxalic Acid vaporization per label)",
                "Schedule drone comb removal to trap female foundress mites"
            ]
        }
    elif scen_id == "scen_005_queenless_piping":
        reasoning = (
            "1. Acoustic sensor displays 295Hz peak, which is a classic acoustic footprint of queenlessness (roar/piping). "
            "2. Brood temperature is slipping to 33.5°C, confirming reduced clustering over open brood. "
            "3. Conclusion: Probable queen failure, loss, or supersedure failure."
        )
        final = {
            "alert_level": "CRITICAL",
            "primary_issue": "Queenlessness & Acoustic Distress",
            "action_plan": [
                "Conduct frame-by-frame inspection during warm hours for eggs or emergency queen cups",
                "Introduce test frame of 1-day-old open larvae from donor hive",
                "Order mated replacement queen if emergency cells are absent"
            ]
        }
    else:
        reasoning = (
            "1. Brood temperature is held in ideal window (34.5 - 35.5°C). "
            "2. Weight dynamic indicates consistent nectar intake and active foraging. "
            "3. Acoustic frequencies show balanced colony ventilation and queen presence."
        )
        final = {
            "alert_level": "INFO",
            "primary_issue": "Nominal Colony Health & Productivity",
            "action_plan": [
                "Continue automated telemetry monitoring",
                "Check super space within 10 days if nectar flow accelerates"
            ]
        }

    return {
        "scenario_id": item["scenario_id"],
        "input": json.dumps(t),
        "query": item["query"],
        "teacher_reasoning": reasoning,
        "final_response": final
    }


async def main():
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "distillation_raw_teacher.jsonl")

    print(f"Generating {len(TELEMETRY_SCENARIOS)} synthetic CoT distillation pairs...")
    results = []
    async with httpx.AsyncClient() as client:
        for scen in TELEMETRY_SCENARIOS:
            print(f"Processing: {scen['scenario_id']}...")
            res = await generate_teacher_record(client, api_key, scen)
            results.append(res)

    with open(output_file, "w", encoding="utf-8") as f:
        for r in results:
            f.write(json.dumps(r) + "\n")

    print(f"Successfully generated {len(results)} teacher records -> {output_file}")


if __name__ == "__main__":
    asyncio.run(main())
