from fastapi import APIRouter
from app.api.api_v1.endpoints import (
    company, auth, traceability, contact, 
    forms, shop, blog, careers, media
)

api_router = APIRouter()

api_router.include_router(company.router, prefix="/company", tags=["Company"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(traceability.router, prefix="/traceability", tags=["Traceability"])
api_router.include_router(contact.router, prefix="/contact", tags=["Contact"])
api_router.include_router(forms.router, prefix="/forms", tags=["Forms"])
api_router.include_router(shop.router, prefix="/shop", tags=["Shop"])
api_router.include_router(blog.router, prefix="/blog", tags=["Blog"])
api_router.include_router(careers.router, prefix="/careers", tags=["Careers"])
api_router.include_router(media.router, prefix="/media", tags=["Media"])

@api_router.get("/health")
def health_check():
    return {"status": "ok", "message": "BeeYield Backend is running smoothly"}
