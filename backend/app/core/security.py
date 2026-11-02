from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from app.services.supabase import (
    create_user_supabase_client,
    create_admin_supabase_client,
)
from app.core.demo_accounts import (
    is_demo_token,
    get_demo_user_from_token,
    ensure_demo_user_db_state,
)


security = HTTPBearer(
    auto_error=True,
)


def get_access_token(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
) -> str:
    return credentials.credentials


def get_supabase(
    access_token: str = Depends(
        get_access_token
    ),
) -> Client:
    # If the request comes with a demo token, return admin Supabase client so PostgREST RLS does not reject it
    if is_demo_token(access_token):
        return create_admin_supabase_client()

    try:
        return create_user_supabase_client(
            access_token
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize Supabase client: {exc}",
        )


def get_authenticated_user(
    supabase: Client,
    access_token: str,
):
    """
    Authenticate the caller.
    If using a demo account token, returns the corresponding demo user and ensures
    their profile and workspace exist in the real project database.
    Otherwise verifies the token against Supabase Auth.
    """
    if is_demo_token(access_token):
        demo_user = get_demo_user_from_token(access_token)
        if not demo_user:
            raise HTTPException(
                status_code=401,
                detail="Invalid demo token or demo account not found",
            )
        try:
            admin_client = create_admin_supabase_client()
            ensure_demo_user_db_state(admin_client, demo_user)
        except Exception:
            pass
        return demo_user

    try:
        response = supabase.auth.get_user(access_token)
    except Exception as exc:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication token: {exc}",
        )

    user = response.user
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )

    return user
