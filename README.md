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

## Build

- `npm run build`
- `npm run preview`