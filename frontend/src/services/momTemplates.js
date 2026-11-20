import { getSupabase } from '../lib/supabase.js';
import { apiRequest } from '../lib/api.js';
import { hasDemoSession } from '../lib/demoAccounts.js';

const BUCKET = 'workspace-mom-template';

function sanitizeFileName(fileName) {
  return fileName
    .trim()
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, '-');
}

export async function getMOMTemplate(workspaceId) {
  return await apiRequest(
    `/api/v1/mom-templates/workspace/${workspaceId}`,
    {
      method: 'GET',
    }
  );
}

export async function uploadMOMTemplate(
  workspaceId,
  file,
  sourceType = 'template'
) {
  if (!file) {
    throw new Error('Please select a file');
  }

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only PDF, DOC, and DOCX files are supported');
  }

  const maxSize = 10 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error('File size must be 10 MB or less');
  }

  const isDemo = hasDemoSession();

  let filePath;
  let fileType = file.type || null;
  let fileSize = file.size;

  if (isDemo) {
    // Demo accounts never get a real Supabase Auth session (see
    // AuthContext), so a direct browser -> Supabase Storage upload is
    // rejected by RLS as anonymous. Upload through the backend instead,
    // which writes with the service-role client.
    const form = new FormData();
    form.append('file', file);

    const uploaded = await apiRequest(
      `/api/v1/mom-templates/workspace/${workspaceId}/upload`,
      {
        method: 'POST',
        body: form,
      }
    );

    filePath = uploaded.file_path;
    fileType = uploaded.file_type || fileType;
    fileSize = uploaded.file_size ?? fileSize;
  } else {
    const supabase = getSupabase();

    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const safeName = sanitizeFileName(file.name);
    filePath = `${workspaceId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message || 'Failed to upload file');
    }
  }

  try {
    return await apiRequest(
      `/api/v1/mom-templates/workspace/${workspaceId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: file.name,
          file_name: file.name,
          file_path: filePath,
          file_type: fileType,
          file_size: fileSize,
          source_type: sourceType,
        }),
      }
    );
  } catch (error) {
    if (!isDemo) {
      const supabase = getSupabase();
      await supabase?.storage.from(BUCKET).remove([filePath]);
    }

    throw error;
  }
}

export async function replaceMOMTemplate(
  workspaceId,
  file,
  sourceType = 'template'
) {
  const existing = await getMOMTemplate(workspaceId);

  // For demo sessions, skip the direct browser -> Storage removal (it would
  // be rejected by RLS); deleteMOMTemplate below already removes the file
  // from storage server-side with the service-role client.
  if (existing?.file_path && !hasDemoSession()) {
    const supabase = getSupabase();

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([existing.file_path]);

    if (error) {
      throw new Error(
        error.message || 'Failed to remove previous file'
      );
    }
  }

  await deleteMOMTemplate(workspaceId);

  return await uploadMOMTemplate(
    workspaceId,
    file,
    sourceType
  );
}

export async function updateMOMTemplate(
  workspaceId,
  data
) {
  return await apiRequest(
    `/api/v1/mom-templates/workspace/${workspaceId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
}

export async function deleteMOMTemplate(workspaceId) {
  return await apiRequest(
    `/api/v1/mom-templates/workspace/${workspaceId}`,
    {
      method: 'DELETE',
    }
  );
}

async function supabaseRemove(filePath) {
  const supabase = getSupabase();

  if (!supabase || !filePath) return;

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([filePath]);

  if (error) {
    console.warn(
      'Failed to remove previous MOM template file:',
      error
    );
  }
}