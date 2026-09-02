'use client';
import Link from 'next/link';

const Logo = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8"
    strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M50 85 L25 60 L25 40 L75 40 L75 60 Z" fill="transparent" stroke="#18181b" />
    <path d="M35 25 Q50 10 65 25" stroke="#d9f99d" />
    <path d="M25 15 Q50 -5 75 15" stroke="#d9f99d" opacity="0.5" />
  </svg>
);

export default function CoachNav({ coachName }: { coachName?: string }) {
  const logout = async () => {
    await fetch('/api/coach/logout', { method: 'POST' });
    window.location.href = '/coach/login';
  };

  return (
    <nav className="bg-[#18181b] text-white px-6 py-4 flex items-center justify-between">
      <Link href="/coach/dashboard" className="flex items-center gap-2">
        <Logo />
        <span className="font-bold text-lg">
          Recruit<span className="text-[#d9f99d]">Radar</span>
        </span>
        <span className="text-xs text-white/50 border border-white/20 rounded-full px-2 py-0.5 ml-1">Coach</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/coach/camps" className="text-sm text-white/60 hover:text-white transition">
          Camps
        </Link>
        {coachName && <span className="text-sm text-white/60">{coachName}</span>}
        <button onClick={logout} className="text-sm text-white/60 hover:text-white transition">
          Log out
        </button>
      </div>
    </nav>
  );
}
