'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';

type Camp = {
  id: number; school_name: string; camp_name: string; division: string;
  conference: string; region: string; state: string; city: string;
  start_date: string; end_date: string; month: string; camp_type: string;
  cost: string; grad_years: string; position_focus: string;
  registration_link: string; source: string;
};

const DIVISION_COLORS: Record<string, string> = {
  'Power 4': 'bg-blue-100 text-blue-800',
  'Mid Major': 'bg-purple-100 text-purple-800',
  'Multi': 'bg-orange-100 text-orange-800',
};

const TYPE_COLORS: Record<string, string> = {
  'Prospect': 'bg-green-100 text-green-800',
  'Elite': 'bg-red-100 text-red-800',
  'Youth': 'bg-yellow-100 text-yellow-800',
  'Pitching': 'bg-indigo-100 text-indigo-800',
  'Showcase': 'bg-pink-100 text-pink-800',
};

export default function CampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [viewMode, setViewMode] = useState<'all'|'matched'>('all');
  const [filters, setFilters] = useState({ region: '', division: '', month: '', type: '' });

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' }).then(r => { if (r.ok) setAuthed(true); });
    loadCamps();
  }, []);

  const loadCamps = async (matched = false) => {
    setLoading(true);
    const endpoint = matched ? '/api/camps/matched' : '/api/camps';
    const params = new URLSearchParams();
    if (!matched) {
      if (filters.region) params.set('region', filters.region);
      if (filters.division) params.set('division', filters.division);
      if (filters.month) params.set('month', filters.month);
      if (filters.type) params.set('type', filters.type);
    }
    const url = endpoint + (params.toString() ? '?' + params.toString() : '');
    const res = await fetch(url);
    if (res.ok) setCamps(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    loadCamps(viewMode === 'matched');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, viewMode]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#18181b]">Softball Camps 2026</h1>
            <p className="text-gray-500 text-sm mt-1">{camps.length} camps • Updated weekly</p>
          </div>
          {authed && (
            <div className="flex gap-2 bg-gray-200 p-1 rounded-xl">
              <button onClick={() => setViewMode('all')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition ${viewMode === 'all' ? 'bg-white text-[#18181b] shadow' : 'text-gray-500'}`}>
                All Camps
              </button>
              <button onClick={() => setViewMode('matched')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition ${viewMode === 'matched' ? 'bg-white text-[#18181b] shadow' : 'text-gray-500'}`}>
                🎯 My Matches
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        {viewMode === 'all' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
            {[
              { key: 'region', label: 'Region', options: ['Southeast','Northeast','Midwest','West','Texas'] },
              { key: 'division', label: 'Division', options: ['Power 4','Mid Major','Multi'] },
              { key: 'month', label: 'Month', options: ['January','March','April','May','June','July','August'] },
              { key: 'type', label: 'Camp Type', options: ['Prospect','Elite','Youth','Pitching','Showcase'] },
            ].map(({ key, label, options }) => (
              <select key={key}
                value={filters[key as keyof typeof filters]}
                onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d] bg-white">
                <option value="">All {label}s</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
            {Object.values(filters).some(Boolean) && (
              <button onClick={() => setFilters({ region: '', division: '', month: '', type: '' })}
                className="text-sm text-gray-500 hover:text-gray-700 underline px-2">Clear</button>
            )}
          </div>
        )}

        {!authed && (
          <div className="bg-[#18181b] text-white rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-semibold">🔔 Want alerts when target schools post camps?</p>
              <p className="text-sm text-white/70">Create a free profile to get matched and notified instantly.</p>
            </div>
            <Link href="/signup" className="bg-[#d9f99d] text-[#18181b] text-sm font-bold px-4 py-2 rounded-lg whitespace-nowrap ml-4">
              Sign Up Free →
            </Link>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading camps...</div>
        ) : camps.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-500">No camps match your filters.</p>
            {viewMode === 'matched' && (
              <p className="text-sm text-gray-400 mt-2">
                <Link href="/profile" className="text-[#d9f99d] hover:underline">Update your profile</Link> to get better matches.
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {camps.map((camp) => (
              <div key={camp.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition hover:border-[#d9f99d]/40">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-[#18181b] text-base leading-tight">{camp.school_name}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{camp.camp_name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {camp.division && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIVISION_COLORS[camp.division] || 'bg-gray-100 text-gray-700'}`}>
                      {camp.division}
                    </span>
                  )}
                  {camp.camp_type && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[camp.camp_type] || 'bg-gray-100 text-gray-700'}`}>
                      {camp.camp_type}
                    </span>
                  )}
                  {camp.region && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{camp.region}</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  {camp.start_date && (
                    <div className="flex items-center gap-1.5">
                      <span>📅</span>
                      <span>{camp.start_date}{camp.end_date && camp.end_date !== camp.start_date ? ` – ${camp.end_date}` : ''}</span>
                    </div>
                  )}
                  {camp.city && camp.state && (
                    <div className="flex items-center gap-1.5">
                      <span>📍</span><span>{camp.city}, {camp.state}</span>
                    </div>
                  )}
                  {camp.cost && camp.cost !== 'TBD' && (
                    <div className="flex items-center gap-1.5">
                      <span>💰</span><span>{camp.cost}</span>
                    </div>
                  )}
                  {camp.grad_years && (
                    <div className="flex items-center gap-1.5">
                      <span>🎓</span><span>Class of {camp.grad_years}</span>
                    </div>
                  )}
                </div>
                {camp.registration_link && (
                  <a href={camp.registration_link} target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center bg-[#18181b] hover:bg-[#1a3060] text-white text-sm font-semibold py-2 rounded-lg transition">
                    Register / Learn More →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
