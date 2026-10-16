import { getApiBaseUrl } from '../lib/config.js';

let status = {
  isChecking: false,
  isWakingUp: false,
  isOnline: true, // optimistic
  lastChecked: null,
};

const listeners = new Set();

function notify() {
  listeners.forEach((fn) => {
    try {
      fn({ ...status });
    } catch (e) {
      console.error('Error in backend status listener:', e);
    }
  });
}

export function subscribeBackendStatus(callback) {
  listeners.add(callback);
  callback({ ...status });
  return () => listeners.delete(callback);
}

/**
 * Manually mark backend as online (e.g. when any API request successfully completes)
 */
export function markBackendOnline() {
  if (!status.isOnline || status.isWakingUp || status.isChecking) {
    status.isOnline = true;
    status.isWakingUp = false;
    status.isChecking = false;
    status.lastChecked = Date.now();
    notify();
  }
}

/**
 * Pings the backend health endpoint with automatic fallback.
 * Detects if the backend (Render free tier) is hibernating and waking up.
 */
export async function pingBackend(showWarmupThresholdMs = 2500) {
  const baseUrl = getApiBaseUrl();
  status.isChecking = true;

  // If the health check takes longer than 2.5s, it is almost certainly a Render cold start
  const warmupTimer = setTimeout(() => {
    if (status.isChecking) {
      status.isWakingUp = true;
      notify();
    }
  }, showWarmupThresholdMs);

  const controller = new AbortController();
  const hardTimeout = setTimeout(() => controller.abort(), 90000); // Render cold start can take up to 75-90s

  try {
    const start = Date.now();
    const candidateEndpoints = ['/health', '/api/v1/health', '/'];
    let isReachable = false;
    let finalStatus = 0;

    for (const ep of candidateEndpoints) {
      try {
        const response = await fetch(`${baseUrl}${ep}`, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });

        if (response.ok || response.status === 200 || response.status === 401) {
          isReachable = true;
          finalStatus = response.status;
          break;
        }
      } catch {
        // Try next candidate endpoint
      }
    }

    clearTimeout(warmupTimer);
    clearTimeout(hardTimeout);

    const elapsed = Date.now() - start;

    if (isReachable) {
      status.isOnline = true;
      status.isWakingUp = false;
      status.isChecking = false;
      status.lastChecked = Date.now();
      notify();
      return { ok: true, elapsed };
    } else {
      status.isOnline = false;
      status.isWakingUp = false;
      status.isChecking = false;
      notify();
      return { ok: false, status: finalStatus };
    }
  } catch (err) {
    clearTimeout(warmupTimer);
    clearTimeout(hardTimeout);

    status.isOnline = false;
    status.isWakingUp = false;
    status.isChecking = false;
    notify();
    return { ok: false, error: err.name === 'AbortError' ? 'timeout' : 'network_error' };
  }
}
