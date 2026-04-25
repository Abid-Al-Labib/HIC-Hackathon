/**
 * Combined recording-processing route.
 *
 * One round-trip from the recorder UI: clones the speaker's voice and
 * transcribes what they said in parallel. Always responds 200 with both
 * results (or null + error per-call) so partial successes are visible to the
 * frontend instead of failing the whole flow.
 *
 * Request:
 *   POST /api/elevenlabs/record-process?voiceName=<name>&description=<optional>&languageCode=<optional>
 *   Content-Type: audio/webm | audio/mp4 | audio/wav | …
 *   Body: raw audio bytes (no multipart wrapper)
 *
 * Response:
 *   200 {
 *     bytes, contentType,
 *     voice: { voiceId, name, requiresVerification? } | null,
 *     transcript: { text, languageCode?, languageProbability?, audioDurationSecs? } | null,
 *     errors: { voice: ErrorInfo | null, transcript: ErrorInfo | null }
 *   }
 *
 * Consent reminder: only clone a person's voice with their explicit, documented
 * consent.
 */

import {
  cloneVoice,
  ElevenLabsServerError,
  getHeaderString,
  getQueryParam,
  jsonError,
  jsonOk,
  readBinaryBody,
  setCorsPreflight,
  transcribeAudio,
  type AnyReq,
  type AnyRes,
} from "../_lib/elevenlabs";

interface ErrorInfo {
  message: string;
  status: number;
  details?: unknown;
}

interface SettledOk<T> {
  success: true;
  data: T;
}
interface SettledErr {
  success: false;
  error: ErrorInfo;
}
type Settled<T> = SettledOk<T> | SettledErr;

function settle<T>(promise: Promise<T>): Promise<Settled<T>> {
  return promise.then(
    (data): SettledOk<T> => ({ success: true, data }),
    (err: unknown): SettledErr => {
      if (err instanceof ElevenLabsServerError) {
        return {
          success: false,
          error: { message: err.message, status: err.status, details: err.details },
        };
      }
      return {
        success: false,
        error: {
          message: (err as Error)?.message || String(err),
          status: 500,
        },
      };
    }
  );
}

export default async function handler(req: AnyReq, res: AnyRes): Promise<void> {
  if (req.method === "OPTIONS") {
    setCorsPreflight(res);
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return jsonError(res, 405, "Method not allowed");
  }

  const contentType = (getHeaderString(req, "content-type") || "").toLowerCase();
  if (!contentType.startsWith("audio/")) {
    return jsonError(
      res,
      415,
      "Expected audio/* request body. Set Content-Type to the audio mime type."
    );
  }

  const voiceName = (getQueryParam(req, "voiceName") || "").trim();
  if (!voiceName) {
    return jsonError(res, 400, "Missing voiceName query parameter.");
  }
  const description = getQueryParam(req, "description")?.trim() || undefined;
  const languageCode = getQueryParam(req, "languageCode")?.trim() || undefined;

  let buffer: Buffer;
  try {
    buffer = await readBinaryBody(req);
  } catch (err) {
    return jsonError(
      res,
      400,
      "Failed to read request body",
      String((err as Error)?.message ?? err)
    );
  }

  if (buffer.length === 0) {
    return jsonError(res, 400, "Audio body is empty.");
  }

  const audio = { buffer, contentType };

  const [voiceSettled, transcriptSettled] = await Promise.all([
    settle(cloneVoice({ name: voiceName, description, audio })),
    settle(
      transcribeAudio({
        audio,
        languageCode,
        tagAudioEvents: false,
        diarize: false,
      })
    ),
  ]);

  return jsonOk(res, {
    bytes: buffer.length,
    contentType,
    voice: voiceSettled.success
      ? {
          voiceId: voiceSettled.data.voiceId,
          name: voiceSettled.data.name,
          requiresVerification: voiceSettled.data.requiresVerification,
        }
      : null,
    transcript: transcriptSettled.success
      ? {
          text: transcriptSettled.data.text,
          languageCode: transcriptSettled.data.languageCode,
          languageProbability: transcriptSettled.data.languageProbability,
          audioDurationSecs: transcriptSettled.data.audioDurationSecs,
        }
      : null,
    errors: {
      voice: voiceSettled.success ? null : voiceSettled.error,
      transcript: transcriptSettled.success ? null : transcriptSettled.error,
    },
  });
}
