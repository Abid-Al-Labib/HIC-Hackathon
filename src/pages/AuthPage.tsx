import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { signIn, signUp } from "../lib/api/auth";
import type { UserRole } from "../lib/database.types";
import { cn } from "../lib/utils";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "primary_caregiver", label: "Primary Caregiver" },
  { value: "family_contributor", label: "Family Member / Friend" },
  { value: "doctor", label: "Doctor / Clinician" },
  { value: "facility_staff", label: "Facility Staff" },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("primary_caregiver");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, fullName, role);
      } else {
        await signIn(email, password);
      }
      navigate("/app");
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-posthog-parchment dark:bg-[#111827] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-posthog-cta flex items-center justify-center text-white">
            <Brain size={28} />
          </div>
          <span className="text-2xl font-bold text-posthog-deep-ink dark:text-slate-100">MemoryBridge</span>
        </div>

        <div className="bg-posthog-sage dark:bg-slate-900 rounded-3xl p-8 border border-posthog-border dark:border-slate-700 shadow-sm">
          <div className="flex rounded-2xl bg-posthog-parchment dark:bg-[#111827] p-1 mb-6">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                  mode === m
                    ? "bg-posthog-cta text-white shadow"
                    : "text-posthog-ink/60 dark:text-slate-400 hover:text-posthog-ink dark:hover:text-slate-200"
                )}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-posthog-ink dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-posthog-border dark:border-slate-600 bg-white dark:bg-slate-800 text-posthog-deep-ink dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-posthog-cta"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-posthog-ink dark:text-slate-300 mb-1">
                    Your Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-4 py-2.5 rounded-xl border border-posthog-border dark:border-slate-600 bg-white dark:bg-slate-800 text-posthog-deep-ink dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-posthog-cta"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-posthog-ink dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-posthog-border dark:border-slate-600 bg-white dark:bg-slate-800 text-posthog-deep-ink dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-posthog-cta"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-posthog-ink dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-posthog-border dark:border-slate-600 bg-white dark:bg-slate-800 text-posthog-deep-ink dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-posthog-cta"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-posthog-cta text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
