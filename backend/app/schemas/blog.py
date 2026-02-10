from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BlogPostCreate(BaseModel):
    title: str
    slug: Optional[str] = None # Can be auto-generated
    excerpt: str
    content: str
    featured_image: Optional[str] = None
    category: str
    tags: list[str] = []
    
class BlogPost(BlogPostCreate):
    id: str
    author_id: str
    status: str # draft, published
    read_time_minutes: int
    published_at: Optional[datetime]
    created_at: datetime

class OutlineGenerationRequest(BaseModel):
    post_id: str

class ChapterGenerationRequest(BaseModel):
    post_id: str
    chapter_id: str
