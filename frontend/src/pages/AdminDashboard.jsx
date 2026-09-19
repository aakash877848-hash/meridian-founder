import React, { useEffect, useState } from 'react';
import api from '../api/axios.js';
import { Spinner } from '../components/Loading.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [startups, setStartups] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'investor', organization: '' });
  const [message, setMessage] = useState('');

  const load = async () => {
    const [statsRes, usersRes, startupsRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/startups', { params: { limit: 20 } }),
    ]);
    setStats(statsRes.data.data);
    setUsers(usersRes.data.data.users);
    setStartups(startupsRes.data.data.startups);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (userId, isActive) => {
    await api.patch(`/admin/users/${userId}/active`, { isActive: !isActive });
    load();
  };

  const createUser = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/admin/users', newUser);
      setMessage(`${newUser.role} account created for ${newUser.email}.`);
      setNewUser({ name: '', email: '', password: '', role: 'investor', organization: '' });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not create account.');
    }
  };

  const verifyStartup = async (id) => {
    await api.patch(`/startups/${id}/verify`);
    load();
  };

  const setVisibility = async (id, visibility) => {
    await api.patch(`/startups/${id}/visibility`, { visibility });
    load();
  };

  if (!stats) return <Spinner label="Loading admin dashboard" />;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">Admin dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="card"><p className="text-xs text-ink/50 mb-1">Founders</p><p className="font-display text-3xl">{stats.totalFounders}</p></div>
        <div className="card"><p className="text-xs text-ink/50 mb-1">Investors</p><p className="font-display text-3xl">{stats.totalInvestors}</p></div>
        <div className="card"><p className="text-xs text-ink/50 mb-1">Startups</p><p className="font-display text-3xl">{stats.totalStartups}</p></div>
        <div className="card"><p className="text-xs text-ink/50 mb-1">Published profiles</p><p className="font-display text-3xl">{stats.submittedProfiles}</p></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
        <div className="card">
          <h2 className="font-display text-lg mb-3">Startups by sector</h2>
          <ul className="text-sm space-y-1">
            {stats.bySector.map((s) => (
              <li key={s._id} className="flex justify-between"><span>{s._id || 'Unspecified'}</span><strong>{s.count}</strong></li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-display text-lg mb-3">Startups by stage</h2>
          <ul className="text-sm space-y-1">
            {stats.byStage.map((s) => (
              <li key={s._id} className="flex justify-between"><span>{s._id || 'Unspecified'}</span><strong>{s.count}</strong></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card mb-10">
        <h2 className="font-display text-lg mb-4">Invite an investor or admin</h2>
        {message && <p className="mb-3 text-sm text-signal">{message}</p>}
        <form onSubmit={createUser} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="label">Name</label>
            <input required className="input" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input required type="email" className="input" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Temp password</label>
            <input required minLength={8} className="input" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="investor">Investor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className="btn-primary h-[38px]">Create</button>
        </form>
      </div>

      <div className="card mb-10">
        <h2 className="font-display text-lg mb-4">Users</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/50 border-b border-line">
              <th className="py-2">Name</th><th>Email</th><th>Role</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-line/50">
                <td className="py-2">{u.name}</td>
                <td>{u.email}</td>
                <td className="capitalize">{u.role}</td>
                <td>{u.isActive ? 'Active' : 'Deactivated'}</td>
                <td><button onClick={() => toggleActive(u._id, u.isActive)} className="text-clay hover:underline">{u.isActive ? 'Deactivate' : 'Reactivate'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="font-display text-lg mb-4">Startup profiles</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/50 border-b border-line">
              <th className="py-2">Startup</th><th>Founder</th><th>Status</th><th>Visibility</th><th></th>
            </tr>
          </thead>
          <tbody>
            {startups.map((s) => (
              <tr key={s._id} className="border-b border-line/50">
                <td className="py-2">{s.startupName}</td>
                <td>{s.founder?.email}</td>
                <td className="capitalize">{s.status}</td>
                <td>
                  <select className="input py-1 text-xs" value={s.visibility} onChange={(e) => setVisibility(s._id, e.target.value)}>
                    <option value="investors_only">Investors only</option>
                    <option value="private">Private</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </td>
                <td>
                  {!s.verification?.isVerified && (
                    <button onClick={() => verifyStartup(s._id)} className="text-signal hover:underline">Verify</button>
                  )}
                  {s.verification?.isVerified && <span className="badge">Verified</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
