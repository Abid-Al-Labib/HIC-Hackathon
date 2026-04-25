const requiredEnv = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY
} as const;

export function getEnv() {
  return requiredEnv;
}
