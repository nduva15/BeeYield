"""
RATE LIMIT MANAGER (v4.0)
Handles API rate limits with exponential backoff and jitter.
"""
import asyncio
import random
import time
from typing import Callable, Any, Optional
from functools import wraps

class RateLimitManager:
    """
    Manages API rate limits with intelligent retry logic.
    """
    
    # Track last call times per API
    _last_calls: dict = {}
    _call_counts: dict = {}
    
    @staticmethod
    async def with_retry(
        func: Callable,
        max_retries: int = 5,
        base_delay: float = 1.0,
        max_delay: float = 60.0,
        api_name: str = "default"
    ) -> Any:
        """
        Execute function with exponential backoff retry logic.
        
        Args:
            func: Async function to execute
            max_retries: Maximum number of retry attempts
            base_delay: Initial delay in seconds
            max_delay: Maximum delay cap
            api_name: Identifier for rate limit tracking
        """
        last_exception = None
        
        for attempt in range(max_retries + 1):
            try:
                result = await func()
                # Reset counter on success
                RateLimitManager._call_counts[api_name] = 0
                return result
            except Exception as e:
                last_exception = e
                error_str = str(e).lower()
                
                # Check if it's a rate limit error
                is_rate_limit = any(indicator in error_str for indicator in [
                    "429", "rate limit", "quota", "too many requests", 
                    "resource_exhausted", "retry"
                ])
                
                if not is_rate_limit:
                    # Not a rate limit error, don't retry
                    raise e
                
                if attempt == max_retries:
                    # Final attempt failed
                    raise e
                
                # Calculate delay with exponential backoff + jitter
                delay = min(base_delay * (2 ** attempt), max_delay)
                jitter = random.uniform(0, delay * 0.1)  # 10% jitter
                total_delay = delay + jitter
                
                # Extract retry delay from error if available
                if "retrydelay" in error_str:
                    try:
                        import re
                        match = re.search(r"retrydelay.*?(\d+)s", error_str)
                        if match:
                            suggested_delay = int(match.group(1))
                            total_delay = max(total_delay, suggested_delay)
                    except Exception:
                        pass
                
                print(f"[RATE_LIMIT] {api_name}: Attempt {attempt + 1}/{max_retries + 1} failed. "
                      f"Retrying in {total_delay:.1f}s...")
                
                await asyncio.sleep(total_delay)
                
                # Track call count
                RateLimitManager._call_counts[api_name] = \
                    RateLimitManager._call_counts.get(api_name, 0) + 1
        
        raise last_exception

    @staticmethod
    def throttle(min_interval: float = 0.5, api_name: str = "default"):
        """
        Decorator to throttle API calls with minimum interval.
        """
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                last_call = RateLimitManager._last_calls.get(api_name, 0)
                elapsed = time.time() - last_call
                
                if elapsed < min_interval:
                    await asyncio.sleep(min_interval - elapsed)
                
                RateLimitManager._last_calls[api_name] = time.time()
                return await func(*args, **kwargs)
            return wrapper
        return decorator

    @staticmethod
    def get_stats() -> dict:
        """Get rate limit statistics."""
        return {
            "call_counts": RateLimitManager._call_counts.copy(),
            "last_calls": {
                k: time.time() - v 
                for k, v in RateLimitManager._last_calls.items()
            }
        }
