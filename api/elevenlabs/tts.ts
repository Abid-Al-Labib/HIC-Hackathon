/**
 * ElevenLabs Text-to-Speech route.
 *
 * Vercel-compatible Node serverless function. Also runs locally via a small
 * Vite dev middleware (see vite.config.ts) so `npm run dev` works end to end.
 *
 * Consent note: cloned voices must only be used with the clear, documented
 * consent of the person whose voice is being cloned.
 */

// Loosely typed req/res so we don't require @types/node or @vercel/node.
// In practice Vercel passes (VercelRequest, VercelResponse) which extend
// Node's IncomingMessage / ServerResponse. The Vite dev middleware passes
// raw Node IncomingMessage / ServerResponse. Both share the surface we use.
type AnyReq = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  on: (event: string, listener: (...args: any[]) => void) => unknown;
};

type AnyRes = {
  statusCode: number;
  setHeader: (name: string, value: string | number | string[]) => unknown;
  end: (chunk?: any) => unknown;
  writableEnded?: boolean;
};

export interface VoiceSettingsInput {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface TtsRequestBody {
  scriptText?: string;
  voiceId?: string;
  voiceSettings?: VoiceSettingsInput;
  modelId?: string;
  outputFormat?: string;
}

const DEFAULT_MODEL_ID = "eleven_multilingual_v2";
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";
const DEFAULT_VOICE_SETTINGS: Required<VoiceSettingsInput> = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0,
  use_speaker_boost: true,
};

function jsonError(res: AnyRes, status: number, message: string, details?: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(
    JSON.stringify({
      error: message,
      ...(details !== undefined ? { details } : {}),
    })
  );
}

async function readJsonBody(req: AnyReq): Promise<TtsRequestBody> {
  if (req.body && typeof req.body === "object") {
    return req.body as TtsRequestBody;
  }
  if (typeof req.body === "string" && req.body.length > 0) {
    try {
      return JSON.parse(req.body) as TtsRequestBody;
    } catch {
      return {};
    }
  }

  return await new Promise<TtsRequestBody>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? (JSON.parse(raw) as TtsRequestBody) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req: AnyReq, res: AnyRes): Promise<void> {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return jsonError(res, 405, "Method not allowed");
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return jsonError(
      res,
      500,
      "ElevenLabs is not configured. Set ELEVENLABS_API_KEY in your environment."
    );
  }

  let body: TtsRequestBody;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    return jsonError(res, 400, "Invalid JSON body", String((err as Error)?.message ?? err));
  }

  const scriptText = (body.scriptText ?? "").toString().trim();
  if (!scriptText) {
    return jsonError(res, 400, "scriptText is required");
  }

  const voiceId =
    (body.voiceId ?? "").toString().trim() ||
    (process.env.ELEVENLABS_VOICE_ID ?? "").toString().trim();

  if (!voiceId) {
    return jsonError(
      res,
      400,
      "No voice selected. Provide voiceId in the request body or set ELEVENLABS_VOICE_ID."
    );
  }

  const modelId = (body.modelId ?? "").toString().trim() || DEFAULT_MODEL_ID;
  const outputFormat = (body.outputFormat ?? "").toString().trim() || DEFAULT_OUTPUT_FORMAT;
  const voiceSettings = { ...DEFAULT_VOICE_SETTINGS, ...(body.voiceSettings ?? {}) };

  const url =
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}` +
    `?output_format=${encodeURIComponent(outputFormat)}`;

  let elevenResponse: Response;
  try {
    elevenResponse = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: scriptText,
        model_id: modelId,
        voice_settings: voiceSettings,
      }),
    });
  } catch (err) {
    return jsonError(
      res,
      502,
      "Failed to reach ElevenLabs",
      String((err as Error)?.message ?? err)
    );
  }

  if (!elevenResponse.ok) {
    const errorText = await elevenResponse.text().catch(() => "");
    return jsonError(
      res,
      elevenResponse.status,
      "ElevenLabs request failed",
      errorText || elevenResponse.statusText
    );
  }

  const arrayBuffer = await elevenResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  res.statusCode = 200;
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Length", String(buffer.byteLength));
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-ElevenLabs-Voice-Id", voiceId);
  res.setHeader("X-ElevenLabs-Model-Id", modelId);
  res.end(buffer);
}
