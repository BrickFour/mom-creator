SET local check_function_bodies = off;

CREATE TABLE "public"."action_items" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "mom_id"          uuid                     NOT NULL,
  "meeting_id"      uuid                     NOT NULL,
  "created_by"      uuid                     NOT NULL,
  "task"            text                     NOT NULL,
  "assigned_to"     uuid,
  "assigned_name"   text,
  "due_date"        timestamp with time zone,
  "priority"        text                     NOT NULL DEFAULT 'medium'::text,
  "completed_at"    timestamp with time zone,
  "google_event_id" text,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "action_items_pkey" PRIMARY KEY (id),
  CONSTRAINT "action_items_priority_check" CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))),
  CONSTRAINT "action_items_task_check" CHECK (((char_length(TRIM(BOTH FROM task)) >= 1) AND (char_length(TRIM(BOTH FROM task)) <= 1000)))
);

ALTER TABLE "public"."action_items"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."attachments" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "meeting_id"      uuid                     NOT NULL,
  "uploaded_by"     uuid                     NOT NULL,
  "file_name"       text                     NOT NULL,
  "file_path"       text                     NOT NULL,
  "file_type"       text,
  "file_size"       bigint,
  "attachment_type" text                     NOT NULL DEFAULT 'meeting_attachment'::text,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "attachments_attachment_type_check" CHECK ((attachment_type = ANY (ARRAY['meeting_attachment'::text, 'imported_mom'::text]))),
  CONSTRAINT "attachments_file_name_check" CHECK (((char_length(TRIM(BOTH FROM file_name)) >= 1) AND (char_length(TRIM(BOTH FROM file_name)) <= 255))),
  CONSTRAINT "attachments_file_path_key" UNIQUE (file_path),
  CONSTRAINT "attachments_file_size_check" CHECK (((file_size IS NULL) OR (file_size >= 0))),
  CONSTRAINT "attachments_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."attachments"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."fireflies_connections" (
  "id"                   uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id"         uuid                     NOT NULL,
  "connected_by"         uuid                     NOT NULL,
  "fireflies_user_email" text,
  "is_active"            boolean                  NOT NULL DEFAULT true,
  "connected_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "last_sync_at"         timestamp with time zone,
  "updated_at"           timestamp with time zone NOT NULL DEFAULT now(),
  "api_key_encrypted"    text,
  "created_at"           timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "fireflies_connections_pkey" PRIMARY KEY (id),
  CONSTRAINT "fireflies_connections_workspace_unique" UNIQUE (workspace_id)
);

ALTER TABLE "public"."fireflies_connections"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."fireflies_meetings" (
  "id"                      uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id"            uuid                     NOT NULL,
  "meeting_id"              uuid                     NOT NULL,
  "fireflies_transcript_id" text                     NOT NULL,
  "original_title"          text,
  "organizer_email"         text,
  "transcript_url"          text,
  "meeting_link"            text,
  "participants"            jsonb                    NOT NULL DEFAULT '[]'::jsonb,
  "fireflies_date"          timestamp with time zone,
  "raw_metadata"            jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "imported_at"             timestamp with time zone NOT NULL DEFAULT now(),
  "created_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "duration_minutes"        numeric,
  "status"                  text                     NOT NULL DEFAULT 'pending'::text,
  "error_message"           text,
  CONSTRAINT "fireflies_meetings_fireflies_transcript_id_key" UNIQUE (fireflies_transcript_id),
  CONSTRAINT "fireflies_meetings_meeting_unique" UNIQUE (meeting_id),
  CONSTRAINT "fireflies_meetings_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."fireflies_meetings"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."google_connections" (
  "user_id"                 uuid                     NOT NULL,
  "refresh_token_encrypted" text                     NOT NULL,
  "granted_scopes"          text[]                   NOT NULL DEFAULT '{}'::text[],
  "created_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"              timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "google_connections_pkey" PRIMARY KEY (user_id)
);

ALTER TABLE "public"."google_connections"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."google_connections" FROM "anon", "authenticated";

CREATE TABLE "public"."meeting_participants" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "meeting_id" uuid                     NOT NULL,
  "name"       text                     NOT NULL,
  "email"      text,
  "role"       text,
  "sort_order" integer                  NOT NULL DEFAULT 0,
  "created_by" uuid                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "meeting_participants_name_check" CHECK (((char_length(TRIM(BOTH FROM name)) >= 1) AND (char_length(TRIM(BOTH FROM name)) <= 200))),
  CONSTRAINT "meeting_participants_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."meeting_participants"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."meetings" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id"     uuid                     NOT NULL,
  "created_by"       uuid                     NOT NULL,
  "title"            text                     NOT NULL,
  "description"      text,
  "meeting_date"     timestamp with time zone,
  "source_file_path" text,
  "audio_file_path"  text,
  "video_file_path"  text,
  "duration_seconds" integer,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "venue"            text,
  CONSTRAINT "meetings_duration_seconds_check" CHECK (((duration_seconds IS NULL) OR (duration_seconds >= 0))),
  CONSTRAINT "meetings_pkey" PRIMARY KEY (id),
  CONSTRAINT "meetings_title_check" CHECK (((char_length(TRIM(BOTH FROM title)) >= 1) AND (char_length(TRIM(BOTH FROM title)) <= 250)))
);

ALTER TABLE "public"."meetings"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."moms" (
  "id"                    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "meeting_id"            uuid                     NOT NULL,
  "created_by"            uuid                     NOT NULL,
  "title"                 text                     NOT NULL,
  "summary"               text,
  "transcript"            text,
  "key_discussion_points" jsonb                    NOT NULL DEFAULT '[]'::jsonb,
  "decisions"             jsonb                    NOT NULL DEFAULT '[]'::jsonb,
  "next_steps"            jsonb                    NOT NULL DEFAULT '[]'::jsonb,
  "abbreviations_used"    jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "generated_at"          timestamp with time zone,
  "created_at"            timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"            timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "moms_abbreviations_used_check" CHECK ((jsonb_typeof(abbreviations_used) = 'object'::text)),
  CONSTRAINT "moms_decisions_check" CHECK ((jsonb_typeof(decisions) = 'array'::text)),
  CONSTRAINT "moms_key_discussion_points_check" CHECK ((jsonb_typeof(key_discussion_points) = 'array'::text)),
  CONSTRAINT "moms_next_steps_check" CHECK ((jsonb_typeof(next_steps) = 'array'::text)),
  CONSTRAINT "moms_pkey" PRIMARY KEY (id),
  CONSTRAINT "moms_title_check" CHECK (((char_length(TRIM(BOTH FROM title)) >= 1) AND (char_length(TRIM(BOTH FROM title)) <= 250))),
  CONSTRAINT "unique_mom_per_meeting" UNIQUE (meeting_id)
);

ALTER TABLE "public"."moms"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."online_meeting_integrations" (
  "id"                       uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "meeting_id"               uuid                     NOT NULL,
  "provider"                 text                     NOT NULL,
  "external_space_name"      text,
  "meeting_uri"              text,
  "meeting_code"             text,
  "conference_record_name"   text,
  "transcript_resource_name" text,
  "transcript_state"         text,
  "last_synced_at"           timestamp with time zone,
  "created_at"               timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"               timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "online_meeting_integrations_meeting_id_key" UNIQUE (meeting_id),
  CONSTRAINT "online_meeting_integrations_pkey" PRIMARY KEY (id),
  CONSTRAINT "online_meeting_integrations_provider_check" CHECK ((provider = ANY (ARRAY['google_meet'::text, 'zoom'::text, 'microsoft_teams'::text])))
);

ALTER TABLE "public"."online_meeting_integrations"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."online_meeting_integrations" FROM "anon", "authenticated";

CREATE TABLE "public"."processing_jobs" (
  "id"                   uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "meeting_id"           uuid                     NOT NULL,
  "created_by"           uuid                     NOT NULL,
  "error_message"        text,
  "input_file_path"      text,
  "output_data"          jsonb                    DEFAULT '{}'::jsonb,
  "source_attachment_id" uuid,
  "output_mom_id"        uuid,
  "started_at"           timestamp with time zone,
  "completed_at"         timestamp with time zone,
  "created_at"           timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"           timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "processing_jobs_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."processing_jobs"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."profiles" (
  "id"         uuid                     NOT NULL,
  "name"       character varying(150),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."workspace_invitations" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" uuid                     NOT NULL,
  "email"        text                     NOT NULL,
  "invited_by"   uuid                     NOT NULL,
  "token_hash"   text                     NOT NULL,
  "status"       text                     NOT NULL DEFAULT 'pending'::text,
  "expires_at"   timestamp with time zone NOT NULL,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "accepted_at"  timestamp with time zone,
  "accepted_by"  uuid,
  CONSTRAINT "workspace_invitations_pkey" PRIMARY KEY (id),
  CONSTRAINT "workspace_invitations_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'revoked'::text, 'expired'::text]))),
  CONSTRAINT "workspace_invitations_token_hash_key" UNIQUE (token_hash)
);

ALTER TABLE "public"."workspace_invitations"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."workspace_members" (
  "workspace_id" uuid                     NOT NULL,
  "user_id"      uuid                     NOT NULL,
  "joined_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "workspace_members_pkey" PRIMARY KEY (workspace_id, user_id)
);

ALTER TABLE "public"."workspace_members"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."workspace_mom_templates" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" uuid                     NOT NULL,
  "name"         text                     NOT NULL DEFAULT 'MOM Template'::text,
  "created_by"   uuid                     NOT NULL,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "file_name"    text,
  "file_path"    text,
  "file_type"    text,
  "file_size"    bigint,
  "source_type"  text                     NOT NULL DEFAULT 'template'::text,
  CONSTRAINT "workspace_mom_templates_file_path_unique" UNIQUE (file_path),
  CONSTRAINT "workspace_mom_templates_pkey" PRIMARY KEY (id),
  CONSTRAINT "workspace_mom_templates_source_type_check" CHECK ((source_type = ANY (ARRAY['template'::text, 'example'::text]))),
  CONSTRAINT "workspace_mom_templates_workspace_unique" UNIQUE (workspace_id)
);

ALTER TABLE "public"."workspace_mom_templates"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."workspaces" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"        text                     NOT NULL,
  "created_by"  uuid                     NOT NULL,
  "terminology" jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "workspaces_name_check" CHECK (((char_length(TRIM(BOTH FROM name)) >= 1) AND (char_length(TRIM(BOTH FROM name)) <= 150))),
  CONSTRAINT "workspaces_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."workspaces"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."zoom_connections" (
  "user_id"                 uuid                     NOT NULL,
  "refresh_token_encrypted" text                     NOT NULL,
  "granted_scopes"          text[]                   NOT NULL DEFAULT '{}'::text[],
  "created_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"              timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "zoom_connections_pkey" PRIMARY KEY (user_id)
);

ALTER TABLE "public"."zoom_connections"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."zoom_connections" FROM "anon", "authenticated";

CREATE TYPE "public"."meeting_mode_enum" AS ENUM (
  'google_meet',
  'mic_recording',
  'upload',
  'import',
  'zoom',
  'fireflies'
);

ALTER TABLE "public"."meetings"
  ADD COLUMN "mode" public.meeting_mode_enum NOT NULL;

CREATE TYPE "public"."meeting_status_enum" AS ENUM (
  'draft',
  'uploading',
  'processing',
  'completed',
  'failed'
);

ALTER TABLE "public"."meetings"
  ADD COLUMN "status" public.meeting_status_enum NOT NULL DEFAULT 'draft'::public.meeting_status_enum;

CREATE TYPE "public"."mom_status_enum" AS ENUM (
  'draft',
  'reviewed',
  'finalized'
);

ALTER TABLE "public"."moms"
  ADD COLUMN "status" public.mom_status_enum NOT NULL DEFAULT 'draft'::public.mom_status_enum;

CREATE TYPE "public"."processing_job_status_enum" AS ENUM (
  'queued',
  'processing',
  'completed',
  'failed'
);

ALTER TABLE "public"."processing_jobs"
  ADD COLUMN "status" public.processing_job_status_enum NOT NULL DEFAULT 'queued'::public.processing_job_status_enum;

CREATE TYPE "public"."processing_job_type_enum" AS ENUM (
  'transcription',
  'mom_generation',
  'export_generation'
);

ALTER TABLE "public"."processing_jobs"
  ADD COLUMN "job_type" public.processing_job_type_enum NOT NULL;

CREATE TYPE "public"."task_status_enum" AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled'
);

ALTER TABLE "public"."action_items"
  ADD COLUMN "status" public.task_status_enum NOT NULL DEFAULT 'pending'::public.task_status_enum;

CREATE TYPE "public"."workspace_role_enum" AS ENUM (
  'owner',
  'admin',
  'member'
);

ALTER TABLE "public"."workspace_members"
  ADD COLUMN "role" public.workspace_role_enum NOT NULL DEFAULT 'member'::public.workspace_role_enum;

CREATE OR REPLACE FUNCTION public.claim_fireflies_sync (
  target_workspace_id uuid
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$

declare
    claimed_id uuid;

begin

    update public.fireflies_connections

    set last_sync_at = now()

    where workspace_id =
        target_workspace_id

      and is_active = true

      and (
          last_sync_at is null
          or last_sync_at <=
              now() - interval '1 hour'
      )

    returning id into claimed_id;

    return claimed_id is not null;

end;
$function$;

REVOKE ALL ON FUNCTION "public"."claim_fireflies_sync"(uuid) FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.complete_processing_job (
  target_job_id        uuid,
  target_status        public.processing_job_status_enum,
  target_output_data   jsonb                             DEFAULT '{}'::jsonb,
  target_error_message text                              DEFAULT NULL::text
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN

    UPDATE public.processing_jobs
    SET
        status = target_status,
        output_data = COALESCE(target_output_data, '{}'::jsonb),
        error_message = target_error_message,
        completed_at =
            CASE
                WHEN target_status IN ('completed', 'failed')
                THEN now()
                ELSE completed_at
            END,
        started_at =
            CASE
                WHEN target_status = 'processing'
                     AND started_at IS NULL
                THEN now()
                ELSE started_at
            END
    WHERE id = target_job_id;

    RETURN FOUND;

END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN

    INSERT INTO public.profiles (
        id,
        name
    )
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data ->> 'full_name',
            NEW.raw_user_meta_data ->> 'name',
            split_part(NEW.email, '@', 1)
        )
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;

END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_workspace()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN

    INSERT INTO public.workspace_members (
        workspace_id,
        user_id,
        role
    )
    VALUES (
        NEW.id,
        NEW.created_by,
        'owner'
    )
    ON CONFLICT (
        workspace_id,
        user_id
    )
    DO UPDATE SET role = 'owner';

    RETURN NEW;

END;
$function$;

CREATE OR REPLACE FUNCTION public.is_meeting_storage_path_accessible (
  target_name text
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.meetings m
        WHERE m.id::text = split_part(target_name, '/', 2)
          AND m.workspace_id::text = split_part(target_name, '/', 1)
          AND public.is_workspace_member(m.workspace_id)
    );
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin (
  target_workspace_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = target_workspace_id
          AND wm.user_id = auth.uid()
          AND wm.role IN ('owner', 'admin')
    );
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin (
  p_workspace_id uuid,
  p_user_id      uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = p_workspace_id
          AND wm.user_id = p_user_id
          AND wm.role IN ('owner', 'admin')
    );
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_member (
  target_workspace_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = target_workspace_id
          AND wm.user_id = auth.uid()
    );
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_member (
  p_workspace_id uuid,
  p_user_id      uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = p_workspace_id
          AND wm.user_id = p_user_id
    );
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_owner (
  target_workspace_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = target_workspace_id
          AND wm.user_id = auth.uid()
          AND wm.role = 'owner'
    );
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_owner (
  p_workspace_id uuid,
  p_user_id      uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = p_workspace_id
          AND wm.user_id = p_user_id
          AND wm.role = 'owner'
    );
$function$;

CREATE OR REPLACE FUNCTION public.protect_action_item_identity()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN

    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION 'Action item ID cannot be changed';
    END IF;

    IF NEW.mom_id <> OLD.mom_id THEN
        RAISE EXCEPTION 'Action item MOM cannot be changed';
    END IF;

    IF NEW.meeting_id <> OLD.meeting_id THEN
        RAISE EXCEPTION 'Action item meeting cannot be changed';
    END IF;

    IF NEW.created_by <> OLD.created_by THEN
        RAISE EXCEPTION 'Action item creator cannot be changed';
    END IF;

    RETURN NEW;

END;
$function$;

CREATE OR REPLACE FUNCTION public.protect_attachment_identity()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN

    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION 'Attachment ID cannot be changed';
    END IF;

    IF NEW.meeting_id <> OLD.meeting_id THEN
        RAISE EXCEPTION 'Attachment meeting cannot be changed';
    END IF;

    IF NEW.uploaded_by <> OLD.uploaded_by THEN
        RAISE EXCEPTION 'Attachment uploader cannot be changed';
    END IF;

    IF NEW.file_path <> OLD.file_path THEN
        RAISE EXCEPTION 'Attachment file path cannot be changed';
    END IF;

    RETURN NEW;

END;
$function$;

CREATE OR REPLACE FUNCTION public.protect_meeting_identity()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN

    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION 'Meeting ID cannot be changed';
    END IF;

    IF NEW.workspace_id <> OLD.workspace_id THEN
        RAISE EXCEPTION 'Meeting workspace cannot be changed';
    END IF;

    IF NEW.created_by <> OLD.created_by THEN
        RAISE EXCEPTION 'Meeting creator cannot be changed';
    END IF;

    RETURN NEW;

END;
$function$;

CREATE OR REPLACE FUNCTION public.protect_mom_identity()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN

    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION 'MOM ID cannot be changed';
    END IF;

    IF NEW.meeting_id <> OLD.meeting_id THEN
        RAISE EXCEPTION 'MOM meeting cannot be changed';
    END IF;

    IF NEW.created_by <> OLD.created_by THEN
        RAISE EXCEPTION 'MOM creator cannot be changed';
    END IF;

    RETURN NEW;

END;
$function$;

CREATE OR REPLACE FUNCTION public.protect_processing_job_identity()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN

    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION 'Processing job ID cannot be changed';
    END IF;

    IF NEW.meeting_id <> OLD.meeting_id THEN
        RAISE EXCEPTION 'Processing job meeting cannot be changed';
    END IF;

    IF NEW.created_by <> OLD.created_by THEN
        RAISE EXCEPTION 'Processing job creator cannot be changed';
    END IF;

    RETURN NEW;

END;
$function$;

CREATE OR REPLACE FUNCTION public.protect_profile_identity()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN

    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION 'Profile ID cannot be changed';
    END IF;

    RETURN NEW;

END;
$function$;

CREATE OR REPLACE FUNCTION public.protect_workspace_identity()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN

    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION 'Workspace ID cannot be changed';
    END IF;

    IF NEW.created_by <> OLD.created_by THEN
        RAISE EXCEPTION 'Workspace creator cannot be changed';
    END IF;

    RETURN NEW;

END;
$function$;

CREATE OR REPLACE FUNCTION public.protect_workspace_member_identity()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN

    IF NEW.workspace_id <> OLD.workspace_id THEN
        RAISE EXCEPTION 'Workspace membership workspace cannot change';
    END IF;

    IF NEW.user_id <> OLD.user_id THEN
        RAISE EXCEPTION 'Workspace membership user cannot change';
    END IF;

    RETURN NEW;

END;
$function$;

CREATE OR REPLACE FUNCTION public.set_meeting_participants_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
    new.updated_at = now();
    return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.touch_fireflies_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
    new.updated_at = now();
    return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_workspace_mom_templates_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_action_item_assignee()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
    target_workspace UUID;
BEGIN

    IF NEW.assigned_to IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT workspace_id
    INTO target_workspace
    FROM public.meetings
    WHERE id = NEW.meeting_id;

    IF target_workspace IS NULL THEN
        RAISE EXCEPTION 'Invalid meeting reference';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.workspace_members wm
        WHERE wm.workspace_id = target_workspace
          AND wm.user_id = NEW.assigned_to
    ) THEN

        RAISE EXCEPTION
            'Assigned user must be a member of the meeting workspace';

    END IF;

    RETURN NEW;

END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_action_item_relationship()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
    mom_meeting UUID;
BEGIN

    SELECT meeting_id
    INTO mom_meeting
    FROM public.moms
    WHERE id = NEW.mom_id;

    IF mom_meeting IS NULL THEN
        RAISE EXCEPTION 'Invalid MOM reference';
    END IF;

    IF mom_meeting <> NEW.meeting_id THEN
        RAISE EXCEPTION
            'Action item meeting_id must match its MOM meeting_id';
    END IF;

    RETURN NEW;

END;
$function$;

ALTER TABLE "public"."fireflies_connections"
  ADD CONSTRAINT "fireflies_connections_connected_by_fkey" FOREIGN KEY (connected_by) REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE "public"."google_connections"
  ADD CONSTRAINT "google_connections_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."meeting_participants"
  ADD CONSTRAINT "meeting_participants_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE "public"."meetings"
  ADD CONSTRAINT "meetings_mode_check"
    CHECK
    ((mode = ANY (ARRAY['google_meet'::public.meeting_mode_enum, 'mic_recording'::public.meeting_mode_enum, 'upload'::public.meeting_mode_enum, 'import'::public.meeting_mode_enum,
    'fireflies'::public.meeting_mode_enum])));

ALTER TABLE "public"."action_items"
  ADD CONSTRAINT "action_items_meeting_id_fkey" FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;

ALTER TABLE "public"."attachments"
  ADD CONSTRAINT "attachments_meeting_id_fkey" FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;

ALTER TABLE "public"."fireflies_meetings"
  ADD CONSTRAINT "fireflies_meetings_meeting_id_fkey" FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;

ALTER TABLE "public"."meeting_participants"
  ADD CONSTRAINT "meeting_participants_meeting_id_fkey" FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;

ALTER TABLE "public"."moms"
  ADD CONSTRAINT "moms_meeting_id_fkey" FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;

ALTER TABLE "public"."action_items"
  ADD CONSTRAINT "action_items_mom_id_fkey" FOREIGN KEY (mom_id) REFERENCES public.moms(id) ON DELETE CASCADE;

ALTER TABLE "public"."online_meeting_integrations"
  ADD CONSTRAINT "online_meeting_integrations_meeting_id_fkey" FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;

ALTER TABLE "public"."processing_jobs"
  ADD CONSTRAINT "processing_jobs_meeting_id_fkey" FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;

ALTER TABLE "public"."processing_jobs"
  ADD CONSTRAINT "processing_jobs_output_mom_id_fkey" FOREIGN KEY (output_mom_id) REFERENCES public.moms(id) ON DELETE SET NULL;

ALTER TABLE "public"."processing_jobs"
  ADD CONSTRAINT "processing_jobs_source_attachment_id_fkey" FOREIGN KEY (source_attachment_id) REFERENCES public.attachments(id) ON DELETE SET NULL;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."action_items"
  ADD CONSTRAINT "action_items_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."action_items"
  ADD CONSTRAINT "action_items_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."attachments"
  ADD CONSTRAINT "attachments_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."meetings"
  ADD CONSTRAINT "meetings_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."moms"
  ADD CONSTRAINT "moms_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."processing_jobs"
  ADD CONSTRAINT "processing_jobs_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."workspace_invitations"
  ADD CONSTRAINT "workspace_invitations_accepted_by_fkey" FOREIGN KEY (accepted_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE "public"."workspace_invitations"
  ADD CONSTRAINT "workspace_invitations_invited_by_fkey" FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."workspace_members"
  ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."workspace_mom_templates"
  ADD CONSTRAINT "workspace_mom_templates_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE "public"."workspaces"
  ADD CONSTRAINT "workspaces_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."fireflies_connections"
  ADD CONSTRAINT "fireflies_connections_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE "public"."fireflies_meetings"
  ADD CONSTRAINT "fireflies_meetings_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE "public"."meetings"
  ADD CONSTRAINT "meetings_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE "public"."workspace_invitations"
  ADD CONSTRAINT "workspace_invitations_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE "public"."workspace_members"
  ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE "public"."workspace_mom_templates"
  ADD CONSTRAINT "workspace_mom_templates_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE "public"."zoom_connections"
  ADD CONSTRAINT "zoom_connections_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX fireflies_connections_workspace_idx ON public.fireflies_connections USING btree (workspace_id);

CREATE INDEX fireflies_meetings_date_idx ON public.fireflies_meetings USING btree (fireflies_date DESC);

CREATE INDEX fireflies_meetings_workspace_idx ON public.fireflies_meetings USING btree (workspace_id);

CREATE INDEX idx_action_items_assigned_to ON public.action_items USING btree (assigned_to);

CREATE INDEX idx_action_items_due_date ON public.action_items USING btree (due_date);

CREATE INDEX idx_action_items_google_event_id ON public.action_items USING btree (google_event_id);

CREATE INDEX idx_action_items_meeting_id ON public.action_items USING btree (meeting_id);

CREATE INDEX idx_action_items_mom_id ON public.action_items USING btree (mom_id);

CREATE INDEX idx_action_items_status ON public.action_items USING btree (status);

CREATE INDEX idx_attachments_meeting_id ON public.attachments USING btree (meeting_id);

CREATE INDEX idx_attachments_type ON public.attachments USING btree (attachment_type);

CREATE INDEX idx_attachments_uploaded_by ON public.attachments USING btree (uploaded_by);

CREATE INDEX idx_fireflies_connections_workspace ON public.fireflies_connections USING btree (workspace_id);

CREATE INDEX idx_fireflies_meetings_meeting ON public.fireflies_meetings USING btree (meeting_id);

CREATE INDEX idx_fireflies_meetings_workspace ON public.fireflies_meetings USING btree (workspace_id);

CREATE INDEX idx_meeting_participants_meeting ON public.meeting_participants USING btree (meeting_id, sort_order, created_at);

CREATE INDEX idx_meetings_created_by ON public.meetings USING btree (created_by);

CREATE INDEX idx_meetings_meeting_date ON public.meetings USING btree (meeting_date);

CREATE INDEX idx_meetings_status ON public.meetings USING btree (status);

CREATE INDEX idx_meetings_workspace_id ON public.meetings USING btree (workspace_id);

CREATE INDEX idx_moms_abbreviations ON public.moms USING gin (abbreviations_used);

CREATE INDEX idx_moms_created_by ON public.moms USING btree (created_by);

CREATE INDEX idx_moms_meeting_id ON public.moms USING btree (meeting_id);

CREATE INDEX idx_moms_status ON public.moms USING btree (status);

CREATE INDEX idx_online_meeting_integrations_conference ON public.online_meeting_integrations USING btree (conference_record_name);

CREATE INDEX idx_online_meeting_integrations_provider ON public.online_meeting_integrations USING btree (PROVIDER);

CREATE INDEX idx_processing_jobs_created_by ON public.processing_jobs USING btree (created_by);

CREATE INDEX idx_processing_jobs_meeting_id ON public.processing_jobs USING btree (meeting_id);

CREATE INDEX idx_processing_jobs_output_mom ON public.processing_jobs USING btree (output_mom_id);

CREATE INDEX idx_processing_jobs_source_attachment ON public.processing_jobs USING btree (source_attachment_id);

CREATE INDEX idx_processing_jobs_status ON public.processing_jobs USING btree (status);

CREATE INDEX idx_workspace_invitations_email ON public.workspace_invitations USING btree (email);

CREATE INDEX idx_workspace_invitations_status ON public.workspace_invitations USING btree (status);

CREATE INDEX idx_workspace_invitations_token_hash ON public.workspace_invitations USING btree (token_hash);

CREATE INDEX idx_workspace_invitations_workspace ON public.workspace_invitations USING btree (workspace_id);

CREATE INDEX idx_workspace_members_user_id ON public.workspace_members USING btree (user_id);

CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members USING btree (workspace_id);

CREATE INDEX idx_workspace_mom_templates_created_by ON public.workspace_mom_templates USING btree (created_by);

CREATE INDEX idx_workspace_mom_templates_workspace_id ON public.workspace_mom_templates USING btree (workspace_id);

CREATE INDEX idx_workspaces_created_by ON public.workspaces USING btree (created_by);

CREATE INDEX idx_workspaces_terminology ON public.workspaces USING gin (terminology);

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER trg_action_items_updated_at
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_protect_action_item_identity
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_action_item_identity();

CREATE TRIGGER trg_validate_action_item_assignee
  BEFORE INSERT OR UPDATE ON public.action_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_action_item_assignee();

CREATE TRIGGER trg_validate_action_item_relationship
  BEFORE INSERT OR UPDATE ON public.action_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_action_item_relationship();

CREATE TRIGGER trg_protect_attachment_identity
  BEFORE UPDATE ON public.attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_attachment_identity();

CREATE TRIGGER fireflies_connections_touch_updated_at
  BEFORE UPDATE ON public.fireflies_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_fireflies_updated_at();

CREATE TRIGGER fireflies_meetings_touch_updated_at
  BEFORE UPDATE ON public.fireflies_meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_fireflies_updated_at();

CREATE TRIGGER trg_google_connections_updated_at
  BEFORE UPDATE ON public.google_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_meeting_participants_updated_at
  BEFORE UPDATE ON public.meeting_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.set_meeting_participants_updated_at();

CREATE TRIGGER trg_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_protect_meeting_identity
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_meeting_identity();

CREATE TRIGGER trg_moms_updated_at
  BEFORE UPDATE ON public.moms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_protect_mom_identity
  BEFORE UPDATE ON public.moms
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_mom_identity();

CREATE TRIGGER trg_online_meeting_integrations_updated_at
  BEFORE UPDATE ON public.online_meeting_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_processing_jobs_updated_at
  BEFORE UPDATE ON public.processing_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_protect_processing_job_identity
  BEFORE UPDATE ON public.processing_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_processing_job_identity();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_protect_profile_identity
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_identity();

CREATE TRIGGER trg_protect_workspace_member_identity
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_workspace_member_identity();

CREATE TRIGGER workspace_mom_templates_updated_at
  BEFORE UPDATE ON public.workspace_mom_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workspace_mom_templates_updated_at();

CREATE TRIGGER trg_protect_workspace_identity
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_workspace_identity();

CREATE TRIGGER trg_workspace_owner
  AFTER INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_workspace();

CREATE TRIGGER trg_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "action_items_delete_creator_or_owner" ON "public"."action_items"
  FOR DELETE
  TO PUBLIC
  USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = action_items.meeting_id) AND public.is_workspace_owner(m.workspace_id))))));

CREATE POLICY "action_items_insert_member" ON "public"."action_items"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((created_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = action_items.meeting_id) AND public.is_workspace_member(m.workspace_id))))));

CREATE POLICY "action_items_select_member" ON "public"."action_items"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = action_items.meeting_id) AND public.is_workspace_member(m.workspace_id)))));

CREATE POLICY "action_items_update_creator_or_owner" ON "public"."action_items"
  FOR UPDATE
  TO PUBLIC
  USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = action_items.meeting_id) AND public.is_workspace_owner(m.workspace_id))))))
  WITH CHECK (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = action_items.meeting_id) AND public.is_workspace_owner(m.workspace_id))))));

CREATE POLICY "attachments_delete_uploader_or_admin" ON "public"."attachments"
  FOR DELETE
  TO "authenticated"
  USING (((uploaded_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = attachments.meeting_id) AND public.is_workspace_admin(m.workspace_id))))));

CREATE POLICY "attachments_insert_member" ON "public"."attachments"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((uploaded_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = attachments.meeting_id) AND public.is_workspace_member(m.workspace_id))))));

CREATE POLICY "attachments_select_member" ON "public"."attachments"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = attachments.meeting_id) AND public.is_workspace_member(m.workspace_id)))));

CREATE POLICY "attachments_update_uploader" ON "public"."attachments"
  FOR UPDATE
  TO "authenticated"
  USING ((uploaded_by = auth.uid()))
  WITH CHECK ((uploaded_by = auth.uid()));

CREATE POLICY "Workspace members can view Fireflies connections" ON "public"."fireflies_connections"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.workspace_members wm
  WHERE ((wm.workspace_id = fireflies_connections.workspace_id) AND (wm.user_id = auth.uid())))));

CREATE POLICY "fireflies_connections_select" ON "public"."fireflies_connections"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.workspace_members wm
  WHERE ((wm.workspace_id = fireflies_connections.workspace_id) AND (wm.user_id = auth.uid())))));

CREATE POLICY "Workspace members can view Fireflies meetings" ON "public"."fireflies_meetings"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.workspace_members wm
  WHERE ((wm.workspace_id = fireflies_meetings.workspace_id) AND (wm.user_id = auth.uid())))));

CREATE POLICY "fireflies_meetings_select" ON "public"."fireflies_meetings"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.workspace_members wm
  WHERE ((wm.workspace_id = fireflies_meetings.workspace_id) AND (wm.user_id = auth.uid())))));

CREATE POLICY "meetings_delete_creator_or_owner" ON "public"."meetings"
  FOR DELETE
  TO PUBLIC
  USING (((created_by = auth.uid()) OR public.is_workspace_owner(workspace_id)));

CREATE POLICY "meetings_insert_member" ON "public"."meetings"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((created_by = auth.uid()) AND public.is_workspace_member(workspace_id)));

CREATE POLICY "meetings_select_member" ON "public"."meetings"
  FOR SELECT
  TO "authenticated"
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "meetings_update_creator_or_owner" ON "public"."meetings"
  FOR UPDATE
  TO PUBLIC
  USING (((created_by = auth.uid()) OR public.is_workspace_owner(workspace_id)))
  WITH CHECK (((created_by = auth.uid()) OR public.is_workspace_owner(workspace_id)));

CREATE POLICY "moms_delete_creator_or_owner" ON "public"."moms"
  FOR DELETE
  TO PUBLIC
  USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = moms.meeting_id) AND public.is_workspace_owner(m.workspace_id))))));

CREATE POLICY "moms_insert_member" ON "public"."moms"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((created_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = moms.meeting_id) AND public.is_workspace_member(m.workspace_id))))));

CREATE POLICY "moms_select_member" ON "public"."moms"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = moms.meeting_id) AND public.is_workspace_member(m.workspace_id)))));

CREATE POLICY "moms_update_creator_or_owner" ON "public"."moms"
  FOR UPDATE
  TO PUBLIC
  USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = moms.meeting_id) AND public.is_workspace_owner(m.workspace_id))))))
  WITH CHECK (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = moms.meeting_id) AND public.is_workspace_owner(m.workspace_id))))));

CREATE POLICY "processing_jobs_insert_member" ON "public"."processing_jobs"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((created_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = processing_jobs.meeting_id) AND public.is_workspace_member(m.workspace_id))))));

CREATE POLICY "processing_jobs_select_member" ON "public"."processing_jobs"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = processing_jobs.meeting_id) AND public.is_workspace_member(m.workspace_id)))));

CREATE POLICY "profiles_select_own" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING ((id = auth.uid()));

CREATE POLICY "profiles_select_workspace_members" ON "public"."profiles"
  FOR SELECT
  TO PUBLIC
  USING (((id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.workspace_members wm
  WHERE ((wm.user_id = profiles.id) AND public.is_workspace_member(wm.workspace_id))))));

CREATE POLICY "profiles_update_own" ON "public"."profiles"
  FOR UPDATE
  TO "authenticated"
  USING ((id = auth.uid()))
  WITH CHECK ((id = auth.uid()));

CREATE POLICY "workspace_members_delete_owner" ON "public"."workspace_members"
  FOR DELETE
  TO PUBLIC
  USING (public.is_workspace_owner(workspace_id));

CREATE POLICY "workspace_members_insert_owner" ON "public"."workspace_members"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (public.is_workspace_owner(workspace_id));

CREATE POLICY "workspace_members_select_member" ON "public"."workspace_members"
  FOR SELECT
  TO "authenticated"
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "workspace_members_update_owner" ON "public"."workspace_members"
  FOR UPDATE
  TO PUBLIC
  USING (public.is_workspace_owner(workspace_id))
  WITH CHECK (public.is_workspace_owner(workspace_id));

CREATE POLICY "workspace_mom_templates_delete_owner" ON "public"."workspace_mom_templates"
  FOR DELETE
  TO "authenticated"
  USING (public.is_workspace_owner(workspace_id, auth.uid()));

CREATE POLICY "workspace_mom_templates_insert_owner" ON "public"."workspace_mom_templates"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((public.is_workspace_owner(workspace_id, auth.uid()) AND (created_by = auth.uid())));

CREATE POLICY "workspace_mom_templates_select_member" ON "public"."workspace_mom_templates"
  FOR SELECT
  TO "authenticated"
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "workspace_mom_templates_update_owner" ON "public"."workspace_mom_templates"
  FOR UPDATE
  TO "authenticated"
  USING (public.is_workspace_owner(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

CREATE POLICY "workspaces_delete_owner" ON "public"."workspaces"
  FOR DELETE
  TO "authenticated"
  USING (public.is_workspace_owner(id));

CREATE POLICY "workspaces_insert_own" ON "public"."workspaces"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((created_by = auth.uid()));

CREATE POLICY "workspaces_select_member" ON "public"."workspaces"
  FOR SELECT
  TO "authenticated"
  USING (public.is_workspace_member(id));

CREATE POLICY "workspaces_update_owner" ON "public"."workspaces"
  FOR UPDATE
  TO PUBLIC
  USING (public.is_workspace_owner(id))
  WITH CHECK (public.is_workspace_owner(id));

CREATE POLICY "meeting_files_delete" ON "storage"."objects"
  FOR DELETE
  TO "authenticated"
  USING (((bucket_id = ANY (ARRAY['meeting-files'::text, 'meeting-audio'::text, 'meeting-video'::text])) AND public.is_meeting_storage_path_accessible(name)));

CREATE POLICY "meeting_files_insert" ON "storage"."objects"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((bucket_id = ANY (ARRAY['meeting-files'::text, 'meeting-audio'::text, 'meeting-video'::text])) AND public.is_meeting_storage_path_accessible(name)));

CREATE POLICY "meeting_files_select" ON "storage"."objects"
  FOR SELECT
  TO "authenticated"
  USING (((bucket_id = ANY (ARRAY['meeting-files'::text, 'meeting-audio'::text, 'meeting-video'::text])) AND public.is_meeting_storage_path_accessible(name)));

CREATE POLICY "meeting_files_update" ON "storage"."objects"
  FOR UPDATE
  TO "authenticated"
  USING (((bucket_id = ANY (ARRAY['meeting-files'::text, 'meeting-audio'::text, 'meeting-video'::text])) AND public.is_meeting_storage_path_accessible(name)))
  WITH CHECK (((bucket_id = ANY (ARRAY['meeting-files'::text, 'meeting-audio'::text, 'meeting-video'::text])) AND public.is_meeting_storage_path_accessible(name)));

CREATE POLICY "workspace_mom_template_delete" ON "storage"."objects"
  FOR DELETE
  TO "authenticated"
  USING (((bucket_id = 'workspace-mom-template'::text) AND public.is_workspace_owner(((storage.foldername(name))[1])::uuid)));

CREATE POLICY "workspace_mom_template_insert" ON "storage"."objects"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((bucket_id = 'workspace-mom-template'::text) AND public.is_workspace_owner(((storage.foldername(name))[1])::uuid)));

CREATE POLICY "workspace_mom_template_select" ON "storage"."objects"
  FOR SELECT
  TO "authenticated"
  USING (((bucket_id = 'workspace-mom-template'::text) AND public.is_workspace_member(((storage.foldername(name))[1])::uuid)));

CREATE POLICY "workspace_mom_template_update" ON "storage"."objects"
  FOR UPDATE
  TO "authenticated"
  USING (((bucket_id = 'workspace-mom-template'::text) AND public.is_workspace_owner(((storage.foldername(name))[1])::uuid)))
  WITH CHECK (((bucket_id = 'workspace-mom-template'::text) AND public.is_workspace_owner(((storage.foldername(name))[1])::uuid)));

REVOKE ALL ON FUNCTION "public"."claim_fireflies_sync"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."claim_fireflies_sync"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."claim_fireflies_sync"(uuid) TO "service_role";

REVOKE ALL ON FUNCTION "public"."complete_processing_job"(uuid, public.processing_job_status_enum, jsonb, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."complete_processing_job"(uuid, public.processing_job_status_enum, jsonb, text) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."complete_processing_job"(uuid, public.processing_job_status_enum, jsonb, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."complete_processing_job"(uuid, public.processing_job_status_enum, jsonb, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."complete_processing_job"(uuid, public.processing_job_status_enum, jsonb, text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."handle_new_workspace"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_new_workspace"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_workspace"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_workspace"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."is_meeting_storage_path_accessible"(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."is_meeting_storage_path_accessible"(text) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."is_meeting_storage_path_accessible"(text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_meeting_storage_path_accessible"(text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_meeting_storage_path_accessible"(text) TO "service_role";

REVOKE ALL ON FUNCTION "public"."is_workspace_admin"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."is_workspace_admin"(uuid) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."is_workspace_admin"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_admin"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_admin"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_admin"(uuid, uuid) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."is_workspace_admin"(uuid, uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_admin"(uuid, uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_admin"(uuid, uuid) TO "service_role";

REVOKE ALL ON FUNCTION "public"."is_workspace_member"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."is_workspace_member"(uuid) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."is_workspace_member"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_member"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_member"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_member"(uuid, uuid) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."is_workspace_member"(uuid, uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_member"(uuid, uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_member"(uuid, uuid) TO "service_role";

REVOKE ALL ON FUNCTION "public"."is_workspace_owner"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."is_workspace_owner"(uuid) TO "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."is_workspace_owner"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_owner"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_owner"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_owner"(uuid, uuid) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."is_workspace_owner"(uuid, uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_owner"(uuid, uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_workspace_owner"(uuid, uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."protect_action_item_identity"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."protect_action_item_identity"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_action_item_identity"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_action_item_identity"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."protect_attachment_identity"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."protect_attachment_identity"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_attachment_identity"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_attachment_identity"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."protect_meeting_identity"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."protect_meeting_identity"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_meeting_identity"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_meeting_identity"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."protect_mom_identity"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."protect_mom_identity"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_mom_identity"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_mom_identity"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."protect_processing_job_identity"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."protect_processing_job_identity"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_processing_job_identity"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_processing_job_identity"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."protect_profile_identity"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."protect_profile_identity"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_profile_identity"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_profile_identity"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."protect_workspace_identity"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."protect_workspace_identity"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_workspace_identity"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_workspace_identity"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."protect_workspace_member_identity"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."protect_workspace_member_identity"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_workspace_member_identity"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."protect_workspace_member_identity"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."set_meeting_participants_updated_at"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."set_meeting_participants_updated_at"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."set_meeting_participants_updated_at"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."set_meeting_participants_updated_at"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."set_updated_at"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."set_updated_at"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."set_updated_at"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."set_updated_at"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."touch_fireflies_updated_at"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."touch_fireflies_updated_at"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."touch_fireflies_updated_at"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."touch_fireflies_updated_at"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."update_workspace_mom_templates_updated_at"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."update_workspace_mom_templates_updated_at"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_workspace_mom_templates_updated_at"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_workspace_mom_templates_updated_at"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."validate_action_item_assignee"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."validate_action_item_assignee"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."validate_action_item_assignee"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."validate_action_item_assignee"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."validate_action_item_relationship"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."validate_action_item_relationship"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."validate_action_item_relationship"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."validate_action_item_relationship"() TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."action_items" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."action_items" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."action_items" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."action_items" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."attachments" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."attachments" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."attachments" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."attachments" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."fireflies_connections" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."fireflies_connections" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."fireflies_connections" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."fireflies_connections" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."fireflies_meetings" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."fireflies_meetings" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."fireflies_meetings" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."fireflies_meetings" TO "service_role";

REVOKE ALL ON TABLE "public"."google_connections" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."google_connections" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."google_connections" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."meeting_participants" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."meeting_participants" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."meeting_participants" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."meeting_participants" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."meetings" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."meetings" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."meetings" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."meetings" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."moms" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."moms" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."moms" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."moms" TO "service_role";

REVOKE ALL ON TABLE "public"."online_meeting_integrations" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."online_meeting_integrations" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."online_meeting_integrations" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."processing_jobs" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."processing_jobs" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."processing_jobs" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."processing_jobs" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."profiles" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workspace_invitations" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."workspace_invitations" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workspace_invitations" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workspace_invitations" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workspace_members" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."workspace_members" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workspace_members" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workspace_members" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workspace_mom_templates" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."workspace_mom_templates" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workspace_mom_templates" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workspace_mom_templates" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workspaces" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."workspaces" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workspaces" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."workspaces" TO "service_role";

REVOKE ALL ON TABLE "public"."zoom_connections" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."zoom_connections" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."zoom_connections" TO "service_role";

