'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import NotificationCenter from '@/components/NotificationCenter';

export default function Header() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [openCount, setOpenCount] = useState<number | null>(null);
  
  const isManager = user?.role === 'Manager';

  useEffect(() => {
    async function fetchStats() {
      if (!isAuthenticated || !isManager) {
        setOpenCount(null);
        return;
      }
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setOpenCount(data.open ?? 0);
        }
      } catch (err) {
        // Silent error
      }
    }
    fetchStats();

    window.addEventListener('incidentStatusChanged', fetchStats);
    return () => {
      window.removeEventListener('incidentStatusChanged', fetchStats);
    };
  }, [pathname, isAuthenticated, isManager]);

  const isActive = (path: string) => pathname === path;

  // Render simplified header on login page
  if (pathname === '/login') {
    return (
      <header className="w-full border-b border-slate-100 bg-white py-4">
        <div className="container mx-auto flex justify-center px-4">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-slate-900">
            <span>🍽️ IncidentIQ</span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-slate-900 animate-fade-in">
          <span>🍽️ IncidentIQ</span>
        </Link>
        
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {isAuthenticated && (
            <Link
              href="/report"
              className={`transition-colors flex items-center gap-1.5 ${
                isActive('/report')
                  ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-2 decoration-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="h-4 w-4 text-blue-600" />
              Report Incident
            </Link>
          )}

          {isAuthenticated && isManager && (
            <Link
              href="/dashboard"
              className={`transition-colors flex items-center gap-1.5 ${
                isActive('/dashboard')
                  ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-2 decoration-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Dashboard</span>
              {openCount !== null && openCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white bg-rose-500 rounded-full min-w-[1.25rem] h-5">
                  {openCount}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6 ml-2 animate-fade-in">
              <NotificationCenter />
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${
                  isManager ? 'text-indigo-600' : 'text-green-600'
                }`}>
                  {user?.role}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 px-2.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 font-medium transition-colors"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
