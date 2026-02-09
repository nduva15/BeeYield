from fastapi import Depends, HTTPException, status
from app.core import security

def get_current_user_id(current_user: dict = Depends(security.get_current_user)) -> str:
    """
    Utility dependency to get the current user ID from the JWT token.
    This module centralizes authentication dependencies.
    """
    user_id = current_user.get("sub") or current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    return str(user_id)
