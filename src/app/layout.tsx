import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IncidentIQ - Restaurant Incident Reporting',
  description: 'Report operational incidents and manage dashboard reports.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 flex flex-col`}>
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight">
              <span>🍽️ IncidentIQ</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/report"
                className="text-slate-600 transition-colors hover:text-slate-950 flex items-center gap-1.5"
              >
                <PlusCircle className="h-4 w-4 text-blue-600" />
                Report Incident
              </Link>
              <Link
                href="/dashboard"
                className="text-slate-600 transition-colors hover:text-slate-950"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
