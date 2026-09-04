import { sql } from './db';
import { dispatcher } from './dispatcher';

// Resend's free-tier account this app uses is capped at 100 emails/day.
// A single run matching many athletes against many new camps can easily
// exceed that in one burst (a production catch-up run once sent 200+ in
// under a minute). Capping how many emails one run will actually send
// keeps any single run from blowing through the daily quota by itself.
const MAX_EMAILS_PER_RUN = 80;

// Shared by checkAlertsForCamp (one new camp, e.g. from the admin panel) and
// checkAllAlerts (every camp, e.g. the scraper's post-sync catch-up run).
// 'instant' matches (an athlete's exact target school) each send as their
// own email, since each is meant to read as urgent. 'digest' matches
// (broader division/region overlap) are collected per athlete across every
// camp in this call and sent as a single combined email — sending one
// email per camp here previously flooded athletes who matched many camps
// in one run.
//
// Matching happens in a first pass with nothing sent or recorded yet, so
// the total planned email count is known before anything goes out. Only
// the first MAX_EMAILS_PER_RUN of those actually send + get an alerts row;
// anything beyond the cap is left completely unrecorded, so it's picked up
// automatically on the next run instead of being silently lost.
async function checkAlertsForCamps(campIds: number[]): Promise<number> {
  if (campIds.length === 0) return 0;
  const camps = await sql`SELECT * FROM camps WHERE id = ANY(${campIds})`;
  if (camps.length === 0) return 0;

  const athletes = await sql`SELECT * FROM athletes`;

  type InstantMatch = { athlete: any; camp: any };
  const instantMatches: InstantMatch[] = [];
  const digestByAthlete = new Map<number, { athlete: any; camps: any[] }>();

  for (const camp of camps) {
    for (const athlete of athletes) {
      const targetSchools: string[] = JSON.parse(athlete.target_schools || '[]');
      const targetDivisions: string[] = JSON.parse(athlete.target_divisions || '[]');
      const targetRegions: string[] = JSON.parse(athlete.target_regions || '[]');

      let matched = false;
      let alertType: 'instant' | 'digest' = 'digest';

      if (targetSchools.length > 0 && targetSchools.some((s: string) => s.toLowerCase() === camp.school_name.toLowerCase())) {
        matched = true;
        alertType = 'instant';
      }
      if (!matched) {
        const divMatch = targetDivisions.length === 0 || targetDivisions.includes(camp.division);
        const regMatch = targetRegions.length === 0 || targetRegions.includes(camp.region);
        if (divMatch && regMatch) { matched = true; alertType = 'digest'; }
      }

      if (!matched) continue;

      const existing = await sql`SELECT id FROM alerts WHERE athlete_id = ${athlete.id} AND camp_id = ${camp.id}`;
      if (existing.length > 0) continue;

      if (alertType === 'instant') {
        instantMatches.push({ athlete, camp });
      } else {
        if (!digestByAthlete.has(athlete.id)) digestByAthlete.set(athlete.id, { athlete, camps: [] });
        digestByAthlete.get(athlete.id)!.camps.push(camp);
      }
    }
  }

  const digestGroups = [...digestByAthlete.values()];
  const totalPlanned = instantMatches.length + digestGroups.length;
  if (totalPlanned > MAX_EMAILS_PER_RUN) {
    console.warn(`[ALERTS] ${totalPlanned} email(s) matched this run, capping at ${MAX_EMAILS_PER_RUN}; the rest will be picked up on the next run`);
  }

  let sent = 0;
  let alertCount = 0;

  // An alert row is only written once the send is confirmed to have
  // actually gone out — a failed send (e.g. hitting Resend's daily quota)
  // is left unrecorded so it's retried on a later run instead of being
  // silently and permanently marked as delivered.
  for (const { athlete, camp } of instantMatches) {
    if (sent >= MAX_EMAILS_PER_RUN) break;
    sent++;
    const delivered = await dispatcher.send(athlete, camp, 'instant').catch(e => { console.error("Dispatcher failed:", e); return false; });
    if (!delivered) continue;
    await sql`INSERT INTO alerts (athlete_id, camp_id, type) VALUES (${athlete.id}, ${camp.id}, 'instant')`;
    alertCount++;
    console.log(`[ALERT] INSTANT → ${athlete.email} | ${camp.school_name} — ${camp.camp_name}`);
  }

  for (const { athlete, camps: matchedCamps } of digestGroups) {
    if (sent >= MAX_EMAILS_PER_RUN) break;
    sent++;
    const delivered = await dispatcher.sendDigest(athlete, matchedCamps).catch(e => { console.error("Digest dispatch failed:", e); return false; });
    if (!delivered) continue;
    for (const camp of matchedCamps) {
      await sql`INSERT INTO alerts (athlete_id, camp_id, type) VALUES (${athlete.id}, ${camp.id}, 'digest')`;
      alertCount++;
    }
    console.log(`[ALERT] DIGEST → ${athlete.email} | ${matchedCamps.length} camp(s)`);
  }

  return alertCount;
}

export async function checkAlertsForCamp(campId: number): Promise<number> {
  return checkAlertsForCamps([campId]);
}

export async function checkAllAlerts(): Promise<number> {
  const camps = await sql`SELECT id FROM camps`;
  return checkAlertsForCamps(camps.map((c: any) => c.id));
}

export async function getAthleteAlerts(athleteId: number) {
  return sql`SELECT a.*, c.school_name, c.camp_name, c.start_date, c.camp_type, c.registration_link
    FROM alerts a JOIN camps c ON c.id = a.camp_id
    WHERE a.athlete_id = ${athleteId} ORDER BY a.sent_at DESC`;
}
