# BeeYield AI — Quick Start (Kaggle / T4)

This folder contains small tools to preprocess PDFs, shard cleaned text, and train a compact transformer on Kaggle T4.

Requirements
- Python 3.10+
- PyPDF2, pandas, pyarrow, torch (with CUDA), tiktoken (optional)

Install (recommended in a venv):

```bash
pip install PyPDF2 pandas pyarrow torch tiktoken
```

Quick workflow

1. Extract and tag PDFs into JSONL (domain tokens):

```bash
python beeyield-ai/pdf_to_bee_token.py path/to/pdfs data/pdfs.jsonl
```

2. Clean PDFs and write Parquet shards (one shard per PDF):

```bash
python beeyield-ai/pdf_to_parquet.py path/to/pdfs beeyield-ai/parquet_shards
```

3. Stream shards during training (example script uses `ShardedParquetDataset`):

```bash
python beeyield-ai/train_multi_gpu.py --data beeyield-ai/parquet_shards/*.parquet --out ckpt.pt --epochs 3
```

Notes & Kaggle tips
- In Kaggle notebook settings choose GPU: `T4` and enable >1 GPU if available.
- Use `torch.compile(model)` (script already attempts it) to speed up training.
- For large corpora prefer `sharded_stream_loader.ShardedParquetDataset` with `DataLoader`.
- Use `tiktoken` for BPE tokenization if installed; otherwise the scripts use a simple fallback tokenizer.

Safety & scaling
- The preprocessor removes headers/footers and page numbers but manual spot-checking is recommended.
- For 25k datasets, convert JSONL -> sharded Parquet and increase `batch_size` and `num_workers`.

Files
- `pdf_to_bee_token.py` — JSONL extractor with domain tokens
- `pdf_to_parquet.py` — cleaner that writes parquet shards
- `sharded_stream_loader.py` — IterableDataset for sharded parquet
- `train_multi_gpu.py` — training harness (torch.compile + WeightedRandomSampler)

If you want, I can add a Kaggle notebook that runs these steps end-to-end.
