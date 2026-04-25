/**
 * ElevenLabs TTS client helper.
 *
 * Calls our same-origin `/api/elevenlabs/tts` route so the API key never
 * touches the browser. Returns an audio Blob plus a playable object URL.
 *
 * Consent note: only use cloned voice IDs with explicit, documented consent
 * from the person whose voice was cloned.
 */

export interface ElevenLabsVoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface GenerateNarrationAudioInput {
  scriptText: string;
  voiceId?: string;
  voiceSettings?: ElevenLabsVoiceSettings;
  modelId?: string;
  outputFormat?: string;
  signal?: AbortSignal;
}

export interface GenerateNarrationAudioResult {
  blob: Blob;
  url: string;
  voiceId: string | null;
  modelId: string | null;
  contentType: string;
}

export const ELEVENLABS_TTS_ENDPOINT = "/api/elevenlabs/tts";

export class ElevenLabsTtsError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ElevenLabsTtsError";
    this.status = status;
    this.details = details;
  }
}

export async function generateNarrationAudio(
  input: GenerateNarrationAudioInput
): Promise<GenerateNarrationAudioResult> {
  const scriptText = input.scriptText?.trim();
  if (!scriptText) {
    throw new ElevenLabsTtsError("scriptText is required", 400);
  }

  const response = await fetch(ELEVENLABS_TTS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scriptText,
      voiceId: input.voiceId?.trim() || undefined,
      voiceSettings: input.voiceSettings,
      modelId: input.modelId,
      outputFormat: input.outputFormat,
    }),
    signal: input.signal,
  });

  if (!response.ok) {
    let message = `ElevenLabs request failed (${response.status})`;
    let details: unknown;
    try {
      const data = await response.json();
      if (data && typeof data === "object") {
        if (typeof (data as { error?: unknown }).error === "string") {
          message = (data as { error: string }).error;
        }
        details = (data as { details?: unknown }).details;
      }
    } catch {
      // body wasn't JSON; ignore
    }
    throw new ElevenLabsTtsError(message, response.status, details);
  }

  const contentType = response.headers.get("Content-Type") ?? "audio/mpeg";
  const voiceId = response.headers.get("X-ElevenLabs-Voice-Id");
  const modelId = response.headers.get("X-ElevenLabs-Model-Id");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  return { blob, url, voiceId, modelId, contentType };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Recording → voice clone + transcription
 *
 * The recorder UI captures a Blob via MediaRecorder and POSTs the raw audio
 * (no multipart wrapper) to one of the routes below. The API key never leaves
 * the server.
 * ────────────────────────────────────────────────────────────────────────── */

export const ELEVENLABS_RECORD_PROCESS_ENDPOINT = "/api/elevenlabs/record-process";
export const ELEVENLABS_CLONE_VOICE_ENDPOINT = "/api/elevenlabs/clone-voice";
export const ELEVENLABS_TRANSCRIBE_ENDPOINT = "/api/elevenlabs/transcribe";

export interface RecordingVoice {
  voiceId: string;
  name: string;
  requiresVerification?: boolean;
}

export interface RecordingTranscript {
  text: string;
  languageCode?: string;
  languageProbability?: number;
  audioDurationSecs?: number;
}

export interface RecordingErrorInfo {
  message: string;
  status: number;
  details?: unknown;
}

export interface ProcessRecordingInput {
  audioBlob: Blob;
  voiceName: string;
  voiceDescription?: string;
  languageCode?: string;
  signal?: AbortSignal;
}

export interface ProcessRecordingResult {
  voice: RecordingVoice | null;
  transcript: RecordingTranscript | null;
  errors: {
    voice: RecordingErrorInfo | null;
    transcript: RecordingErrorInfo | null;
  };
  bytes: number;
  contentType: string;
}

function buildAudioRequestUrl(
  endpoint: string,
  params: Record<string, string | undefined>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, value);
  }
  const query = search.toString();
  return query ? `${endpoint}?${query}` : endpoint;
}

async function postAudio<T>(
  endpoint: string,
  params: Record<string, string | undefined>,
  audioBlob: Blob,
  signal?: AbortSignal
): Promise<T> {
  if (!audioBlob || audioBlob.size === 0) {
    throw new ElevenLabsTtsError("audioBlob is required and must be non-empty", 400);
  }

  const url = buildAudioRequestUrl(endpoint, params);
  const contentType = audioBlob.type || "audio/webm";

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: audioBlob,
    signal,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let details: unknown;
    try {
      const data = (await response.json()) as { error?: unknown; details?: unknown };
      if (typeof data?.error === "string") message = data.error;
      details = data?.details;
    } catch {
      // body wasn't JSON; ignore
    }
    throw new ElevenLabsTtsError(message, response.status, details);
  }

  return (await response.json()) as T;
}

/**
 * Sends one recording to the backend, which clones the speaker's voice AND
 * transcribes the speech in parallel. Resolves with both results (or
 * per-call errors if either side failed).
 */
export async function processRecording(
  input: ProcessRecordingInput
): Promise<ProcessRecordingResult> {
  const voiceName = input.voiceName?.trim();
  if (!voiceName) {
    throw new ElevenLabsTtsError("voiceName is required", 400);
  }

  return await postAudio<ProcessRecordingResult>(
    ELEVENLABS_RECORD_PROCESS_ENDPOINT,
    {
      voiceName,
      description: input.voiceDescription?.trim() || undefined,
      languageCode: input.languageCode?.trim() || undefined,
    },
    input.audioBlob,
    input.signal
  );
}

export interface CloneVoiceFromRecordingInput {
  audioBlob: Blob;
  voiceName: string;
  voiceDescription?: string;
  signal?: AbortSignal;
}

export async function cloneVoiceFromRecording(
  input: CloneVoiceFromRecordingInput
): Promise<RecordingVoice & { raw?: unknown }> {
  const voiceName = input.voiceName?.trim();
  if (!voiceName) {
    throw new ElevenLabsTtsError("voiceName is required", 400);
  }
  return await postAudio<RecordingVoice & { raw?: unknown }>(
    ELEVENLABS_CLONE_VOICE_ENDPOINT,
    {
      voiceName,
      description: input.voiceDescription?.trim() || undefined,
    },
    input.audioBlob,
    input.signal
  );
}

export interface TranscribeRecordingInput {
  audioBlob: Blob;
  languageCode?: string;
  modelId?: string;
  signal?: AbortSignal;
}

export async function transcribeRecording(
  input: TranscribeRecordingInput
): Promise<RecordingTranscript & { raw?: unknown }> {
  return await postAudio<RecordingTranscript & { raw?: unknown }>(
    ELEVENLABS_TRANSCRIBE_ENDPOINT,
    {
      languageCode: input.languageCode?.trim() || undefined,
      modelId: input.modelId?.trim() || undefined,
    },
    input.audioBlob,
    input.signal
  );
}
