'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import { supabase } from '../../../lib/supabase';

interface JobPost {
  id: string;
  title: string;
  type: 'part-time' | 'internship';
  pay_amount: number;
  location_address: string;
  is_active: boolean;
  created_at: string;
  _count?: { job_applications: number }; // Mock extension indicator
}

interface Application {
  id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  cover_letter: string;
  student_profiles: {
    college: string;
    department: string;
    skills: string[];
    profiles: {
      full_name: string;
    };
  };
}

export default function EmployerDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uiLoading, setUiLoading] = useState(true);

  // Form Field States
  const [formData, setFormData] = useState({
    title: '',
    type: 'part-time',
    description: '',
    pay_amount: '',
    location_address: '',
    latitude: '40.7128', // Default fallback metrics
    longitude: '-74.0060',
    skills_required: '',
  });

  useEffect(() => {
    if (!authLoading && user && role === 'employer') {
      fetchEmployerJobs();
    }
  }, [user, role, authLoading]);

  const fetchEmployerJobs = async () => {
    try {
      setUiLoading(true);
      // Query jobs directly using client-side engine matching session token criteria
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('employer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error executing job fetch queries:', err);
    } finally {
      setUiLoading(false);
    }
  };

  const handleFetchApplicants = async (jobId: string) => {
    try {
      setSelectedJobId(jobId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/employer/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      const resData = await response.json();
      if (resData.status === 'success') {
        setApplicants(resData.data);
      }
    } catch (err) {
      console.error('Error fetching application states:', err);
    }
  };

  const handleStatusTransition = async (appId: string, targetStatus: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/status/${appId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });
      
      if (response.ok && selectedJobId) {
        // Hot-reload current applicant cache pipeline
        handleFetchApplicants(selectedJobId);
      }
    } catch (err) {
      console.error('Failed to change application status:', err);
    }
  };

  const handleCreateJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          pay_amount: parseFloat(formData.pay_amount),
          skills_required: formData.skills_required.split(',').map(s => s.trim()).filter(Boolean),
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        // Reset form values cleanly
        setFormData({ title: '', type: 'part-time', description: '', pay_amount: '', location_address: '', latitude: '40.7128', longitude: '-74.0060', skills_required: '' });
        fetchEmployerJobs();
      }
    } catch (err) {
      console.error('Failed to post position:', err);
    }
  };

  if (authLoading || uiLoading) {
    return <div className="min-h-screen text-zinc-400 flex items-center justify-center font-mono">Verifying authority nodes...</div>;
  }

  return (
    <div className="py-10 space-y-10">
      {/* Analytics & Metrics Grid */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Employer Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage active listings and scale local student recruiting.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-all text-sm shadow-lg shadow-blue-600/10 self-start sm:self-center"
        >
          + Post New Position
        </button>
      </section>

      {/* Basic Metrics Matrix (Bonus Requirements) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Openings</p>
          <p className="text-3xl font-bold text-white mt-2 font-mono">{jobs.length}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Actions Required</p>
          <p className="text-3xl font-bold text-blue-400 mt-2 font-mono">
            {jobs.filter(j => j.is_active).length}
          </p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Server State Status</p>
          <p className="text-sm font-medium text-emerald-400 mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Operational Node
          </p>
        </div>
      </div>

      {/* Main Core Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Jobs Listing Column */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-zinc-200">Your Postings</h2>
          {jobs.length === 0 ? (
            <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 text-sm">
              No positions created yet.
            </div>
          ) : (
            jobs.map((job) => (
              <div 
                key={job.id}
                onClick={() => handleFetchApplicants(job.id)}
                className={`p-5 rounded-xl border transition-all cursor-pointer text-left ${
                  selectedJobId === job.id 
                    ? 'bg-zinc-900 border-blue-500/50 shadow-md' 
                    : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white truncate max-w-[180px]">{job.title}</h3>
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded font-mono ${
                    job.type === 'internship' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {job.type}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">📍 {job.location_address}</p>
                <div className="mt-4 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>${job.pay_amount}/hr</span>
                  <span className="text-blue-400 underline group-hover:text-blue-300">View Candidates →</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Applicants Subsystem Management Section */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-zinc-200">
            {selectedJobId ? 'Applicants Submissions Pipeline' : 'Select a position to monitor candidates'}
          </h2>

          {!selectedJobId ? (
            <div className="p-12 border border-zinc-800 bg-zinc-900/10 text-zinc-500 text-sm rounded-xl text-center">
              Click on an active posting to audit inbound student application matrices.
            </div>
          ) : applicants.length === 0 ? (
            <div className="p-12 border border-zinc-800 bg-zinc-900/10 text-zinc-500 text-sm rounded-xl text-center">
              No students have applied to this position yet.
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((app) => (
                <div key={app.id} className="p-6 border border-zinc-800 bg-zinc-900/40 rounded-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
                    <div>
                      <h4 className="font-bold text-white text-base">{app.student_profiles.profiles.full_name}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {app.student_profiles.college} &bull; {app.student_profiles.department}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded font-mono uppercase font-bold tracking-wide self-start sm:self-center ${
                      app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' :
                      app.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cover Letter Pitch:</p>
                    <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                      {app.cover_letter || "No statement compiled by applicant."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {app.student_profiles.skills.map((skill, index) => (
                      <span key={index} className="text-[11px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex items-center gap-3 pt-2">
                      <button 
                        onClick={() => handleStatusTransition(app.id, 'accepted')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors"
                      >
                        Accept Candidate
                      </button>
                      <button 
                        onClick={() => handleStatusTransition(app.id, 'rejected')}
                        className="px-4 py-1.5 bg-zinc-800 hover:bg-rose-600/20 hover:text-rose-400 text-zinc-400 rounded text-xs font-semibold transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Job Modal Intercept Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6">
              <h3 className="text-lg font-bold text-white">Create New Opportunity</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors text-sm font-mono">&times; Close</button>
            </div>

            <form onSubmit={handleCreateJobSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Position Title</label>
                <input 
                  type="text" required value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Lead Growth Intern" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Contract Vector</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="part-time">Part-Time</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Pay rate ($/Hour)</label>
                  <input 
                    type="number" required value={formData.pay_amount}
                    onChange={(e) => setFormData({...formData, pay_amount: e.target.value})}
                    placeholder="25" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Target Geolocation String Address</label>
                <input 
                  type="text" required value={formData.location_address}
                  onChange={(e) => setFormData({...formData, location_address: e.target.value})}
                  placeholder="e.g., 742 Evergreen Terrace, Campus Quadrant" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Required Competencies (Comma-separated)</label>
                <input 
                  type="text" value={formData.skills_required}
                  onChange={(e) => setFormData({...formData, skills_required: e.target.value})}
                  placeholder="React, TypeScript, SQL" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Role Description Context</label>
                <textarea 
                  required rows={4} value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detail daily operating scope, expectations, and milestones..." 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors mt-2"
              >
                Broadcast Job Opportunity
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}