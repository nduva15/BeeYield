"""
RATE LIMIT MANAGER — Rust-Accelerated (Post-Oxidize)
===================================================
Timing state and backoff logic ported to `beeyield_core.RateLimiter`.
Python layer handles async orchestration (asyncio.sleep).
"""
import asyncio
import functools
import time
from typing import Callable, Any, Optional

try:
    from beeyield_core import RateLimiter as _RustLimiter
    _RUST_AVAILABLE = True
except ImportError:
    _RUST_AVAILABLE = False


class RateLimitManager:
    """
    Manages API rate limits using high-precision Rust monotonic clocks.
    """
    
    # Global Rust-backed limiter
    _limiter = _RustLimiter() if _RUST_AVAILABLE else None
    
    # Fallback storage if Rust is missing
    _fallback_calls: dict = {}
    _fallback_counts: dict = {}

    @staticmethod
    async def with_retry(
        func: Callable,
        max_retries: int = 5,
        base_delay: float = 1.0,
        max_delay: float = 60.0,
        api_name: str = "default"
    ) -> Any:
        last_exception = None
        
        for attempt in range(max_retries + 1):
            try:
                result = await func()
                if RateLimitManager._limiter:
                    RateLimitManager._limiter.record_call(api_name)
                return result
            except Exception as e:
                last_exception = e
                error_str = str(e)
                
                # Use Rust to detect rate limit indicators
                is_rate_limit = False
                if RateLimitManager._limiter:
                    is_rate_limit = RateLimitManager._limiter.is_rate_limit_error(error_str)
                else:
                    is_rate_limit = any(i in error_str.lower() for i in ["429", "rate limit", "quota"])

                if not is_rate_limit or attempt == max_retries:
                    raise e

                # Calculate delay in Rust (exp backoff + monotonic jitter)
                if RateLimitManager._limiter:
                    RateLimitManager._limiter.record_failure(api_name)
                    total_delay_ms = RateLimitManager._limiter.backoff_delay(
                        attempt=attempt, 
                        base_delay_ms=base_delay * 1000.0, 
                        max_delay_ms=max_delay * 1000.0
                    )
                    
                    # Check for suggested retry-after headers extracted by Rust
                    suggested_delay_ms = RateLimitManager._limiter.extract_retry_delay(error_str)
                    total_delay = max(total_delay_ms, suggested_delay_ms) / 1000.0
                else:
                    # Python fallback
                    total_delay = min(base_delay * (2 ** attempt), max_delay) * 1.05

                print(f"[RATE_LIMIT_RUST] {api_name}: Retry {attempt+1} in {total_delay:.1f}s")
                await asyncio.sleep(total_delay)
        
        raise last_exception

    @staticmethod
    def throttle(min_interval: float = 0.5, api_name: str = "default"):
        """Decorator using Rust-owned monotonic clocks."""
        def decorator(func):
            @functools.wraps(func)
            async def wrapper(*args, **kwargs):
                if RateLimitManager._limiter:
                    wait_ms = RateLimitManager._limiter.should_throttle(api_name, min_interval * 1000.0)
                    if wait_ms > 0:
                        await asyncio.sleep(wait_ms / 1000.0)
                    
                    # The function itself might call record_call via with_retry,
                    # but if used as a standalone decorator, we record it here.
                    res = await func(*args, **kwargs)
                    RateLimitManager._limiter.record_call(api_name)
                    return res
                else:
                    # Fallback
                    last = RateLimitManager._fallback_calls.get(api_name, 0)
                    elapsed = time.time() - last
                    if elapsed < min_interval:
                        await asyncio.sleep(min_interval - elapsed)
                    RateLimitManager._fallback_calls[api_name] = time.time()
                    return await func(*args, **kwargs)
            return wrapper
        return decorator

    @staticmethod
    def get_stats() -> dict:
        if RateLimitManager._limiter:
            return RateLimitManager._limiter.get_stats()
        return {"error": "Rust engine unavailable"}
