import { Link } from "react-router-dom";
function DashboardPage() {
  return (
    <main className="min-h-screen bg-posthog-parchment p-4 text-posthog-ink dark:bg-[#111827] dark:text-slate-100 md:p-6">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[240px_1fr]">
        <aside className="rounded-md border border-posthog-border bg-posthog-sage p-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-posthog-ink/80 dark:text-slate-400">
            App Menu
          </p>
          <nav className="space-y-2">
            <Link
              to="/app"
              className="block rounded-md bg-posthog-light-sage px-3 py-2 text-sm font-semibold transition hover:text-posthog-orange dark:bg-slate-800"
            >
              Dashboard
            </Link>
            <Link
              to="/"
              className="block rounded-md px-3 py-2 text-sm font-semibold text-posthog-deep-ink transition hover:text-posthog-orange dark:text-slate-200"
            >
              Landing
            </Link>
          </nav>
        </aside>

        <section className="rounded-md border border-posthog-border bg-posthog-parchment p-6 dark:border-slate-700 dark:bg-slate-900">
          <h1 className="text-3xl font-bold tracking-[-0.02em]">App Dashboard</h1>
          <p className="mt-2 text-base leading-relaxed text-posthog-ink dark:text-slate-300">
            Simple dashboard page with a dark-first sidebar layout.
          </p>
          <div className="mt-6 rounded-md border border-posthog-border bg-posthog-sage p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm leading-relaxed text-posthog-ink dark:text-slate-300">
              This is your app area. Add Supabase data, Gemini features, and your core flows next.
            </p>
          </div>
          <Link
            to="/"
            className="mt-6 inline-block text-sm font-medium text-posthog-deep-ink underline transition hover:text-posthog-orange dark:text-slate-300"
          >
            Back to Landing
          </Link>
        </section>
      </div>
    </main>
  );
}

export default DashboardPage;
