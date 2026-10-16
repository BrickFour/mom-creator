import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Pause,
  Play,
  Square,
  RotateCcw,
  Upload,
  AlertCircle,
  Volume2,
  PhoneCall,
  ShieldAlert,
  Radio,
} from 'lucide-react';
import { Button } from '../common/Button.jsx';

// 1-second silent WAV data URI to maintain active mobile audio session in background (iOS / Android)
const SILENT_AUDIO_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';

export function BrowserRecorder({ onRecordingComplete, disabled = false }) {
  // idle | recording | paused | stopped
  const [recordingState, setRecordingState] = useState('idle');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [detectedExt, setDetectedExt] = useState('webm');
  const [permissionError, setPermissionError] = useState('');
  const [interruptedByCall, setInterruptedByCall] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100 for live meter

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);

  // Timing tracking (wall-clock delta for accurate mobile timers)
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const accumulatedDurationRef = useRef(0);
  const lastResumeTimeRef = useRef(0);

  // Smartphone Wake Lock & Background Audio Keep-Alive refs
  const wakeLockRef = useRef(null);
  const silentAudioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Request screen wake lock to keep screen awake during meeting
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator && !wakeLockRef.current) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      } catch (err) {
        // Wake lock can fail if low battery or disallowed
        console.warn('Screen WakeLock failed:', err);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      try {
        wakeLockRef.current.release();
      } catch {
        // ignore
      }
      wakeLockRef.current = null;
    }
  };

  // Keep-alive silent audio loop for screen-off recording on smartphones
  const startBackgroundAudioSession = () => {
    try {
      if (!silentAudioRef.current) {
        silentAudioRef.current = new Audio(SILENT_AUDIO_URI);
        silentAudioRef.current.loop = true;
      }
      silentAudioRef.current.play().catch(() => {
        // Autoplay may be restricted without user interaction; non-fatal
      });
    } catch {
      // ignore
    }
  };

  const stopBackgroundAudioSession = () => {
    if (silentAudioRef.current) {
      try {
        silentAudioRef.current.pause();
        silentAudioRef.current.currentTime = 0;
      } catch {
        // ignore
      }
    }
  };

  // Re-acquire wake lock if tab becomes visible again while recording
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && recordingState === 'recording') {
        requestWakeLock();
        // Recalculate duration immediately upon waking up
        const now = Date.now();
        const currentElapsed = accumulatedDurationRef.current + Math.floor((now - lastResumeTimeRef.current) / 1000);
        setDuration(currentElapsed);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [recordingState]);

  // Prevent accidental navigation while recording
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (recordingState === 'recording' || recordingState === 'paused') {
        e.preventDefault();
        e.returnValue = 'You have an active recording. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [recordingState]);

  // Clean up all resources on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      releaseWakeLock();
      stopBackgroundAudioSession();

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [audioUrl]);

  // Live audio level visualizer
  const setupAudioVisualizer = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Normalize 0-100
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('Audio meter initialization skipped:', e);
    }
  };

  const startRecording = async () => {
    setPermissionError('');
    setInterruptedByCall(false);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      // Handle Smartphone incoming call & track interruptions
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        // On smartphone incoming call, OS mutes the microphone track!
        audioTrack.addEventListener('mute', () => {
          console.warn('Microphone track muted by OS (incoming call or system interruption)');
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            pauseRecording();
            setInterruptedByCall(true);
            if ('vibrate' in navigator) {
              try {
                navigator.vibrate([200, 100, 200]);
              } catch {
                // ignore
              }
            }
          }
        });

        // When phone call ends, track unmutes
        audioTrack.addEventListener('unmute', () => {
          console.info('Microphone track unmuted by OS (call ended)');
          // Keep paused with user prompt to resume
        });

        // Handle unexpected disconnection (e.g. bluetooth mic pulled out)
        audioTrack.addEventListener('ended', () => {
          console.warn('Microphone track ended unexpectedly');
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            stopRecording();
          }
        });
      }

      // Best supported audio MIME type
      let mimeType = '';
      let ext = 'webm';

      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
        ext = 'webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
        ext = 'mp4';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
        ext = 'webm';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
        ext = 'ogg';
      }

      setDetectedExt(ext);

      const mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalType = mimeType || mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: finalType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordingState('stopped');

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
        releaseWakeLock();
        stopBackgroundAudioSession();

        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setAudioLevel(0);
      };

      // Start recording in chunks of 1000ms
      mediaRecorder.start(1000);
      setRecordingState('recording');

      // Start background keep-alive and screen wake lock
      await requestWakeLock();
      startBackgroundAudioSession();
      setupAudioVisualizer(stream);

      // Wall-clock timing
      accumulatedDurationRef.current = 0;
      lastResumeTimeRef.current = Date.now();
      startTimeRef.current = Date.now();
      setDuration(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const elapsed =
          accumulatedDurationRef.current +
          Math.floor((Date.now() - lastResumeTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 500);
    } catch (err) {
      console.error('Microphone access failed:', err);
      setPermissionError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser settings.'
          : 'Could not access audio recording device.'
      );
    }
  };

  const pauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      try {
        mediaRecorderRef.current.pause();
      } catch (e) {
        console.warn('mediaRecorder pause error:', e);
      }

      if (timerRef.current) clearInterval(timerRef.current);

      // Accumulate elapsed seconds
      const elapsedSinceResume = Math.floor(
        (Date.now() - lastResumeTimeRef.current) / 1000
      );
      accumulatedDurationRef.current += elapsedSinceResume;
      setDuration(accumulatedDurationRef.current);

      setRecordingState('paused');
      setAudioLevel(0);
    }
  };

  const resumeRecording = async () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'paused'
    ) {
      try {
        mediaRecorderRef.current.resume();
      } catch (e) {
        console.warn('mediaRecorder resume error:', e);
      }

      setInterruptedByCall(false);
      lastResumeTimeRef.current = Date.now();
      setRecordingState('recording');

      await requestWakeLock();
      startBackgroundAudioSession();

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const elapsed =
          accumulatedDurationRef.current +
          Math.floor((Date.now() - lastResumeTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 500);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (
      mediaRecorderRef.current &&
      (mediaRecorderRef.current.state === 'recording' ||
        mediaRecorderRef.current.state === 'paused')
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    accumulatedDurationRef.current = 0;
    setRecordingState('idle');
    setPermissionError('');
    setInterruptedByCall(false);
    setAudioLevel(0);
  };

  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const rem = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${rem
      .toString()
      .padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4 shadow-xs">
      {/* Permission or device error banner */}
      {permissionError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <p>{permissionError}</p>
        </div>
      )}

      {/* Incoming Call / Phone Interruption Alert */}
      {interruptedByCall && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs animate-pulse">
          <PhoneCall className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Meeting Paused: Incoming Call or Audio Interruption</p>
            <p className="text-[11px] text-amber-800">
              Your device received a phone call or audio interruption. Your meeting recording was safely paused. Tap "Resume" when your call is finished.
            </p>
          </div>
        </div>
      )}

      {/* 1. IDLE STATE */}
      {recordingState === 'idle' && (
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <Mic className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="text-sm font-bold text-slate-900">Offline Meeting Recorder</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Record conversations, boardroom meetings, or interviews. Screen-off protection and call auto-pause are enabled.
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={startRecording}
              disabled={disabled}
              icon={Mic}
              className="px-6 py-2.5 shadow-md shadow-indigo-500/15"
            >
              Start Recording
            </Button>
          </div>
        </div>
      )}

      {/* 2. RECORDING OR PAUSED STATE */}
      {(recordingState === 'recording' || recordingState === 'paused') && (
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-5">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            {recordingState === 'recording' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                Live Recording
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                <Pause className="w-3 h-3 text-amber-600 fill-amber-600" />
                Recording Paused
              </span>
            )}
          </div>

          {/* Large wall-clock timer display */}
          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-slate-900 tabular-nums">
              {formatTime(duration)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {recordingState === 'recording'
                ? 'Screen-off & background keep-alive active'
                : 'Timer paused · Tap resume to continue'}
            </p>
          </div>

          {/* Live audio level indicator bar */}
          {recordingState === 'recording' && (
            <div className="w-full max-w-xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Radio className="w-3 h-3 text-indigo-500 animate-pulse" /> Mic Input
                </span>
                <span>{audioLevel > 5 ? 'Speech detected' : 'Listening...'}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${Math.max(4, audioLevel)}%` }}
                />
              </div>
            </div>
          )}

          {/* Primary Mobile Touch Controls: Pause / Resume / Stop */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {recordingState === 'recording' ? (
              <Button
                variant="secondary"
                size="md"
                onClick={pauseRecording}
                icon={Pause}
                className="min-w-[110px]"
              >
                Pause
              </Button>
            ) : (
              <Button
                size="md"
                onClick={resumeRecording}
                icon={Play}
                className="min-w-[110px] bg-emerald-600 hover:bg-emerald-700"
              >
                Resume
              </Button>
            )}

            <Button
              variant="danger"
              size="md"
              onClick={stopRecording}
              icon={Square}
              className="min-w-[110px]"
            >
              Stop & Save
            </Button>
          </div>
        </div>
      )}

      {/* 3. STOPPED & CAPTURED STATE */}
      {recordingState === 'stopped' && audioBlob && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Audio Captured Successfully</p>
                <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                  Duration: {formatTime(duration)} · Size: {formatFileSize(audioBlob.size)} ({detectedExt.toUpperCase()})
                </p>
              </div>
            </div>
            {audioUrl && (
              <audio controls src={audioUrl} className="h-9 w-full sm:max-w-xs" />
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={resetRecording}
              icon={RotateCcw}
              disabled={disabled}
            >
              Discard & Re-record
            </Button>
            <Button
              size="sm"
              onClick={() =>
                onRecordingComplete(
                  audioBlob,
                  `meeting_rec_${Date.now()}.${detectedExt}`
                )
              }
              icon={Upload}
              disabled={disabled}
              className="bg-brand-gradient text-white shadow-xs"
            >
              Upload & Generate MOM
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
