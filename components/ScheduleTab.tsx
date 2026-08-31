'use client';
import { useState, useEffect } from 'react';

type Camp = {
  id: number; school_name: string; camp_name: string;
  start_date?: string; end_date?: string; city?: string; state?: string;
  camp_type?: string; registration_link?: string;
};

type ScheduleEntry = Camp & { priority_rank: number | null; has_conflict: boolean };

function formatDateRange(start?: string, end?: string): string {
  if (!start) return 'Date TBD';
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = new Date(start + 'T00:00:00').toLocaleDateString('en-US', opts);
  if (!end || end === start) return startStr;
  const endStr = new Date(end + 'T00:00:00').toLocaleDateString('en-US', opts);
  return `${startStr} – ${endStr}`;
}

export default function ScheduleTab({ targetSchools }: { targetSchools: string[] }) {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [allCamps, setAllCamps] = useState<Camp[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [campSearch, setCampSearch] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  const loadSchedule = () => fetch('/api/schedule', { cache: 'no-store', credentials: 'include' })
    .then(r => r.json()).then(data => setSchedule(data.schedule || []));

  useEffect(() => {
    loadSchedule().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showAddPanel && allCamps.length === 0) {
      fetch('/api/camps').then(r => r.json()).then(setAllCamps);
    }
  }, [showAddPanel, allCamps.length]);

  const handleGenerate = async () => {
    if (rangeStart && rangeEnd && rangeEnd < rangeStart) {
      setError('End date must be after start date.');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/schedule/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rangeStart: rangeStart || undefined, rangeEnd: rangeEnd || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not generate a schedule'); return; }
      await loadSchedule();
    } catch {
      setError('Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  const handleAdd = async (campId: number) => {
    await fetch('/api/schedule/add', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campId }),
    });
    await loadSchedule();
  };

  const handleRemove = async (campId: number) => {
    await fetch('/api/schedule/remove', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campId }),
    });
    await loadSchedule();
  };

  const scheduledIds = new Set(schedule.map(s => s.id));
  const filteredCamps = allCamps.filter(c =>
    !scheduledIds.has(c.id) &&
    (campSearch === '' ||
      c.school_name.toLowerCase().includes(campSearch.toLowerCase()) ||
      c.camp_name.toLowerCase().includes(campSearch.toLowerCase()))
  );

  if (loading) return <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-gray-500 text-sm">Loading schedule...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-[#18181b] mb-1">My Schedule</h2>
        <p className="text-sm text-gray-500 mb-4">
          Generate the best non-conflicting camp schedule from your ranked target schools, then add or remove camps yourself if something doesn&apos;t work.
        </p>

        {targetSchools.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
            Add target schools on the Target Schools tab first — the optimal schedule is built around your priority list.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From (optional)</label>
                <input type="date" value={rangeStart} onChange={e => setRangeStart(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To (optional)</label>
                <input type="date" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />
              </div>
              {(rangeStart || rangeEnd) && (
                <button type="button" onClick={() => { setRangeStart(''); setRangeEnd(''); }}
                  className="text-xs text-gray-500 hover:text-gray-700 pb-2.5">Clear</button>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-3">
              {rangeStart || rangeEnd
                ? `Only camps ${rangeStart ? `from ${rangeStart}` : 'up to'}${rangeStart && rangeEnd ? ' ' : ''}${rangeEnd ? `through ${rangeEnd}` : ''} will be considered.`
                : 'Leave blank to consider camps across your whole target-school list, with no date window.'}
            </p>
            <button type="button" onClick={handleGenerate} disabled={generating}
              className="bg-[#18181b] hover:bg-[#1a3060] text-white font-bold px-6 py-3 rounded-lg transition disabled:opacity-50">
              {generating ? 'Generating...' : '✨ Generate Optimal Schedule'}
            </button>
          </>
        )}
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {schedule.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-gray-500">No camps scheduled yet.</p>
          <p className="text-gray-400 text-sm mt-1">Generate an optimal plan above, or add camps manually below.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedule.map(entry => (
            <div key={entry.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {entry.priority_rank ? (
                    <span className="bg-[#18181b] text-[#d9f99d] font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {entry.priority_rank}
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 mt-0.5">Manual</span>
                  )}
                  <div>
                    <h3 className="font-bold text-[#18181b]">{entry.school_name}</h3>
                    <p className="text-sm text-gray-600">{entry.camp_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateRange(entry.start_date, entry.end_date)}
                      {entry.city && entry.state ? ` · ${entry.city}, ${entry.state}` : ''}
                    </p>
                    {entry.has_conflict && (
                      <p className="text-xs text-red-600 font-semibold mt-1">⚠ Overlaps with another scheduled camp</p>
                    )}
                  </div>
                </div>
                <button type="button" onClick={() => handleRemove(entry.id)}
                  className="text-xs text-red-600 hover:underline shrink-0">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <button type="button" onClick={() => setShowAddPanel(v => !v)}
          className="text-sm font-semibold text-gray-700 hover:text-[#18181b]">
          {showAddPanel ? '▾ Hide camp search' : '▸ Add a camp manually'}
        </button>

        {showAddPanel && (
          <div className="mt-4">
            <input type="text" placeholder="Search camps by school or camp name..."
              value={campSearch} onChange={e => setCampSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#d9f99d]" />
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {filteredCamps.slice(0, 100).map(camp => (
                <div key={camp.id} className="flex items-center justify-between gap-3 px-3 py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{camp.school_name} — {camp.camp_name}</p>
                    <p className="text-xs text-gray-500">{formatDateRange(camp.start_date, camp.end_date)}</p>
                  </div>
                  <button type="button" onClick={() => handleAdd(camp.id)}
                    className="text-xs font-semibold text-[#18181b] bg-[#d9f99d] hover:bg-[#bef264] px-3 py-1.5 rounded-lg transition shrink-0">
                    + Add
                  </button>
                </div>
              ))}
              {filteredCamps.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No matching camps.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
