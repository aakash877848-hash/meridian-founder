import React, { useEffect, useState } from 'react';
import api from '../api/axios.js';

const SECTORS = [
  'Fintech', 'Healthtech', 'Edtech', 'SaaS', 'E-commerce', 'Marketplace',
  'AI/ML', 'Deeptech', 'Climate/Cleantech', 'Consumer', 'Logistics/Supply Chain',
  'Gaming', 'Media/Entertainment', 'Real Estate/Proptech', 'Agritech',
  'Web3/Crypto', 'Cybersecurity', 'HRtech', 'Legaltech', 'Other',
];
const STAGES = ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth', 'Bootstrapped'];
const BUSINESS_MODELS = ['B2B', 'B2C', 'B2B2C', 'D2C', 'Marketplace', 'SaaS', 'Platform', 'Subscription', 'Other'];

const emptyProfile = {
  founderDetails: { fullName: '', email: '', phone: '', linkedIn: '', bio: '' },
  startupName: '', tagline: '', description: '', foundedYear: '',
  sector: '', subSector: '', stage: '',
  location: { country: '', state: '', city: '' },
  businessModel: [],
  traction: { stageOfProduct: '', monthlyRevenueUSD: '', annualRevenueUSD: '', growthRatePercentMoM: '', activeUsers: '', customers: '', notes: '' },
  fundraising: { isRaising: true, amountSeekingUSD: '', valuationUSD: '', roundType: '', useOfFunds: '', totalRaisedUSD: '' },
  team: [], teamSize: '',
  website: '', linkedInUrl: '', twitterUrl: '',
  visibility: 'investors_only', status: 'draft', documents: [],
};

function Section({ title, subtitle, children }) {
  return (
    <div className="card mb-6">
      <h2 className="font-display text-lg text-ink mb-1">{title}</h2>
      {subtitle && <p className="text-xs text-ink/50 mb-4">{subtitle}</p>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function FounderProfileForm() {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadType, setUploadType] = useState('pitch_deck');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/startups/me');
      if (data.data.startup) {
        setProfile({ ...emptyProfile, ...data.data.startup });
      }
      setLoading(false);
    })();
  }, []);

  const set = (path, value) => {
    setProfile((prev) => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const toggleBusinessModel = (bm) => {
    setProfile((prev) => {
      const has = prev.businessModel.includes(bm);
      return {
        ...prev,
        businessModel: has ? prev.businessModel.filter((x) => x !== bm) : [...prev.businessModel, bm],
      };
    });
  };

  const addTeamMember = () => {
    setProfile((prev) => ({ ...prev, team: [...prev.team, { name: '', role: '', linkedIn: '', bio: '' }] }));
  };
  const updateTeamMember = (idx, field, value) => {
    setProfile((prev) => {
      const team = [...prev.team];
      team[idx] = { ...team[idx], [field]: value };
      return { ...prev, team };
    });
  };
  const removeTeamMember = (idx) => {
    setProfile((prev) => ({ ...prev, team: prev.team.filter((_, i) => i !== idx) }));
  };

  const save = async (submitForReview) => {
    setSaving(true);
    setMessage('');
    try {
      const payload = structuredClone(profile);
      if (submitForReview) payload.status = 'submitted';
      delete payload.documents;
      delete payload._id;
      delete payload.founder;
      delete payload.verification;
      delete payload.profileCompleteness;
      delete payload.createdAt;
      delete payload.updatedAt;

      const { data } = await api.put('/startups/me', payload);
      setProfile((prev) => ({ ...prev, ...data.data.startup }));
      setMessage(submitForReview ? 'Profile submitted for investor visibility.' : 'Draft saved.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const uploadDocs = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('documents', f));
      formData.append('type', uploadType);
      const { data } = await api.post('/startups/me/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((prev) => ({ ...prev, documents: data.data.documents }));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const deleteDoc = async (docId) => {
    await api.delete(`/startups/me/documents/${docId}`);
    setProfile((prev) => ({ ...prev, documents: prev.documents.filter((d) => d._id !== docId) }));
  };

  if (loading) return <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-ink/50">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Your startup profile</h1>
          <p className="text-sm text-ink/60 mt-1">
            Completeness: <strong>{profile.profileCompleteness ?? 0}%</strong> · Status: <span className="badge">{profile.status}</span>
          </p>
        </div>
      </div>

      {message && <div className="mb-6 border border-signal/40 bg-signal/5 px-4 py-2 text-sm text-signal">{message}</div>}

      <Section title="Founder details">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={profile.founderDetails.fullName} onChange={(e) => set('founderDetails.fullName', e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={profile.founderDetails.email} onChange={(e) => set('founderDetails.email', e.target.value)} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={profile.founderDetails.phone} onChange={(e) => set('founderDetails.phone', e.target.value)} />
          </div>
          <div>
            <label className="label">LinkedIn</label>
            <input className="input" value={profile.founderDetails.linkedIn} onChange={(e) => set('founderDetails.linkedIn', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Short bio</label>
          <textarea className="input" rows={3} value={profile.founderDetails.bio} onChange={(e) => set('founderDetails.bio', e.target.value)} />
        </div>
      </Section>

      <Section title="Startup details">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Startup name</label>
            <input className="input" value={profile.startupName} onChange={(e) => set('startupName', e.target.value)} />
          </div>
          <div>
            <label className="label">Founded year</label>
            <input type="number" className="input" value={profile.foundedYear} onChange={(e) => set('foundedYear', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Tagline</label>
          <input className="input" maxLength={200} value={profile.tagline} onChange={(e) => set('tagline', e.target.value)} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={5} value={profile.description} onChange={(e) => set('description', e.target.value)} />
        </div>
      </Section>

      <Section title="Sector, stage & location">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Sector</label>
            <select className="input" value={profile.sector} onChange={(e) => set('sector', e.target.value)}>
              <option value="">Select…</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Sub-sector</label>
            <input className="input" value={profile.subSector} onChange={(e) => set('subSector', e.target.value)} />
          </div>
          <div>
            <label className="label">Stage</label>
            <select className="input" value={profile.stage} onChange={(e) => set('stage', e.target.value)}>
              <option value="">Select…</option>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Country</label>
            <input className="input" value={profile.location.country} onChange={(e) => set('location.country', e.target.value)} />
          </div>
          <div>
            <label className="label">State / region</label>
            <input className="input" value={profile.location.state} onChange={(e) => set('location.state', e.target.value)} />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" value={profile.location.city} onChange={(e) => set('location.city', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Business model</label>
          <div className="flex flex-wrap gap-2">
            {BUSINESS_MODELS.map((bm) => (
              <button
                type="button"
                key={bm}
                onClick={() => toggleBusinessModel(bm)}
                className={`border px-3 py-1 text-sm ${profile.businessModel.includes(bm) ? 'border-signal bg-signal text-paper' : 'border-line text-ink/60'}`}
              >
                {bm}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Traction & revenue">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Product stage</label>
            <select className="input" value={profile.traction.stageOfProduct} onChange={(e) => set('traction.stageOfProduct', e.target.value)}>
              <option value="">Select…</option>
              {['Concept', 'Prototype', 'MVP', 'Live/Launched', 'Scaling'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Monthly revenue (USD)</label>
            <input type="number" className="input" value={profile.traction.monthlyRevenueUSD} onChange={(e) => set('traction.monthlyRevenueUSD', e.target.value)} />
          </div>
          <div>
            <label className="label">Annual revenue (USD)</label>
            <input type="number" className="input" value={profile.traction.annualRevenueUSD} onChange={(e) => set('traction.annualRevenueUSD', e.target.value)} />
          </div>
          <div>
            <label className="label">MoM growth rate (%)</label>
            <input type="number" className="input" value={profile.traction.growthRatePercentMoM} onChange={(e) => set('traction.growthRatePercentMoM', e.target.value)} />
          </div>
          <div>
            <label className="label">Active users</label>
            <input type="number" className="input" value={profile.traction.activeUsers} onChange={(e) => set('traction.activeUsers', e.target.value)} />
          </div>
          <div>
            <label className="label">Customers</label>
            <input type="number" className="input" value={profile.traction.customers} onChange={(e) => set('traction.customers', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Traction notes</label>
          <textarea className="input" rows={3} value={profile.traction.notes} onChange={(e) => set('traction.notes', e.target.value)} />
        </div>
      </Section>

      <Section title="Fundraising">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Amount seeking (USD)</label>
            <input type="number" className="input" value={profile.fundraising.amountSeekingUSD} onChange={(e) => set('fundraising.amountSeekingUSD', e.target.value)} />
          </div>
          <div>
            <label className="label">Round type</label>
            <input className="input" value={profile.fundraising.roundType} onChange={(e) => set('fundraising.roundType', e.target.value)} />
          </div>
          <div>
            <label className="label">Target valuation (USD)</label>
            <input type="number" className="input" value={profile.fundraising.valuationUSD} onChange={(e) => set('fundraising.valuationUSD', e.target.value)} />
          </div>
          <div>
            <label className="label">Total raised to date (USD)</label>
            <input type="number" className="input" value={profile.fundraising.totalRaisedUSD} onChange={(e) => set('fundraising.totalRaisedUSD', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Use of funds</label>
          <textarea className="input" rows={3} value={profile.fundraising.useOfFunds} onChange={(e) => set('fundraising.useOfFunds', e.target.value)} />
        </div>
      </Section>

      <Section title="Team">
        <div>
          <label className="label">Team size</label>
          <input type="number" className="input w-32" value={profile.teamSize} onChange={(e) => set('teamSize', e.target.value)} />
        </div>
        {profile.team.map((member, idx) => (
          <div key={idx} className="border border-line p-3 grid grid-cols-2 gap-3 relative">
            <input className="input" placeholder="Name" value={member.name} onChange={(e) => updateTeamMember(idx, 'name', e.target.value)} />
            <input className="input" placeholder="Role" value={member.role} onChange={(e) => updateTeamMember(idx, 'role', e.target.value)} />
            <input className="input" placeholder="LinkedIn" value={member.linkedIn} onChange={(e) => updateTeamMember(idx, 'linkedIn', e.target.value)} />
            <input className="input" placeholder="Short bio" value={member.bio} onChange={(e) => updateTeamMember(idx, 'bio', e.target.value)} />
            <button type="button" onClick={() => removeTeamMember(idx)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-clay text-white text-xs">×</button>
          </div>
        ))}
        <button type="button" onClick={addTeamMember} className="btn-secondary text-sm">+ Add team member</button>
      </Section>

      <Section title="Links">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Website</label>
            <input className="input" value={profile.website} onChange={(e) => set('website', e.target.value)} />
          </div>
          <div>
            <label className="label">Company LinkedIn</label>
            <input className="input" value={profile.linkedInUrl} onChange={(e) => set('linkedInUrl', e.target.value)} />
          </div>
          <div>
            <label className="label">Twitter / X</label>
            <input className="input" value={profile.twitterUrl} onChange={(e) => set('twitterUrl', e.target.value)} />
          </div>
        </div>
      </Section>

      <Section title="Documents" subtitle="Pitch deck, financials, cap table — PDF, PPT, DOC, XLS up to 15MB each.">
        <div className="flex items-center gap-3">
          <select className="input w-48" value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
            <option value="pitch_deck">Pitch deck</option>
            <option value="financials">Financials</option>
            <option value="cap_table">Cap table</option>
            <option value="other">Other</option>
          </select>
          <label className="btn-secondary cursor-pointer">
            {uploading ? 'Uploading…' : 'Choose files'}
            <input type="file" multiple hidden onChange={uploadDocs} disabled={uploading} />
          </label>
        </div>
        <ul className="divide-y divide-line">
          {(profile.documents || []).map((doc) => (
            <li key={doc._id} className="flex items-center justify-between py-2 text-sm">
              <a href={doc.url} target="_blank" rel="noreferrer" className="text-signal underline">{doc.name}</a>
              <div className="flex items-center gap-3 text-ink/50">
                <span className="badge">{doc.type}</span>
                <button onClick={() => deleteDoc(doc._id)} className="text-clay hover:underline">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Visibility">
        <select className="input" value={profile.visibility} onChange={(e) => set('visibility', e.target.value)}>
          <option value="investors_only">Visible to investors on the platform</option>
          <option value="private">Private (only me — not searchable)</option>
          <option value="hidden">Hidden (paused)</option>
        </select>
      </Section>

      <div className="flex gap-3 pb-16">
        <button onClick={() => save(false)} disabled={saving} className="btn-secondary">Save draft</button>
        <button onClick={() => save(true)} disabled={saving} className="btn-primary">Submit for investor visibility</button>
      </div>
    </div>
  );
}
