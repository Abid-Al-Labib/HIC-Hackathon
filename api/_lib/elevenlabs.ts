/**
 * Shared server-side helpers for ElevenLabs routes.
 *
 * Files in `api/` whose names start with `_` are NOT auto-routed by Vercel,
 * so this module is safe to import from sibling routes without exposing it.
 *
 * Consent reminder: cloned voices must only be created with the explicit,
 * documented consent of the person whose voice is being cloned.
 */

// Loosely typed req/res so we don't require @types/node or @vercel/node.
// In practice Vercel passes (VercelRequest, VercelResponse) which extend
// Node's IncomingMessage / ServerResponse. The Vite dev middleware passes
// raw Node IncomingMessage / ServerResponse. Both share the surface we use.
export type AnyReq = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  on: (event: string, listener: (...args: any[]) => void) => unknown;
};

export type AnyRes = {
  statusCode: number;
  setHeader: (name: string, value: string | number | string[]) => unknown;
  end: (chunk?: any) => unknown;
  writableEnded?: boolean;
};

export class ElevenLabsServerError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ElevenLabsServerError";
    this.status = status;
    this.details = details;
  }
}

export function jsonError(
  res: AnyRes,
  status: number,
  message: string,
  details?: unknown
): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(
    JSON.stringify({
      error: message,
      ...(details !== undefined ? { details } : {}),
    })
  );
}

export function jsonOk(res: AnyRes, payload: unknown): void {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function setCorsPreflight(res: AnyRes): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Voice-Name, X-Voice-Description, X-Language-Code"
  );
}

export function getApiKey(): string | null {
  const key = process.env.ELEVENLABS_API_KEY;
  return key && key.trim() ? key.trim() : null;
}

export function getDefaultVoiceId(): string | null {
  const id = process.env.ELEVENLABS_VOICE_ID;
  return id && id.trim() ? id.trim() : null;
}

export function getHeaderString(req: AnyReq, name: string): string | undefined {
  const value = req.headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value;
}

export function getQueryParam(req: AnyReq, name: string): string | undefined {
  // We use a fake base because req.url for serverless is path-only.
  const url = new URL(req.url || "/", "http://localhost");
  const value = url.searchParams.get(name);
  return value === null ? undefined : value;
}

export function inferAudioFilename(contentType: string): string {
  const ct = contentType.toLowerCase();
  if (ct.includes("webm")) return "recording.webm";
  if (ct.includes("ogg")) return "recording.ogg";
  if (ct.includes("mp4") || ct.includes("m4a")) return "recording.m4a";
  if (ct.includes("mpeg") || ct.includes("mp3")) return "recording.mp3";
  if (ct.includes("wav")) return "recording.wav";
  if (ct.includes("flac")) return "recording.flac";
  if (ct.includes("aac")) return "recording.aac";
  return "recording.bin";
}

/**
 * Reads a binary request body into a Buffer. Works in both Vercel
 * (where req.body may be pre-parsed for some content types) and the Vite
 * dev middleware (where the body is a raw Node stream).
 */
export async function readBinaryBody(req: AnyReq): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) return req.body as Buffer;
  if (req.body instanceof Uint8Array) return Buffer.from(req.body);

  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer | string) => {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export interface CloneVoiceParams {
  name: string;
  description?: string;
  audio: { buffer: Buffer; contentType: string; filename?: string };
}

export interface CloneVoiceResult {
  voiceId: string;
  name: string;
  requiresVerification?: boolean;
  raw: unknown;
}

/**
 * Calls ElevenLabs Instant Voice Cloning (POST /v1/voices/add).
 *
 * IVC is gated to ElevenLabs paid tiers (Creator+). Free-tier API keys will
 * receive a 401/403 from ElevenLabs which is surfaced unchanged to the caller.
 */
export async function cloneVoice(params: CloneVoiceParams): Promise<CloneVoiceResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new ElevenLabsServerError(
      "ElevenLabs is not configured. Set ELEVENLABS_API_KEY.",
      500
    );
  }

  const formData = new FormData();
  formData.append("name", params.name);
  if (params.description) formData.append("description", params.description);

  const filename =
    params.audio.filename || inferAudioFilename(params.audio.contentType);
  // Wrap the Node Buffer in a Web Blob so we can use the global FormData/fetch
  // available in Node 18+ (Vercel default runtime).
  const blob = new Blob([params.audio.buffer], { type: params.audio.contentType });
  formData.append("files", blob, filename);

  let response: Response;
  try {
    response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: formData,
    });
  } catch (err) {
    throw new ElevenLabsServerError(
      "Failed to reach ElevenLabs (voice clone)",
      502,
      String((err as Error)?.message ?? err)
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new ElevenLabsServerError(
      `ElevenLabs voice clone failed (${response.status})`,
      response.status,
      text || response.statusText
    );
  }

  const data = (await response.json()) as {
    voice_id?: string;
    requires_verification?: boolean;
  };

  if (!data.voice_id) {
    throw new ElevenLabsServerError(
      "ElevenLabs voice clone returned no voice_id",
      502,
      data
    );
  }

  return {
    voiceId: data.voice_id,
    name: params.name,
    requiresVerification: data.requires_verification,
    raw: data,
  };
}

export interface TranscribeParams {
  audio: { buffer: Buffer; contentType: string; filename?: string };
  modelId?: string;
  languageCode?: string;
  tagAudioEvents?: boolean;
  diarize?: boolean;
}

export interface TranscribeResult {
  text: string;
  languageCode?: string;
  languageProbability?: number;
  audioDurationSecs?: number;
  raw: unknown;
}

/**
 * Calls ElevenLabs Scribe Speech-to-Text (POST /v1/speech-to-text).
 */
export async function transcribeAudio(
  params: TranscribeParams
): Promise<TranscribeResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new ElevenLabsServerError(
      "ElevenLabs is not configured. Set ELEVENLABS_API_KEY.",
      500
    );
  }

  const formData = new FormData();
  const filename =
    params.audio.filename || inferAudioFilename(params.audio.contentType);
  const blob = new Blob([params.audio.buffer], { type: params.audio.contentType });
  formData.append("file", blob, filename);
  formData.append("model_id", params.modelId || "scribe_v1");
  if (params.languageCode) formData.append("language_code", params.languageCode);
  if (params.tagAudioEvents !== undefined) {
    formData.append("tag_audio_events", String(params.tagAudioEvents));
  }
  if (params.diarize !== undefined) {
    formData.append("diarize", String(params.diarize));
  }

  let response: Response;
  try {
    response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: formData,
    });
  } catch (err) {
    throw new ElevenLabsServerError(
      "Failed to reach ElevenLabs (transcription)",
      502,
      String((err as Error)?.message ?? err)
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new ElevenLabsServerError(
      `ElevenLabs transcription failed (${response.status})`,
      response.status,
      text || response.statusText
    );
  }

  const data = (await response.json()) as {
    text?: string;
    language_code?: string;
    language_probability?: number;
    audio_duration_secs?: number;
  };

  return {
    text: data.text ?? "",
    languageCode: data.language_code,
    languageProbability: data.language_probability,
    audioDurationSecs: data.audio_duration_secs,
    raw: data,
  };
}
