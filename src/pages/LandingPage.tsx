import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

type Theme = "light" | "dark";

type LandingPageProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

function LandingPage({ theme, onToggleTheme }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-posthog-parchment px-6 py-16 text-posthog-ink dark:bg-[#111827] dark:text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-4xl font-extrabold tracking-[-0.03em]">HIC Hackathon</h1>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-posthog-ink dark:text-slate-300">
          Minimal landing page with a PostHog-inspired warm palette. It is intentionally simple
          so you can start building features fast.
        </p>
        <Link
          to="/app"
          className="inline-block rounded-md bg-posthog-cta px-4 py-2 text-sm font-semibold text-white transition hover:opacity-70 hover:text-[#F7A501] active:scale-[0.99]"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}

export default LandingPage;
