import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold">HIC Hackathon</h1>
        <p className="text-slate-300">
          Minimal starter landing page. You can expand this anytime.
        </p>
        <Link
          to="/app"
          className="inline-block rounded-md bg-slate-200 px-4 py-2 text-slate-900"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}

export default LandingPage;
