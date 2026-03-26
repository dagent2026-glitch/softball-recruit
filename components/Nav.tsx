'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Logo = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8"
    strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M50 85 L25 60 L25 40 L75 40 L75 60 Z" fill="transparent" stroke="#18181b" />
    <path d="M35 25 Q50 10 65 25" stroke="#d9f99d" />
    <path d="M25 15 Q50 -5 75 15" stroke="#d9f99d" opacity="0.5" />
  </svg>
);

export default function Nav() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <nav className="bg-[#18181b] text-white px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Logo />
        <span className="font-bold text-lg">
          Recruit<span className="text-[#d9f99d]">Radar</span>
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {/* Don't render anything until auth is known — prevents flash */}
        {authed === null ? null : authed ? (
          <>
            <Link href="/camps" className="text-sm text-white/80 hover:text-white transition">
              My Camps
            </Link>
            <Link href="/profile"
              className="text-sm font-semibold text-[#18181b] bg-[#d9f99d] hover:bg-[#bef264] px-4 py-2 rounded-lg transition">
              Account & Settings
            </Link>
            <button onClick={logout} className="text-sm text-white/60 hover:text-white transition">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm text-white/80 hover:text-white transition">
              Log In
            </Link>
            <Link href="/signup"
              className="bg-[#d9f99d] hover:bg-[#bef264] text-[#18181b] font-semibold text-sm px-4 py-2 rounded-lg transition">
              Sign Up Free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
