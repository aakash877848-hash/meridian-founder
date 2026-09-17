import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function VCShortlist() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get('/vc/shortlist');
    setEntries(data.data.shortlist.filter((e) => e.startup));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (startupId) => {
    await api.delete(`/vc/shortlist/${startupId}`);
    load();
  };

  if (loading) return <div className="mx-auto max-w-4xl px-6 py-16 text-sm text-ink/50">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">Shortlist</h1>

      {entries.length === 0 && <p className="text-sm text-ink/50">Nothing shortlisted yet — discover startups to add them here.</p>}

      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e._id} className="card flex items-center justify-between">
            <div>
              <Link to={`/vc/startups/${e.startup._id}`} className="font-display text-lg text-ink hover:text-signal">{e.startup.startupName}</Link>
              <p className="text-xs text-ink/50">{e.startup.sector} · {e.startup.stage}</p>
            </div>
            <button onClick={() => remove(e.startup._id)} className="btn-secondary text-sm">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
