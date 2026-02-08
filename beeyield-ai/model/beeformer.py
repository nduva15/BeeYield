"""
BeeFormer Transformer Architecture
===================================
A 125M parameter language model for bee research.
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional, Tuple, List
from dataclasses import dataclass

from .config import BeeFormerConfig
from .rope import RotaryEmbedding, apply_rotary_emb, precompute_freqs_cis
from .fp8_linear import get_linear_layer


class RMSNorm(nn.Module):
    """Root Mean Square Layer Normalization."""
    
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # RMSNorm: x * rsqrt(mean(x^2) + eps) * weight
        norm = torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps)
        return x * norm * self.weight


class BeeAttention(nn.Module):
    """Multi-head self-attention with RoPE."""
    
    def __init__(self, config: BeeFormerConfig):
        super().__init__()
        self.config = config
        self.hidden_size = config.hidden_size
        self.num_heads = config.num_attention_heads
        self.head_dim = config.hidden_size // config.num_attention_heads
        self.dropout = config.attention_probs_dropout_prob
        
        # QKV projections
        use_fp8 = getattr(config, "use_fp8", False)
        self.q_proj = get_linear_layer(self.hidden_size, self.hidden_size, bias=False, use_fp8=use_fp8)
        self.k_proj = get_linear_layer(self.hidden_size, self.hidden_size, bias=False, use_fp8=use_fp8)
        self.v_proj = get_linear_layer(self.hidden_size, self.hidden_size, bias=False, use_fp8=use_fp8)
        self.o_proj = get_linear_layer(self.hidden_size, self.hidden_size, bias=False, use_fp8=use_fp8)
        
        # RoPE
        self.rotary_emb = RotaryEmbedding(
            self.head_dim,
            max_seq_len=config.max_position_embeddings,
            theta=config.rope_theta
        )
    
    def forward(
        self,
        hidden_states: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
        past_key_value: Optional[Tuple[torch.Tensor]] = None,
        use_cache: bool = False,
    ) -> Tuple[torch.Tensor, Optional[Tuple[torch.Tensor]]]:
        batch_size, seq_len, _ = hidden_states.size()
        
        # Project to Q, K, V
        query = self.q_proj(hidden_states)
        key = self.k_proj(hidden_states)
        value = self.v_proj(hidden_states)
        
        # Reshape for multi-head attention
        query = query.view(batch_size, seq_len, self.num_heads, self.head_dim)
        key = key.view(batch_size, seq_len, self.num_heads, self.head_dim)
        value = value.view(batch_size, seq_len, self.num_heads, self.head_dim)
        
        # Apply RoPE
        start_pos = 0 if past_key_value is None else past_key_value[0].shape[1]
        query, key = self.rotary_emb(query, key, start_pos)
        
        # Handle KV cache
        if past_key_value is not None:
            key = torch.cat([past_key_value[0], key], dim=1)
            value = torch.cat([past_key_value[1], value], dim=1)
        
        if use_cache:
            present_key_value = (key, value)
        else:
            present_key_value = None
        
        # Transpose for attention: (batch, heads, seq, head_dim)
        query = query.transpose(1, 2)
        key = key.transpose(1, 2)
        value = value.transpose(1, 2)
        
        # Scaled dot-product attention
        # Try to use Flash Attention if available
        if hasattr(F, 'scaled_dot_product_attention'):
            attn_output = F.scaled_dot_product_attention(
                query, key, value,
                attn_mask=attention_mask,
                dropout_p=self.dropout if self.training else 0.0,
                is_causal=attention_mask is None,
            )
        else:
            # Manual attention
            scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(self.head_dim)
            
            if attention_mask is not None:
                scores = scores + attention_mask
            
            attn_weights = F.softmax(scores, dim=-1)
            attn_weights = F.dropout(attn_weights, p=self.dropout, training=self.training)
            attn_output = torch.matmul(attn_weights, value)
        
        # Reshape and project
        attn_output = attn_output.transpose(1, 2).contiguous()
        attn_output = attn_output.view(batch_size, seq_len, self.hidden_size)
        attn_output = self.o_proj(attn_output)
        
        return attn_output, present_key_value


class BeeMLP(nn.Module):
    """Feed-forward network with SwiGLU activation."""
    
    def __init__(self, config: BeeFormerConfig):
        super().__init__()
        self.hidden_size = config.hidden_size
        self.intermediate_size = config.intermediate_size
        
        use_fp8 = getattr(config, "use_fp8", False)
        self.gate_proj = get_linear_layer(self.hidden_size, self.intermediate_size, bias=False, use_fp8=use_fp8)
        self.up_proj = get_linear_layer(self.hidden_size, self.intermediate_size, bias=False, use_fp8=use_fp8)
        self.down_proj = get_linear_layer(self.intermediate_size, self.hidden_size, bias=False, use_fp8=use_fp8)
        self.dropout = nn.Dropout(config.hidden_dropout_prob)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # SwiGLU: down(silu(gate(x)) * up(x))
        gate = F.silu(self.gate_proj(x))
        up = self.up_proj(x)
        hidden = gate * up
        hidden = self.down_proj(hidden)
        hidden = self.dropout(hidden)
        return hidden


class BeeFormerBlock(nn.Module):
    """Single transformer block."""
    
    def __init__(self, config: BeeFormerConfig, layer_idx: int):
        super().__init__()
        self.layer_idx = layer_idx
        
        self.input_layernorm = RMSNorm(config.hidden_size, eps=config.rms_norm_eps)
        self.self_attn = BeeAttention(config)
        self.post_attention_layernorm = RMSNorm(config.hidden_size, eps=config.rms_norm_eps)
        self.mlp = BeeMLP(config)
    
    def forward(
        self,
        hidden_states: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
        past_key_value: Optional[Tuple[torch.Tensor]] = None,
        use_cache: bool = False,
    ) -> Tuple[torch.Tensor, Optional[Tuple[torch.Tensor]]]:
        # Pre-norm attention
        residual = hidden_states
        hidden_states = self.input_layernorm(hidden_states)
        hidden_states, present_key_value = self.self_attn(
            hidden_states,
            attention_mask=attention_mask,
            past_key_value=past_key_value,
            use_cache=use_cache,
        )
        hidden_states = residual + hidden_states
        
        # Pre-norm FFN
        residual = hidden_states
        hidden_states = self.post_attention_layernorm(hidden_states)
        hidden_states = self.mlp(hidden_states)
        hidden_states = residual + hidden_states
        
        return hidden_states, present_key_value


class BeeFormer(nn.Module):
    """BeeFormer base model (no LM head)."""
    
    def __init__(self, config: BeeFormerConfig):
        super().__init__()
        self.config = config
        
        # Token embeddings
        self.embed_tokens = nn.Embedding(config.vocab_size, config.hidden_size)
        
        # Transformer layers
        self.layers = nn.ModuleList([
            BeeFormerBlock(config, layer_idx=i)
            for i in range(config.num_hidden_layers)
        ])
        
        # Final norm
        self.norm = RMSNorm(config.hidden_size, eps=config.rms_norm_eps)
        
        # Initialize weights
        self.apply(self._init_weights)
    
    def _init_weights(self, module):
        std = self.config.initializer_range
        if isinstance(module, nn.Linear):
            module.weight.data.normal_(mean=0.0, std=std)
            if module.bias is not None:
                module.bias.data.zero_()
        elif isinstance(module, nn.Embedding):
            module.weight.data.normal_(mean=0.0, std=std)
    
    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
        past_key_values: Optional[List[Tuple[torch.Tensor]]] = None,
        use_cache: bool = False,
    ) -> Tuple[torch.Tensor, Optional[List[Tuple[torch.Tensor]]]]:
        batch_size, seq_len = input_ids.shape
        
        # Token embeddings
        hidden_states = self.embed_tokens(input_ids)
        
        # Create causal mask if needed
        if attention_mask is None and seq_len > 1:
            # Causal mask
            mask = torch.triu(
                torch.full((seq_len, seq_len), float('-inf'), device=input_ids.device),
                diagonal=1
            )
            attention_mask = mask
        
        # Forward through layers
        present_key_values = [] if use_cache else None
        
        for i, layer in enumerate(self.layers):
            past_kv = past_key_values[i] if past_key_values is not None else None
            hidden_states, present_kv = layer(
                hidden_states,
                attention_mask=attention_mask,
                past_key_value=past_kv,
                use_cache=use_cache,
            )
            if use_cache:
                present_key_values.append(present_kv)
        
        # Final norm
        hidden_states = self.norm(hidden_states)
        
        return hidden_states, present_key_values


class BeeFormerLMHead(nn.Module):
    """BeeFormer with language modeling head."""
    
    def __init__(self, config: BeeFormerConfig):
        super().__init__()
        self.config = config
        self.model = BeeFormer(config)
        
        # LM head (tied with embeddings)
        self.lm_head = nn.Linear(config.hidden_size, config.vocab_size, bias=False)
        
        if config.tie_word_embeddings:
            self.lm_head.weight = self.model.embed_tokens.weight
    
    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
        labels: Optional[torch.Tensor] = None,
        past_key_values: Optional[List[Tuple[torch.Tensor]]] = None,
        use_cache: bool = False,
    ) -> dict:
        hidden_states, present_key_values = self.model(
            input_ids,
            attention_mask=attention_mask,
            past_key_values=past_key_values,
            use_cache=use_cache,
        )
        
        logits = self.lm_head(hidden_states)
        
        loss = None
        if labels is not None:
            # Shift for causal LM
            shift_logits = logits[..., :-1, :].contiguous()
            shift_labels = labels[..., 1:].contiguous()
            loss = F.cross_entropy(
                shift_logits.view(-1, self.config.vocab_size),
                shift_labels.view(-1),
                ignore_index=-100,
            )
        
        return {
            "loss": loss,
            "logits": logits,
            "past_key_values": present_key_values,
        }
    
    @torch.no_grad()
    def generate(
        self,
        input_ids: torch.Tensor,
        max_new_tokens: int = 100,
        temperature: float = 0.8,
        top_p: float = 0.9,
        top_k: int = 50,
    ) -> torch.Tensor:
        """Generate text autoregressively."""
        self.eval()
        
        past_key_values = None
        generated = input_ids
        
        for _ in range(max_new_tokens):
            # Forward pass
            outputs = self.forward(
                generated if past_key_values is None else generated[:, -1:],
                past_key_values=past_key_values,
                use_cache=True,
            )
            
            past_key_values = outputs["past_key_values"]
            logits = outputs["logits"][:, -1, :]
            
            # Apply temperature
            logits = logits / temperature
            
            # Top-k filtering
            if top_k > 0:
                indices_to_remove = logits < torch.topk(logits, top_k)[0][..., -1, None]
                logits[indices_to_remove] = float('-inf')
            
            # Top-p (nucleus) filtering
            if top_p < 1.0:
                sorted_logits, sorted_indices = torch.sort(logits, descending=True)
                cumulative_probs = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)
                
                sorted_indices_to_remove = cumulative_probs > top_p
                sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
                sorted_indices_to_remove[..., 0] = 0
                
                indices_to_remove = sorted_indices_to_remove.scatter(
                    -1, sorted_indices, sorted_indices_to_remove
                )
                logits[indices_to_remove] = float('-inf')
            
            # Sample
            probs = F.softmax(logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)
            
            generated = torch.cat([generated, next_token], dim=-1)
            
            # Stop on EOS
            if next_token.item() == self.config.eos_token_id:
                break
        
        return generated


if __name__ == "__main__":
    # Test model creation
    config = BeeFormerConfig()
    model = BeeFormerLMHead(config)
    
    print(f"BeeFormer Model")
    print(f"=" * 40)
    print(f"Config Parameters: {config.num_parameters:,}")
    print(f"Actual Parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    # Test forward pass
    x = torch.randint(0, config.vocab_size, (1, 32))
    outputs = model(x)
    print(f"Input shape: {x.shape}")
    print(f"Logits shape: {outputs['logits'].shape}")
