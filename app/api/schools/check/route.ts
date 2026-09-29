import { NextRequest, NextResponse } from 'next/server';
import { D1_SCHOOLS, normalizeSchoolName } from '@/lib/schools';

// Lets the scraper (a separate project) validate camp school names against
// the same normalization RecruitRadar itself uses for matching, without
// duplicating D1_SCHOOLS or normalizeSchoolName into that codebase — a
// duplicated copy is exactly the kind of thing that silently drifts and
// causes the mismatch bugs this endpoint exists to catch early.
const normalizedSchools = new Set(D1_SCHOOLS.map(normalizeSchoolName));

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const names: string[] = Array.isArray(body.names) ? body.names : [];

  const unmatched = names.filter(n => typeof n === 'string' && !normalizedSchools.has(normalizeSchoolName(n)));

  return NextResponse.json({ checked: names.length, unmatched });
}
