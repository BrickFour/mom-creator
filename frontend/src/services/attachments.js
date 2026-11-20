import { apiRequest } from '../lib/api.js';
import { getSupabase } from '../lib/supabase.js';
import { hasDemoSession } from '../lib/demoAccounts.js';

export async function uploadToStorage({
  file,
  bucket,
  workspaceId,
  meetingId,
  customFileName,
}) {
  // Demo accounts never get a real Supabase Auth session (see AuthContext),
  // so a direct browser -> Supabase Storage upload is rejected by RLS as
  // anonymous. Route those uploads through the backend, which uploads with
  // the service-role client after re-checking workspace/meeting ownership.
  if (hasDemoSession()) {
    const form = new FormData();
    form.append('file', file);
    form.append('bucket', bucket);
    form.append('workspace_id', workspaceId);
    form.append('meeting_id', meetingId);
    if (customFileName) {
      form.append('custom_file_name', customFileName);
    }

    const result = await apiRequest('/api/v1/attachments/upload', {
      method: 'POST',
      body: form,
    });

    return {
      path: result.path,
      fileName: result.fileName,
      fileType: result.fileType || file.type || 'application/octet-stream',
      fileSize: result.fileSize ?? file.size,
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client is not configured for storage upload.');
  }

  const originalName = file?.name || 'recording.webm';
  const fileName =
    customFileName ||
    `${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = `${workspaceId}/${meetingId}/${fileName}`;


  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload to storage: ${error.message}`);
  }

  return {
    path: data.path || filePath,
    fileName,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
  };
}

export async function confirmAttachmentUpload({
  meeting_id,
  bucket,
  path,
  file_name,
  file_type,
  file_size,
  attachment_type = 'meeting_attachment',
}) {
  return await apiRequest('/api/v1/attachments/confirm', {
    method: 'POST',
    body: JSON.stringify({
      meeting_id,
      bucket,
      path,
      file_name,
      file_type,
      file_size,
      attachment_type,
    }),
  });
}
