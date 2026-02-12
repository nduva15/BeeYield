# BeeYield AI — Kaggle Data Lake (Sharded Parquet)

Purpose
- Convert cleaned JSONL (one doc per line with `source` and `text`) into sharded Parquet files suitable for streaming training on Kaggle.

Quick commands

1) Create shards (200 docs per parquet by default):

```bash
python beeyield-ai/jsonl_to_parquet_sharder.py data/pdfs.jsonl beeyield-ai/parquet_shards --shard-size 200
```

2) Stream shards during training: use `beeyield-ai/sharded_stream_loader.py` (IterableDataset) and set `shuffle_shards=True` for epoch shuffling.

Notes
- Parquet shards are per-file and small; increase `--shard-size` for fewer, larger files.
- For 25k datasets, store shards in cloud storage (GCS/S3) and stream them into your Kaggle/cluster training job to avoid local disk limits.
