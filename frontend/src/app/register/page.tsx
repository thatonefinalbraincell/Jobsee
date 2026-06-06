'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'employer'>('student');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      // 1. Core Sign Up via Supabase Auth engine
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Pass the display name and role as metadata so Supabase triggers can capture them
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Could not establish user identity profile network matrix.');
      }

      // 2. Provision custom profile entry inside your PostgreSQL public schema
      // This maps the generated user UUID directly to their chosen role tier
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            full_name: fullName,
            role: role,
            email: email,
          }
        ]);

      if (profileError) throw profileError;

      setSuccessMessage('Registration initialization complete! Check your inbox for a confirmation link.');
      
      // Auto-route to specific terminal home board after a brief delay
      setTimeout(() => {
        if (role === 'employer') {
          router.push('/dashboard/employer');
        } else {
          router.push('/dashboard/student');
        }
      }, 2000);

    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected exception occurred during credential creation.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-zinc-900/30 border border-zinc-800 p-8 rounded-2xl backdrop-blur-md">
        
        {/* Branding Node */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Create Account</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Join your localized secure university gig micro-economy.
          </p>
        </div>

        {/* Feedback Banners */}
        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium tracking-wide">
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium tracking-wide">
            ✅ {successMessage}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-sm">
          
          {/* Identity/Role Tier Switcher */}
          <div>
            <label className="block text-zinc-400 font-semibold mb-2 uppercase tracking-wider text-[11px]">
              Select Platform Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2.5 rounded-lg border font-medium transition-all text-xs uppercase tracking-wider ${
                  role === 'student'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/15'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`py-2.5 rounded-lg border font-medium transition-all text-xs uppercase tracking-wider ${
                  role === 'employer'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/15'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                💼 Employer
              </button>
            </div>
          </div>

          {/* Full Name Input */}
          <div>
            <label htmlFor="fullName" className="block text-zinc-400 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Full Name / Business Entity
            </label>
            <input
              type="text" id="fullName" required
              value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Alex Rivera or Dept. of Computer Science"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-zinc-400 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Campus Email Address
            </label>
            <input
             autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-zinc-400 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Create Strong Password
            </label>
            <input
              autoComplete="new-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
            />
          </div>

          {/* Submission Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs uppercase tracking-wider mt-4"
          >
            {isSubmitting ? 'Provisioning Profile...' : 'Complete System Registration'}
          </button>
        </form>

        {/* Existing User Navigation Alternative */}
        <div className="text-center pt-2 border-t border-zinc-800/60">
          <p className="text-xs text-zinc-500">
            Already registered on this node?{' '}
            <Link href="/login" className="text-blue-500 hover:text-blue-400 font-medium hover:underline transition-colors">
              Log into terminal
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}