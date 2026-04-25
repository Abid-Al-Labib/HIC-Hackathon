import { Link } from "react-router-dom";

function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-900 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-semibold">App Dashboard</h1>
        <p className="text-slate-300">Simple placeholder dashboard page.</p>

        <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-300">
            This is your app area. Add cards, data, or AI features here next.
          </p>
        </div>

        <Link to="/" className="inline-block text-sm text-slate-300 underline">
          Back to Landing
        </Link>
      </div>
    </main>
  );
}

export default DashboardPage;
