import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '../api/axios.js';
import SearchFilters from '../components/SearchFilters.jsx';
import StartupCard from '../components/StartupCard.jsx';
import { SkeletonGrid } from '../components/Loading.jsx';

export default function VCSearch() {
  const [filters, setFilters] = useState({ sort: 'newest' });
  const [startups, setStartups] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const applyAndClose = () => {
    search(1);
    setFiltersOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink animate-fade-in-up">Discover startups</h1>
        <button onClick={() => setFiltersOpen(true)} className="btn-secondary md:hidden">
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="hidden md:block col-span-1">
          <SearchFilters filters={filters} setFilters={setFilters} onSearch={() => search(1)} />
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-ink/40 md:hidden"
              onClick={() => setFiltersOpen(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-paper p-6 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg">Filters</h2>
                  <button onClick={() => setFiltersOpen(false)}><X size={20} /></button>
                </div>
                <SearchFilters filters={filters} setFilters={setFilters} onSearch={applyAndClose} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="col-span-1 md:col-span-3">
          <p className="mb-4 text-sm text-ink/50">{meta.total} result{meta.total !== 1 ? 's' : ''}</p>

          {loading ? (
            <SkeletonGrid count={4} />
          ) : startups.length === 0 ? (
            <p className="text-sm text-ink/50 py-12 text-center animate-fade-in">No startups match these filters yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {startups.map((s, i) => (
                <StartupCard key={s._id} startup={s} onShortlist={handleShortlist} shortlisted={shortlistedIds.has(s._id)} index={i} />
              ))}
            </div>
          )}

          {meta.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => search(p)}
                  className={`h-8 w-8 text-sm border transition-all duration-150 ${p === meta.page ? 'border-signal bg-signal text-paper' : 'border-line text-ink/60 hover:border-signal hover:text-signal'}`}
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
