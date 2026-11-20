import { apiRequest } from '../lib/api.js';

export async function connectGoogleMeet() {
  return await apiRequest('/api/v1/integrations/google/meet/connect', {
    method: 'GET',
  });
}

// Disconnects both Google Meet and Google Calendar (they share one Google
// connection): revokes the grant at Google and deletes the stored token.
export async function disconnectGoogle() {
  return await apiRequest('/api/v1/integrations/google/connection', {
    method: 'DELETE',
  });
}

export async function createGoogleMeet(meetingId) {
  return await apiRequest(`/api/v1/integrations/google/meetings/${meetingId}/meet`, {
    method: 'POST',
  });
}

export async function getGoogleMeet(meetingId) {
  return await apiRequest(`/api/v1/integrations/google/meetings/${meetingId}/meet`, {
    method: 'GET',
  });
}

export async function syncGoogleMeetTranscript(meetingId) {
  return await apiRequest(`/api/v1/integrations/google/meetings/${meetingId}/meet/sync-transcript`, {
    method: 'POST',
  });
}
