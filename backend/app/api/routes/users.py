from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.core.security import (
    get_access_token,
    get_supabase,
    get_authenticated_user,
)
from app.schemas.user import MeResponse


router = APIRouter(
    prefix="/me",
    tags=["Users"],
)


@router.get(
    "",
    response_model=MeResponse,
)
async def get_current_user(
    supabase: Client = Depends(get_supabase),
    access_token: str = Depends(get_access_token),
):
    """
    Return the currently authenticated user and their profile.
    Supports both standard Supabase tokens and demo accounts.
    """
    user = get_authenticated_user(
        supabase,
        access_token,
    )

    try:
        response = (
            supabase
            .table("profiles")
            .select(
                "id,name,created_at,updated_at"
            )
            .eq("id", user.id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load profile: {exc}",
        )

    profile_data = response.data[0] if response.data else None

    if profile_data is None:
        # If demo user profile is being created on the fly
        name = (user.user_metadata or {}).get("name") if hasattr(user, "user_metadata") else user.email
        try:
            insert_res = supabase.table("profiles").insert({"id": user.id, "name": name}).execute()
            profile_data = insert_res.data[0] if insert_res.data else {"id": user.id, "name": name}
        except Exception:
            profile_data = {"id": user.id, "name": name}

    return {
        "user": {
            "id": user.id,
            "email": user.email,
        },
        "profile": profile_data,
    }
