'use client';

import Link from 'next/link';
import { useAuth } from '../context/auth-context';

export default function Navbar() {
  const { user, role, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-muted bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-8">
      <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity">
        🚀 Campus<span className="text-blue-500">Gig</span>
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <Link href="/jobs" className="text-zinc-400 hover:text-white transition-colors">Browse Jobs</Link>
        {user ? (
          <>
            <Link href={role === 'employer' ? '/dashboard/employer' : '/dashboard/student'} className="text-zinc-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <button onClick={logout} className="px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors">
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-all font-medium">
              Join Now
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}