import { sql } from './db';

export async function checkAlertsForCamp(campId: number): Promise<number> {
  const camps = await sql`SELECT * FROM camps WHERE id = ${campId}`;
  if (camps.length === 0) return 0;
  const camp = camps[0];

  const athletes = await sql`SELECT * FROM athletes`;
  let alertCount = 0;

  for (const athlete of athletes) {
    const targetSchools: string[] = JSON.parse(athlete.target_schools || '[]');
    const targetDivisions: string[] = JSON.parse(athlete.target_divisions || '[]');
    const targetRegions: string[] = JSON.parse(athlete.target_regions || '[]');

    let matched = false;
    let alertType = 'digest';

    if (targetSchools.length > 0 && targetSchools.some((s: string) => s.toLowerCase() === camp.school_name.toLowerCase())) {
      matched = true;
      alertType = 'instant';
    }
    if (!matched) {
      const divMatch = targetDivisions.length === 0 || targetDivisions.includes(camp.division);
      const regMatch = targetRegions.length === 0 || targetRegions.includes(camp.region);
      if (divMatch && regMatch) { matched = true; alertType = 'digest'; }
    }

    if (matched) {
      const existing = await sql`SELECT id FROM alerts WHERE athlete_id = ${athlete.id} AND camp_id = ${campId}`;
      if (existing.length === 0) {
        await sql`INSERT INTO alerts (athlete_id, camp_id, type) VALUES (${athlete.id}, ${campId}, ${alertType})`;
        console.log(`[ALERT] ${alertType.toUpperCase()} → ${athlete.email} | ${camp.school_name} — ${camp.camp_name}`);
        alertCount++;
      }
    }
  }
  return alertCount;
}

export async function checkAllAlerts(): Promise<number> {
  const camps = await sql`SELECT id FROM camps`;
  let total = 0;
  for (const { id } of camps) total += await checkAlertsForCamp(id);
  return total;
}

export async function getAthleteAlerts(athleteId: number) {
  return sql`SELECT a.*, c.school_name, c.camp_name, c.start_date, c.camp_type, c.registration_link
    FROM alerts a JOIN camps c ON c.id = a.camp_id
    WHERE a.athlete_id = ${athleteId} ORDER BY a.sent_at DESC`;
}
