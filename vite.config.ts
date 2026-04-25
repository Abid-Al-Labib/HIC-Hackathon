import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Server-only env vars (no VITE_ prefix) that the dev middleware needs to
// expose to api/* handlers via process.env. In production on Vercel these
// come from the project settings automatically.
const SERVER_ENV_KEYS = ["ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID"] as const;

function elevenLabsDevApi(): Plugin {
  return {
    name: "elevenlabs-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/elevenlabs/tts", async (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== "POST") {
          next();
          return;
        }

        try {
          const mod = await server.ssrLoadModule("/api/elevenlabs/tts.ts");
          const handler = (mod as { default?: (req: unknown, res: unknown) => Promise<void> })
            .default;
          if (typeof handler !== "function") {
            throw new Error("api/elevenlabs/tts.ts does not export a default handler");
          }
          await handler(req, res);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("[/api/elevenlabs/tts]", err);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(
              JSON.stringify({
                error: "API handler error",
                details: (err as Error)?.message ?? String(err),
              })
            );
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  for (const key of SERVER_ENV_KEYS) {
    if (env[key] && !process.env[key]) {
      process.env[key] = env[key];
    }
  }

  return {
    plugins: [react(), elevenLabsDevApi()],
  };
});
