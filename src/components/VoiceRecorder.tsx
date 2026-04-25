import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mic,
  Play,
  RefreshCw,
  Square,
  Upload,
} from "lucide-react";
import {
  ElevenLabsTtsError,
  processRecording,
  type ProcessRecordingResult,
} from "../lib/elevenlabs";
import { cn } from "../lib/utils";

/* ──────────────────────────────────────────────────────────────────────────
 * VoiceRecorder
 *
 * Records audio in the browser via MediaRecorder, then sends the recording
 * to /api/elevenlabs/record-process which:
 *   1. Clones the speaker's voice via ElevenLabs Instant Voice Cloning.
 *   2. Transcribes what was said via ElevenLabs Scribe (speech-to-text).
 *
 * The transcript is what your friend's database layer will store. We expose
 * it (plus the raw audio Blob, voice id, and metadata) via the `onProcessed`
 * callback so the DB integration is a one-liner.
 *
 * Consent reminder: only clone a person's voice with their explicit, documented
 * consent. The UI shows a small note next to the Record button.
 * ────────────────────────────────────────────────────────────────────────── */

type RecorderState =
  | { kind: "idle" }
  | { kind: "permission" }
  | { kind: "recording"; startedAt: number }
  | { kind: "recorded" }
  | { kind: "processing" }
  | { kind: "done"; result: ProcessRecordingResult }
  | { kind: "error"; message: string };

export interface VoiceRecorderProcessed {
  /** Raw audio captured by MediaRecorder. Useful for uploading to storage. */
  audioBlob: Blob;
  /** Object URL for instant playback in the UI. The recorder revokes this on unmount. */
  audioUrl: string;
  /** The voice name the caregiver typed. */
  voiceName: string;
  voiceDescription?: string;
  /** Optional caregiver/contributor + patient context (passed in via props). */
  contributorId?: string;
  patientId?: string;
  /** ISO timestamp when the recording was processed. */
  recordedAt: string;
  /** Recording duration in milliseconds (client-measured). */
  durationMs: number;
  /** ElevenLabs results — either side may be null if that call failed. */
  voice: ProcessRecordingResult["voice"];
  transcript: ProcessRecordingResult["transcript"];
  errors: ProcessRecordingResult["errors"];
}

export interface VoiceRecorderProps {
  /** Pre-fill the voice name input (e.g., "Sarah Johnson"). */
  defaultVoiceName?: string;
  /** Optional default description (e.g., "Daughter, recorded for memory narration"). */
  defaultVoiceDescription?: string;
  /** Optional patient + contributor IDs forwarded to onProcessed for DB storage. */
  patientId?: string;
  contributorId?: string;
  /** Optional language hint for transcription (e.g., "en"). */
  languageCode?: string;
  /**
   * Called once after a successful round-trip. The downstream DB layer should
   * subscribe here to persist the transcript, audio, and voice id.
   */
  onProcessed?: (data: VoiceRecorderProcessed) => void;
  className?: string;
}

const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg;codecs=opus",
];

function pickMimeType(): string {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return "";
  for (const candidate of PREFERRED_MIME_TYPES) {
    try {
      if (MediaRecorder.isTypeSupported(candidate)) return candidate;
    } catch {
      // ignore and try next
    }
  }
  return "";
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function VoiceRecorder({
  defaultVoiceName = "",
  defaultVoiceDescription = "",
  patientId,
  contributorId,
  languageCode,
  onProcessed,
  className,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>({ kind: "idle" });
  const [voiceName, setVoiceName] = useState(defaultVoiceName);
  const [voiceDescription, setVoiceDescription] = useState(defaultVoiceDescription);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chosenMimeTypeRef = useRef<string>("");
  const tickRef = useRef<number | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    audioUrlRef.current = audioUrl;
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      stopMediaTracks();
      if (tickRef.current !== null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopMediaTracks = () => {
    if (mediaStreamRef.current) {
      for (const track of mediaStreamRef.current.getTracks()) track.stop();
      mediaStreamRef.current = null;
    }
  };

  const resetCapturedAudio = () => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDurationMs(0);
    setElapsedMs(0);
  };

  const handleStartRecording = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState({
        kind: "error",
        message: "Microphone capture isn't supported in this browser.",
      });
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      setState({
        kind: "error",
        message: "MediaRecorder isn't supported in this browser.",
      });
      return;
    }

    setState({ kind: "permission" });
    resetCapturedAudio();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const message =
        (err as Error)?.name === "NotAllowedError"
          ? "Microphone permission was denied. Please allow access and try again."
          : (err as Error)?.message || "Couldn't access the microphone.";
      setState({ kind: "error", message });
      return;
    }

    mediaStreamRef.current = stream;
    chunksRef.current = [];
    const mimeType = pickMimeType();
    chosenMimeTypeRef.current = mimeType;

    let recorder: MediaRecorder;
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch (err) {
      stopMediaTracks();
      setState({
        kind: "error",
        message: (err as Error)?.message || "Failed to start MediaRecorder.",
      });
      return;
    }

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onerror = (event) => {
      // eslint-disable-next-line no-console
      console.error("[VoiceRecorder] MediaRecorder error", event);
      setState({ kind: "error", message: "Recording failed. Please try again." });
      stopMediaTracks();
    };

    recorder.onstop = () => {
      const finalDuration = elapsedMsRef.current;
      const blobType =
        recorder.mimeType ||
        chunksRef.current[0]?.type ||
        chosenMimeTypeRef.current ||
        "audio/webm";
      const blob = new Blob(chunksRef.current, { type: blobType });
      chunksRef.current = [];
      stopMediaTracks();
      if (tickRef.current !== null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }

      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
      setDurationMs(finalDuration);
      setState({ kind: "recorded" });
    };

    mediaRecorderRef.current = recorder;
    const startedAt = Date.now();
    recorder.start();

    if (tickRef.current !== null) window.clearInterval(tickRef.current);
    setElapsedMs(0);
    tickRef.current = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 200);

    setState({ kind: "recording", startedAt });
  };

  const elapsedMsRef = useRef(0);
  useEffect(() => {
    elapsedMsRef.current = elapsedMs;
  }, [elapsedMs]);

  const handleStopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[VoiceRecorder] stop error", err);
      }
    } else {
      stopMediaTracks();
      setState({ kind: "idle" });
    }
  };

  const handleReRecord = () => {
    resetCapturedAudio();
    setState({ kind: "idle" });
  };

  const handleProcess = async () => {
    if (!audioBlob) return;
    if (!voiceName.trim()) {
      setState({
        kind: "error",
        message: "Please add a voice name before processing.",
      });
      return;
    }

    setState({ kind: "processing" });
    try {
      const result = await processRecording({
        audioBlob,
        voiceName: voiceName.trim(),
        voiceDescription: voiceDescription.trim() || undefined,
        languageCode,
      });

      // Hand off to the DB layer — your friend's persistence code can plug in
      // here. This is intentionally fire-and-forget; we don't await the parent.
      try {
        onProcessed?.({
          audioBlob,
          audioUrl: audioUrl ?? URL.createObjectURL(audioBlob),
          voiceName: voiceName.trim(),
          voiceDescription: voiceDescription.trim() || undefined,
          contributorId,
          patientId,
          recordedAt: new Date().toISOString(),
          durationMs,
          voice: result.voice,
          transcript: result.transcript,
          errors: result.errors,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[VoiceRecorder] onProcessed handler threw", err);
      }

      setState({ kind: "done", result });
    } catch (err) {
      const message =
        err instanceof ElevenLabsTtsError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong while processing the recording.";
      setState({ kind: "error", message });
    }
  };

  const handleStartOver = () => {
    resetCapturedAudio();
    setState({ kind: "idle" });
  };

  const isRecording = state.kind === "recording";
  const isProcessing = state.kind === "processing";
  const isDone = state.kind === "done";
  const errorMessage = state.kind === "error" ? state.message : null;
  const liveTimer = isRecording ? elapsedMs : durationMs;

  const doneVoice = isDone ? state.result.voice : null;
  const doneTranscript = isDone ? state.result.transcript : null;
  const doneVoiceError = isDone ? state.result.errors.voice : null;
  const doneTranscriptError = isDone ? state.result.errors.transcript : null;

  const recordButtonLabel = useMemo(() => {
    if (state.kind === "permission") return "Requesting mic access…";
    if (isRecording) return "Stop Recording";
    if (state.kind === "recorded") return "Re-record";
    return "Start Recording";
  }, [state.kind, isRecording]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="vr-voice-name"
            className="block text-xs font-bold uppercase tracking-wider text-posthog-ink/70 dark:text-slate-500 mb-2"
          >
            Voice name <span className="text-rose-500">*</span>
          </label>
          <input
            id="vr-voice-name"
            type="text"
            value={voiceName}
            onChange={(event) => setVoiceName(event.target.value)}
            placeholder="e.g. Sarah Johnson"
            disabled={isProcessing}
            className={cn(
              "w-full rounded-2xl border border-posthog-border bg-posthog-parchment dark:bg-slate-950/40",
              "p-3 text-sm text-posthog-deep-ink dark:text-slate-100",
              "placeholder:text-posthog-ink/40 dark:placeholder:text-slate-600",
              "focus:outline-none focus:ring-2 focus:ring-posthog-cta/40",
              "disabled:opacity-60"
            )}
          />
        </div>
        <div>
          <label
            htmlFor="vr-voice-desc"
            className="block text-xs font-bold uppercase tracking-wider text-posthog-ink/70 dark:text-slate-500 mb-2"
          >
            Description <span className="font-normal lowercase tracking-normal">(optional)</span>
          </label>
          <input
            id="vr-voice-desc"
            type="text"
            value={voiceDescription}
            onChange={(event) => setVoiceDescription(event.target.value)}
            placeholder="e.g. Daughter, recorded April 25"
            disabled={isProcessing}
            className={cn(
              "w-full rounded-2xl border border-posthog-border bg-posthog-parchment dark:bg-slate-950/40",
              "p-3 text-sm text-posthog-deep-ink dark:text-slate-100",
              "placeholder:text-posthog-ink/40 dark:placeholder:text-slate-600",
              "focus:outline-none focus:ring-2 focus:ring-posthog-cta/40",
              "disabled:opacity-60"
            )}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-posthog-border bg-posthog-parchment dark:bg-slate-950/40 p-6">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all",
              isRecording
                ? "bg-rose-500 text-white shadow-[0_0_0_8px_rgba(244,63,94,0.18)] animate-pulse"
                : "bg-posthog-light-sage dark:bg-slate-800 text-posthog-orange"
            )}
          >
            {isRecording ? <Square size={26} fill="currentColor" /> : <Mic size={28} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-2xl font-bold text-posthog-deep-ink dark:text-slate-100">
              {formatDuration(liveTimer)}
            </div>
            <p className="text-xs text-posthog-ink/60 dark:text-slate-500">
              {isRecording
                ? "Recording… click Stop when finished."
                : state.kind === "recorded"
                  ? `Captured ${formatDuration(durationMs)}${
                      audioBlob ? ` · ${formatBytes(audioBlob.size)}` : ""
                    }`
                  : "Speak naturally for at least 30 seconds for the best clone quality."}
            </p>
          </div>
          <button
            type="button"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isProcessing || state.kind === "permission"}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold shadow-md transition-all",
              isRecording
                ? "bg-rose-500 text-white hover:bg-rose-600"
                : "bg-posthog-cta text-white hover:bg-indigo-700",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {state.kind === "permission" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isRecording ? (
              <Square size={16} fill="currentColor" />
            ) : state.kind === "recorded" ? (
              <RefreshCw size={16} />
            ) : (
              <Mic size={16} />
            )}
            {recordButtonLabel}
          </button>
        </div>

        {audioUrl && !isRecording && (
          <div className="mt-5 flex items-center gap-3">
            <Play size={14} className="text-posthog-ink/60 dark:text-slate-500" />
            <audio src={audioUrl} controls className="flex-1 h-10" />
          </div>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-posthog-ink/60 dark:text-slate-500 flex items-start gap-1.5">
        <AlertCircle size={12} className="mt-0.5 shrink-0" />
        Cloned voices may only be created with the speaker's clear, documented
        consent. The recording is sent to ElevenLabs to clone the voice and to
        transcribe what was said; the transcript is stored in MemoryBridge for
        later playback.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleProcess}
          disabled={
            !audioBlob ||
            isRecording ||
            isProcessing ||
            state.kind === "permission" ||
            voiceName.trim().length === 0
          }
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-md",
            "bg-posthog-cta text-white hover:bg-indigo-700",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-posthog-cta"
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Cloning voice & transcribing…
            </>
          ) : (
            <>
              <Upload size={16} />
              Clone Voice & Transcribe
            </>
          )}
        </button>

        {(state.kind === "recorded" || isDone) && (
          <button
            type="button"
            onClick={handleReRecord}
            disabled={isProcessing}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all border",
              "border-posthog-border text-posthog-ink dark:text-slate-200 hover:bg-posthog-light-sage dark:hover:bg-slate-800",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            <RefreshCw size={14} />
            Re-record
          </button>
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Something went wrong</p>
            <p className="opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      {isDone && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 size={18} />
            Recording processed.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={cn(
                "rounded-2xl border p-4",
                doneVoice
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                  : "border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20"
              )}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-posthog-ink/70 dark:text-slate-400 mb-2">
                Voice clone
              </p>
              {doneVoice ? (
                <>
                  <p className="text-sm text-posthog-ink dark:text-slate-200">
                    Cloned as <span className="font-semibold">{doneVoice.name}</span>.
                  </p>
                  <p className="mt-1 text-[11px] text-posthog-ink/60 dark:text-slate-500">
                    Voice ID:{" "}
                    <code className="font-mono break-all text-posthog-ink dark:text-slate-300">
                      {doneVoice.voiceId}
                    </code>
                  </p>
                  <p className="mt-2 text-[11px] text-posthog-ink/60 dark:text-slate-500">
                    Paste this voice ID into the Narration Studio to generate audio with this voice.
                  </p>
                </>
              ) : (
                <p className="text-sm text-rose-800 dark:text-rose-200">
                  {doneVoiceError?.message || "Voice cloning failed."}
                </p>
              )}
            </div>

            <div
              className={cn(
                "rounded-2xl border p-4",
                doneTranscript
                  ? "border-posthog-border bg-posthog-sage dark:bg-slate-900 dark:border-slate-700"
                  : "border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20"
              )}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-posthog-ink/70 dark:text-slate-400 mb-2">
                Transcript
              </p>
              {doneTranscript ? (
                <>
                  <p className="text-sm leading-relaxed italic text-posthog-ink dark:text-slate-200 whitespace-pre-wrap">
                    {doneTranscript.text || <span className="opacity-60">(empty transcript)</span>}
                  </p>
                  <p className="mt-2 text-[11px] text-posthog-ink/60 dark:text-slate-500">
                    {doneTranscript.languageCode
                      ? `Language: ${doneTranscript.languageCode}${
                          doneTranscript.languageProbability !== undefined
                            ? ` (${(doneTranscript.languageProbability * 100).toFixed(0)}%)`
                            : ""
                        }`
                      : "Transcript ready."}
                    {" · queued for memory vault"}
                  </p>
                </>
              ) : (
                <p className="text-sm text-rose-800 dark:text-rose-200">
                  {doneTranscriptError?.message || "Transcription failed."}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartOver}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border border-posthog-border text-posthog-ink dark:text-slate-200 hover:bg-posthog-light-sage dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={14} />
            Record another
          </button>
        </div>
      )}
    </div>
  );
}
