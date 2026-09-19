import React from 'react';

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-3 py-16 justify-center text-sm text-ink/50 animate-fade-in">
      <span className="spinner h-4 w-4" />
      <span>{label}…</span>
    </div>
  );
}

export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton rounded-sm ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <SkeletonBlock className="h-5 w-2/3" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-4/5" />
      <div className="flex gap-2 pt-2">
        <SkeletonBlock className="h-6 w-16" />
        <SkeletonBlock className="h-6 w-16" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
