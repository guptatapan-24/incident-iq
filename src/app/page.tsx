import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { ClipboardList, Sparkles, CheckSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  let user = null;

  if (sessionCookie) {
    user = await verifyToken(sessionCookie.value);
  }

  const isManager = user?.role === 'Manager';

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-white">
      {/* Hero Section */}
      <section className="w-full bg-slate-50 border-b border-slate-200 py-16 md:py-24 px-4 text-center animate-fade-in">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900 leading-none">
            Streamline Restaurant Operations with <span className="text-blue-600">IncidentIQ</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-600 sm:text-xl leading-relaxed">
            Report operational incidents, leverage AI auto-classification, and track resolutions in real-time.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row pt-4 items-center">
            {user ? (
              <>
                <Link
                  href="/report"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 w-full sm:w-auto"
                >
                  Report an Incident
                </Link>
                {isManager && (
                  <Link
                    href="/dashboard"
                    className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 w-full sm:w-auto"
                  >
                    View Dashboard
                  </Link>
                )}
                {!isManager && (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-3.5 py-1.5 self-center">
                    Logged in as Staff: <strong className="text-slate-700">{user.name}</strong>
                  </span>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 hover:bg-slate-800 px-8 py-2 text-sm font-semibold text-white shadow-sm transition-colors w-full sm:w-auto"
              >
                Sign In to Start
              </Link>
            )}
          </div>
        </div>
      </section>


      {/* Features Grid Section */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-5xl flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="p-3 w-fit rounded-lg bg-blue-50 text-blue-600">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-900">Report Incidents</h3>
                <p className="text-sm text-slate-500 leading-normal">
                  Log hardware, delivery, POS, or staff issues quickly using our streamlined form.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="p-3 w-fit rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-900">AI Analysis</h3>
                <p className="text-sm text-slate-500 leading-normal">
                  Get intelligent category recommendations and plain-English summaries instantly via Groq LLaMA.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="p-3 w-fit rounded-lg bg-green-50 text-green-600">
                <CheckSquare className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-900">Track & Resolve</h3>
                <p className="text-sm text-slate-500 leading-normal">
                  Monitor incident stats and transition statuses seamlessly from the manager dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
