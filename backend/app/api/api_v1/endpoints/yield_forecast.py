from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field

from app.core import security
from app.services.yield_forecast_service import build_yield_forecast

router = APIRouter()


def get_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None


def get_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found in token")
    return str(user_id)


class YieldForecastRequest(BaseModel):
    apiary_id: Optional[str] = Field(default=None, description="Optional apiary to anchor the analysis")
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    date_from: date
    date_to: date
    radius_m: int = Field(default=2000, ge=250, le=20000)
    vegetation_index: str = Field(default="NDVI")
    crop_profile: str = Field(default="general")
    bee_activity_pct: Optional[float] = Field(default=None, ge=0, le=100)


@router.post("/run", response_model=dict)
async def run_yield_forecast(
    payload: YieldForecastRequest,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    try:
        return await build_yield_forecast(
            user_id=user_id,
            token=token,
            apiary_id=payload.apiary_id,
            latitude=payload.latitude,
            longitude=payload.longitude,
            date_from=payload.date_from,
            date_to=payload.date_to,
            radius_m=payload.radius_m,
            vegetation_index=payload.vegetation_index,
            crop_profile=payload.crop_profile,
            bee_activity_pct=payload.bee_activity_pct,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
