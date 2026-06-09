from fastapi import HTTPException, Depends
from routes.auth import get_current_user


def require_admin(user: dict = Depends(get_current_user)):
    if not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
