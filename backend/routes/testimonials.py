from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime
from models import TestimonialCreate, TestimonialResponse, ToggleTestimonialApproval
from database import supabase
from routes.auth import get_current_user
from routes.admin_base import require_admin

router = APIRouter(prefix="/api", tags=["testimonials"])


@router.get("/testimonials")
def list_testimonials():
    result = supabase.table("testimonials") \
        .select("*") \
        .eq("is_approved", True) \
        .order("created_at", desc=True) \
        .execute()
    return {"testimonials": [TestimonialResponse(**t).model_dump() for t in result.data]}


@router.post("/testimonials", status_code=201)
def create_testimonial(
    data: TestimonialCreate,
    user: dict = Depends(get_current_user),
):
    now = datetime.utcnow().isoformat()
    name = data.name or user.get("name", "Anonymous")
    location = data.location or user.get("location", "")

    result = supabase.table("testimonials").insert({
        "user_id": user["id"],
        "name": name,
        "location": location,
        "text": data.text,
        "stars": data.stars,
        "is_approved": False,
        "created_at": now,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create testimonial")

    return {"testimonial": TestimonialResponse(**result.data[0]).model_dump()}


@router.get("/admin/testimonials")
def admin_list_testimonials(
    approved: bool = Query(None),
    admin: dict = Depends(require_admin),
):
    q = supabase.table("testimonials").select("*")
    if approved is not None:
        q = q.eq("is_approved", approved)
    result = q.order("created_at", desc=True).execute()
    return {"testimonials": [TestimonialResponse(**t).model_dump() for t in result.data]}


@router.patch("/admin/testimonials/{testimonial_id}/approve")
def admin_approve_testimonial(
    testimonial_id: str,
    data: ToggleTestimonialApproval,
    admin: dict = Depends(require_admin),
):
    result = supabase.table("testimonials") \
        .update({"is_approved": data.is_approved}) \
        .eq("id", testimonial_id) \
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"testimonial": TestimonialResponse(**result.data[0]).model_dump()}


@router.delete("/admin/testimonials/{testimonial_id}")
def admin_delete_testimonial(
    testimonial_id: str,
    admin: dict = Depends(require_admin),
):
    result = supabase.table("testimonials") \
        .delete() \
        .eq("id", testimonial_id) \
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"success": True}
