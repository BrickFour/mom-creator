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
 * Pings the backend health endpoint.
 * Detects if the backend serverless instance is initializing.
 */
export async function pingBackend(showWarmupThresholdMs = 4500) {
  const baseUrl = getApiBaseUrl();
  status.isChecking = true;

  // If initial ping takes longer than threshold, notify UI of cold-start warmup
  const warmupTimer = setTimeout(() => {
    if (status.isChecking) {
      status.isWakingUp = true;
      notify();
    }
  }, showWarmupThresholdMs);

  const controller = new AbortController();
  const hardTimeout = setTimeout(() => controller.abort(), 10000); // Fast 10s max timeout for serverless

  try {
    const start = Date.now();
    let isReachable = false;
    let finalStatus = 0;

    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });

      if (response.ok || response.status === 200 || response.status === 401) {
        isReachable = true;
        finalStatus = response.status;
      }
    } catch {
      // Fallback ping to root /
      try {
        const rootResponse = await fetch(`${baseUrl}/`, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });

        if (rootResponse.ok || rootResponse.status === 200 || rootResponse.status === 401) {
          isReachable = true;
          finalStatus = rootResponse.status;
        }
      } catch {
        // Unreachable
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
