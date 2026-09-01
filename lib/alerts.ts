import { sql } from './db';
import { dispatcher } from './dispatcher';

// Shared by checkAlertsForCamp (one new camp, e.g. from the admin panel) and
// checkAllAlerts (every camp, e.g. the scraper's post-sync catch-up run).
// 'instant' matches (an athlete's exact target school) send immediately,
// one email per camp, since each is meant to read as urgent. 'digest'
// matches (broader division/region overlap) are collected per athlete
// across every camp in this call and sent as a single combined email —
// sending one email per camp here previously flooded athletes who matched
// many camps in one run.
async function checkAlertsForCamps(campIds: number[]): Promise<number> {
  if (campIds.length === 0) return 0;
  const camps = await sql`SELECT * FROM camps WHERE id = ANY(${campIds})`;
  if (camps.length === 0) return 0;

  const athletes = await sql`SELECT * FROM athletes`;
  let alertCount = 0;
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

      await sql`INSERT INTO alerts (athlete_id, camp_id, type) VALUES (${athlete.id}, ${camp.id}, ${alertType})`;
      alertCount++;
      console.log(`[ALERT] ${alertType.toUpperCase()} → ${athlete.email} | ${camp.school_name} — ${camp.camp_name}`);

      if (alertType === 'instant') {
        await dispatcher.send(athlete, camp, 'instant').catch(e => console.error("Dispatcher failed:", e));
      } else {
        if (!digestByAthlete.has(athlete.id)) digestByAthlete.set(athlete.id, { athlete, camps: [] });
        digestByAthlete.get(athlete.id)!.camps.push(camp);
      }
    }
  }

  for (const { athlete, camps: matchedCamps } of digestByAthlete.values()) {
    await dispatcher.sendDigest(athlete, matchedCamps).catch(e => console.error("Digest dispatch failed:", e));
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
