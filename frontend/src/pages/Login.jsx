import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'founder') navigate('/founder/profile');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/vc/search');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center px-6 py-24">
      <h1 className="font-display text-3xl text-ink mb-1">Welcome back</h1>
      <p className="text-sm text-ink/60 mb-8">Log in to your Meridian account.</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            required
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error && <p className="text-sm text-clay">{error}</p>}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? 'Signing in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        New here? <Link to="/register" className="text-signal underline">Create an account</Link>
      </p>
    </div>
  );
}
