# HIC-Hackathon

Minimal starter for:
- Vite + React + TypeScript
- Tailwind CSS
- Supabase client setup
- Gemini API key wiring
- Vercel deployment config

## Setup

1. Install dependencies:
   - `npm install`
2. Create local env file:
   - copy `.env.example` to `.env.local`
3. Fill env values:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
   - `ELEVENLABS_API_KEY` (server-only, used by `/api/elevenlabs/tts`)
   - `ELEVENLABS_VOICE_ID` (server-only fallback voice when the request omits one)
4. Run app:
   - `npm run dev`

## ElevenLabs Narration

- Server route: `POST /api/elevenlabs/tts` — body `{ scriptText, voiceId?, voiceSettings?, modelId? }`, returns `audio/mpeg`.
- Frontend helper: `generateNarrationAudio(...)` in `src/lib/elevenlabs.ts`.
- UI: open the Caregiver portal and pick **Narration Studio** in the sidebar.
- Cloned voices must only be used with the explicit consent of the person whose voice was cloned.

## Voice Recording → Clone + Transcribe

When a family member clicks **Record Audio** (Caregiver portal → AI Guided Prompt card), MemoryBridge captures audio via `MediaRecorder` and POSTs the raw bytes once. The backend then runs two ElevenLabs calls in parallel:

1. **Voice clone** — ElevenLabs Instant Voice Cloning (`POST /v1/voices/add`) returns a `voice_id` that can later be used for narration in the Narration Studio.
2. **Transcription** — ElevenLabs Scribe (`POST /v1/speech-to-text`) returns the spoken text. The transcript is what your DB layer should persist.

Both results (and any per-call errors) come back in one JSON response, so the UI can show a partial result if one call fails.

Server routes:
- `POST /api/elevenlabs/record-process?voiceName=…&description=…&languageCode=…` — body = raw audio bytes, runs both calls in parallel.
- `POST /api/elevenlabs/clone-voice?voiceName=…&description=…` — voice clone only.
- `POST /api/elevenlabs/transcribe?languageCode=…&modelId=…` — transcription only.

Frontend helpers (in `src/lib/elevenlabs.ts`): `processRecording`, `cloneVoiceFromRecording`, `transcribeRecording`.

UI components:
- `src/components/VoiceRecorder.tsx` — full recorder UI (mic permission, timer, playback, processing, results).
- `src/components/Modal.tsx` — small modal wrapper used by the Caregiver portal.

Database hand-off: `<VoiceRecorder onProcessed={...} />` fires once per successful recording. The callback receives the audio Blob, transcript text, voice id, timestamps, and patient/contributor IDs — exactly what your DB code needs to insert. Look for the `TODO(db)` block in `CaregiverPortal.tsx`.

Notes:
- ElevenLabs Instant Voice Cloning is gated to paid tiers (Creator+). Free-tier API keys will get a 401/403 from ElevenLabs and the recorder will surface the error inline; transcription still succeeds independently.
- Browser MediaRecorder typically produces `audio/webm;codecs=opus`. We forward the original Content-Type to ElevenLabs.
- Recommended: speak for at least 30 seconds for a usable voice clone.

## Build

- `npm run build`
- `npm run preview`