import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

// Server-only env vars (no VITE_ prefix) that the dev middleware needs to
// expose to api/* handlers via process.env. In production on Vercel these
// come from the project settings automatically.
const SERVER_ENV_KEYS = ["ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID"] as const;

/**
 * Mounts every file under `api/elevenlabs/<name>.ts` as `/api/elevenlabs/<name>`
 * during `vite dev`, so the same handlers used by Vercel in production also
 * work locally without `vercel dev` or any extra server.
 *
 * This is a generic file-based router for our small API surface. New routes
 * placed in `api/elevenlabs/` are picked up automatically.
 */
function elevenLabsDevApi(): Plugin {
  const apiDir = path.resolve(process.cwd(), "api/elevenlabs");

  return {
    name: "elevenlabs-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/elevenlabs", async (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, X-Voice-Name, X-Voice-Description, X-Language-Code"
          );
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== "POST") {
          next();
          return;
        }

        // When mounted at "/api/elevenlabs", req.url is the suffix, e.g. "/tts".
        const rawPath = (req.url || "").split("?")[0];
        const cleaned = rawPath.replace(/^\/+/, "").replace(/\.\.+/g, "");
        if (!cleaned || !/^[a-z0-9_\-/]+$/i.test(cleaned)) {
          next();
          return;
        }

        const filePath = path.join(apiDir, `${cleaned}.ts`);
        if (
          !filePath.startsWith(apiDir + path.sep) &&
          filePath !== `${apiDir}.ts`
        ) {
          // Defense-in-depth against path traversal.
          next();
          return;
        }
        if (!fs.existsSync(filePath)) {
          next();
          return;
        }

        const moduleSpecifier = `/api/elevenlabs/${cleaned}.ts`;
        try {
          const mod = await server.ssrLoadModule(moduleSpecifier);
          const handler = (mod as {
            default?: (req: unknown, res: unknown) => Promise<void>;
          }).default;
          if (typeof handler !== "function") {
            throw new Error(`${moduleSpecifier} does not export a default handler`);
          }
          await handler(req, res);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`[${moduleSpecifier}]`, err);
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
