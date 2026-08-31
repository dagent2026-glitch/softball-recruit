'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CoachNav from '@/components/CoachNav';

type Team = {
  id: number;
  name: string;
  join_code: string;
  coach_invite_code: string;
  member_count: number;
  coach_count: number;
  role: 'owner' | 'assistant';
  created_at: string;
};

export default function CoachDashboardPage() {
  const router = useRouter();
  const [coachName, setCoachName] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const loadTeams = () => fetch('/api/coach/me', { cache: 'no-store', credentials: 'include' }).then(async r => {
    if (!r.ok) { router.push('/coach/login'); return; }
    const data = await r.json();
    setCoachName(data.coach.name);
    setTeams(data.teams);
    setLoading(false);
  });

  useEffect(() => { loadTeams(); }, [router]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/coach/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not create team'); return; }
      setTeams(t => [data.team, ...t]);
      setNewTeamName('');
    } catch {
      setError('Something went wrong');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinAsAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setJoining(true);
    setJoinError('');
    try {
      const res = await fetch('/api/coach/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) { setJoinError(data.error || 'Could not join team'); return; }
      setInviteCode('');
      await loadTeams();
    } catch {
      setJoinError('Something went wrong');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveTeam = async (teamId: number) => {
    await fetch(`/api/coach/teams/${teamId}/leave`, { method: 'POST' });
    setTeams(t => t.filter(team => team.id !== teamId));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 1500);
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachNav coachName={coachName} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#18181b]">Your Teams</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create a team, share the join code with your players, and see everyone&apos;s target school priorities in one place.
          </p>
        </div>

        <form onSubmit={handleCreateTeam} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Create a new team</label>
          <div className="flex gap-2">
            <input
              type="text" placeholder="e.g. Cherokee Lady Warriors Gold"
              value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9f99d]"
            />
            <button type="submit" disabled={creating || !newTeamName.trim()}
              className="bg-[#18181b] hover:bg-[#1a3060] text-white font-bold px-6 py-3 rounded-lg transition disabled:opacity-50 whitespace-nowrap">
              {creating ? 'Creating...' : '+ Create'}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </form>

        <form onSubmit={handleJoinAsAssistant} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Join an existing team as an assistant coach</label>
          <p className="text-xs text-gray-500 mb-2">Ask the head coach for their team&apos;s coach invite code (not the player join code).</p>
          <div className="flex gap-2">
            <input
              type="text" placeholder="Enter coach invite code" value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#d9f99d]"
            />
            <button type="submit" disabled={joining || !inviteCode.trim()}
              className="bg-[#18181b] hover:bg-[#1a3060] text-white font-bold px-6 py-3 rounded-lg transition disabled:opacity-50 whitespace-nowrap">
              {joining ? 'Joining...' : 'Join Team'}
            </button>
          </div>
          {joinError && <p className="text-red-600 text-sm mt-2">{joinError}</p>}
        </form>

        {teams.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gray-500">No teams yet — create one above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map(team => (
              <div key={team.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#18181b]">{team.name}</h2>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${team.role === 'owner' ? 'bg-[#d9f99d] text-[#18181b]' : 'bg-gray-100 text-gray-600'}`}>
                      {team.role === 'owner' ? 'Owner' : 'Assistant'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {team.member_count} player{team.member_count === 1 ? '' : 's'} · {team.coach_count} coach{team.coach_count === 1 ? '' : 'es'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Player join code:</span>
                    <button onClick={() => copyCode(team.join_code)}
                      className="font-mono font-bold text-sm bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-400 transition"
                      title="Click to copy">
                      {team.join_code}
                    </button>
                    {copiedCode === team.join_code && <span className="text-xs text-lime-700">Copied!</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Coach invite code:</span>
                    <button onClick={() => copyCode(team.coach_invite_code)}
                      className="font-mono font-bold text-sm bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-400 transition"
                      title="Click to copy">
                      {team.coach_invite_code}
                    </button>
                    {copiedCode === team.coach_invite_code && <span className="text-xs text-lime-700">Copied!</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link href={`/coach/teams/${team.id}`}
                    className="inline-block bg-[#d9f99d] hover:bg-[#bef264] text-[#18181b] font-semibold text-sm px-4 py-2 rounded-lg transition">
                    View Roster & Priorities →
                  </Link>
                  {team.role === 'assistant' && (
                    <button type="button" onClick={() => handleLeaveTeam(team.id)}
                      className="text-xs text-red-600 hover:underline">Leave team</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
