'use client';

import React from 'react';
import Link from 'next/link';

// 1. Establish the precise property expectations contract matching your Discovery page
interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    type: 'part-time' | 'internship';
    pay_amount: number;
    location_address: string;
    distance?: number;
  };
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="group relative flex flex-col justify-between p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700/80 hover:bg-zinc-900/50 transition-all duration-300 shadow-sm hover:shadow-md">
      
      {/* Card Header Info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">
            {job.title}
          </h3>
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            job.type === 'internship' 
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {job.type}
          </span>
        </div>

        {/* Location & Relative Proximity Meta Indicators */}
        <div className="flex flex-col gap-1 text-xs text-zinc-400">
          <p className="flex items-center gap-1.5 truncate">
            <span>📍</span> {job.location_address}
          </p>
          {typeof job.distance === 'number' && (
            <p className="font-mono text-blue-400/90 text-[11px] flex items-center gap-1">
              <span>⚡</span> {(job.distance / 1000).toFixed(1)} km away from you
            </p>
          )}
        </div>

        {/* Description Body Snip */}
        <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed pt-1">
          {job.description}
        </p>
      </div>

      {/* Card Action Footer */}
      <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Compensation</span>
          <span className="text-white font-mono font-bold text-base">
            ${job.pay_amount}<span className="text-xs text-zinc-500 font-normal">/hr</span>
          </span>
        </div>

        <Link 
          href={`/jobs/${job.id}`}
          className="px-4 py-2 bg-zinc-800 text-zinc-200 group-hover:bg-blue-600 group-hover:text-white rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1"
        >
          View Gig <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}