# BeeYield AI - PyTorch Model

The "BeeFormer" - a 125M parameter transformer for bee research.

## Architecture

- **Parameters:** ~125M
- **Layers:** 12 transformer blocks
- **Attention Heads:** 12
- **Embedding Dim:** 768
- **FFN Dim:** 3072
- **Context Length:** 2048 tokens

## Features

- Rotary Position Embeddings (RoPE)
- FlashAttention-2 support
- FP8 quantization ready
- Weight tying (input/output embeddings)

## Installation

```bash
pip install -r requirements.txt
```

## Training

```bash
python train.py --corpus ../data/corpus/bee_corpus.txt --epochs 10
```

## Inference

```python
from model import BeeFormer, BeeFormerConfig

config = BeeFormerConfig()
model = BeeFormer.from_pretrained("checkpoints/beeformer-125m")
response = model.generate("What causes American Foulbrood?")
```
