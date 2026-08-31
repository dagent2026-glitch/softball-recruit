export type SchedulableCamp = {
  id: number;
  school_name: string;
  start_date: string | null;
  end_date: string | null;
};

/**
 * Weighted interval scheduling: given camps (each with a date range and a
 * weight) picks the subset with the highest total weight such that no two
 * selected camps overlap in date. This is a classic DP with an exact,
 * provably-optimal solution — not a heuristic.
 *
 * Weight per camp = priority rank of its school in targetSchools (highest
 * priority = highest weight). Camps at schools not in targetSchools are
 * excluded entirely, since the point of this generator is an optimal plan
 * for the athlete's stated priorities, not a general camp browser.
 */
export function generateOptimalSchedule(camps: SchedulableCamp[], targetSchools: string[]): number[] {
  const priorityIndex = new Map<string, number>();
  targetSchools.forEach((school, i) => priorityIndex.set(school.toLowerCase(), i));

  type Job = { id: number; start: number; end: number; weight: number };
  const jobs: Job[] = [];
  for (const camp of camps) {
    if (!camp.start_date || !camp.end_date) continue;
    const a = Date.parse(camp.start_date);
    const b = Date.parse(camp.end_date);
    if (Number.isNaN(a) || Number.isNaN(b)) continue;
    // Some seeded camps have start/end swapped (data-entry bug upstream) —
    // normalize rather than trust field order.
    const start = Math.min(a, b);
    const end = Math.max(a, b);
    const rank = priorityIndex.get(camp.school_name.toLowerCase());
    if (rank === undefined) continue; // not a target school — excluded
    jobs.push({ id: camp.id, start, end, weight: targetSchools.length - rank });
  }

  jobs.sort((a, b) => a.end - b.end);
  const n = jobs.length;
  if (n === 0) return [];

  // p[i] = index of the latest job that ends before job i starts (or -1)
  const p: number[] = jobs.map((job, i) => {
    for (let j = i - 1; j >= 0; j--) {
      if (jobs[j].end < job.start) return j;
    }
    return -1;
  });

  const dp: number[] = new Array(n).fill(0);
  dp[0] = jobs[0].weight;
  for (let i = 1; i < n; i++) {
    const withJob = jobs[i].weight + (p[i] >= 0 ? dp[p[i]] : 0);
    dp[i] = Math.max(dp[i - 1], withJob);
  }

  const selected: number[] = [];
  let i = n - 1;
  while (i >= 0) {
    const withJob = jobs[i].weight + (p[i] >= 0 ? dp[p[i]] : 0);
    const withoutJob = i > 0 ? dp[i - 1] : 0;
    if (withJob >= withoutJob) {
      selected.push(jobs[i].id);
      i = p[i];
    } else {
      i--;
    }
  }

  return selected;
}

/** Two camps conflict if their date ranges overlap (inclusive). */
export function campsOverlap(a: { start_date: string | null; end_date: string | null }, b: { start_date: string | null; end_date: string | null }): boolean {
  if (!a.start_date || !a.end_date || !b.start_date || !b.end_date) return false;
  const aRaw1 = Date.parse(a.start_date), aRaw2 = Date.parse(a.end_date);
  const bRaw1 = Date.parse(b.start_date), bRaw2 = Date.parse(b.end_date);
  if ([aRaw1, aRaw2, bRaw1, bRaw2].some(Number.isNaN)) return false;
  // Normalize in case start/end are swapped in the source data.
  const aStart = Math.min(aRaw1, aRaw2), aEnd = Math.max(aRaw1, aRaw2);
  const bStart = Math.min(bRaw1, bRaw2), bEnd = Math.max(bRaw1, bRaw2);
  return aStart <= bEnd && bStart <= aEnd;
}
