import os
import asyncio
from celery import Celery
from app.services.ai_service import AIService
from app.core.config import settings

# Configure Celery to use Redis
# Ensure REDIS_URL is set in .env or use localhost default
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "beeyield_worker",
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Africa/Nairobi",
    enable_utc=True,
)

@celery_app.task(name="shop.generate_insight", bind=True, max_retries=3)
def task_generate_shop_insight(self, user_profile: dict, product_id: str, product_name: str):
    """
    Background task to generate shop insights.
    Prioritized for speed (sales critical).
    """
    try:
        # Since AIService methods are async, we need to run them in an event loop
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        result = loop.run_until_complete(
            AIService.generate_shop_insight(user_profile, product_id, product_name)
        )
        return result
    except Exception as e:
        self.retry(exc=e, countdown=1)

@celery_app.task(name="pollination.calculate_roi", bind=True)
def task_calculate_roi(self, acres: float, crop: str):
    """
    Background task for Pollination FOMO calculations.
    """
    try:
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        result = loop.run_until_complete(
            AIService.calculate_pollination_roi(acres, crop)
        )
        return result
    except Exception as e:
        self.retry(exc=e, countdown=2)
