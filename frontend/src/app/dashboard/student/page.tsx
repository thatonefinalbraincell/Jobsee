'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import { supabase } from '../../../lib/supabase';

interface ApplicationRecord {
  id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
  job_posts: {
    id: string;
    title: string;
    type: 'part-time' | 'internship';
    pay_amount: number;
    pay_period: string;
    location_address: string;
    employer_profiles: {
      company_name: string;
    };
  };
}

interface StudentProfile {
  college: string;
  department: string;
  skills: string[];
  availability: {
    days: string[];
    hours: string;
  };
}

export default function StudentDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [uiLoading, setUiLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for profile updating
  const [skillsInput, setSkillsInput] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [availHours, setAvailHours] = useState('');

  useEffect(() => {
    if (!authLoading && user && role === 'student') {
      initStudentDashboard();
    }
  }, [user, role, authLoading]);

  const initStudentDashboard = async () => {
    try {
      setUiLoading(true);
      await Promise.all([fetchApplications(), fetchProfile()]);
    } catch (err) {
      console.error('Initialization error on student nodes:', err);
    } finally {
      setUiLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/student/my-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.status === 'success') {
        setApplications(result.data);
      }
    } catch (err) {
      console.error('Failed fetching application track record:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setCollege(data.college || '');
        setDepartment(data.department || '');
        setSkillsInput(data.skills ? data.skills.join(', ') : '');
        setAvailHours(data.availability?.hours || '');
      }
    } catch (err) {
      console.error('Profile parsing exception:', err);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const processedSkills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from('student_profiles')
        .update({
          college,
          department,
          skills: processedSkills,
          availability: {
            days: profile?.availability?.days || [],
            hours: availHours,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      // Refresh context
      await fetchProfile();
      alert('Profile metrics synced cleanly.');
    } catch (err: any) {
      alert(`Sync failure: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || uiLoading) {
    return <div className="min-h-screen text-zinc-400 flex items-center justify-center font-mono">Loading telemetry matrices...</div>;
  }

  return (
    <div className="py-10 space-y-10">
      {/* Top Welcome Title */}
      <section className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Student Hub Workspace</h1>
        <p className="text-zinc-400 text-sm mt-1">Track your active pitches, maintain your resume metadata, and audit status records.</p>
      </section>

      {/* Grid Dashboard Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns: Application Status Tracker */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-zinc-200 flex items-center gap-2">
            💼 Application Tracker Pipeline 
            <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono font-normal">
              {applications.length} total
            </span>
          </h2>

          {applications.length === 0 ? (
            <div className="p-12 border border-dashed border-zinc-800 bg-zinc-900/10 rounded-xl text-center text-zinc-500 text-sm">
              You haven't applied to any job slots yet. Head to the discovery board to launch applications.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div 
                  key={app.id} 
                  className="p-5 border border-zinc-800 bg-zinc-900/30 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-zinc-700 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{app.job_posts.title}</h3>
                      <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase">
                        {app.job_posts.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-400">
                      🏢 {app.job_posts.employer_profiles?.company_name || 'Local Provider'}
                    </p>
                    <div className="text-xs text-zinc-500 flex flex-wrap gap-x-4 gap-y-1 font-mono">
                      <span>📍 {app.job_posts.location_address}</span>
                      <span>💰 ${app.job_posts.pay_amount}/{app.job_posts.pay_period}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-start sm:items-end justify-between border-t sm:border-t-0 border-zinc-800/60 pt-3 sm:pt-0">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded font-mono ${
                      app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' :
                      app.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' :
                      app.status === 'reviewed' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {app.status}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-1 font-mono">
                      Applied: {new Date(app.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Mini-Profile Modifier Editor */}
        <div className="lg:col-span-1 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Your Profile Settings</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Keep your metrics polished to maximize application conversions.</p>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">College/Institution</label>
              <input 
                type="text" required value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="State University"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Department/Major</label>
              <input 
                type="text" required value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Computer Science"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Competencies (Comma separated)</label>
              <input 
                type="text" value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Next.js, Python, Figma"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {profile?.skills?.map((skill, index) => (
                  <span key={index} className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Weekly Availability Scope</label>
              <input 
                type="text" value={availHours}
                onChange={(e) => setAvailHours(e.target.value)}
                placeholder="e.g., 15-20 hours / Week"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <button 
              type="submit" disabled={isSaving}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-40"
            >
              {isSaving ? 'Syncing...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}