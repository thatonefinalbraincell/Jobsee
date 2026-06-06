'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context'; //  Clean absolute path alias

export default function Login() {
  const { user, role, login, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      if (role === 'employer') {
        router.push('/dashboard/employer');
      } else {
        router.push('/dashboard/student');
      }
    }
  }, [user, role, authLoading, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const { error } = await login(email, password);
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials profile signature.');
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-zinc-400 font-mono text-sm">
        Verifying runtime session credentials...
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 bg-zinc-900/30 border border-zinc-800 p-8 rounded-2xl backdrop-blur-md">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back</h2>
          <p className="mt-2 text-sm text-zinc-400">Access your terminal profile.</p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-5 text-sm">
          <div>
            <label className="block text-zinc-400 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Campus Email
            </label>
            <input
              type="email" required autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Password
            </label>
            <input
              type="password" required autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <button
            type="submit" disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all disabled:opacity-40 text-xs uppercase tracking-wider"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In To Terminal'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-800/60">
          <p className="text-xs text-zinc-500">
            New to the platform?{' '}
            <Link href="/register" className="text-blue-500 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}