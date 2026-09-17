import React from 'react';

const SECTORS = [
  'Fintech', 'Healthtech', 'Edtech', 'SaaS', 'E-commerce', 'Marketplace',
  'AI/ML', 'Deeptech', 'Climate/Cleantech', 'Consumer', 'Logistics/Supply Chain',
  'Gaming', 'Media/Entertainment', 'Real Estate/Proptech', 'Agritech',
  'Web3/Crypto', 'Cybersecurity', 'HRtech', 'Legaltech', 'Other',
];
const STAGES = ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth', 'Bootstrapped'];

export default function SearchFilters({ filters, setFilters, onSearch }) {
  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="card space-y-4">
      <div>
        <label className="label">Keyword</label>
        <input
          className="input"
          placeholder="Search name, description, tags…"
          value={filters.q || ''}
          onChange={(e) => update('q', e.target.value)}
        />
      </div>

      <div>
        <label className="label">Sector</label>
        <select className="input" value={filters.sector || ''} onChange={(e) => update('sector', e.target.value)}>
          <option value="">Any</option>
          {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Stage</label>
        <select className="input" value={filters.stage || ''} onChange={(e) => update('stage', e.target.value)}>
          <option value="">Any</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Country</label>
          <input className="input" value={filters.country || ''} onChange={(e) => update('country', e.target.value)} />
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" value={filters.city || ''} onChange={(e) => update('city', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Min ask (USD)</label>
          <input type="number" className="input" value={filters.minAsk || ''} onChange={(e) => update('minAsk', e.target.value)} />
        </div>
        <div>
          <label className="label">Max ask (USD)</label>
          <input type="number" className="input" value={filters.maxAsk || ''} onChange={(e) => update('maxAsk', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Min annual revenue (USD)</label>
        <input type="number" className="input" value={filters.minRevenue || ''} onChange={(e) => update('minRevenue', e.target.value)} />
      </div>

      <div>
        <label className="label">Sort by</label>
        <select className="input" value={filters.sort || 'newest'} onChange={(e) => update('sort', e.target.value)}>
          <option value="newest">Newest</option>
          <option value="revenue">Highest revenue</option>
          <option value="fundraisingAmount">Largest raise</option>
          <option value="completeness">Most complete profile</option>
        </select>
      </div>

      <button onClick={onSearch} className="btn-primary w-full">Apply filters</button>
    </div>
  );
}
