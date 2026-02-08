"""
GGUF Export Script
==================
Exports BeeFormer model to GGUF format for C++ inference.
Requires 'gguf' package: pip install gguf
"""

import sys
import os
import argparse
import struct
import json
import torch
import numpy as np
from pathlib import Path

# Add parent directory to path to import model
sys.path.append(str(Path(__file__).parent.parent))
from model import BeeFormerConfig, BeeFormerLMHead

def write_gguf(model_path, output_path, config):
    try:
        import gguf
    except ImportError:
        print("Error: 'gguf' package not found. Install with: pip install gguf")
        return

    print(f"Loading model from {model_path}...")
    checkpoint = torch.load(model_path, map_location="cpu")
    
    # Load state dict
    if "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
    else:
        state_dict = checkpoint
        
    print(f"Exporting to {output_path}...")
    gguf_writer = gguf.GGUFWriter(output_path, "beeformer-125m")
    
    # Architecture params
    gguf_writer.add_architecture("beeformer")
    gguf_writer.add_uint32("beeformer.context_length", config.max_position_embeddings)
    gguf_writer.add_uint32("beeformer.embedding_length", config.hidden_size)
    gguf_writer.add_uint32("beeformer.block_count", config.num_hidden_layers)
    gguf_writer.add_uint32("beeformer.feed_forward_length", config.intermediate_size)
    gguf_writer.add_uint32("beeformer.attention.head_count", config.num_attention_heads)
    gguf_writer.add_float32("beeformer.attention.layer_norm_rms_epsilon", config.rms_norm_eps)
    gguf_writer.add_float32("beeformer.rope.freq_base", config.rope_theta)
    
    # Tokenizer (Placeholder - would need actual tokenizer data)
    tokens = [f"<token_{i}>" for i in range(config.vocab_size)]
    gguf_writer.add_tokenizer_model("gpt2")
    gguf_writer.add_token_list(tokens)
    
    # Tensors
    for name, param in state_dict.items():
        # Clean names (remove module. prefix if present)
        clean_name = name.replace("model.", "beeformer.") 
        clean_name = clean_name.replace("layers.", "blk.")
        clean_name = clean_name.replace("self_attn.", "attn_")
        clean_name = clean_name.replace("mlp.", "ffn_")
        
        # Convert to numpy
        data = param.numpy().astype(np.float32)
        gguf_writer.add_tensor(clean_name, data)
    
    gguf_writer.write_header_to_file()
    gguf_writer.write_kv_data_to_file()
    gguf_writer.write_tensors_to_file()
    gguf_writer.close()
    
    print(f"GGUF file saved to {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", type=str, required=True, help="Path to best_model.pt")
    parser.add_argument("--output", type=str, default="beeformer.gguf", help="Output .gguf file")
    args = parser.parse_args()
    
    # Load config (assuming default)
    config = BeeFormerConfig() 
    
    write_gguf(args.checkpoint, args.output, config)
