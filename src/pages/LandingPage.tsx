import { Link } from "react-router-dom";
function LandingPage() {
  return (
    <main className="min-h-screen bg-posthog-parchment px-6 py-16 text-posthog-ink dark:bg-[#111827] dark:text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-4xl font-extrabold tracking-[-0.03em]">HIC Hackathon</h1>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-posthog-ink dark:text-slate-300">
          HIC Hackathon — building MemoryBridge, a personalized dementia care platform.
        </p>

        <div className="rounded-md border border-posthog-border bg-posthog-sage p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-bold tracking-tight mb-1">MemoryBridge</h2>
          <p className="text-sm text-posthog-ink/70 dark:text-slate-400 mb-4 leading-relaxed">
            Transforms cherished memories into therapeutic experiences for dementia patients.
            Explore the Patient, Caregiver, Doctor, and Facility portals.
          </p>
          <Link
            to="/app"
            className="inline-block rounded-md bg-posthog-cta px-4 py-2 text-sm font-semibold text-white transition hover:opacity-70 hover:text-[#F7A501] active:scale-[0.99]"
          >
            Launch MemoryBridge →
          </Link>
        </div>

        <Link
          to="/app"
          className="inline-block text-sm font-medium text-posthog-ink/60 dark:text-slate-400 underline hover:text-posthog-orange transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}

export default LandingPage;
