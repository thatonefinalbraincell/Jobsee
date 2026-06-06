'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/auth-context';
import { supabase } from '../../../lib/supabase';

export default function PostJob() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Core structured form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'part-time',
    description: '',
    pay_amount: '',
    pay_period: 'hour',
    location_address: '',
    skills_required: '',
    latitude: '40.7128', // Standard default fallbacks (e.g., Downtown NY)
    longitude: '-74.0060'
  });

  // Guard: Ensure only authorized Employers can access this view channel
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (role !== 'employer') {
        router.push('/dashboard/student');
      }
    }
  }, [user, role, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // 1. Clean and transform comma-separated strings into a robust sanitized array
      const processedSkills = formData.skills_required
        .split(',')
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      const parsedPay = parseFloat(formData.pay_amount);
      if (isNaN(parsedPay) || parsedPay <= 0) {
        throw new Error('Please enter a valid compensation rate greater than 0.');
      }

      // 2. Acquire user authorization token to verify backend request context
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error('Authentication session context expired. Please re-authenticate.');
      }

      // 3. Broadcast new job payload matrix to custom API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          description: formData.description,
          pay_amount: parsedPay,
          pay_period: formData.pay_period,
          location_address: formData.location_address,
          skills_required: processedSkills,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        })
      });

      const result = await response.json();

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Failed to broadcast opening to the infrastructure network.');
      }

      // Success: Route back to employer analytics dashboard panel
      router.push('/dashboard/employer');
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected operation error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-zinc-400 font-mono text-sm">
        Verifying authorization tokens...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <header className="mb-10 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Post an Opportunity</h1>
        <p className="mt-2 text-sm text-zinc-400">Broadcast part-time positions or localized project sprints straight to your campus network.</p>
      </header>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6 text-sm text-zinc-200">
        
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-zinc-400 font-semibold mb-1.5 uppercase tracking-wider text-xs">
            Opportunity Title
          </label>
          <input
            type="text" id="title" name="title" required
            value={formData.title} onChange={handleInputChange}
            placeholder="e.g., Campus Marketing Representative"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
          />
        </div>

        {/* Contract Type & Pay Rate Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="type" className="block text-zinc-400 font-semibold mb-1.5 uppercase tracking-wider text-xs">
              Classification Vibe
            </label>
            <select
              id="type" name="type"
              value={formData.type} onChange={handleInputChange}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="part-time">Part-Time Gig</option>
              <option value="internship">Internship Slot</option>
            </select>
          </div>

          <div>
            <label htmlFor="pay_amount" className="block text-zinc-400 font-semibold mb-1.5 uppercase tracking-wider text-xs">
              Rate Amount ($)
            </label>
            <input
              type="number" id="pay_amount" name="pay_amount" required min="1" step="0.01"
              value={formData.pay_amount} onChange={handleInputChange}
              placeholder="20.00"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label htmlFor="pay_period" className="block text-zinc-400 font-semibold mb-1.5 uppercase tracking-wider text-xs">
              Billing Cadence
            </label>
            <select
              id="pay_period" name="pay_period"
              value={formData.pay_period} onChange={handleInputChange}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="hour">Per Hour</option>
              <option value="project">Flat Project Fee</option>
            </select>
          </div>
        </div>

        {/* Target Physical/Campus Location */}
        <div>
          <label htmlFor="location_address" className="block text-zinc-400 font-semibold mb-1.5 uppercase tracking-wider text-xs">
            Geographic Location/Campus Quadrant
          </label>
          <input
            type="text" id="location_address" name="location_address" required
            value={formData.location_address} onChange={handleInputChange}
            placeholder="e.g., Engineering West Building, Room 402"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
          />
        </div>

        {/* Core Required Competencies */}
        <div>
          <label htmlFor="skills_required" className="block text-zinc-400 font-semibold mb-1.5 uppercase tracking-wider text-xs">
            Core Target Skills <span className="text-zinc-600 lowercase font-normal">(comma-separated)</span>
          </label>
          <input
            type="text" id="skills_required" name="skills_required"
            value={formData.skills_required} onChange={handleInputChange}
            placeholder="e.g., Figma, Social Copywriting, Excel"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
          />
        </div>

        {/* Full Detailed Context Description */}
        <div>
          <label htmlFor="description" className="block text-zinc-400 font-semibold mb-1.5 uppercase tracking-wider text-xs">
            Operating Context & Responsibilities
          </label>
          <textarea
            id="description" name="description" required rows={6}
            value={formData.description} onChange={handleInputChange}
            placeholder="Detail daily operating scope, timeline deliverables, hours per week, and baseline project criteria..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-zinc-600 leading-relaxed"
          />
        </div>

        {/* Action Button Trigger Group */}
        <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/employer')}
            className="px-5 py-2.5 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publishing Link...' : 'Broadcast Opportunity'}
          </button>
        </div>

      </form>
    </div>
  );
}