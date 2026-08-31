'use client';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center px-4">
        <p className="text-white">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Optionally, make an API call here to validate the token upfront
      // For now, we'll assume the token might be valid and proceed with the form
      setTokenValid(true);
    }
    setInitialCheckComplete(true);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Invalid or missing token.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }

      setMessage(data.message || 'Your password has been reset successfully. You can now log in.');
      // Optionally redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!initialCheckComplete) {
    return (
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center px-4">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-[#18181b] mt-2">Invalid Token</h1>
          <p className="text-gray-500 text-sm mt-1">The password reset link is invalid or has expired.</p>
          <p className="text-center text-sm text-gray-500 mt-6">
            <Link href="/forgot-password" className="text-[#d9f99d] font-semibold hover:underline">Request a new reset link</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18181b] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto mb-4"><path d="M50 85 L25 60 L25 40 L75 40 L75 60 Z" fill="transparent" stroke="#18181b" /><path d="M35 25 Q50 10 65 25" stroke="#d9f99d" /><path d="M25 15 Q50 -5 75 15" stroke="#d9f99d" opacity="0.5"/></svg></Link>
          <h1 className="text-2xl font-bold text-[#18181b] mt-2">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your new password.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password" required
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password" required
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]"
            />
          </div>
          {message && <p className="text-green-600 text-sm">{message}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-[#18181b] hover:bg-[#1a3060] text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password →'}
          </button>
        </form>
      </div>
    </div>
  );
}
