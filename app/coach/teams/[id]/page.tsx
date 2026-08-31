'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import CoachNav from '@/components/CoachNav';

type Athlete = {
  id: number;
  name: string;
  graduation_year: number | null;
  primary_position: string | null;
  high_school: string | null;
  joined_at: string;
  target_schools: string[];
};

type Team = { id: number; name: string; join_code: string; coach_invite_code: string };
type CoachEntry = { id: number; name: string; role: 'owner' | 'assistant' };

export default function CoachTeamRosterPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;

  const [coachName, setCoachName] = useState('');
  const [team, setTeam] = useState<Team | null>(null);
  const [coaches, setCoaches] = useState<CoachEntry[]>([]);
  const [roster, setRoster] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/coach/me', { cache: 'no-store', credentials: 'include' }).then(async r => {
      if (!r.ok) { router.push('/coach/login'); return; }
      const data = await r.json();
      setCoachName(data.coach.name);
    });

    fetch(`/api/coach/teams/${teamId}/roster`, { cache: 'no-store', credentials: 'include' }).then(async r => {
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'Could not load roster'); setLoading(false); return; }
      setTeam(data.team);
      setCoaches(data.coaches || []);
      setRoster(data.roster);
      setLoading(false);
    });
  }, [router, teamId]);

  if (loading) return (
    <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachNav coachName={coachName} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/coach/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Back to Teams</Link>

        {error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 mt-4">
            <p className="text-gray-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-6 mt-2">
              <h1 className="text-2xl font-bold text-[#18181b]">{team?.name}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {roster.length} player{roster.length === 1 ? '' : 's'} · player join code <span className="font-mono font-semibold">{team?.join_code}</span>
                {' · '}coach invite code <span className="font-mono font-semibold">{team?.coach_invite_code}</span>
              </p>
              {coaches.length > 0 && (
                <p className="text-gray-500 text-sm mt-2">
                  <span className="font-semibold text-gray-600">Coaching staff:</span>{' '}
                  {coaches.map((c, i) => (
                    <span key={c.id}>
                      {c.name}{c.role === 'owner' ? ' (Owner)' : ''}{i < coaches.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              )}
            </div>

            {roster.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-gray-500">No players have joined yet.</p>
                <p className="text-gray-400 text-sm mt-1">Share the join code above to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {roster.map(athlete => (
                  <div key={athlete.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-baseline justify-between mb-1">
                      <h2 className="text-lg font-bold text-[#18181b]">{athlete.name}</h2>
                      {athlete.graduation_year ? (
                        <span className="text-xs text-gray-500">Class of {athlete.graduation_year}</span>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {[athlete.primary_position, athlete.high_school].filter(Boolean).join(' · ') || 'No profile details yet'}
                    </p>

                    {athlete.target_schools.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No target schools selected yet.</p>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Target Schools — by priority</p>
                        <div className="flex flex-col gap-1.5">
                          {athlete.target_schools.map((school, i) => (
                            <div key={school} className="bg-[#18181b] text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                              <span className="text-[#d9f99d] font-bold w-4 text-center shrink-0">{i + 1}</span>
                              <span>{school}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
