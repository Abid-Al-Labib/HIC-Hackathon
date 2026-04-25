/**
 * ElevenLabs Instant Voice Cloning route.
 *
 * Request:
 *   POST /api/elevenlabs/clone-voice?voiceName=<name>&description=<optional>
 *   Content-Type: audio/webm | audio/mp4 | audio/wav | …
 *   Body: raw audio bytes (no multipart wrapper)
 *
 * Response:
 *   200 { voiceId, name, requiresVerification?, raw }
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
  type AnyReq,
  type AnyRes,
} from "../_lib/elevenlabs";

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

  try {
    const result = await cloneVoice({
      name: voiceName,
      description,
      audio: { buffer, contentType },
    });
    return jsonOk(res, result);
  } catch (err) {
    if (err instanceof ElevenLabsServerError) {
      return jsonError(res, err.status, err.message, err.details);
    }
    return jsonError(res, 500, "Voice clone failed", String((err as Error)?.message ?? err));
  }
}
