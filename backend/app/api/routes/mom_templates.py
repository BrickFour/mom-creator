import re
import time

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from supabase import Client

from app.services.supabase import create_admin_supabase_client
from app.core.security import get_access_token, get_supabase, get_authenticated_user

from app.schemas.mom_template import (
    MOMTemplateCreate,
    MOMTemplateUpdate,
    MOMTemplateResponse,
)


router = APIRouter(
    prefix="/api/v1/mom-templates",
    tags=["MOM Templates"],
)


BUCKET_NAME = "workspace-mom-template"

ALLOWED_TEMPLATE_MIME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

MAX_TEMPLATE_SIZE = 10 * 1024 * 1024


def get_workspace_membership(
    admin_supabase,
    workspace_id: str,
    user_id: str,
):
    response = (
        admin_supabase
        .table("workspace_members")
        .select("role")
        .eq("workspace_id", workspace_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    if not response or not response.data:
        return None

    return response.data[0]


def require_member(
    admin_supabase,
    workspace_id: str,
    user_id: str,
):
    membership = get_workspace_membership(
        admin_supabase,
        workspace_id,
        user_id,
    )

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this workspace",
        )

    return membership


def require_owner(
    admin_supabase,
    workspace_id: str,
    user_id: str,
):
    membership = require_member(
        admin_supabase,
        workspace_id,
        user_id,
    )

    if membership.get("role") != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the workspace owner can manage the MOM template",
        )

    return membership


def validate_storage_path(
    workspace_id: str,
    file_path: str,
):
    expected_prefix = f"{workspace_id}/"

    if not file_path.startswith(expected_prefix):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid MOM template storage path",
        )

    if file_path.count("/") != 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid MOM template storage path",
        )


def verify_storage_file(
    admin_supabase,
    file_path: str,
):
    directory = "/".join(file_path.split("/")[:-1])
    filename = file_path.split("/")[-1]

    response = (
        admin_supabase.storage
        .from_(BUCKET_NAME)
        .list(directory)
    )

    if response is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file was not found",
        )

    file_exists = any(
        item.get("name") == filename
        for item in response
    )

    if not file_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file does not exist in storage",
        )


@router.post("/workspace/{workspace_id}/upload")
async def upload_workspace_mom_template_file(
    workspace_id: str,
    file: UploadFile = File(...),
    supabase: Client = Depends(get_supabase),
    access_token: str = Depends(get_access_token),
):
    """
    Upload a MOM template file to Supabase Storage via the trusted backend.

    Demo accounts never hold a real Supabase Auth session, so a direct
    browser -> Supabase Storage upload is rejected by RLS as anonymous.
    This endpoint re-checks workspace ownership and performs the storage
    write with the service-role client instead.
    """

    user_id = get_authenticated_user(supabase, access_token).id
    admin_supabase = create_admin_supabase_client()

    require_owner(
        admin_supabase,
        workspace_id,
        user_id,
    )

    if file.content_type not in ALLOWED_TEMPLATE_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOC, and DOCX files are supported",
        )

    contents = await file.read()

    if len(contents) > MAX_TEMPLATE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be 10 MB or less",
        )

    safe_name = re.sub(r"[^\w.\- ]+", "", file.filename or "template").strip()
    safe_name = re.sub(r"\s+", "-", safe_name)
    file_path = f"{workspace_id}/{int(time.time() * 1000)}-{safe_name}"

    try:
        admin_supabase.storage.from_(BUCKET_NAME).upload(
            file_path,
            contents,
            {
                "content-type": file.content_type or "application/octet-stream",
                "upsert": "false",
            },
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload to storage: {exc}",
        )

    return {
        "file_path": file_path,
        "file_name": file.filename,
        "file_type": file.content_type,
        "file_size": len(contents),
    }


@router.get(
    "/workspace/{workspace_id}",
    response_model=MOMTemplateResponse | None,
)
def get_workspace_mom_template(
    workspace_id: str,
    supabase: Client = Depends(get_supabase),
    access_token: str = Depends(get_access_token),
):
    user_id = get_authenticated_user(supabase, access_token).id
    admin_supabase = create_admin_supabase_client()

    require_member(
        admin_supabase,
        workspace_id,
        user_id,
    )

    response = (
        admin_supabase
        .table("workspace_mom_templates")
        .select("*")
        .eq("workspace_id", workspace_id)
        .limit(1)
        .execute()
    )

    if not response or not response.data:
        return None

    return response.data[0]


@router.post(
    "/workspace/{workspace_id}",
    response_model=MOMTemplateResponse,
)
def create_workspace_mom_template(
    workspace_id: str,
    payload: MOMTemplateCreate,
    supabase: Client = Depends(get_supabase),
    access_token: str = Depends(get_access_token),
):
    user_id = get_authenticated_user(supabase, access_token).id
    admin_supabase = create_admin_supabase_client()

    require_owner(
        admin_supabase,
        workspace_id,
        user_id,
    )

    if payload.source_type not in {"template", "example"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="source_type must be 'template' or 'example'",
        )

    validate_storage_path(
        workspace_id,
        payload.file_path,
    )

    verify_storage_file(
        admin_supabase,
        payload.file_path,
    )

    existing = (
        admin_supabase
        .table("workspace_mom_templates")
        .select("id")
        .eq("workspace_id", workspace_id)
        .limit(1)
        .execute()
    )

    if existing and existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This workspace already has an MOM template. Use replace.",
        )

    response = (
        admin_supabase
        .table("workspace_mom_templates")
        .insert(
            {
                "workspace_id": workspace_id,
                "name": payload.name,
                "file_name": payload.file_name,
                "file_path": payload.file_path,
                "file_type": payload.file_type,
                "file_size": payload.file_size,
                "source_type": payload.source_type,
                "created_by": user_id,
            }
        )
        .execute()
    )

    if not response or not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create MOM template",
        )

    return response.data[0]


@router.patch(
    "/workspace/{workspace_id}",
    response_model=MOMTemplateResponse,
)
def update_workspace_mom_template(
    workspace_id: str,
    payload: MOMTemplateUpdate,
    supabase: Client = Depends(get_supabase),
    access_token: str = Depends(get_access_token),
):
    user_id = get_authenticated_user(supabase, access_token).id
    admin_supabase = create_admin_supabase_client()

    require_owner(
        admin_supabase,
        workspace_id,
        user_id,
    )

    existing = (
        admin_supabase
        .table("workspace_mom_templates")
        .select("*")
        .eq("workspace_id", workspace_id)
        .limit(1)
        .execute()
    )

    if not existing or not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MOM template not found",
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    if "source_type" in update_data:
        if update_data["source_type"] not in {
            "template",
            "example",
        }:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="source_type must be 'template' or 'example'",
            )

    if "file_path" in update_data:
        validate_storage_path(
            workspace_id,
            update_data["file_path"],
        )

        verify_storage_file(
            admin_supabase,
            update_data["file_path"],
        )

    response = (
        admin_supabase
        .table("workspace_mom_templates")
        .update(update_data)
        .eq("workspace_id", workspace_id)
        .execute()
    )

    if not response or not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MOM template not found",
        )

    return response.data[0]


@router.delete(
    "/workspace/{workspace_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_workspace_mom_template(
    workspace_id: str,
    supabase: Client = Depends(get_supabase),
    access_token: str = Depends(get_access_token),
):
    user_id = get_authenticated_user(supabase, access_token).id
    admin_supabase = create_admin_supabase_client()

    require_owner(
        admin_supabase,
        workspace_id,
        user_id,
    )

    existing = (
        admin_supabase
        .table("workspace_mom_templates")
        .select("file_path")
        .eq("workspace_id", workspace_id)
        .limit(1)
        .execute()
    )

    if not existing or not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MOM template not found",
        )

    file_path = existing.data[0].get("file_path")

    if file_path:
        try:
            (
                admin_supabase.storage
                .from_(BUCKET_NAME)
                .remove([file_path])
            )
        except Exception as exc:
            print(
                f"[MOM TEMPLATE STORAGE DELETE] {exc}"
            )

    response = (
        admin_supabase
        .table("workspace_mom_templates")
        .delete()
        .eq("workspace_id", workspace_id)
        .execute()
    )

    if not response or not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to delete MOM template",
        )

    return None