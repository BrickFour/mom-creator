from datetime import datetime, timezone
import logging
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.core.security import (
    get_access_token,
    get_supabase,
    get_authenticated_user,
)
from app.schemas.mom import (
    MOMResponse,
    MOMShareRequest,
    MOMShareResponse,
    MOMUpdate,
)
from app.services.supabase import create_admin_supabase_client

logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/api/v1/moms",
    tags=["MOMs"],
)

# ============================================================
# GET MOM BY MEETING
# ============================================================

@router.get(
    "/meeting/{meeting_id}",
    response_model=MOMResponse,
)
async def get_mom_by_meeting(
    meeting_id: str,
    supabase: Client = Depends(get_supabase),
):
    """
    Get the MOM associated with a meeting.
    """

    response = (
        supabase
        .table("moms")
        .select(
            """
            id,
            meeting_id,
            created_by,
            title,
            summary,
            transcript,
            key_discussion_points,
            decisions,
            next_steps,
            abbreviations_used,
            status,
            generated_at,
            created_at,
            updated_at
            """
        )
        .eq("meeting_id", meeting_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="MOM not found for this meeting",
        )

    return response.data[0]
# ============================================================
# GET MOM
# ============================================================

@router.get(
    "/{mom_id}",
    response_model=MOMResponse,
)
async def get_mom(
    mom_id: str,
    supabase: Client = Depends(get_supabase),
):
    """
    Get a single MOM by ID.

    RLS is enforced through the user-scoped Supabase client.
    """

    response = (
        supabase
        .table("moms")
        .select(
            """
            id,
            meeting_id,
            created_by,
            title,
            summary,
            transcript,
            key_discussion_points,
            decisions,
            next_steps,
            abbreviations_used,
            status,
            generated_at,
            created_at,
            updated_at
            """
        )
        .eq("id", mom_id)
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="MOM not found",
        )

    return response.data


# ============================================================
# UPDATE MOM
# ============================================================

@router.patch(
    "/{mom_id}",
    response_model=MOMResponse,
)
async def update_mom(
    mom_id: str,
    payload: MOMUpdate,
    supabase: Client = Depends(get_supabase),
):
    """
    Update an existing MOM.

    Draft and reviewed MOMs can be edited.
    Finalized MOMs are locked.
    """

    # --------------------------------------------------------
    # Get existing MOM
    # --------------------------------------------------------

    existing_response = (
        supabase
        .table("moms")
        .select(
            """
            id,
            meeting_id,
            created_by,
            title,
            summary,
            transcript,
            key_discussion_points,
            decisions,
            next_steps,
            abbreviations_used,
            status,
            generated_at,
            created_at,
            updated_at
            """
        )
        .eq("id", mom_id)
        .single()
        .execute()
    )

    if not existing_response.data:
        raise HTTPException(
            status_code=404,
            detail="MOM not found",
        )

    existing_mom = existing_response.data

    # --------------------------------------------------------
    # Prevent editing finalized MOM
    # --------------------------------------------------------

    if existing_mom["status"] == "finalized":
        raise HTTPException(
            status_code=409,
            detail="Finalized MOM cannot be edited",
        )

    # --------------------------------------------------------
    # Build update payload
    # --------------------------------------------------------

    update_data = payload.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update",
        )

    # --------------------------------------------------------
    # Validate title
    # --------------------------------------------------------

    if "title" in update_data:

        title = update_data["title"]

        if not isinstance(title, str):
            raise HTTPException(
                status_code=400,
                detail="MOM title must be a string",
            )

        title = title.strip()

        if not title:
            raise HTTPException(
                status_code=400,
                detail="MOM title cannot be empty",
            )

        update_data["title"] = title

    # --------------------------------------------------------
    # Validate summary
    # --------------------------------------------------------

    if "summary" in update_data:

        summary = update_data["summary"]

        if summary is not None:

            if not isinstance(summary, str):
                raise HTTPException(
                    status_code=400,
                    detail="MOM summary must be a string",
                )

            update_data["summary"] = summary.strip()

    # --------------------------------------------------------
    # Validate list fields
    # --------------------------------------------------------

    for field in (
        "key_discussion_points",
        "decisions",
        "next_steps",
    ):

        if field not in update_data:
            continue

        value = update_data[field]

        if not isinstance(value, list):
            raise HTTPException(
                status_code=400,
                detail=f"{field} must be a list",
            )

        for index, item in enumerate(value):

            if not isinstance(item, str):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"{field}[{index}] "
                        "must be a string"
                    ),
                )

            if not item.strip():
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"{field}[{index}] "
                        "cannot be empty"
                    ),
                )

        update_data[field] = [
            item.strip()
            for item in value
        ]

    # --------------------------------------------------------
    # Validate abbreviations
    # --------------------------------------------------------

    if "abbreviations_used" in update_data:

        abbreviations = update_data[
            "abbreviations_used"
        ]

        if not isinstance(
            abbreviations,
            dict,
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "abbreviations_used "
                    "must be an object"
                ),
            )

        cleaned_abbreviations = {}

        for abbreviation, meaning in (
            abbreviations.items()
        ):

            if not isinstance(
                abbreviation,
                str,
            ):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Abbreviation keys "
                        "must be strings"
                    ),
                )

            if not isinstance(
                meaning,
                str,
            ):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Meaning for '{abbreviation}' "
                        "must be a string"
                    ),
                )

            abbreviation = abbreviation.strip()
            meaning = meaning.strip()

            if not abbreviation:
                raise HTTPException(
                    status_code=400,
                    detail="Abbreviation cannot be empty",
                )

            if not meaning:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Meaning for '{abbreviation}' "
                        "cannot be empty"
                    ),
                )

            cleaned_abbreviations[
                abbreviation
            ] = meaning

        update_data[
            "abbreviations_used"
        ] = cleaned_abbreviations

    # --------------------------------------------------------
    # Update database
    # --------------------------------------------------------

    updated_response = (
        supabase
        .table("moms")
        .update(update_data)
        .eq("id", mom_id)
        .execute()
    )

    if not updated_response.data:
        raise HTTPException(
            status_code=400,
            detail="Failed to update MOM",
        )

    return updated_response.data[0]


# ============================================================
# REVIEW MOM
# ============================================================

@router.post(
    "/{mom_id}/review",
    response_model=MOMResponse,
)
async def review_mom(
    mom_id: str,
    supabase: Client = Depends(get_supabase),
):
    """
    Mark a MOM as reviewed.

    draft -> reviewed

    Reviewed MOMs remain editable.
    Finalized MOMs cannot be reviewed.
    """

    # --------------------------------------------------------
    # Get existing MOM
    # --------------------------------------------------------

    existing_response = (
        supabase
        .table("moms")
        .select(
            """
            id,
            meeting_id,
            created_by,
            title,
            summary,
            transcript,
            key_discussion_points,
            decisions,
            next_steps,
            abbreviations_used,
            status,
            generated_at,
            created_at,
            updated_at
            """
        )
        .eq("id", mom_id)
        .single()
        .execute()
    )

    if not existing_response.data:
        raise HTTPException(
            status_code=404,
            detail="MOM not found",
        )

    existing_mom = existing_response.data

    # --------------------------------------------------------
    # Prevent reviewing finalized MOM
    # --------------------------------------------------------

    if existing_mom["status"] == "finalized":
        raise HTTPException(
            status_code=409,
            detail="Finalized MOM cannot be reviewed",
        )

    # --------------------------------------------------------
    # Mark as reviewed
    # --------------------------------------------------------

    response = (
        supabase
        .table("moms")
        .update(
            {
                "status": "reviewed",
            }
        )
        .eq("id", mom_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=400,
            detail="Failed to mark MOM as reviewed",
        )

    return response.data[0]


# ============================================================
# FINALIZE MOM
# ============================================================

@router.post(
    "/{mom_id}/finalize",
    response_model=MOMResponse,
)
async def finalize_mom(
    mom_id: str,
    supabase: Client = Depends(get_supabase),
):
    """
    Finalize a reviewed MOM.

    reviewed -> finalized

    Once finalized, the MOM becomes locked.
    """

    # --------------------------------------------------------
    # Get existing MOM
    # --------------------------------------------------------

    existing_response = (
        supabase
        .table("moms")
        .select(
            """
            id,
            meeting_id,
            created_by,
            title,
            summary,
            transcript,
            key_discussion_points,
            decisions,
            next_steps,
            abbreviations_used,
            status,
            generated_at,
            created_at,
            updated_at
            """
        )
        .eq("id", mom_id)
        .single()
        .execute()
    )

    if not existing_response.data:
        raise HTTPException(
            status_code=404,
            detail="MOM not found",
        )

    existing_mom = existing_response.data

    # --------------------------------------------------------
    # Validate current status
    # --------------------------------------------------------

    if existing_mom["status"] == "draft":
        raise HTTPException(
            status_code=409,
            detail=(
                "MOM must be reviewed before "
                "it can be finalized"
            ),
        )

    if existing_mom["status"] == "finalized":
        raise HTTPException(
            status_code=409,
            detail="MOM is already finalized",
        )

    if existing_mom["status"] != "reviewed":
        raise HTTPException(
            status_code=409,
            detail=(
                f"MOM cannot be finalized from "
                f"status '{existing_mom['status']}'"
            ),
        )

    # --------------------------------------------------------
    # Finalize MOM
    # --------------------------------------------------------

    response = (
        supabase
        .table("moms")
        .update(
            {
                "status": "finalized",
            }
        )
        .eq("id", mom_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=400,
            detail="Failed to finalize MOM",
        )

    return response.data[0]


# ============================================================
# SHARE / ASSIGN MOM TO WORKSPACE
# ============================================================

@router.post(
    "/{mom_id}/share",
    response_model=MOMShareResponse,
)
async def share_mom_to_workspace(
    mom_id: str,
    payload: MOMShareRequest,
    supabase: Client = Depends(get_supabase),
    access_token: str = Depends(get_access_token),
):
    """
    Assign/share a MOM to another workspace using the target workspace ID.
    Only the owner of the source workspace containing the MOM can assign it.
    This clones the meeting, MOM, action items, and participants into the target workspace.
    """
    # 1. Authenticate user
    user = get_authenticated_user(supabase, access_token)

    # 2. Validate target_workspace_id format
    raw_target_id = payload.target_workspace_id.strip()
    if not raw_target_id:
        raise HTTPException(
            status_code=400,
            detail="Target workspace ID cannot be empty",
        )
    try:
        target_uuid = UUID(raw_target_id)
        target_workspace_id = str(target_uuid)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid target workspace ID format. Must be a valid UUID.",
        )

    # 3. Retrieve source MOM using admin client
    admin_supabase = create_admin_supabase_client()
    source_mom_res = (
        admin_supabase
        .table("moms")
        .select("*")
        .eq("id", mom_id)
        .execute()
    )
    if not source_mom_res.data:
        raise HTTPException(
            status_code=404,
            detail="MOM not found",
        )
    source_mom = source_mom_res.data[0]

    # 4. Retrieve source meeting
    meeting_id = source_mom.get("meeting_id")
    source_meeting_res = (
        admin_supabase
        .table("meetings")
        .select("*")
        .eq("id", meeting_id)
        .execute()
    )
    if not source_meeting_res.data:
        raise HTTPException(
            status_code=404,
            detail="Meeting associated with this MOM not found",
        )
    source_meeting = source_meeting_res.data[0]
    source_workspace_id = source_meeting.get("workspace_id")

    # 5. Check if target workspace is identical to source
    if str(source_workspace_id) == target_workspace_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot assign MOM to the same workspace",
        )

    # 6. Verify caller is workspace owner of source workspace
    source_ws_res = (
        admin_supabase
        .table("workspaces")
        .select("id, name, created_by")
        .eq("id", source_workspace_id)
        .execute()
    )
    if not source_ws_res.data:
        raise HTTPException(
            status_code=404,
            detail="Source workspace not found",
        )
    source_workspace = source_ws_res.data[0]

    is_owner = False
    if str(source_workspace.get("created_by")) == str(user.id):
        is_owner = True
    else:
        membership_res = (
            admin_supabase
            .table("workspace_members")
            .select("role")
            .eq("workspace_id", source_workspace_id)
            .eq("user_id", user.id)
            .execute()
        )
        if membership_res.data and membership_res.data[0].get("role") == "owner":
            is_owner = True

    if not is_owner:
        raise HTTPException(
            status_code=403,
            detail="Only the workspace owner can assign or share this MOM to another workspace",
        )

    # 7. Verify target workspace exists
    target_ws_res = (
        admin_supabase
        .table("workspaces")
        .select("id, name, created_by")
        .eq("id", target_workspace_id)
        .execute()
    )
    if not target_ws_res.data:
        raise HTTPException(
            status_code=404,
            detail="Target workspace not found. Please verify the Workspace ID.",
        )
    target_workspace = target_ws_res.data[0]
    target_owner_id = target_workspace.get("created_by") or user.id

    # 8. Clone Meeting into Target Workspace
    new_meeting_id = str(uuid4())
    meeting_title = source_meeting.get("title", "Meeting")
    meeting_desc = source_meeting.get("description") or ""

    try:
        admin_supabase.table("meetings").insert({
            "id": new_meeting_id,
            "workspace_id": target_workspace_id,
            "created_by": target_owner_id,
            "title": meeting_title,
            "description": meeting_desc,
            "mode": source_meeting.get("mode") or "import",
            "status": "completed",
            "meeting_date": source_meeting.get("meeting_date"),
            "venue": source_meeting.get("venue"),
            "duration_seconds": source_meeting.get("duration_seconds"),
        }).execute()
    except Exception as exc:
        logger.error(f"Failed to create meeting in target workspace: {exc}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create meeting in target workspace: {exc}",
        )

    # 9. Clone MOM into Target Workspace
    new_mom_id = str(uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        admin_supabase.table("moms").insert({
            "id": new_mom_id,
            "meeting_id": new_meeting_id,
            "created_by": target_owner_id,
            "title": source_mom.get("title", meeting_title),
            "summary": source_mom.get("summary"),
            "transcript": source_mom.get("transcript"),
            "key_discussion_points": source_mom.get("key_discussion_points") or [],
            "decisions": source_mom.get("decisions") or [],
            "next_steps": source_mom.get("next_steps") or [],
            "abbreviations_used": source_mom.get("abbreviations_used") or {},
            "status": source_mom.get("status") or "draft",
            "generated_at": source_mom.get("generated_at") or now_iso,
        }).execute()
    except Exception as exc:
        logger.error(f"Failed to create MOM in target workspace: {exc}")
        try:
            admin_supabase.table("meetings").delete().eq("id", new_meeting_id).execute()
        except Exception:
            pass
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create MOM in target workspace: {exc}",
        )

    # 10. Copy Action Items
    try:
        action_items_res = (
            admin_supabase
            .table("action_items")
            .select("*")
            .eq("mom_id", mom_id)
            .execute()
        )
        if action_items_res.data:
            target_members_res = (
                admin_supabase
                .table("workspace_members")
                .select("user_id")
                .eq("workspace_id", target_workspace_id)
                .execute()
            )
            target_member_ids = {m["user_id"] for m in (target_members_res.data or [])}

            for item in action_items_res.data:
                assigned_to_id = item.get("assigned_to")
                valid_assigned_to = (
                    assigned_to_id if assigned_to_id in target_member_ids else None
                )
                admin_supabase.table("action_items").insert({
                    "id": str(uuid4()),
                    "mom_id": new_mom_id,
                    "meeting_id": new_meeting_id,
                    "created_by": target_owner_id,
                    "task": item.get("task", ""),
                    "assigned_to": valid_assigned_to,
                    "assigned_name": item.get("assigned_name"),
                    "due_date": item.get("due_date"),
                    "priority": item.get("priority") or "medium",
                    "completed_at": item.get("completed_at"),
                }).execute()
    except Exception as exc:
        logger.warning(f"Error copying action items to target workspace: {exc}")

    # 11. Copy Meeting Participants
    try:
        participants_res = (
            admin_supabase
            .table("meeting_participants")
            .select("*")
            .eq("meeting_id", meeting_id)
            .execute()
        )
        if participants_res.data:
            for part in participants_res.data:
                admin_supabase.table("meeting_participants").insert({
                    "meeting_id": new_meeting_id,
                    "name": part.get("name", "Participant"),
                    "email": part.get("email"),
                    "role": part.get("role"),
                    "created_by": target_owner_id,
                }).execute()
    except Exception as exc:
        logger.warning(f"Error copying participants to target workspace: {exc}")

    return MOMShareResponse(
        success=True,
        message=f"MOM successfully assigned to workspace '{target_workspace['name']}'",
        target_workspace_id=target_workspace_id,
        target_workspace_name=target_workspace["name"],
        new_meeting_id=new_meeting_id,
        new_mom_id=new_mom_id,
    )
