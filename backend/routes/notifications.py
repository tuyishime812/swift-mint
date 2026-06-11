from fastapi import APIRouter, Depends, HTTPException, Query

from database import supabase
from routes.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/")
def list_notifications(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False),
    user: dict = Depends(get_current_user),
):
    query = (
        supabase.table("notifications")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
    )
    if unread_only:
        query = query.eq("is_read", False)
    result = query.execute()
    return {"notifications": result.data}


@router.get("/unread-count")
def unread_count(user: dict = Depends(get_current_user)):
    result = (
        supabase.table("notifications")
        .select("id", count="exact")
        .eq("user_id", user["id"])
        .eq("is_read", False)
        .execute()
    )
    return {"count": result.count}


@router.patch("/{notif_id}/read")
def mark_read(notif_id: str, user: dict = Depends(get_current_user)):
    notif = supabase.table("notifications").select("*").eq("id", notif_id).execute()
    if not notif.data:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notif.data[0]["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your notification")
    supabase.table("notifications").update({"is_read": True}).eq("id", notif_id).execute()
    return {"success": True}


@router.patch("/mark-all-read")
def mark_all_read(user: dict = Depends(get_current_user)):
    supabase.table("notifications").update({"is_read": True}).eq(
        "user_id", user["id"]
    ).eq("is_read", False).execute()
    return {"success": True}
