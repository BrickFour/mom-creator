import { apiRequest } from '../lib/api.js';

/**
 * Export a meeting MOM as PDF.
 *
 * Backend endpoint:
 * GET /api/v1/meetings/{meetingId}/export/pdf
 */
export async function exportMOMPdf(meetingId, options = {}) {
  if (!meetingId) {
    throw new Error('Meeting ID is required');
  }

  // Detect user local timezone and timestamp to ensure the exported PDF
  // displays the exact local time when the MOM was created or exported.
  const userTimezone =
    options.tz ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    'Asia/Kolkata';
  const clientTime = options.clientTime || new Date().toISOString();

  const queryParams = new URLSearchParams({
    tz: userTimezone,
    client_time: clientTime,
  });

  const result = await apiRequest(
    `/api/v1/meetings/${meetingId}/export/pdf?${queryParams.toString()}`,
    {
      method: 'GET',
      responseType: 'blob',
    }
  );

  if (!result?.blob) {
    throw new Error('PDF export returned no file');
  }

  const blobUrl = window.URL.createObjectURL(result.blob);

  try {
    const link = document.createElement('a');

    link.href = blobUrl;

    link.download =
      result.filename ||
      `MOM-${meetingId}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    window.URL.revokeObjectURL(blobUrl);
  }

  return result;
}

/*
 * Keep downloadPdf as an alias so MOMEditor.jsx
 * and any other existing component can use either name.
 */
export async function downloadPdf(meetingId, options = {}) {
  return await exportMOMPdf(meetingId, options);
}