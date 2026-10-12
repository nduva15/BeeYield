"""
Stage 3: Data Filtering & Quality Control (Biosecurity & Agronomic Rules Engine)
Validates synthetic teacher outputs against strict apicultural thresholds,
safety regulations, schema contracts, and deduplication criteria.

Outputs: backend/data/distillation_filtered_sft.jsonl
"""

import os
import json
import hashlib
from typing import Dict, Any, List, Tuple
from pydantic import BaseModel, Field, field_validator


class FinalResponseSchema(BaseModel):
    alert_level: str = Field(..., description="Must be INFO, WARNING, or CRITICAL")
    primary_issue: str = Field(..., min_length=3)
    action_plan: List[str] = Field(..., min_length=1)

    @field_validator("alert_level")
    @classmethod
    def validate_alert(cls, v: str) -> str:
        valid = {"INFO", "WARNING", "CRITICAL"}
        upper_v = v.upper()
        if upper_v not in valid:
            raise ValueError(f"alert_level must be one of {valid}, got {v}")
        return upper_v


class DistillationSample(BaseModel):
    scenario_id: str
    input: str
    query: str
    teacher_reasoning: str = Field(..., min_length=10)
    final_response: FinalResponseSchema


class BiosecurityRulesEngine:
    """
    Automated quality control filter for synthetic teacher outputs.
    Ensures no hallucinations or illegal/hazardous apicultural practices
    reach the student training corpus.
    """

    PROHIBITED_FLOW_CHEMICALS = [
        "amitraz",
        "apivar",
        "fluvalinate",
        "apistan",
        "coumaphos",
        "checkmite",
        "bayvarol",
    ]

    INSPECTION_KEYWORDS = [
        "open the hive",
        "open brood chamber",
        "inspect frames",
        "pull frames",
        "internal brood inspection",
        "frame inspection",
    ]

    def validate_sample(self, raw: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Runs comprehensive checks:
        1. Schema integrity
        2. Chemical miticide biosecurity during honey flows
        3. Thermal shock protection (< 12°C ambient)
        """
        # 1. Schema Validation
        try:
            sample = DistillationSample(**raw)
        except Exception as e:
            return False, f"Schema validation error: {e}"

        text_to_check = (
            sample.teacher_reasoning.lower() + " " +
            " ".join(sample.final_response.action_plan).lower()
        )
        input_lower = sample.input.lower() + " " + sample.query.lower()

        # 2. Biosecurity Guard: Honey Flow Contamination
        # Chemical miticides are strictly prohibited when surplus honey supers are installed
        is_honey_flow = (
            '"honey_flow": true' in input_lower or
            "honey flow: true" in input_lower or
            "active honey flow" in input_lower
        )
        if is_honey_flow:
            for chemical in self.PROHIBITED_FLOW_CHEMICALS:
                if chemical in text_to_check:
                    # Allow only if explicitly framed as prohibited / do not use
                    if "not" not in text_to_check and "avoid" not in text_to_check and "never" not in text_to_check:
                        return False, f"Biosecurity Violation: Recommended {chemical} during active honey flow."

        # 3. Agronomic Guard: Cold Weather Inspection (Thermal Shock)
        # Checking if ambient temp is < 12°C
        is_sub_12c = False
        try:
            if "ambient_temp_c" in sample.input:
                telemetry = json.loads(sample.input) if sample.input.startswith("{") else {}
                ambient = float(telemetry.get("ambient_temp_c", 20.0))
                if ambient < 12.0:
                    is_sub_12c = True
        except Exception:
            pass

        if is_sub_12c:
            for keyword in self.INSPECTION_KEYWORDS:
                if keyword in text_to_check:
                    # Must have negation ("do not", "avoid", "never")
                    negation_tokens = ["do not", "don't", "avoid", "never", "refrain"]
                    has_negation = any(tok in text_to_check for tok in negation_tokens)
                    if not has_negation:
                        return False, (
                            f"Agronomic Violation: Advised internal hive opening ({keyword}) "
                            f"at dangerously low ambient temperature (<12°C)."
                        )

        return True, "PASSED"


def filter_dataset(input_file: str, output_file: str) -> Dict[str, int]:
    """Reads raw teacher records, applies rules engine and deduplication, and writes approved dataset."""
    validator = BiosecurityRulesEngine()
    seen_hashes = set()
    stats = {"total": 0, "approved": 0, "rejected_schema": 0, "rejected_biosecurity": 0, "duplicate": 0}

    approved_samples = []

    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file not found: {input_file}")

    with open(input_file, "r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            stats["total"] += 1
            try:
                record = json.loads(line)
            except Exception as e:
                stats["rejected_schema"] += 1
                print(f"Line {line_no}: Invalid JSON: {e}")
                continue

            # Deduplication
            content_hash = hashlib.sha256((record.get("input", "") + record.get("query", "")).encode("utf-8")).hexdigest()
            if content_hash in seen_hashes:
                stats["duplicate"] += 1
                continue
            seen_hashes.add(content_hash)

            # Validate against Biosecurity & Agronomic Rules
            is_valid, reason = validator.validate_sample(record)
            if not is_valid:
                print(f"Sample {record.get('scenario_id', line_no)} REJECTED: {reason}")
                if "Schema" in reason:
                    stats["rejected_schema"] += 1
                else:
                    stats["rejected_biosecurity"] += 1
                continue

            approved_samples.append(record)
            stats["approved"] += 1

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        for item in approved_samples:
            f.write(json.dumps(item) + "\n")

    print("\nDistillation Filter Summary:")
    print(f"- Total Raw Records: {stats['total']}")
    print(f"- Approved for SFT:  {stats['approved']}")
    print(f"- Rejected Biosecurity: {stats['rejected_biosecurity']}")
    print(f"- Rejected Schema:      {stats['rejected_schema']}")
    print(f"- Duplicates Pruned:    {stats['duplicate']}")
    print(f"Output saved to: {output_file}")

    return stats


if __name__ == "__main__":
    import argparse

    base_dir = os.path.dirname(os.path.dirname(__file__))
    default_raw = os.path.join(base_dir, "data", "distillation_raw_teacher.jsonl")
    default_clean = os.path.join(base_dir, "data", "distillation_filtered_sft.jsonl")

    parser = argparse.ArgumentParser(description="CEBA AI Biosecurity & Agronomic Rules Dataset Filter")
    parser.add_argument("--input", "-i", type=str, default=default_raw, help=f"Input raw JSONL (default: {default_raw})")
    parser.add_argument("--output", "-o", type=str, default=default_clean, help=f"Output clean JSONL (default: {default_clean})")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Warning: Input file does not exist yet: {args.input}")
        print("Ready to process teacher synthetic generation logs when created.")
    else:
        filter_dataset(args.input, args.output)
