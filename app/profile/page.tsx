'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { D1_SCHOOLS } from '@/lib/schools';

const POSITIONS = ['Pitcher','Catcher','1B','2B','3B','SS','Middle Infield','Corner Infield','OF','Utility'];
const DIVISIONS = ['Power 4','Mid Major','D2','D3','NAIA'];
const CONFERENCES = ['SEC','ACC','Big Ten','Big 12','Sun Belt','American','Mountain West','Big West','MAC','Missouri Valley','Other'];
const REGIONS = ['Southeast','Northeast','Midwest','West','Texas'];
const GRAD_YEARS = [2025,2026,2027,2028,2029,2030,2031,2032];

type Profile = {
  name: string; phone: string; address: string; birthdate: string;
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
            onClick={() => onChange(
              selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]
            )}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
              selected.includes(opt)
                ? 'bg-[#0f2044] text-white border-[#0f2044]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-[#0f2044]'
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
    name: '', phone: '', address: '', birthdate: '', graduation_year: 0,
    high_school: '', travel_team: '', is_pitcher: 0, is_catcher: 0,
    primary_position: '', is_hitter: 0, bats: 'Right',
    target_divisions: '[]', target_conferences: '[]',
    target_regions: '[]', target_schools: '[]',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [tab, setTab] = useState<'basic' | 'position' | 'targets'>('basic');

  const targetDivisions: string[] = JSON.parse(profile.target_divisions || '[]');
  const targetConferences: string[] = JSON.parse(profile.target_conferences || '[]');
  const targetRegions: string[] = JSON.parse(profile.target_regions || '[]');
  const targetSchools: string[] = JSON.parse(profile.target_schools || '[]');

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (!r.ok) { router.push('/login'); return; }
      return r.json();
    }).then(data => {
      if (data) setProfile(data);
      setLoading(false);
    });
  }, [router]);

  const update = (key: string, val: unknown) => setProfile(p => ({ ...p, [key]: val }));
  const updateJSON = (key: string, val: string[]) => setProfile(p => ({ ...p, [key]: JSON.stringify(val) }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...profile,
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
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const filteredSchools = D1_SCHOOLS.filter(s =>
    s.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0f2044] flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-[#0f2044] text-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🥎</span>
          <span className="font-bold">RecruitRadar</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/camps" className="text-sm text-white/80 hover:text-white">My Camps</Link>
          <button onClick={logout} className="text-sm text-white/60 hover:text-white">Log out</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0f2044]">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Complete your profile to get matched with the right camps</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 p-1 rounded-xl mb-6">
          {(['basic','position','targets'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition ${
                tab === t ? 'bg-white text-[#0f2044] shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'targets' ? '🎯 Target Schools' : t === 'position' ? '⚾ Position' : '👤 Basic Info'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

            {tab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input required value={profile.name} onChange={e => update('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9971c]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input value={profile.phone} onChange={e => update('phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9971c]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input value={profile.address} onChange={e => update('address', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9971c]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Birthdate</label>
                    <input type="date" value={profile.birthdate} onChange={e => update('birthdate', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9971c]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                    <select value={profile.graduation_year} onChange={e => update('graduation_year', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9971c]">
                      <option value={0}>Select year</option>
                      {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">High School</label>
                    <input value={profile.high_school} onChange={e => update('high_school', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9971c]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Travel Team</label>
                    <input value={profile.travel_team} onChange={e => update('travel_team', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9971c]" />
                  </div>
                </div>
              </div>
            )}

            {tab === 'position' && (
              <div>
                <div className="flex gap-6 mb-6">
                  {[['is_pitcher','Pitcher 🥎'],['is_catcher','Catcher 🧤'],['is_hitter','Hitter 🏏']].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox"
                        checked={profile[key as keyof Profile] === 1}
                        onChange={e => update(key, e.target.checked ? 1 : 0)}
                        className="w-4 h-4 accent-[#0f2044]" />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Position</label>
                  <div className="flex flex-wrap gap-2">
                    {POSITIONS.map(pos => (
                      <button key={pos} type="button"
                        onClick={() => update('primary_position', pos)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                          profile.primary_position === pos
                            ? 'bg-[#0f2044] text-white border-[#0f2044]'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-[#0f2044]'
                        }`}
                      >{pos}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bats</label>
                  <div className="flex gap-3">
                    {['Left','Right','Switch'].map(b => (
                      <button key={b} type="button" onClick={() => update('bats', b)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                          profile.bats === b ? 'bg-[#0f2044] text-white border-[#0f2044]' : 'bg-white text-gray-600 border-gray-300'
                        }`}
                      >{b}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'targets' && (
              <div>
                <MultiCheck label="Target Division" options={DIVISIONS} selected={targetDivisions}
                  onChange={v => updateJSON('target_divisions', v)} />
                <MultiCheck label="Target Conference" options={CONFERENCES} selected={targetConferences}
                  onChange={v => updateJSON('target_conferences', v)} />
                <MultiCheck label="Target Region" options={REGIONS} selected={targetRegions}
                  onChange={v => updateJSON('target_regions', v)} />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Schools
                    <span className="ml-2 text-[#c9971c] font-normal">({targetSchools.length} selected)</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">🔔 You get instant alerts when any selected school posts a new camp</p>
                  <input
                    type="text" placeholder="Search schools..."
                    value={schoolSearch} onChange={e => setSchoolSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#c9971c]"
                  />
                  {targetSchools.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {targetSchools.map(s => (
                        <span key={s} className="bg-[#0f2044] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          {s}
                          <button type="button" onClick={() => updateJSON('target_schools', targetSchools.filter(x => x !== s))}
                            className="text-white/70 hover:text-white ml-0.5">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {filteredSchools.slice(0, 100).map(school => (
                      <label key={school}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                        <input type="checkbox"
                          checked={targetSchools.includes(school)}
                          onChange={e => updateJSON('target_schools',
                            e.target.checked ? [...targetSchools, school] : targetSchools.filter(s => s !== school)
                          )}
                          className="w-4 h-4 accent-[#0f2044]"
                        />
                        <span className="text-sm text-gray-700">{school}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-3">
              {(['basic','position','targets'] as const).map((t, i) => (
                <button key={t} type="button" onClick={() => setTab(t)}
                  className="text-sm text-gray-500 hover:text-[#0f2044] underline"
                >{i === 0 ? '← Back' : i === 1 ? (tab === 'basic' ? 'Next: Position →' : tab === 'targets' ? '← Position' : '') : 'Next: Targets →'}
                </button>
              ))}
            </div>
            <button type="submit" disabled={saving}
              className="bg-[#c9971c] hover:bg-[#f0b429] text-white font-bold px-6 py-2.5 rounded-lg transition disabled:opacity-50">
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
