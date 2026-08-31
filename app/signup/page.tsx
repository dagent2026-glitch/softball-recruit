'use client';
import Link from 'next/link';

export default function SignupChooserPage() {
  return (
    <div className="min-h-screen bg-[#18181b] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto mb-4 text-white"><path d="M50 85 L25 60 L25 40 L75 40 L75 60 Z" fill="transparent" /><path d="M35 25 Q50 10 65 25" stroke="#d9f99d" /><path d="M25 15 Q50 -5 75 15" stroke="#d9f99d" opacity="0.5"/></svg></Link>
          <h1 className="text-3xl font-bold text-white mt-2">Create Your Account</h1>
          <p className="text-white/60 text-sm mt-1">First, tell us who you are — the two experiences are different.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/signup/player"
            className="group bg-white rounded-2xl shadow-2xl p-6 hover:ring-2 hover:ring-[#d9f99d] transition flex flex-col">
            <span className="text-3xl mb-2">🥎</span>
            <h2 className="text-lg font-bold text-[#18181b] mb-1">I&apos;m a Player</h2>
            <p className="text-sm text-gray-500 mb-4 flex-1">
              Build a recruiting profile — position, grad year, target schools — and get instant alerts when your target schools post camps.
            </p>
            <span className="inline-block bg-[#18181b] group-hover:bg-black text-white font-semibold text-sm px-4 py-2.5 rounded-lg text-center">
              Sign Up as Player →
            </span>
          </Link>

          <Link href="/coach/signup"
            className="group bg-white rounded-2xl shadow-2xl p-6 hover:ring-2 hover:ring-[#d9f99d] transition flex flex-col">
            <span className="text-3xl mb-2">🏆</span>
            <h2 className="text-lg font-bold text-[#18181b] mb-1">I&apos;m a Coach / Mentor</h2>
            <p className="text-sm text-gray-500 mb-4 flex-1">
              Create a team, share a join code with your players, and see everyone&apos;s target school priorities in one place. No player profile fields — just your team.
            </p>
            <span className="inline-block bg-[#18181b] group-hover:bg-black text-white font-semibold text-sm px-4 py-2.5 rounded-lg text-center">
              Sign Up as Coach →
            </span>
          </Link>
        </div>

        <p className="text-center text-sm text-white/50 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-[#d9f99d] font-semibold hover:underline">Player login</Link>
          {' · '}
          <Link href="/coach/login" className="text-[#d9f99d] font-semibold hover:underline">Coach login</Link>
        </p>
      </div>
    </div>
  );
}
