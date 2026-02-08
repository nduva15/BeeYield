"""
Rotary Position Embeddings (RoPE)
=================================
Implementation of RoPE for better long-range dependency modeling.
Reference: https://arxiv.org/abs/2104.09864
"""

import torch
import torch.nn as nn
from typing import Tuple


def precompute_freqs_cis(dim: int, end: int, theta: float = 10000.0) -> torch.Tensor:
    """Precompute the frequency tensor for RoPE.
    
    Args:
        dim: Dimension of each head (hidden_size // num_heads)
        end: Maximum sequence length
        theta: Base frequency
        
    Returns:
        Complex tensor of shape (end, dim//2) for rotation
    """
    freqs = 1.0 / (theta ** (torch.arange(0, dim, 2)[: (dim // 2)].float() / dim))
    t = torch.arange(end, device=freqs.device)
    freqs = torch.outer(t, freqs).float()
    freqs_cis = torch.polar(torch.ones_like(freqs), freqs)  # complex64
    return freqs_cis


def reshape_for_broadcast(freqs_cis: torch.Tensor, x: torch.Tensor) -> torch.Tensor:
    """Reshape frequency tensor for broadcasting with attention tensors."""
    ndim = x.ndim
    assert 0 <= 1 < ndim
    assert freqs_cis.shape == (x.shape[1], x.shape[-1])
    shape = [d if i == 1 or i == ndim - 1 else 1 for i, d in enumerate(x.shape)]
    return freqs_cis.view(*shape)


def apply_rotary_emb(
    xq: torch.Tensor,
    xk: torch.Tensor,
    freqs_cis: torch.Tensor,
) -> Tuple[torch.Tensor, torch.Tensor]:
    """Apply rotary embeddings to query and key tensors.
    
    Args:
        xq: Query tensor of shape (batch, seq_len, num_heads, head_dim)
        xk: Key tensor of shape (batch, seq_len, num_kv_heads, head_dim)
        freqs_cis: Precomputed frequencies
        
    Returns:
        Rotated query and key tensors
    """
    # Convert to complex representation
    xq_ = torch.view_as_complex(xq.float().reshape(*xq.shape[:-1], -1, 2))
    xk_ = torch.view_as_complex(xk.float().reshape(*xk.shape[:-1], -1, 2))
    
    # Reshape freqs for broadcasting
    freqs_cis = reshape_for_broadcast(freqs_cis, xq_)
    
    # Apply rotation
    xq_out = torch.view_as_real(xq_ * freqs_cis).flatten(-2)
    xk_out = torch.view_as_real(xk_ * freqs_cis).flatten(-2)
    
    return xq_out.type_as(xq), xk_out.type_as(xk)


class RotaryEmbedding(nn.Module):
    """Rotary Position Embedding module."""
    
    def __init__(self, dim: int, max_seq_len: int = 2048, theta: float = 10000.0):
        super().__init__()
        self.dim = dim
        self.max_seq_len = max_seq_len
        self.theta = theta
        
        # Precompute and register as buffer
        freqs_cis = precompute_freqs_cis(dim, max_seq_len, theta)
        self.register_buffer("freqs_cis", freqs_cis, persistent=False)
    
    def forward(
        self, 
        xq: torch.Tensor, 
        xk: torch.Tensor, 
        start_pos: int = 0
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """Apply RoPE to query and key tensors.
        
        Args:
            xq: Query tensor
            xk: Key tensor
            start_pos: Starting position for cached inference
            
        Returns:
            Rotated query and key tensors
        """
        seq_len = xq.shape[1]
        freqs_cis = self.freqs_cis[start_pos : start_pos + seq_len]
        return apply_rotary_emb(xq, xk, freqs_cis)
