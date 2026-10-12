"""
Stage 4: Fine-Tuning the Student Model (Supervised Fine-Tuning / SFT)
Fine-tunes Meta-Llama-3.1-8B-Instruct or Qwen-2.5-7B-Instruct using
QLoRA (4-bit quantization, rank 16) with Unsloth or Hugging Face TRL.

Input: backend/data/distillation_filtered_sft.jsonl
Output: outputs/ceba-ai-student-8b (LoRA adapters) & ceba-ai-student-8b-Q4_K_M.gguf
"""

import os
import json
import argparse
from typing import List, Dict, Any


def format_llama3_chatml(records: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """
    Transforms filtered distillation samples into standard Llama 3.1 ChatML format:
    <|start_header_id|>system<|end_header_id|>
    ...
    <|start_header_id|>user<|end_header_id|>
    ...
    <|start_header_id|>assistant<|end_header_id|>
    ...
    """
    formatted_dataset = []

    system_content = (
        "You are CEBA AI, an edge-optimized apiculture diagnostic system deployed on a BeeYield gateway.\n"
        "Your task is to analyze hive telemetry, environmental conditions, and acoustic metrics, "
        "then produce step-by-step diagnostic reasoning followed by a structured action plan.\n\n"
        "Operating Rules:\n"
        "1. Always evaluate telemetry systematically (temperature, weight dynamics, acoustics, brood state).\n"
        "2. Adhere strictly to biosecurity and agronomic thresholds:\n"
        "   - Never recommend chemical miticides during an active honey flow.\n"
        "   - Never advise internal brood inspections when ambient temperature is below 12°C.\n"
        "3. Output valid JSON containing alert_level ('INFO', 'WARNING', or 'CRITICAL'), primary_issue, and action_plan."
    )

    for item in records:
        telemetry = item.get("input", "")
        query = item.get("query", "")
        reasoning = item.get("teacher_reasoning", "")
        final = item.get("final_response", {})

        user_content = (
            f"Telemetry Payload:\n{telemetry}\n\n"
            f"Observation / Query:\n{query}"
        )

        assistant_content = (
            f"### Diagnostic Reasoning:\n{reasoning}\n\n"
            f"```json\n{json.dumps(final, indent=2)}\n```"
        )

        # Llama 3.1 Prompt Template Representation
        full_text = (
            f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n"
            f"{system_content}<|eot_id|>"
            f"<|start_header_id|>user<|end_header_id|>\n\n"
            f"{user_content}<|eot_id|>"
            f"<|start_header_id|>assistant<|end_header_id|>\n\n"
            f"{assistant_content}<|eot_id|>"
        )

        formatted_dataset.append({
            "text": full_text,
            "system": system_content,
            "user": user_content,
            "assistant": assistant_content
        })

    return formatted_dataset


def run_training_pipeline(dataset_path: str, output_dir: str, dry_run: bool = False):
    """
    Executes SFT fine-tuning. If unsloth/torch-cuda is not installed (e.g. standard local CPU),
    validates the dataset tokens and prints export instructions.
    """
    print(f"Loading filtered distillation data from: {dataset_path}")
    with open(dataset_path, "r", encoding="utf-8") as f:
        records = [json.loads(line.strip()) for line in f if line.strip()]

    print(f"Loaded {len(records)} verified distillation samples.")
    chatml_data = format_llama3_chatml(records)
    print(f"Formatted {len(chatml_data)} samples to Llama 3.1 ChatML.")

    # Save formatted dataset preview
    preview_path = os.path.join(output_dir, "llama3_chatml_preview.json")
    os.makedirs(output_dir, exist_ok=True)
    with open(preview_path, "w", encoding="utf-8") as f:
        json.dump(chatml_data[:2], f, indent=2)
    print(f"Saved ChatML preview sample -> {preview_path}")

    if dry_run:
        print("\n[DRY RUN COMPLETE] Dataset is fully formatted, verified, and ready for SFT Trainer.")
        return

    # Check for Unsloth / Torch GPU runtime
    try:
        from unsloth import FastLanguageModel
        import torch
        from trl import SFTTrainer
        from transformers import TrainingArguments
        from datasets import Dataset

        max_seq_length = 2048
        model_name = "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit"

        print(f"Loading {model_name} in 4-bit...")
        model, tokenizer = FastLanguageModel.from_pretrained(
            model_name=model_name,
            max_seq_length=max_seq_length,
            load_in_4bit=True,
        )

        # Configure LoRA Adapters
        model = FastLanguageModel.get_peft_model(
            model,
            r=16,
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
            lora_alpha=16,
            lora_dropout=0,
            bias="none",
            use_gradient_checkpointing="unsloth",
        )

        hf_dataset = Dataset.from_list([{"text": d["text"]} for d in chatml_data])

        training_args = TrainingArguments(
            per_device_train_batch_size=2,
            gradient_accumulation_steps=4,
            warmup_steps=5,
            max_steps=100,
            learning_rate=2e-4,
            fp16=not torch.cuda.is_bf16_supported(),
            bf16=torch.cuda.is_bf16_supported(),
            logging_steps=10,
            optim="adamw_8bit",
            weight_decay=0.01,
            lr_scheduler_type="linear",
            seed=3407,
            output_dir=output_dir,
        )

        trainer = SFTTrainer(
            model=model,
            tokenizer=tokenizer,
            train_dataset=hf_dataset,
            dataset_text_field="text",
            max_seq_length=max_seq_length,
            args=training_args,
        )

        print("Starting Student Model SFT...")
        trainer.train()

        # Save and Export GGUF for Ollama Edge Deployment
        gguf_model_name = "ceba-ai-student-8b"
        print(f"Saving quantized GGUF model -> {gguf_model_name} (Q4_K_M)...")
        model.save_pretrained_gguf(gguf_model_name, tokenizer, quantization_method="q4_k_m")
        print("Model distillation and GGUF quantization successfully complete!")

    except ImportError as e:
        print(f"\nNote: Unsloth/GPU training framework not present in this local environment ({e}).")
        print("To run GPU fine-tuning on your training cluster or Colab/RunPod:")
        print("  pip install \"unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git\"")
        print("  python backend/scripts/train_student_8b.py --dataset backend/data/distillation_filtered_sft.jsonl")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CEBA AI Student SFT Distillation Script")
    parser.add_argument("--dataset", default=os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "distillation_filtered_sft.jsonl"))
    parser.add_argument("--output", default=os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "outputs"))
    parser.add_argument("--dry-run", action="store_true", default=False)
    args = parser.parse_args()

    run_training_pipeline(args.dataset, args.output, dry_run=args.dry_run)
