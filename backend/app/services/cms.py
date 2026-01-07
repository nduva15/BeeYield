from typing import List, Optional
from datetime import datetime

def get_all_posts(category: Optional[str] = None):
    # Mock CMS
    return [
       {
          "id": "post-1",
          "title": "The Importance of Bees",
          "slug": "importance-of-bees",
          "excerpt": "Why bees matter...",
          "content": "Full article content...",
          "category": "Conservation",
          "featured_image": "/img/blog1.jpg",
          "tags": ["bees", "nature"],
          "author_id": "auth-1",
          "status": "published",
          "read_time_minutes": 5,
          "published_at": datetime.now(),
          "created_at": datetime.now()
       }
    ]

def create_post(post_data: dict):
    # Mock save
    post_data['id'] = "new-post-id"
    return post_data
