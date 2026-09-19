import React, { useEffect, useState } from 'react';
import api from '../api/axios.js';
import { Spinner } from '../components/Loading.jsx';

export default function FounderRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get('/vc/connections/received');
    setRequests(data.data.requests);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const respond = async (id, status) => {
    await api.patch(`/vc/connections/${id}/respond`, { status });
    load();
  };

  if (loading) return <Spinner label="Loading requests" />;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">Investor requests</h1>

      {requests.length === 0 && (
        <p className="text-sm text-ink/50">No investor has reached out yet. Complete and submit your profile to get discovered.</p>
      )}

      <div className="space-y-4">
        {requests.map((r) => (
          <div key={r._id} className="card">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-ink">{r.investor?.name} {r.investor?.organization && <span className="text-ink/50">· {r.investor.organization}</span>}</p>
                <p className="text-xs text-ink/40">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="badge capitalize">{r.status}</span>
            </div>
            <p className="text-sm text-ink/70 mb-3">{r.message}</p>
            {r.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => respond(r._id, 'accepted')} className="btn-primary py-1">Accept</button>
                <button onClick={() => respond(r._id, 'declined')} className="btn-secondary py-1">Decline</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
