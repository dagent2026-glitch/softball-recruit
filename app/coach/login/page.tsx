import { redirect } from 'next/navigation';

// Login is now unified at /login with a Player/Coach toggle (coach
// pre-selected via the query param) — kept as a redirect so existing
// links/bookmarks to /coach/login still work.
export default function CoachLoginRedirect() {
  redirect('/login?type=coach');
}
