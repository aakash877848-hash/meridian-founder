import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Bookmark, BookmarkCheck, ArrowUpRight } from 'lucide-react';

const money = (n) => (n ? `$${Number(n).toLocaleString()}` : '—');

export default function StartupCard({ startup, onShortlist, shortlisted, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="card-interactive flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg text-ink">{startup.startupName}</h3>
            {(startup.location?.city || startup.location?.country) && (
              <p className="text-xs text-ink/50 flex items-center gap-1 mt-0.5">
                <MapPin size={11} strokeWidth={1.75} />
                {startup.location?.city}{startup.location?.city && startup.location?.country ? ', ' : ''}{startup.location?.country}
              </p>
            )}
          </div>
          <span className="badge shrink-0">{startup.stage}</span>
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
        <Link to={`/vc/startups/${startup._id}`} className="btn-secondary flex-1 text-center group">
          View
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
        <button
          onClick={() => onShortlist(startup._id)}
          disabled={shortlisted}
          className={`btn-primary flex-1 ${shortlisted ? 'opacity-70' : ''}`}
        >
          {shortlisted ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          {shortlisted ? 'Shortlisted' : 'Shortlist'}
        </button>
      </div>
    </motion.div>
  );
}
