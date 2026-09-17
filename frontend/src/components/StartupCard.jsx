import React from 'react';
import { Link } from 'react-router-dom';

const money = (n) => (n ? `$${Number(n).toLocaleString()}` : '—');

export default function StartupCard({ startup, onShortlist, shortlisted }) {
  return (
    <div className="card flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg text-ink">{startup.startupName}</h3>
            <p className="text-xs text-ink/50">{startup.location?.city}{startup.location?.city && startup.location?.country ? ', ' : ''}{startup.location?.country}</p>
          </div>
          <span className="badge">{startup.stage}</span>
        </div>
        <p className="mt-2 text-sm text-ink/70 line-clamp-2">{startup.tagline || startup.description}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="badge">{startup.sector}</span>
          {(startup.businessModel || []).slice(0, 2).map((bm) => <span key={bm} className="badge">{bm}</span>)}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-ink/60">
          <div>ARR: <strong className="text-ink">{money(startup.traction?.annualRevenueUSD)}</strong></div>
          <div>Raising: <strong className="text-ink">{money(startup.fundraising?.amountSeekingUSD)}</strong></div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link to={`/vc/startups/${startup._id}`} className="btn-secondary flex-1 text-center">View</Link>
        <button
          onClick={() => onShortlist(startup._id)}
          className={`btn-primary flex-1 ${shortlisted ? 'opacity-60' : ''}`}
        >
          {shortlisted ? 'Shortlisted' : 'Shortlist'}
        </button>
      </div>
    </div>
  );
}
