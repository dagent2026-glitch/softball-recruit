'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-[#0f2044] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥎</span>
          <span className="text-xl font-bold tracking-tight">RecruitRadar</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-white/80 hover:text-white transition">Log In</Link>
          <Link href="/signup" className="bg-[#c9971c] hover:bg-[#f0b429] text-white font-semibold text-sm px-4 py-2 rounded-lg transition">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#0f2044] text-white pt-20 pb-28 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-[#c9971c]/20 border border-[#c9971c]/40 text-[#f0b429] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            🔔 Never Miss a Camp Again
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            College Softball<br />Camp Intelligence
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Get instant alerts the moment your target schools post new prospect camps.
            Build your profile, pick your schools, and let us do the watching.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-[#c9971c] hover:bg-[#f0b429] text-white font-bold text-lg px-8 py-4 rounded-xl transition shadow-lg">
              Create Free Profile →
            </Link>
            <Link href="/camps" className="bg-white/10 hover:bg-white/20 text-white font-semibold text-lg px-8 py-4 rounded-xl transition border border-white/20">
              Browse All Camps
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-[#c9971c] text-white py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          {[['120+', 'Camps Listed'], ['50+', 'D1 Programs'], ['Power 4', '& Mid Major'], ['Instant', 'Alert System']].map(([val, label]) => (
            <div key={label}>
              <div className="text-2xl font-extrabold">{val}</div>
              <div className="text-sm text-white/80">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#0f2044] mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '👤', title: 'Build Your Profile', desc: 'Enter your position, graduation year, and recruiting preferences — including every school you\'re interested in.' },
              { step: '2', icon: '🎯', title: 'Set Your Targets', desc: 'Select target schools, conferences, divisions, and regions. Even target specific programs by name.' },
              { step: '3', icon: '🔔', title: 'Get Instant Alerts', desc: 'The moment a school you\'re tracking posts a new camp, you get notified. No more manually checking 50 websites.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="text-4xl mb-4">{icon}</div>
                <div className="w-8 h-8 bg-[#0f2044] text-white text-sm font-bold rounded-full flex items-center justify-center mx-auto mb-3">{step}</div>
                <h3 className="font-bold text-lg text-[#0f2044] mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Positions */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#0f2044] mb-4">Built for Every Position</h2>
          <p className="text-gray-600 mb-10">Filter camps by your position so you only see what matters to you.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Pitcher', 'Catcher', '1st Base', '2nd Base', '3rd Base', 'Shortstop', 'Middle Infield', 'Corner Infield', 'Outfield', 'Utility'].map(pos => (
              <span key={pos} className="bg-[#0f2044] text-white text-sm font-medium px-4 py-2 rounded-full">{pos}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#0f2044] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4">Ready to take control of your recruiting?</h2>
          <p className="text-white/70 text-lg mb-8">Free to start. No credit card required.</p>
          <Link href="/signup" className="bg-[#c9971c] hover:bg-[#f0b429] text-white font-bold text-xl px-10 py-5 rounded-xl transition shadow-xl inline-block">
            Create Your Free Profile →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>🥎</span>
          <span className="font-bold text-white">RecruitRadar</span>
        </div>
        <p>College Softball Camp Intelligence Platform</p>
      </footer>
    </div>
  );
}
