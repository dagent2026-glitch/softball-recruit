'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { D1_SCHOOLS, CONFERENCES } from '@/lib/schools';

const POSITIONS = ['Pitcher','Catcher','1B','2B','3B','SS','Middle Infield','Corner Infield','OF','Utility'];
const DIVISIONS = ['Power 4','Mid Major','D2','D3','NAIA'];
const REGIONS = ['Southeast','Northeast','Midwest','West','Texas'];
const GRAD_YEARS = [2025,2026,2027,2028,2029,2030,2031,2032];
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

type Profile = {
  email: string; name: string; phone: string; address_street: string; address_city: string;
  address_state: string; address_zip: string; birthdate: string;
  graduation_year: number; high_school: string; travel_team: string;
  is_pitcher: number; is_catcher: number; primary_position: string;
  is_hitter: number; bats: string;
  target_divisions: string; target_conferences: string;
  target_regions: string; target_schools: string;
};

function MultiCheck({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} type="button"
            onClick={() => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
              selected.includes(opt) ? 'bg-[#18181b] text-white border-[#18181b]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#18181b]'
            }`}
          >{opt}</button>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    name: '', phone: '', address_street: '', address_city: '', address_state: '',
    address_zip: '', birthdate: '', graduation_year: 0, high_school: '', travel_team: '',
    is_pitcher: 0, is_catcher: 0, primary_position: '', is_hitter: 0, bats: 'Right',
    target_divisions: '[]', target_conferences: '[]', target_regions: '[]', target_schools: '[]',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [tab, setTab] = useState<'basic' | 'position' | 'targets' | 'account'>('basic');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountError, setAccountError] = useState('');

  const targetDivisions: string[] = JSON.parse(profile.target_divisions || '[]');
  const targetConferences: string[] = JSON.parse(profile.target_conferences || '[]');
  const targetRegions: string[] = JSON.parse(profile.target_regions || '[]');
  const targetSchools: string[] = JSON.parse(profile.target_schools || '[]');

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (!r.ok) { router.push('/login'); return null; }
      return r.json();
    }).then(data => {
      if (data) {
        // Parse address back into fields if stored as combined
        setProfile(p => ({ ...p, ...data }));
      }
      setLoading(false);
    });
  }, [router]);

  const update = (key: string, val: unknown) => setProfile(p => ({ ...p, [key]: val }));
  const updateJSON = (key: string, val: string[]) => setProfile(p => ({ ...p, [key]: JSON.stringify(val) }));

  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError('');
    if (newPassword && newPassword !== confirmPassword) {
      setAccountError('Passwords do not match');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: profile.email, password: newPassword || undefined }),
    });
    setSaving(false);
    if (!res.ok) {
      const { error } = await res.json();
      setAccountError(error || 'Failed to update account');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSave = async (e: React.FormEvent | null, redirect: boolean = true) => {
    if (e) e.preventDefault();
    setSaving(true);
    const address = [profile.address_street, profile.address_city, profile.address_state, profile.address_zip].filter(Boolean).join(', ');
    const body = {
      ...profile,
      address,
      target_divisions: targetDivisions,
      target_conferences: targetConferences,
      target_regions: targetRegions,
      target_schools: targetSchools,
    };
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      if (redirect) {
        setTimeout(() => {
          router.push('/camps?settings_saved=1');
        }, 800);
      }
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const filteredSchools = D1_SCHOOLS.filter(s => s.toLowerCase().includes(schoolSearch.toLowerCase()));
  const tabComplete = {
    basic: !!(profile.name && profile.graduation_year),
    position: !!(profile.primary_position),
    targets: targetSchools.length > 0 || targetDivisions.length > 0,
  };

  if (loading) return (
    <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#18181b] text-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M50 85 L25 60 L25 40 L75 40 L75 60 Z" fill="transparent" stroke="#18181b" /><path d="M35 25 Q50 10 65 25" stroke="#d9f99d" /><path d="M25 15 Q50 -5 75 15" stroke="#d9f99d" opacity="0.5"/></svg>
          <span className="font-bold">RecruitRadar</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/camps" className="text-sm text-white/80 hover:text-white">My Camps</Link>
          <button onClick={logout} className="text-sm text-white/60 hover:text-white">Log out</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#18181b]">Manage Profile & Selections</h1>
          <p className="text-gray-500 text-sm mt-1">Update your info, positions, and target schools to refine your camp matches</p>
        </div>

        {/* Progress tabs */}
        <div className="flex gap-1 bg-gray-200 p-1 rounded-xl mb-6">
          {(['basic','position','targets','account'] as const).map((t, i) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                tab === t ? 'bg-white text-[#18181b] shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tabComplete[t] && <span className="text-green-500 text-xs">✓</span>}
              {i === 0 ? '👤 Basic Info' : i === 1 ? '⚾ Position' : i === 2 ? '🎯 Target Schools' : '⚙️ Account'}
            </button>
          ))}
        </div>

        {saved && (
          <div className="fixed top-4 right-4 bg-[#d9f99d] border border-[#bef264] text-[#18181b] font-bold px-4 py-2 rounded-lg shadow-lg z-50">
            ✅ Settings Saved!
          </div>
        )}
        {tab === 'account' ? (
          <form onSubmit={handleAccountSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-[#18181b] mb-4">Account Settings</h2>
            {accountError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{accountError}</div>}
            
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" required value={profile.email || ''} onChange={e => update('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />
              </div>
              
              <div className="pt-4 border-t border-gray-100 mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={6}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" disabled={saving}
                  className="w-full bg-[#18181b] text-white hover:bg-black font-bold py-3 rounded-lg transition shadow-md disabled:opacity-50 text-lg">
                  {saving ? 'Saving...' : 'Update Account Settings'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={(e) => handleSave(e, tab === 'targets')}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

            {/* BASIC INFO */}
            {tab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input required value={profile.name} onChange={e => update('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={profile.phone} onChange={e => update('phone', e.target.value)}
                      placeholder="(555) 555-5555"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input value={profile.address_street} onChange={e => update('address_street', e.target.value)}
                    placeholder="123 Main St"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />
                </div>

                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input value={profile.address_city} onChange={e => update('address_city', e.target.value)}
                      placeholder="Atlanta"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select value={profile.address_state} onChange={e => update('address_state', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]">
                      <option value="">--</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input value={profile.address_zip} onChange={e => update('address_zip', e.target.value)}
                      placeholder="30301" maxLength={10}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Birthdate</label>
                    <input type="date" value={profile.birthdate} onChange={e => update('birthdate', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year *</label>
                    <select required value={profile.graduation_year} onChange={e => update('graduation_year', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]">
                      <option value={0}>Select year</option>
                      {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">High School</label>
                    <input value={profile.high_school} onChange={e => update('high_school', e.target.value)}
                      placeholder="Cherokee High School"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Travel Team</label>
                    <input value={profile.travel_team} onChange={e => update('travel_team', e.target.value)}
                      placeholder="Lady Warriors Gold"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />
                  </div>
                </div>

                <div className="mt-4">
                  <button type="button" onClick={() => setTab('position')}
                    className="w-full bg-[#18181b] text-white font-bold py-3 rounded-lg hover:bg-[#1a3060] transition">
                    Next: Position Info →
                  </button>
                </div>
              </div>
            )}

            {/* POSITION */}
            {tab === 'position' && (
              <div>
                <div className="flex flex-wrap gap-6 mb-6">
                  {[['is_pitcher','Pitcher 🥎'],['is_catcher','Catcher 🧤'],['is_hitter','Hitter 🏏']].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox"
                        checked={profile[key as keyof Profile] === 1}
                        onChange={e => update(key, e.target.checked ? 1 : 0)}
                        className="w-4 h-4 accent-[#18181b]" />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Position *</label>
                  <div className="flex flex-wrap gap-2">
                    {POSITIONS.map(pos => (
                      <button key={pos} type="button" onClick={() => update('primary_position', pos)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                          profile.primary_position === pos ? 'bg-[#18181b] text-white border-[#18181b]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#18181b]'
                        }`}>{pos}</button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bats</label>
                  <div className="flex gap-3">
                    {['Left','Right','Switch'].map(b => (
                      <button key={b} type="button" onClick={() => update('bats', b)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                          profile.bats === b ? 'bg-[#18181b] text-white border-[#18181b]' : 'bg-white text-gray-600 border-gray-300'
                        }`}>{b}</button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setTab('basic')}
                    className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-lg hover:border-gray-400 transition">
                    ← Back
                  </button>
                  <button type="button" onClick={() => setTab('targets')}
                    className="flex-1 bg-[#18181b] text-white font-bold py-3 rounded-lg hover:bg-[#1a3060] transition">
                    Next: Target Schools →
                  </button>
                </div>
              </div>
            )}

            {/* TARGET SCHOOLS */}
            {tab === 'targets' && (
              <div>
                <MultiCheck label="Target Division" options={DIVISIONS} selected={targetDivisions}
                  onChange={v => updateJSON('target_divisions', v)} />
                <MultiCheck label="Target Conference" options={CONFERENCES} selected={targetConferences}
                  onChange={v => updateJSON('target_conferences', v)} />
                <MultiCheck label="Target Region" options={REGIONS} selected={targetRegions}
                  onChange={v => updateJSON('target_regions', v)} />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Target Schools
                    <span className="ml-2 text-[#d9f99d] font-normal text-xs">({targetSchools.length} selected — instant alerts when these post camps)</span>
                  </label>
                  <input type="text" placeholder="Search schools..."
                    value={schoolSearch} onChange={e => setSchoolSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />

                  {targetSchools.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      {targetSchools.map(s => (
                        <span key={s} className="bg-[#18181b] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          {s}
                          <button type="button" onClick={() => updateJSON('target_schools', targetSchools.filter(x => x !== s))}
                            className="text-white/70 hover:text-white">×</button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="border border-gray-200 rounded-lg max-h-52 overflow-y-auto">
                    {filteredSchools.slice(0, 150).map(school => (
                      <label key={school}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                        <input type="checkbox"
                          checked={targetSchools.includes(school)}
                          onChange={e => updateJSON('target_schools',
                            e.target.checked ? [...targetSchools, school] : targetSchools.filter(s => s !== school)
                          )}
                          className="w-4 h-4 accent-[#18181b]" />
                        <span className="text-sm text-gray-700">{school}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setTab('position')}
                    className="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-lg hover:border-gray-400 transition">
                    ← Back
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-[#d9f99d] hover:bg-[#bef264] text-[#18181b] font-bold py-3 rounded-lg transition disabled:opacity-50 text-lg">
                    {saving ? 'Saving...' : saved ? '✓ Saved! Redirecting...' : '🎯 Save & See My Camps →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
