'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';

type UserPlan = {
  subscription_status: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
};

function isPro(plan: UserPlan | null): boolean {
  if (!plan) return false;
  if (plan.subscription_status === 'active') return true;
  if (plan.subscription_status === 'trialing' && plan.trial_ends_at) {
    return new Date(plan.trial_ends_at) > new Date();
  }
  return false;
}

export default function PricingPage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' }).then(r => {
      if (r.ok) {
        setAuthed(true);
        return r.json();
      }
      setAuthed(false);
      return null;
    }).then(data => {
      if (data) {
        setUserPlan({
          subscription_status: data.subscription_status || 'free',
          trial_started_at: data.trial_started_at || null,
          trial_ends_at: data.trial_ends_at || null,
        });
      }
    });
  }, []);

  const handleCheckout = async () => {
    if (!authed) {
      router.push('/signup');
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: billingPeriod }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setCheckoutLoading(false);
    }
  };

  const pro = isPro(userPlan);
  const hasHadTrial = !!userPlan?.trial_started_at;
  const ctaLabel = pro
    ? 'Current Plan ✓'
    : hasHadTrial
    ? 'Upgrade Now →'
    : 'Start 7-Day Free Trial →';

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#18181b] mb-3">
            Upgrade to RecruitRadar Pro
          </h1>
          <p className="text-lg text-gray-500">
            Never miss a camp at your target schools
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-200 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition ${billingPeriod === 'monthly' ? 'bg-white text-[#18181b] shadow' : 'text-gray-500'}`}>
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 ${billingPeriod === 'annual' ? 'bg-white text-[#18181b] shadow' : 'text-gray-500'}`}>
              Annual
              <span className="bg-[#d9f99d] text-[#18181b] text-xs font-bold px-2 py-0.5 rounded-full">Save 32%</span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">

          {/* Free card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#18181b] mb-1">Free</h2>
              <div className="text-4xl font-extrabold text-[#18181b]">$0</div>
              <div className="text-gray-400 text-sm mt-1">Forever free</div>
            </div>
            <ul className="space-y-3 mb-8 text-sm text-gray-600">
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Browse all camps</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> See camp details (dates, location, type)</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Filter by region, division, type</li>
              <li className="flex items-center gap-2"><span className="text-gray-300">✗</span> <span className="text-gray-400">Registration links</span></li>
              <li className="flex items-center gap-2"><span className="text-gray-300">✗</span> <span className="text-gray-400">Camp alerts</span></li>
            </ul>
            {!authed ? (
              <Link href="/signup"
                className="block w-full text-center border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-300 transition">
                Sign Up Free
              </Link>
            ) : (
              <button disabled
                className="block w-full text-center border-2 border-gray-200 text-gray-400 font-semibold py-3 rounded-xl cursor-default">
                {pro ? 'Free Plan' : 'Current Plan'}
              </button>
            )}
          </div>

          {/* Pro card */}
          <div className="bg-[#18181b] rounded-2xl border border-[#18181b] p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-[#d9f99d] text-[#18181b] text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Pro</h2>
              <div className="text-4xl font-extrabold text-white">
                {billingPeriod === 'annual' ? '$64.99' : '$7.99'}
              </div>
              <div className="text-gray-400 text-sm mt-1">
                {billingPeriod === 'annual' ? 'per year — just $5.42/mo' : 'per month'}
              </div>
            </div>
            <ul className="space-y-3 mb-8 text-sm text-gray-300">
              <li className="flex items-center gap-2"><span className="text-[#d9f99d]">✓</span> Everything in Free</li>
              <li className="flex items-center gap-2"><span className="text-[#d9f99d]">✓</span> <span>🔓 Registration links unlocked</span></li>
              <li className="flex items-center gap-2"><span className="text-[#d9f99d]">✓</span> <span>🔔 Instant alerts when target schools post camps</span></li>
              <li className="flex items-center gap-2"><span className="text-[#d9f99d]">✓</span> <span>📧 Weekly camp digest</span></li>
              <li className="flex items-center gap-2"><span className="text-[#d9f99d]">✓</span> <span>🎯 Personalized matched feed</span></li>
            </ul>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || pro}
              className="block w-full text-center bg-[#d9f99d] hover:bg-[#bef264] text-[#18181b] font-bold py-3 rounded-xl transition disabled:opacity-60 disabled:cursor-default">
              {checkoutLoading ? 'Redirecting...' : ctaLabel}
            </button>
            {!hasHadTrial && !pro && (
              <p className="text-center text-gray-400 text-xs mt-3">7-day free trial • No credit card required</p>
            )}
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm">
          Questions? <Link href="mailto:hello@recruitradar.com" className="text-[#18181b] hover:underline">Contact us</Link> · Cancel anytime from your account settings.
        </p>
      </div>
    </div>
  );
}
