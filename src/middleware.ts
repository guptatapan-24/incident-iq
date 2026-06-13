import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  // Let's identify the request type
  const isLoginPage = pathname === '/login';
  const isDashboardPage = pathname.startsWith('/dashboard');
  const isReportPage = pathname.startsWith('/report');
  
  // API routes
  const isStatsApi = pathname.startsWith('/api/stats');
  const isIncidentsApi = pathname.startsWith('/api/incidents');

  // Decrypt/verify token if it exists
  let user = null;
  if (sessionCookie) {
    user = await verifyToken(sessionCookie.value);
  }

  // Handle Login Page Redirects
  if (isLoginPage) {
    if (user) {
      const redirectUrl = user.role === 'Manager' ? '/dashboard' : '/report';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Handle Protected Pages (Dashboard and Report)
  if (isDashboardPage) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user.role !== 'Manager') {
      // Staff cannot access Dashboard, redirect to Report page
      return NextResponse.redirect(new URL('/report', request.url));
    }
  }

  if (isReportPage) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Handle Protected APIs
  if (isStatsApi) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'Manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  if (isIncidentsApi) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // GET /api/incidents is manager only
    if (request.method === 'GET' && user.role !== 'Manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // POST /api/incidents is allowed for both Staff and Manager
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/report/:path*',
    '/login',
    '/api/incidents/:path*',
    '/api/stats/:path*',
  ],
};
