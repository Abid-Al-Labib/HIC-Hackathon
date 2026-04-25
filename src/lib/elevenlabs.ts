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
