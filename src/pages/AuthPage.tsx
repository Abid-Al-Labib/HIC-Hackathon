import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Brain, LogIn, MailCheck } from "lucide-react";
import { createInvitedDemoAccount, demoSignIn, DEMO_ACCOUNTS } from "../lib/demo-auth";
import { acceptDemoInvite, getDemoInviteByToken } from "../lib/demo-data";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

export default function AuthPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { user } = useAuth();
  const invite = token ? getDemoInviteByToken(token) : null;
  const [selectedUsername, setSelectedUsername] = useState(DEMO_ACCOUNTS[0]?.username ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (user && !token) { navigate("/app"); return null; }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const account = demoSignIn(selectedUsername, password);
    if (!account) { setError("Choose a name and enter the shared demo password."); return; }
    window.location.assign("/app?addMemory=1");
  }

  function acceptInvite() {
    if (!invite || !token) {
      setError("This invite link is no longer available.");
      return;
    }
    const account = createInvitedDemoAccount(invite.invite_email, token);
    const accepted = acceptDemoInvite(token, account.id);
    if (!accepted) {
      setError("This invite is expired or has already been accepted.");
      return;
    }
    window.location.assign("/app");
  }

  return (
    <div className="min-h-screen bg-posthog-parchment dark:bg-[#111827] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-posthog-cta flex items-center justify-center text-white">
            <Brain size={28} />
          </div>
          <span className="text-2xl font-bold text-posthog-deep-ink dark:text-slate-100">MemoryBridge</span>
        </div>

        <div className="bg-posthog-sage dark:bg-slate-900 rounded-3xl p-8 border border-posthog-border dark:border-slate-700 shadow-sm space-y-6">
          {token && (
            <div className="rounded-2xl border border-posthog-border bg-posthog-parchment p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-2 font-bold text-posthog-deep-ink dark:text-slate-100">
                <MailCheck size={18} />
                Family memory invite
              </div>
              <p className="mt-2 text-sm leading-relaxed text-posthog-ink/70 dark:text-slate-300">
                {invite
                  ? `${invite.invite_email} was invited to help add memories for Robert.`
                  : "This invite is missing, expired, or already accepted."}
              </p>
              {invite?.status === "pending" && (
                <button
                  onClick={acceptInvite}
                  className="mt-4 w-full rounded-xl bg-posthog-cta py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  Accept Invite and Continue
                </button>
              )}
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-posthog-ink/50 dark:text-slate-500 mb-3">
              Choose your name
            </p>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.username}
                  type="button"
                  onClick={() => {
                    setSelectedUsername(a.username);
                    setError(null);
                  }}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                    selectedUsername === a.username
                      ? "bg-posthog-cta text-white border-posthog-cta shadow-sm"
                      : "bg-posthog-parchment dark:bg-slate-800 border-posthog-border dark:border-slate-700 hover:border-posthog-cta hover:text-posthog-cta dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                  )}
                >
                  <span>{a.displayName}</span>
                  <span className="text-xs font-normal opacity-70 capitalize">{a.role.replace(/_/g, " ")}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2.5 rounded-xl border border-posthog-border dark:border-slate-600 bg-white dark:bg-slate-800 text-posthog-deep-ink dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-posthog-cta"
            />
            {error && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-posthog-cta text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
            >
              <LogIn size={16} />
              Sign In
            </button>
          </form>

          <p className="text-center text-xs text-posthog-ink/40 dark:text-slate-600">
            Shared password: <span className="font-mono font-bold">demo1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}
