import { useState, useEffect } from 'react';
import { subscribeBackendStatus, pingBackend } from '../../services/backendWarmup.js';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';

export function BackendStatusBanner() {
  const [status, setStatus] = useState({
    isChecking: false,
    isWakingUp: false,
    isOnline: true,
  });
  const [recentlyWoken, setRecentlyWoken] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Initial ping on app mount
    pingBackend();

    const unsubscribe = subscribeBackendStatus((newStatus) => {
      setStatus((prev) => {
        if (prev.isWakingUp && !newStatus.isWakingUp && newStatus.isOnline) {
          setRecentlyWoken(true);
          setTimeout(() => setRecentlyWoken(false), 4000);
        }
        if (newStatus.isOnline) {
          setDismissed(false);
        }
        return newStatus;
      });
    });

    return () => unsubscribe();
  }, []);

  if (status.isWakingUp) {
    return (
      <div className="bg-amber-500 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-xs transition-all animate-in slide-in-from-top duration-200 z-50">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-amber-100" />
          <span>
            <strong>Backend Waking Up:</strong> The server on Render is spinning up from idle state. First request may take 30–50 seconds.
          </span>
        </div>
      </div>
    );
  }

  if (recentlyWoken) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-all animate-in slide-in-from-top duration-200 z-50">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
        <span>Server is online and ready!</span>
      </div>
    );
  }

  if (!status.isOnline && !status.isChecking && !dismissed) {
    return (
      <div className="bg-rose-600 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-xs transition-all animate-in slide-in-from-top duration-200 z-50">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-rose-200 shrink-0" />
          <span>Cannot reach API server. Ensure Render service is deployed and active.</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <button
            onClick={() => pingBackend(0)}
            className="underline hover:text-rose-100 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-0.5 hover:bg-rose-700 rounded text-rose-200 hover:text-white cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
