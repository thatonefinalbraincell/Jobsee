'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', label, error, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-xs">
        {label && (
          <label htmlFor={id} className="block text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
            {label}
          </label>
        )}
        
        <input
          id={id}
          type={type}
          ref={ref}
          className={`w-full bg-zinc-950 border text-white placeholder:text-zinc-600 focus:outline-none transition-colors rounded-lg px-3.5 py-2.5 text-sm font-normal
            ${error ? 'border-rose-500/80 focus:border-rose-500' : 'border-zinc-800 focus:border-blue-500'} 
            ${type === 'password' ? 'font-mono' : ''} 
            ${className}`}
          {...props}
    	  />

        {error && (
          <p className="text-[11px] text-rose-400 font-medium tracking-wide animate-fade-in">
            ⚠️ {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';