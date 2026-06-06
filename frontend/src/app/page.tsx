'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/auth-context';

export default function Home() {
  const { user, role, loading } = useAuth();

  // Dynamic dashboard router link logic based on user identity
  const getDashboardLink = () => {
    if (role === 'employer') return '/dashboard/employer';
    return '/dashboard/student';
  };

  return (
    <div className="min-h-[90vh] bg-black text-white flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      
      {/* Decorative subtle background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl text-center space-y-8 relative z-10">
        
        {/* Platform Tagline Banner */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          The Campus Gig Network
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 leading-tight max-w-3xl mx-auto">
          Bridging Campus Talent with Immediate Opportunities
        </h1>

        {/* Core Subtitle */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          A secure, localized micro-economy for university ecosystems. Students find flexible project sprints, and local entities scale their workforce instantly.
        </p>

        {/* Dynamic CTA Matrix */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {loading ? (
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest animate-pulse py-3">
              Syncing Terminal Access...
            </div>
          ) : user ? (
            // Authenticated Action State
            <Link
              href={getDashboardLink()}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-blue-600/10 w-full sm:w-auto text-center"
            >
              Enter Workspace Dashboard
            </Link>
          ) : (
            // Anonymous Guest State Actions
            <>
              <Link
                href="/login"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-blue-600/10 w-full sm:w-auto text-center"
              >
                Sign In To Terminal
              </Link>
              <Link
                href="/register"
                className="px-8 py-3.5 border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all w-full sm:w-auto text-center"
              >
                Create Account
              </Link>
            </>
          )}
        </div>

        {/* Informational Core Features Divider Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-3xl mx-auto border-t border-zinc-900/60 text-left">
          
          <div className="space-y-2 border border-zinc-900 bg-zinc-950/20 p-5 rounded-xl">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wide">🎓 For Students</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Discover localized tasks, micro-internships, and side gigs matching your major that work around your class schedule.
            </p>
          </div>

          <div className="space-y-2 border border-zinc-900 bg-zinc-950/20 p-5 rounded-xl">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wide">💼 For Employers</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Post contract work or short-term project sprints directly to your campus network. Hire background-verified students instantly.
            </p>
          </div>

          <div className="space-y-2 border border-zinc-900 bg-zinc-950/20 p-5 rounded-xl">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wide">⚡ Immediate Pay</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Seamless payout pipelines powered directly through secure platform verification. Work, deliver milestones, and get credited.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}