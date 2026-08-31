'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function CoachSignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/coach/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      window.location.href = '/coach/dashboard';
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#18181b] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto mb-4"><path d="M50 85 L25 60 L25 40 L75 40 L75 60 Z" fill="transparent" stroke="#18181b" /><path d="M35 25 Q50 10 65 25" stroke="#d9f99d" /><path d="M25 15 Q50 -5 75 15" stroke="#d9f99d" opacity="0.5"/></svg></Link>
          <h1 className="text-2xl font-bold text-[#18181b] mt-2">Coach / Facilitator Sign Up</h1>
          <p className="text-gray-500 text-sm mt-1">Create teams, share a join code, see your players&apos; target school priorities</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text" required placeholder="Coach Smith"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" required placeholder="coach@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" required placeholder="At least 8 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-[#18181b] hover:bg-[#1a3060] text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Coach Account →'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have a coach account?{' '}
          <Link href="/coach/login" className="text-lime-700 font-semibold hover:underline">Log in</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Athlete? <Link href="/signup" className="text-lime-700 font-semibold hover:underline">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}
