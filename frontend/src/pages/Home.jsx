import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <p className="mb-4 text-sm tracking-wide text-signal">Founder & Startup Discovery</p>
        <h1 className="font-display text-5xl leading-tight text-ink mb-6">
          Where the right founders and the right investors find each other.
        </h1>
        <p className="text-lg text-ink/70 mb-10 leading-relaxed">
          Meridian gives founders one clean profile to maintain, and gives investment
          teams a searchable, filterable view of the startups worth their time —
          with private notes and pipeline tracking built in.
        </p>

        {!user && (
          <div className="flex gap-4">
            <Link to="/register" className="btn-primary">Get started</Link>
            <Link to="/login" className="btn-secondary">Log in</Link>
          </div>
        )}
      </div>

      <div className="mt-24 grid grid-cols-1 gap-8 border-t border-line pt-12 sm:grid-cols-3">
        <div>
          <h3 className="font-display text-lg mb-2">For founders</h3>
          <p className="text-sm text-ink/60">
            Build one profile — traction, team, fundraising ask — and control exactly who sees it.
          </p>
        </div>
        <div>
          <h3 className="font-display text-lg mb-2">For investors</h3>
          <p className="text-sm text-ink/60">
            Filter by sector, stage, geography and traction. Shortlist, annotate, and track deals in one place.
          </p>
        </div>
        <div>
          <h3 className="font-display text-lg mb-2">Built to grow</h3>
          <p className="text-sm text-ink/60">
            Matching scores, warm intros, and verification are on the roadmap — the data model is ready for them.
          </p>
        </div>
      </div>
    </div>
  );
}
