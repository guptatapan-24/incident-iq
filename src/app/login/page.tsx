'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, Mail, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // AuthProvider router.refresh() handles layout, we check status and redirect
      // Wait a moment for refresh and then redirect
      const checkRes = await fetch('/api/auth/me');
      if (checkRes.ok) {
        const data = await checkRes.json();
        if (data.authenticated && data.user) {
          if (data.user.role === 'Manager') {
            router.push('/dashboard');
          } else {
            router.push('/report');
          }
        } else {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Invalid credentials.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'Manager' | 'Staff') => {
    setError(null);
    setLoading(true);
    const quickEmail = role === 'Manager' ? 'manager@incidentiq.com' : 'staff@incidentiq.com';
    const quickPassword = role === 'Manager' ? 'manager123' : 'staff123';
    setEmail(quickEmail);
    setPassword(quickPassword);

    try {
      await login(quickEmail, quickPassword);
      if (role === 'Manager') {
        router.push('/dashboard');
      } else {
        router.push('/report');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Quick login failed.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-radial from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <span className="text-4xl">🍽️</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">IncidentIQ</h1>
          <p className="text-sm text-slate-500">Restaurant Operational Incident Management</p>
        </div>

        <Card className="border-slate-200 bg-white/85 backdrop-blur-md shadow-lg overflow-hidden">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-xl font-bold">Sign In</CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials to access the operational portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-red-900">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span className="text-xs font-medium leading-normal">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@restaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-slate-200 focus-visible:ring-blue-600 text-sm"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-slate-200 focus-visible:ring-blue-600 text-sm"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11 transition-colors text-sm focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Or Quick Test Login
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleQuickLogin('Manager')}
                className="flex flex-col items-center justify-center h-20 border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-200 hover:text-indigo-900 group transition-all"
              >
                <ShieldCheck className="h-5 w-5 text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Manager Portal</span>
                <span className="text-[9px] text-slate-400 font-normal">Alice Manager</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleQuickLogin('Staff')}
                className="flex flex-col items-center justify-center h-20 border-slate-200 hover:bg-green-50/50 hover:border-green-200 hover:text-green-900 group transition-all"
              >
                <UserCheck className="h-5 w-5 text-green-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Staff Reporter</span>
                <span className="text-[9px] text-slate-400 font-normal">Bob Staff</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
