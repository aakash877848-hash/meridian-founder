import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios.js';
import SearchFilters from '../components/SearchFilters.jsx';
import StartupCard from '../components/StartupCard.jsx';

export default function VCSearch() {
  const [filters, setFilters] = useState({ sort: 'newest' });
  const [startups, setStartups] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const search = useCallback(async (page = 1) => {
    setLoading(true);
    const params = { ...filters, page };
    Object.keys(params).forEach((k) => (params[k] === '' || params[k] == null) && delete params[k]);
    const { data } = await api.get('/startups/search', { params });
    setStartups(data.data.startups);
    setMeta({ total: data.total, page: data.page, totalPages: data.totalPages });
    setLoading(false);
  }, [filters]);

  const loadShortlist = async () => {
    const { data } = await api.get('/vc/shortlist');
    setShortlistedIds(new Set(data.data.shortlist.map((s) => s.startup?._id)));
  };

  useEffect(() => { search(1); loadShortlist(); }, []); // eslint-disable-line

  const handleShortlist = async (startupId) => {
    await api.post(`/vc/shortlist/${startupId}`);
    setShortlistedIds((prev) => new Set(prev).add(startupId));
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">Discover startups</h1>

      <div className="grid grid-cols-4 gap-8">
        <div className="col-span-1">
          <SearchFilters filters={filters} setFilters={setFilters} onSearch={() => search(1)} />
        </div>

        <div className="col-span-3">
          <p className="mb-4 text-sm text-ink/50">{meta.total} result{meta.total !== 1 ? 's' : ''}</p>

          {loading ? (
            <p className="text-sm text-ink/50">Loading…</p>
          ) : startups.length === 0 ? (
            <p className="text-sm text-ink/50">No startups match these filters yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {startups.map((s) => (
                <StartupCard key={s._id} startup={s} onShortlist={handleShortlist} shortlisted={shortlistedIds.has(s._id)} />
              ))}
            </div>
          )}

          {meta.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => search(p)}
                  className={`h-8 w-8 text-sm border ${p === meta.page ? 'border-signal bg-signal text-paper' : 'border-line text-ink/60'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
