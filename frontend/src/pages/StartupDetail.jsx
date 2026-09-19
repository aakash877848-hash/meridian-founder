import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios.js';
import { Spinner } from '../components/Loading.jsx';

const money = (n) => (n ? `$${Number(n).toLocaleString()}` : '—');
const PIPELINE_STAGES = ['New', 'Screening', 'Contacted', 'In Discussion', 'Due Diligence', 'Term Sheet', 'Invested', 'Passed'];

export default function StartupDetail() {
  const { id } = useParams();
  const [startup, setStartup] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [connectMsg, setConnectMsg] = useState('');
  const [pipelineStage, setPipelineStage] = useState('New');
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await api.get(`/startups/${id}`);
    setStartup(data.data.startup);
    const notesRes = await api.get(`/vc/startups/${id}/notes`);
    setNotes(notesRes.data.data.notes);
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const addNote = async () => {
    if (!noteText.trim()) return;
    await api.post(`/vc/startups/${id}/notes`, { content: noteText });
    setNoteText('');
    load();
  };

  const sendConnect = async () => {
    if (!connectMsg.trim()) return;
    await api.post(`/vc/startups/${id}/connect`, { message: connectMsg });
    setConnectMsg('');
    setMessage('Connection request sent to the founder.');
  };

  const updatePipeline = async () => {
    await api.put(`/vc/pipeline/${id}`, { stage: pipelineStage });
    setMessage(`Pipeline stage set to "${pipelineStage}".`);
  };

  if (!startup) return <Spinner label="Loading startup" />;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm text-signal mb-1">{startup.sector} · {startup.stage}</p>
        <h1 className="font-display text-4xl text-ink mb-2">{startup.startupName}</h1>
        <p className="text-ink/70">{startup.tagline}</p>
        <p className="text-xs text-ink/40 mt-2">{startup.location?.city}, {startup.location?.country}</p>
      </div>

      {message && <div className="mb-6 border border-signal/40 bg-signal/5 px-4 py-2 text-sm text-signal">{message}</div>}

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-display text-lg mb-2">Overview</h2>
            <p className="text-sm text-ink/70 whitespace-pre-line">{startup.description}</p>
          </div>

          <div className="card">
            <h2 className="font-display text-lg mb-3">Traction</h2>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>MRR: <strong>{money(startup.traction?.monthlyRevenueUSD)}</strong></div>
              <div>ARR: <strong>{money(startup.traction?.annualRevenueUSD)}</strong></div>
              <div>Growth: <strong>{startup.traction?.growthRatePercentMoM ?? '—'}% MoM</strong></div>
              <div>Users: <strong>{startup.traction?.activeUsers ?? '—'}</strong></div>
              <div>Customers: <strong>{startup.traction?.customers ?? '—'}</strong></div>
              <div>Product: <strong>{startup.traction?.stageOfProduct ?? '—'}</strong></div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-display text-lg mb-3">Fundraising</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>Seeking: <strong>{money(startup.fundraising?.amountSeekingUSD)}</strong></div>
              <div>Round: <strong>{startup.fundraising?.roundType || '—'}</strong></div>
              <div>Valuation: <strong>{money(startup.fundraising?.valuationUSD)}</strong></div>
              <div>Total raised: <strong>{money(startup.fundraising?.totalRaisedUSD)}</strong></div>
            </div>
            {startup.fundraising?.useOfFunds && <p className="mt-3 text-sm text-ink/70">{startup.fundraising.useOfFunds}</p>}
          </div>

          <div className="card">
            <h2 className="font-display text-lg mb-3">Team</h2>
            <ul className="space-y-2 text-sm">
              {(startup.team || []).map((m, i) => (
                <li key={i}><strong>{m.name}</strong> — {m.role}</li>
              ))}
              {(!startup.team || startup.team.length === 0) && <p className="text-ink/50">Not provided.</p>}
            </ul>
          </div>

          <div className="card">
            <h2 className="font-display text-lg mb-3">Documents</h2>
            <ul className="space-y-1 text-sm">
              {(startup.documents || []).map((d) => (
                <li key={d._id}><a href={d.url} target="_blank" rel="noreferrer" className="text-signal underline">{d.name}</a></li>
              ))}
              {(!startup.documents || startup.documents.length === 0) && <p className="text-ink/50">No documents shared.</p>}
            </ul>
          </div>

          <div className="card">
            <h2 className="font-display text-lg mb-3">Internal notes <span className="text-xs text-ink/40">(private to your team)</span></h2>
            <div className="space-y-3 mb-4">
              {notes.map((n) => (
                <div key={n._id} className="border-l-2 border-signal pl-3 text-sm">
                  <p className="text-ink/80">{n.content}</p>
                  <p className="text-xs text-ink/40">{n.author?.name} · {new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))}
              {notes.length === 0 && <p className="text-sm text-ink/50">No notes yet.</p>}
            </div>
            <textarea className="input mb-2" rows={2} placeholder="Add a private note…" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
            <button onClick={addNote} className="btn-secondary text-sm">Add note</button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="font-display text-base mb-3">Founder contact</h2>
            <p className="text-sm text-ink/70">{startup.founderDetails?.fullName}</p>
            <p className="text-sm text-ink/50">{startup.founderDetails?.email}</p>
            <p className="text-sm text-ink/50">{startup.founderDetails?.phone}</p>
            {startup.website && <a href={startup.website} target="_blank" rel="noreferrer" className="block text-sm text-signal underline mt-2">Website</a>}
          </div>

          <div className="card">
            <h2 className="font-display text-base mb-3">Connect</h2>
            <textarea className="input mb-2" rows={3} placeholder="Introduce yourself…" value={connectMsg} onChange={(e) => setConnectMsg(e.target.value)} />
            <button onClick={sendConnect} className="btn-primary w-full">Send request</button>
          </div>

          <div className="card">
            <h2 className="font-display text-base mb-3">Pipeline stage</h2>
            <select className="input mb-2" value={pipelineStage} onChange={(e) => setPipelineStage(e.target.value)}>
              {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={updatePipeline} className="btn-secondary w-full">Update stage</button>
          </div>
        </div>
      </div>
    </div>
  );
}
