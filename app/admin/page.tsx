'use client';
import { useState, useEffect } from 'react';

type Camp = { id: number; school_name: string; camp_name: string; division: string; start_date: string; camp_type: string; source: string; created_at: string; };

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [camps, setCamps] = useState<Camp[]>([]);
  const [alertLog, setAlertLog] = useState<{id:number;type:string;sent_at:string;school_name:string;camp_name:string}[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    school_name:'', camp_name:'', division:'Power 4', conference:'SEC',
    region:'Southeast', state:'', city:'', start_date:'', end_date:'',
    month:'June', camp_type:'Prospect', cost:'TBD', grad_years:'2027-2031',
    position_focus:'All', registration_link:'', source:'Ryzer', notes:''
  });

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === 'slugger2026') setAuthed(true);
    else alert('Wrong password');
  };

  useEffect(() => {
    if (!authed) return;
    fetch('/api/camps').then(r => r.json()).then(setCamps);
    fetch('/api/alerts', { headers: { 'x-admin-key': 'slugger2026' } }).then(r => r.ok ? r.json() : []).then(d => { if (Array.isArray(d)) setAlertLog(d); });
  }, [authed]);

  const addCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/camps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'slugger2026' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`✅ Camp added (ID: ${data.campId}) — ${data.alertCount} alerts triggered`);
      fetch('/api/camps').then(r => r.json()).then(setCamps);
      setForm(f => ({ ...f, school_name: '', camp_name: '', registration_link: '', notes: '' }));
    } else {
      setMsg(`❌ Error: ${data.error}`);
    }
  };

  const triggerAlerts = async () => {
    const res = await fetch('/api/alerts', {
      method: 'POST', headers: { 'x-admin-key': 'slugger2026' }
    });
    const data = await res.json();
    setMsg(`Alerts check complete: ${data.alerts_created} new alerts created`);
  };

  if (!authed) return (
    <div className="min-h-screen bg-[#0f2044] flex items-center justify-center">
      <form onSubmit={login} className="bg-white rounded-2xl p-8 w-80">
        <h1 className="text-xl font-bold text-[#0f2044] mb-4 text-center">🥎 Admin Panel</h1>
        <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#c9971c]" />
        <button type="submit" className="w-full bg-[#0f2044] text-white font-bold py-2 rounded-lg">Enter</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#0f2044]">🥎 RecruitRadar Admin</h1>
          <div className="flex gap-3">
            <button onClick={triggerAlerts} className="bg-[#c9971c] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#f0b429]">
              🔔 Trigger Alert Check
            </button>
          </div>
        </div>

        {msg && <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm px-4 py-3 rounded-lg mb-6">{msg}</div>}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Add camp */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-[#0f2044] mb-4">Add New Camp</h2>
            <form onSubmit={addCamp} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="School Name" value={form.school_name} onChange={e => setForm(f => ({...f, school_name: e.target.value}))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]" />
                <input required placeholder="Camp Name" value={form.camp_name} onChange={e => setForm(f => ({...f, camp_name: e.target.value}))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <select value={form.division} onChange={e => setForm(f => ({...f, division: e.target.value}))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]">
                  {['Power 4','Mid Major','Multi'].map(d => <option key={d}>{d}</option>)}
                </select>
                <select value={form.conference} onChange={e => setForm(f => ({...f, conference: e.target.value}))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]">
                  {['SEC','ACC','Big Ten','Big 12','Sun Belt','American','Mountain West','Big West','MAC','Other','Multi'].map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={form.region} onChange={e => setForm(f => ({...f, region: e.target.value}))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]">
                  {['Southeast','Northeast','Midwest','West','Texas'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="State (e.g. FL)" value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]" />
                <input placeholder="City" value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="date" value={form.start_date} onChange={e => setForm(f => ({...f, start_date: e.target.value}))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]" />
                <input type="date" value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]" />
                <select value={form.month} onChange={e => setForm(f => ({...f, month: e.target.value}))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]">
                  {MONTHS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.camp_type} onChange={e => setForm(f => ({...f, camp_type: e.target.value}))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]">
                  {['Prospect','Elite','Youth','Pitching','Team Camp','Showcase'].map(t => <option key={t}>{t}</option>)}
                </select>
                <input placeholder="Cost (e.g. $250)" value={form.cost} onChange={e => setForm(f => ({...f, cost: e.target.value}))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Grad Years (e.g. 2027-2031)" value={form.grad_years} onChange={e => setForm(f => ({...f, grad_years: e.target.value}))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]" />
                <select value={form.source} onChange={e => setForm(f => ({...f, source: e.target.value}))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]">
                  {['Ryzer','ACTIVE','Exact'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <input placeholder="Registration Link" value={form.registration_link} onChange={e => setForm(f => ({...f, registration_link: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9971c]" />
              <button type="submit" className="w-full bg-[#0f2044] text-white font-bold py-2.5 rounded-lg hover:bg-[#1a3060] transition">
                Add Camp + Trigger Alerts
              </button>
            </form>
          </div>

          {/* Camp list + alerts */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-[#0f2044] mb-3">Camps ({camps.length})</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {camps.map(c => (
                  <div key={c.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="font-medium">{c.school_name}</span>
                      <span className="text-gray-500 ml-1.5">— {c.camp_name}</span>
                    </div>
                    <span className="text-gray-400 text-xs ml-2 whitespace-nowrap">{c.start_date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-[#0f2044] mb-3">Alert Log ({alertLog.length})</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {alertLog.length === 0 ? (
                  <p className="text-gray-400 text-sm">No alerts yet</p>
                ) : alertLog.map(a => (
                  <div key={a.id} className="text-sm py-1.5 border-b border-gray-100 last:border-0">
                    <span className={`inline-block text-xs font-bold px-1.5 py-0.5 rounded mr-2 ${a.type === 'instant' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {a.type}
                    </span>
                    <span className="text-gray-600">{a.school_name} — {a.camp_name}</span>
                    <span className="text-gray-400 text-xs ml-2">{a.sent_at}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
