'use client';

import { useEffect, useState } from 'react';
import JobCard from '../../components/job-card';

// 1. Define a clear, reusable type interface for your Job data structure
interface Job {
  id: string;
  title: string;
  description: string;
  type: 'part-time' | 'internship';
  pay_amount: number;
  location_address: string;
  distance?: number;
}

export default function DiscoverJobs() {
  // 2. Explicitly tell the state hook to expect an array of Jobs
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Acquire real-time geo coordinate location parameters securely
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => {
        // Fallback standard default fallback coordinates if blocked (e.g., Downtown NY)
        setCoords({ lat: 40.7128, lng: -74.0060 });
      }
    );
  }, []);

  useEffect(() => {
    if (!coords) return;

    const fetchLocalGigs = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/nearby?lat=${coords.lat}&lng=${coords.lng}&radius_meters=25000`);
        const result = await response.json();
        if (result.status === 'success') {
          setJobs(result.data);
        }
      } catch (e) {
        console.error("Failed to query API engine parameters", e);
      } finally {
        setLoading(false);
      }
    };

    fetchLocalGigs();
  }, [coords]);

  return (
    <div className="py-12">
      <header className="mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Available Opportunities</h1>
        <p className="mt-3 text-lg text-zinc-400">Hyper-localized, high-intent gigs matched directly to your location context.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 rounded-xl border border-zinc-800 bg-zinc-900/20 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-500">No active positions within your immediate geographic vicinity.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 3. The loop is now beautiful, safe, and completely error-free */}
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}