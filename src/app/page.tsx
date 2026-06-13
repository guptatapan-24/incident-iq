import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900">
          Welcome to <span className="text-blue-600">IncidentIQ</span>
        </h1>
        <p className="mx-auto max-w-md text-lg text-slate-600 sm:text-xl md:max-w-xl">
          Report operational incidents and track resolutions in real-time.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/report"
            className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
          >
            Report an Incident
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
