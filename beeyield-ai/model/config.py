"""
BeeFormer Configuration
=======================
Hyperparameters for the BeeYield AI language model.
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class BeeFormerConfig:
    """Configuration for BeeFormer ~125M parameter model."""
    
    # === Model Architecture ===
    vocab_size: int = 32000           # Custom BPE vocabulary
    hidden_size: int = 768            # Embedding dimension (d_model)
    num_hidden_layers: int = 12       # Transformer blocks
    num_attention_heads: int = 12     # Attention heads
    intermediate_size: int = 3072     # FFN hidden dim (4x hidden_size)
    hidden_act: str = "silu"          # SwiGLU-style activation
    
    # === Sequence ===
    max_position_embeddings: int = 2048  # Context window
    
    # === Regularization ===
    hidden_dropout_prob: float = 0.1
    attention_probs_dropout_prob: float = 0.1
    
    # === RoPE Configuration ===
    rope_theta: float = 10000.0       # Base for rotary embeddings
    rope_scaling: Optional[dict] = None  # For extended context
    
    # === Optimization ===
    tie_word_embeddings: bool = True  # Share input/output embeddings
    use_cache: bool = True            # KV cache for inference
    
    # === Precision ===
    use_fp8: bool = False             # FP8 quantization (requires H100+)
    torch_dtype: str = "bfloat16"     # Training precision
    
    # === Special Tokens ===
    pad_token_id: int = 0
    bos_token_id: int = 1
    eos_token_id: int = 2
    
    # === Layer Norm ===
    rms_norm_eps: float = 1e-6        # RMSNorm epsilon
    
    # === Initialization ===
    initializer_range: float = 0.02   # Weight init std
    
    def __post_init__(self):
        """Validate configuration."""
        assert self.hidden_size % self.num_attention_heads == 0, \
            "hidden_size must be divisible by num_attention_heads"
        self.head_dim = self.hidden_size // self.num_attention_heads
    
    @property
    def num_parameters(self) -> int:
        """Estimate total parameter count."""
        # Token embeddings
        embed = self.vocab_size * self.hidden_size
        
        # Per layer
        # QKV projections
        qkv = 3 * self.hidden_size * self.hidden_size
        # Output projection
        o_proj = self.hidden_size * self.hidden_size
        # FFN (with SwiGLU: gate, up, down)
        ffn = 3 * self.hidden_size * self.intermediate_size
        # Layer norms
        ln = 2 * self.hidden_size
        
        per_layer = qkv + o_proj + ffn + ln
        
        # Final layer norm
        final_ln = self.hidden_size
        
        # LM head (tied with embeddings)
        lm_head = 0 if self.tie_word_embeddings else embed
        
        total = embed + (self.num_hidden_layers * per_layer) + final_ln + lm_head
        return total
    
    def to_dict(self) -> dict:
        """Convert config to dictionary."""
        return {
            "vocab_size": self.vocab_size,
            "hidden_size": self.hidden_size,
            "num_hidden_layers": self.num_hidden_layers,
            "num_attention_heads": self.num_attention_heads,
            "intermediate_size": self.intermediate_size,
            "hidden_act": self.hidden_act,
            "max_position_embeddings": self.max_position_embeddings,
            "hidden_dropout_prob": self.hidden_dropout_prob,
            "attention_probs_dropout_prob": self.attention_probs_dropout_prob,
            "rope_theta": self.rope_theta,
            "tie_word_embeddings": self.tie_word_embeddings,
            "torch_dtype": self.torch_dtype,
            "rms_norm_eps": self.rms_norm_eps,
        }
    
    @classmethod
    def from_dict(cls, config_dict: dict) -> "BeeFormerConfig":
        """Create config from dictionary."""
        return cls(**{k: v for k, v in config_dict.items() 
                     if k in cls.__dataclass_fields__})


# === Preset Configurations ===

def beeformer_125m() -> BeeFormerConfig:
    """125M parameter config (default)."""
    return BeeFormerConfig()


def beeformer_350m() -> BeeFormerConfig:
    """350M parameter config for more capacity."""
    return BeeFormerConfig(
        hidden_size=1024,
        num_hidden_layers=24,
        num_attention_heads=16,
        intermediate_size=4096,
    )


def beeformer_tiny() -> BeeFormerConfig:
    """Tiny 10M config for testing."""
    return BeeFormerConfig(
        hidden_size=256,
        num_hidden_layers=4,
        num_attention_heads=4,
        intermediate_size=1024,
        max_position_embeddings=512,
    )


if __name__ == "__main__":
    config = BeeFormerConfig()
    print(f"BeeFormer-125M Configuration")
    print(f"=" * 40)
    print(f"Parameters: {config.num_parameters:,}")
    print(f"Hidden Size: {config.hidden_size}")
    print(f"Layers: {config.num_hidden_layers}")
    print(f"Heads: {config.num_attention_heads}")
    print(f"Head Dim: {config.head_dim}")
    print(f"FFN Size: {config.intermediate_size}")
    print(f"Context: {config.max_position_embeddings}")
