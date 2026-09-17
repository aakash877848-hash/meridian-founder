import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

const STAGES = ['New', 'Screening', 'Contacted', 'In Discussion', 'Due Diligence', 'Term Sheet', 'Invested', 'Passed'];

export default function VCPipeline() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get('/vc/pipeline');
    setEntries(data.data.pipeline.filter((e) => e.startup));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const moveStage = async (startupId, stage) => {
    await api.put(`/vc/pipeline/${startupId}`, { stage });
    load();
  };

  if (loading) return <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-ink/50">Loading…</div>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">Deal pipeline</h1>

      <div className="grid grid-cols-4 gap-4 overflow-x-auto">
        {STAGES.map((stage) => (
          <div key={stage} className="min-w-[220px]">
            <h3 className="mb-3 text-sm font-medium text-ink/70 border-b border-line pb-2">{stage}</h3>
            <div className="space-y-3">
              {entries.filter((e) => e.stage === stage).map((e) => (
                <div key={e._id} className="card">
                  <Link to={`/vc/startups/${e.startup._id}`} className="font-medium text-sm text-ink hover:text-signal">{e.startup.startupName}</Link>
                  <select
                    className="input mt-2 text-xs"
                    value={e.stage}
                    onChange={(ev) => moveStage(e.startup._id, ev.target.value)}
                  >
                    {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
