import re
import time

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from supabase import Client
from app.services.supabase import create_admin_supabase_client

from app.core.security import (
    get_access_token,
    get_supabase,
    get_authenticated_user,
)


router = APIRouter(
    prefix="/api/v1/attachments",
    tags=["Attachments"],
)


ALLOWED_BUCKETS = {
    "meeting-files",
    "meeting-audio",
    "meeting-video",
    "workspace-mom-template",
}


@router.post("/upload")
async def upload_attachment(
    file: UploadFile = File(...),
    bucket: str = Form(...),
    workspace_id: str = Form(...),
    meeting_id: str = Form(...),
    custom_file_name: str | None = Form(None),
    supabase: Client = Depends(get_supabase),
    access_token: str = Depends(get_access_token),
):
    """
    Upload a file to Supabase Storage via the trusted backend.

    Demo accounts never hold a real Supabase Auth session, so the browser
    cannot upload to Storage directly (it gets rejected by RLS). This
    endpoint authenticates the caller the same way the rest of the API
    does, re-validates workspace/meeting ownership, then performs the
    actual storage write with the service-role client.
    """

    get_authenticated_user(supabase, access_token)

    if bucket not in ALLOWED_BUCKETS:
        raise HTTPException(
            status_code=400,
            detail="Invalid storage bucket",
        )

    meeting_response = (
        supabase
        .table("meetings")
        .select("id,workspace_id")
        .eq("id", meeting_id)
        .execute()
    )

    if not meeting_response.data:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    meeting = meeting_response.data[0]

    if meeting["workspace_id"] != workspace_id:
        raise HTTPException(
            status_code=400,
            detail="Meeting does not belong to the given workspace",
        )

    original_name = custom_file_name or file.filename or "recording.webm"
    safe_name = re.sub(r"[^a-zA-Z0-9._-]", "_", original_name)
    file_name = f"{int(time.time() * 1000)}_{safe_name}"
    file_path = f"{workspace_id}/{meeting_id}/{file_name}"

    contents = await file.read()

    admin_supabase = create_admin_supabase_client()

    try:
        admin_supabase.storage.from_(bucket).upload(
            file_path,
            contents,
            {
                "content-type": file.content_type or "application/octet-stream",
                "upsert": "true",
            },
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload to storage: {exc}",
        )

    return {
        "path": file_path,
        "fileName": file_name,
        "fileType": file.content_type or "application/octet-stream",
        "fileSize": len(contents),
    }


class UploadConfirmRequest(BaseModel):
    meeting_id: str | None = None
    workspace_id: str | None = None
    bucket: str
    path: str
    file_name: str
    file_type: str | None = None
    file_size: int | None = None
    attachment_type: str = "meeting_attachment"


@router.post("/confirm")
async def confirm_upload(
    payload: UploadConfirmRequest,
    supabase: Client = Depends(get_supabase),
    access_token: str = Depends(get_access_token),
):
    # --------------------------------------------------------
    # Authenticate user
    # --------------------------------------------------------

    user = get_authenticated_user(supabase, access_token)
    user_id = user.id

    # --------------------------------------------------------
    # Validate bucket
    # --------------------------------------------------------

    if payload.bucket not in ALLOWED_BUCKETS:
        raise HTTPException(
            status_code=400,
            detail="Invalid storage bucket",
        )

    # --------------------------------------------------------
    # Validate attachment type
    # --------------------------------------------------------

    if payload.attachment_type not in {
        "meeting_attachment",
        "imported_mom",
        "workspace_mom_template",
    }:
        raise HTTPException(
            status_code=400,
            detail="Invalid attachment type",
        )

    # --------------------------------------------------------
    # Get meeting
    # --------------------------------------------------------

    meeting_response = (
        supabase
        .table("meetings")
        .select("id,workspace_id")
        .eq("id", payload.meeting_id)
        .execute()
    )

    if not meeting_response.data:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    meeting = meeting_response.data[0]

    # --------------------------------------------------------
    # Validate storage path
    # --------------------------------------------------------

    expected_prefix = (
        f"{meeting['workspace_id']}/"
        f"{meeting['id']}/"
    )

    if not payload.path.startswith(expected_prefix):
        raise HTTPException(
            status_code=400,
            detail="Invalid storage path",
        )

    # --------------------------------------------------------
    # Verify object actually exists
    # --------------------------------------------------------

    admin_supabase = create_admin_supabase_client()

    directory = "/".join(
        payload.path.split("/")[:-1]
    )

    filename = payload.path.split("/")[-1]

    storage_response = (
        admin_supabase.storage
        .from_(payload.bucket)
        .list(directory)
    )

    if storage_response is None:
        raise HTTPException(
            status_code=404,
            detail="Uploaded file not found",
        )

    file_exists = any(
        item.get("name") == filename
        for item in storage_response
    )

    if not file_exists:
        raise HTTPException(
            status_code=404,
            detail="Uploaded file does not exist in storage",
        )

    # --------------------------------------------------------
    # Create attachment record
    # --------------------------------------------------------

    response = (
        supabase
        .table("attachments")
        .insert({
            "meeting_id": payload.meeting_id,
            "uploaded_by": user_id,
            "file_name": payload.file_name,
            "file_path": payload.path,
            "file_type": payload.file_type,
            "file_size": payload.file_size,
            "attachment_type": payload.attachment_type,
        })
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=400,
            detail="Failed to create attachment",
        )

    return {
        "attachment": response.data[0],
        "message": "Upload confirmed",
    }