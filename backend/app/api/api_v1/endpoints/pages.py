"""
Page Data Endpoints
Returns structured data for frontend pages by slug.
"""
from fastapi import APIRouter, HTTPException
from typing import Any, Callable

from app.api.api_v1.endpoints import (
    company,
    services,
    blog,
    media,
    careers,
    shop,
    traceability,
)

router = APIRouter()

KNOWN_PAGE_SLUGS = [
    "home",
    "about",
    "team",
    "ourstory",
    "commitment",
    "impact",
    "esg",
    "blogs",
    "media",
    "careers",
    "contact",
    "pollination-request",
    "pollination-solutions",
    "precision-pollination",
    "in-land-pollination",
    "crops-we-pollinate",
    "global-hive-network",
    "honey",
    "learn",
    "traceability",
    "shop",
    "checkout",
    "account-settings",
    "my-account",
    "update-password",
    "my-devices",
    "hub-setup",
    "diseases",
    "beeyield-dashboard",
    "admin",
]


def _safe_call(fn: Callable[[], Any], errors: list[str], label: str, fallback: Any) -> Any:
    try:
        return fn()
    except Exception as exc:
        errors.append(f"{label}: {exc}")
        return fallback


def _page_about(errors: list[str]) -> dict[str, Any]:
    return {
        "company_info": _safe_call(company.company_info, errors, "company_info", {}),
        "story": _safe_call(company.get_company_story, errors, "company_story", {}),
        "stats": _safe_call(company.get_company_stats, errors, "company_stats", []),
        "team": _safe_call(company.team_members, errors, "team_members", []),
    }


def _page_team(errors: list[str]) -> dict[str, Any]:
    return {
        "team": _safe_call(company.team_members, errors, "team_members", []),
    }


def _page_story(errors: list[str]) -> dict[str, Any]:
    return {
        "story": _safe_call(company.get_company_story, errors, "company_story", {}),
    }


def _page_impact(errors: list[str]) -> dict[str, Any]:
    return {
        "stories": _safe_call(services.get_impact_stories, errors, "impact_stories", []),
        "sdgs": _safe_call(services.get_sdgs, errors, "sdgs", []),
        "metrics": _safe_call(services.get_esg_metrics, errors, "esg_metrics", []),
        "stats": _safe_call(company.get_company_stats, errors, "company_stats", []),
    }


def _page_esg(errors: list[str]) -> dict[str, Any]:
    return {
        "metrics": _safe_call(services.get_esg_metrics, errors, "esg_metrics", []),
        "pillars": _safe_call(services.get_esg_pillars, errors, "esg_pillars", []),
        "sdgs": _safe_call(services.get_sdgs, errors, "sdgs", []),
    }


def _page_blogs(errors: list[str]) -> dict[str, Any]:
    return {
        "posts": _safe_call(lambda: blog.get_blog_posts(limit=10, offset=0), errors, "blog_posts", []),
        "categories": _safe_call(blog.get_blog_categories, errors, "blog_categories", []),
    }


def _page_media(errors: list[str]) -> dict[str, Any]:
    return {
        "items": _safe_call(media.get_media_items, errors, "media_items", []),
        "featured": _safe_call(media.get_featured_media, errors, "media_featured", []),
    }


def _page_careers(errors: list[str]) -> dict[str, Any]:
    return {
        "jobs": _safe_call(careers.get_job_listings, errors, "job_listings", []),
    }


def _page_pollination(errors: list[str]) -> dict[str, Any]:
    return {
        "services": _safe_call(services.get_pollination_services, errors, "pollination_services", []),
        "crops": _safe_call(services.get_crops, errors, "crops", []),
    }


def _page_pollination_by_slug(slug: str, errors: list[str]) -> dict[str, Any]:
    payload = _page_pollination(errors)
    services_list = payload.get("services", [])
    payload["service"] = next((item for item in services_list if item.get("slug") == slug), None)
    return payload


def _page_crops(errors: list[str]) -> dict[str, Any]:
    return {
        "crops": _safe_call(services.get_crops, errors, "crops", []),
    }


def _page_global_network(errors: list[str]) -> dict[str, Any]:
    return {
        "apiaries": _safe_call(services.get_apiaries, errors, "apiaries", []),
    }


def _page_learn(errors: list[str]) -> dict[str, Any]:
    return {
        "modules": _safe_call(services.get_learning_modules, errors, "learning_modules", []),
    }


def _page_shop(errors: list[str]) -> dict[str, Any]:
    return {
        "products": _safe_call(shop.get_products, errors, "shop_products", []),
    }


def _page_honey(errors: list[str]) -> dict[str, Any]:
    return {
        "products": _safe_call(lambda: shop.get_products(category="honey"), errors, "honey_products", []),
    }


def _page_traceability(errors: list[str]) -> dict[str, Any]:
    return {
        "chain": _safe_call(traceability.get_blockchain_status, errors, "traceability_chain", {}),
    }


def _page_contact(_: list[str]) -> dict[str, Any]:
    return {
        "forms": {
            "contact": "/api/v1/contact/submit",
            "pollination": "/api/v1/contact/pollination",
            "newsletter": "/api/v1/contact/newsletter",
        }
    }


def _page_static(_: list[str], note: str) -> dict[str, Any]:
    return {"note": note}


PAGE_BUILDERS: dict[str, Callable[[list[str]], dict[str, Any]]] = {
    "home": _page_about,
    "about": _page_about,
    "team": _page_team,
    "ourstory": _page_story,
    "impact": _page_impact,
    "esg": _page_esg,
    "blogs": _page_blogs,
    "media": _page_media,
    "careers": _page_careers,
    "pollination-request": _page_pollination,
    "pollination-solutions": _page_pollination,
    "precision-pollination": lambda errors: _page_pollination_by_slug("precision-pollination", errors),
    "in-land-pollination": lambda errors: _page_pollination_by_slug("in-land-pollination", errors),
    "crops-we-pollinate": _page_crops,
    "global-hive-network": _page_global_network,
    "learn": _page_learn,
    "shop": _page_shop,
    "honey": _page_honey,
    "traceability": _page_traceability,
    "contact": _page_contact,
    "commitment": lambda errors: _page_static(errors, "Static page content only"),
    "checkout": lambda errors: _page_static(errors, "Client checkout with /api/v1/shop/checkout/init"),
    "account-settings": lambda errors: _page_static(errors, "Client account settings"),
    "my-account": lambda errors: _page_static(errors, "Client account dashboard"),
    "update-password": lambda errors: _page_static(errors, "Client password update"),
    "my-devices": lambda errors: _page_static(errors, "Client devices page"),
    "hub-setup": lambda errors: _page_static(errors, "Client USB hub setup"),
    "diseases": lambda errors: _page_static(errors, "Client disease education page"),
    "beeyield-dashboard": lambda errors: _page_static(errors, "Client dashboard"),
    "admin": lambda errors: _page_static(errors, "Client admin dashboard"),
}


@router.get("/", response_model=dict[str, Any])
def list_pages():
    """
    List supported page slugs for the frontend.
    """
    return {"pages": sorted(PAGE_BUILDERS.keys())}


@router.get("/{slug}", response_model=dict[str, Any])
def get_page(slug: str):
    """
    Return structured page data based on page slug.
    """
    normalized = slug.strip().lower()
    if normalized in ("", "index", "home"):
        normalized = "home"

    builder = PAGE_BUILDERS.get(normalized)
    if not builder:
        raise HTTPException(status_code=404, detail=f"Unknown page slug: {slug}")

    errors: list[str] = []
    data = builder(errors)

    return {
        "slug": normalized,
        "data": data,
        "errors": errors,
    }
