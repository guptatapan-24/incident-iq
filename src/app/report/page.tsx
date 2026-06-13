import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import IncidentForm from '@/components/IncidentForm';

export const metadata = {
  title: 'Report Incident - IncidentIQ',
  description: 'Report an operational restaurant incident.',
};

export default function ReportPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-4xl">
      {/* Back to Dashboard Link */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Report an Incident
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500">
          Fill in the details below to report an operational issue
        </p>
      </div>

      {/* Incident Form Component */}
      <IncidentForm />
    </div>
  );
}
