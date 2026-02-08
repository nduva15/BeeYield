"""
BeeFormer Training Script
=========================
Train the BeeFormer model on bee research corpus.
"""

import os
import argparse
import math
from pathlib import Path
from typing import Optional

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

from tqdm import tqdm
import wandb

from model import BeeFormerConfig, BeeFormerLMHead


class BeeCorpusDataset(Dataset):
    """Dataset for the bee research corpus."""
    
    def __init__(
        self, 
        corpus_path: str, 
        tokenizer, 
        max_length: int = 512,
        stride: int = 256,
    ):
        self.tokenizer = tokenizer
        self.max_length = max_length
        
        # Load and tokenize corpus
        print(f"Loading corpus from {corpus_path}...")
        with open(corpus_path, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # Split by document markers
        docs = text.split('<|doc|>')
        
        # Tokenize all documents
        self.examples = []
        for doc in tqdm(docs, desc="Tokenizing"):
            doc = doc.replace('<|endofdoc|>', '').strip()
            if not doc:
                continue
            
            tokens = tokenizer.encode(doc)
            
            # Sliding window
            for i in range(0, len(tokens) - max_length + 1, stride):
                chunk = tokens[i : i + max_length]
                self.examples.append(torch.tensor(chunk, dtype=torch.long))
        
        print(f"Created {len(self.examples)} training examples")
    
    def __len__(self):
        return len(self.examples)
    
    def __getitem__(self, idx):
        tokens = self.examples[idx]
        return {
            "input_ids": tokens,
            "labels": tokens.clone(),
        }


def collate_fn(batch):
    """Collate batch of examples."""
    input_ids = torch.stack([x["input_ids"] for x in batch])
    labels = torch.stack([x["labels"] for x in batch])
    return {"input_ids": input_ids, "labels": labels}


def train_epoch(
    model: nn.Module,
    dataloader: DataLoader,
    optimizer: torch.optim.Optimizer,
    scheduler: Optional[torch.optim.lr_scheduler._LRScheduler],
    device: torch.device,
    epoch: int,
    accumulation_steps: int = 8,
    use_wandb: bool = False,
) -> float:
    """Train for one epoch."""
    model.train()
    total_loss = 0.0
    num_batches = 0
    
    optimizer.zero_grad()
    
    pbar = tqdm(dataloader, desc=f"Epoch {epoch}")
    for step, batch in enumerate(pbar):
        input_ids = batch["input_ids"].to(device)
        labels = batch["labels"].to(device)
        
        outputs = model(input_ids=input_ids, labels=labels)
        loss = outputs["loss"] / accumulation_steps
        loss.backward()
        
        if (step + 1) % accumulation_steps == 0:
            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            
            optimizer.step()
            if scheduler is not None:
                scheduler.step()
            optimizer.zero_grad()
        
        total_loss += outputs["loss"].item()
        num_batches += 1
        
        # Update progress bar
        avg_loss = total_loss / num_batches
        pbar.set_postfix({"loss": f"{avg_loss:.4f}"})
        
        # Log to wandb
        if use_wandb and step % 100 == 0:
            wandb.log({
                "train/loss": outputs["loss"].item(),
                "train/lr": optimizer.param_groups[0]["lr"],
            })
    
    return total_loss / num_batches


def main():
    parser = argparse.ArgumentParser(description="Train BeeFormer")
    parser.add_argument("--corpus", type=str, required=True, help="Path to corpus file")
    parser.add_argument("--output", type=str, default="checkpoints", help="Output directory")
    parser.add_argument("--epochs", type=int, default=10, help="Number of epochs")
    parser.add_argument("--batch-size", type=int, default=4, help="Batch size")
    parser.add_argument("--lr", type=float, default=3e-4, help="Learning rate")
    parser.add_argument("--accumulation", type=int, default=16, help="Gradient accumulation steps")
    parser.add_argument("--max-length", type=int, default=512, help="Max sequence length")
    parser.add_argument("--wandb", action="store_true", help="Use Weights & Biases logging")
    parser.add_argument("--smoke-test", action="store_true", help="Quick test with 100 steps")
    args = parser.parse_args()
    
    # Device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Setup wandb
    if args.wandb:
        wandb.init(project="beeyield-ai", name="beeformer-125m")
    
    # Model
    print("Creating model...")
    config = BeeFormerConfig(max_position_embeddings=args.max_length)
    model = BeeFormerLMHead(config)
    model.to(device)
    
    # Mixed precision
    if device.type == "cuda":
        model = model.to(dtype=torch.bfloat16)
    
    param_count = sum(p.numel() for p in model.parameters())
    print(f"Model parameters: {param_count:,}")
    
    # Tokenizer (simple for now - replace with trained BPE)
    from tokenizers import Tokenizer
    from tokenizers.models import BPE
    from tokenizers.trainers import BpeTrainer
    from tokenizers.pre_tokenizers import Whitespace
    
    # Check for existing tokenizer
    tokenizer_path = Path(args.corpus).parent / "tokenizer.json"
    if tokenizer_path.exists():
        print(f"Loading tokenizer from {tokenizer_path}")
        tokenizer = Tokenizer.from_file(str(tokenizer_path))
    else:
        print("Training tokenizer on corpus...")
        tokenizer = Tokenizer(BPE(unk_token="[UNK]"))
        tokenizer.pre_tokenizer = Whitespace()
        trainer = BpeTrainer(
            vocab_size=config.vocab_size,
            special_tokens=["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"]
        )
        tokenizer.train([args.corpus], trainer)
        tokenizer.save(str(tokenizer_path))
        print(f"Saved tokenizer to {tokenizer_path}")
    
    # Dataset
    print("Loading dataset...")
    dataset = BeeCorpusDataset(
        args.corpus,
        tokenizer,
        max_length=args.max_length,
    )
    
    dataloader = DataLoader(
        dataset,
        batch_size=args.batch_size,
        shuffle=True,
        collate_fn=collate_fn,
        num_workers=2,
        pin_memory=True,
    )
    
    # Optimizer
    optimizer = AdamW(model.parameters(), lr=args.lr, weight_decay=0.01)
    
    # Scheduler
    total_steps = len(dataloader) * args.epochs // args.accumulation
    scheduler = CosineAnnealingLR(optimizer, T_max=total_steps)
    
    # Training loop
    print(f"Starting training for {args.epochs} epochs...")
    os.makedirs(args.output, exist_ok=True)
    
    best_loss = float("inf")
    
    for epoch in range(args.epochs):
        loss = train_epoch(
            model,
            dataloader,
            optimizer,
            scheduler,
            device,
            epoch=epoch,
            accumulation_steps=args.accumulation,
            use_wandb=args.wandb,
        )
        
        print(f"Epoch {epoch}: loss = {loss:.4f}")
        
        # Save checkpoint
        if loss < best_loss:
            best_loss = loss
            checkpoint_path = os.path.join(args.output, "best_model.pt")
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "loss": loss,
                "config": config.to_dict(),
            }, checkpoint_path)
            print(f"Saved best model to {checkpoint_path}")
        
        if args.smoke_test:
            print("Smoke test complete!")
            break
    
    print("Training complete!")
    
    if args.wandb:
        wandb.finish()


if __name__ == "__main__":
    main()
