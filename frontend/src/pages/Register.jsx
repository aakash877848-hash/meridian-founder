import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'founder', organization: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await register(form);
      navigate(user.role === 'founder' ? '/founder/profile' : '/vc/search');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center px-6 py-20">
      <h1 className="font-display text-3xl text-ink mb-1">Create your account</h1>
      <p className="text-sm text-ink/60 mb-8">Join as a founder or an investor.</p>

      <div className="mb-6 flex border border-line">
        {['founder', 'investor'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setForm({ ...form, role: r })}
            className={`flex-1 py-2 text-sm capitalize transition-colors ${
              form.role === r ? 'bg-signal text-paper' : 'text-ink/60 hover:bg-line/40'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        {form.role === 'investor' && (
          <div>
            <label className="label">Firm / organization</label>
            <input className="input" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
          </div>
        )}
        <div>
          <label className="label">Password</label>
          <input type="password" required minLength={8} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <p className="mt-1 text-xs text-ink/40">At least 8 characters, including a number.</p>
        </div>
        {error && <p className="text-sm text-clay">{error}</p>}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        Already have an account? <Link to="/login" className="text-signal underline">Log in</Link>
      </p>
    </div>
  );
}
