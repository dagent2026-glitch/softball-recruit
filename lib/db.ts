import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export { sql };

// Initialize schema on first use
let initialized = false;

export async function initDb() {
  if (initialized) return;
  initialized = true;

  await sql`
    CREATE TABLE IF NOT EXISTS athletes (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      birthdate TEXT,
      graduation_year INTEGER,
      high_school TEXT,
      travel_team TEXT,
      is_pitcher INTEGER DEFAULT 0,
      is_catcher INTEGER DEFAULT 0,
      primary_position TEXT,
      is_hitter INTEGER DEFAULT 0,
      bats TEXT DEFAULT 'Right',
      target_divisions TEXT DEFAULT '[]',
      target_conferences TEXT DEFAULT '[]',
      target_regions TEXT DEFAULT '[]',
      target_schools TEXT DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS camps (
      id SERIAL PRIMARY KEY,
      school_name TEXT NOT NULL,
      camp_name TEXT NOT NULL,
      division TEXT,
      conference TEXT,
      region TEXT,
      state TEXT,
      city TEXT,
      start_date TEXT,
      end_date TEXT,
      month TEXT,
      camp_type TEXT,
      cost TEXT,
      grad_years TEXT,
      position_focus TEXT,
      registration_link TEXT,
      source TEXT,
      verified INTEGER DEFAULT 1,
      last_updated TEXT DEFAULT CURRENT_DATE,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS alerts (
      id SERIAL PRIMARY KEY,
      athlete_id INTEGER NOT NULL REFERENCES athletes(id),
      camp_id INTEGER NOT NULL REFERENCES camps(id),
      type TEXT NOT NULL,
      sent_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Seed camps if empty
  const result = await sql`SELECT COUNT(*)::int as c FROM camps`;
  const count = result[0].c;
  if (count === 0) await seedCamps();
}

async function seedCamps() {
  const camps = [
    ['University of Alabama','High School Summer Camp','Power 4','SEC','Southeast','AL','Tuscaloosa','2026-06-08','2026-06-10','June','Prospect','TBD','2027-2031','All','https://www.alabamasoftballcamp.com','Ryzer'],
    ['University of Florida','Elite Prospect Camp Session 1','Power 4','SEC','Southeast','FL','Gainesville','2026-06-09','2026-06-09','June','Prospect','TBD','2027-2031','All','https://floridagators.com/sports/softball','ACTIVE'],
    ['University of Florida','Elite Prospect Camp Session 2','Power 4','SEC','Southeast','FL','Gainesville','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2031','All','https://floridagators.com/sports/softball','ACTIVE'],
    ['LSU','Summer Advanced Camp','Power 4','SEC','Southeast','LA','Baton Rouge','2026-06-07','2026-06-09','June','Elite','TBD','2027-2032','All','https://www.lsusoftballcamp.com','ACTIVE'],
    ['University of Tennessee','Lady Vols Experience Camp','Power 4','SEC','Southeast','TN','Knoxville','2026-04-03','2026-04-03','April','Prospect','TBD','2027-2031','All','https://www.tennesseesoftballcamp.com','Ryzer'],
    ['Auburn University','Elite Prospect Camp I','Power 4','SEC','Southeast','AL','Auburn','2026-06-09','2026-06-09','June','Elite','TBD','2027-2031','All','https://register.ryzer.com/camp.cfm?sport=3&id=326622','Ryzer'],
    ['Florida State','Lonni Alameda Summer Prospect Camp','Power 4','ACC','Southeast','FL','Tallahassee','2026-06-22','2026-06-22','June','Prospect','TBD','2028-2030','All','https://fsusoftballcamps.com','Ryzer'],
    ['University of Georgia','Summer Softball Camp','Power 4','SEC','Southeast','GA','Athens','2026-06-01','2026-06-03','June','Elite','TBD','2027-2031','All','https://georgiadogs.com','Ryzer'],
    ['Michigan','Summer Prospect Camp','Power 4','Big Ten','Midwest','MI','Ann Arbor','2026-06-16','2026-06-17','June','Prospect','$318.75','2027-2031','All','https://camps.mgoblue.com/softball','Ryzer'],
    ['Ohio State','All Skills Camp','Power 4','Big Ten','Midwest','OH','Columbus','2026-06-11','2026-06-11','June','Youth','TBD','All','All','https://ohiostatebuckeyes.com','ACTIVE'],
    ['Northwestern','Youth Wildcat Camp','Power 4','Big Ten','Midwest','IL','Evanston','2026-06-17','2026-06-17','June','Youth','TBD','All','All','https://www.northwesternsoftballcamp.com','Ryzer'],
    ['Oklahoma State','Summer Prospect Camp I','Power 4','Big 12','Texas','OK','Stillwater','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2031','All','https://www.kgsoftballcamps.com','Ryzer'],
    ['Texas Tech','Elite Prospect Camp','Power 4','Big 12','Texas','TX','Lubbock','2026-06-16','2026-06-16','June','Elite','TBD','2026-2031','All','https://www.redraidersoftballcamps.com','Ryzer'],
    ['Notre Dame','Fighting Irish Softball Camp','Power 4','ACC','Midwest','IN','South Bend','2026-06-17','2026-06-17','June','Prospect','TBD','2027-2031','All','https://und.com','Ryzer'],
    ['Stanford','Cardinal Softball Prospect Camp','Power 4','ACC','West','CA','Stanford','2026-06-16','2026-06-16','June','Prospect','TBD','2027-2031','All','https://gostanford.com','Ryzer'],
    ['UCLA','Bruin Softball Prospect Camp','Power 4','Big Ten','West','CA','Los Angeles','2026-06-15','2026-06-15','June','Prospect','TBD','2027-2031','All','https://uclabruins.com','Ryzer'],
    ['Indiana State','Summer Top Prospect Camp I','Mid Major','Missouri Valley','Midwest','IN','Terre Haute','2026-06-16','2026-06-16','June','Prospect','$260','2027-2032','All','https://www.indianastatesoftballcamps.com','Ryzer'],
    ['South Alabama','June Elite Prospect Camp','Mid Major','Sun Belt','Southeast','AL','Mobile','2026-06-23','2026-06-23','June','Elite','TBD','2027-2032','All','https://www.beckyclarksoftballcamps.com','Ryzer'],
    ['Coastal Carolina','Softball Prospect Camp','Mid Major','Sun Belt','Southeast','SC','Conway','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2032','All','https://www.coastalsoftballcamps.com','Ryzer'],
    ['Fresno State','Bulldog Softball Camp','Mid Major','Mountain West','West','CA','Fresno','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2032','All','https://gobulldogs.com','Ryzer'],
    ['San Diego State','Aztec Softball Camp','Mid Major','Mountain West','West','CA','San Diego','2026-06-15','2026-06-15','June','Prospect','TBD','2027-2032','All','https://goaztecs.com','Ryzer'],
    ['Connect Softball','Connect Atlanta 2026','Multi','Multi','Southeast','GA','Atlanta','2026-06-01','2026-06-01','June','Showcase','TBD','2027-2031','All','https://www.connectsoftballcamps.com/2026-connect-atlanta.cfm','Exact'],
    ['Exact Sports','X1 Showcase - Dallas','Multi','Multi','Texas','TX','Dallas','2026-07-06','2026-07-06','July','Showcase','TBD','2027-2031','All','https://exactsports.com/softball','Exact'],
    ['University of South Carolina','Elite Prospect Camp','Power 4','SEC','Southeast','SC','Columbia','2026-07-14','2026-07-14','July','Elite','TBD','2027-2032','All','https://www.ashleychastain.com','Ryzer'],
    ['Texas A&M','Aggie Softball Prospect Camp','Power 4','SEC','Texas','TX','College Station','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2031','All','https://12thman.com','Ryzer'],
  ];

  for (const c of camps) {
    await sql`
      INSERT INTO camps (school_name, camp_name, division, conference, region, state, city,
        start_date, end_date, month, camp_type, cost, grad_years, position_focus,
        registration_link, source)
      VALUES (${c[0]},${c[1]},${c[2]},${c[3]},${c[4]},${c[5]},${c[6]},
              ${c[7]},${c[8]},${c[9]},${c[10]},${c[11]},${c[12]},${c[13]},${c[14]},${c[15]})
    `;
  }
  console.log(`Seeded ${camps.length} camps`);
}

export type Athlete = {
  id: number; email: string; name: string; phone?: string; address?: string;
  birthdate?: string; graduation_year?: number; high_school?: string; travel_team?: string;
  is_pitcher: number; is_catcher: number; primary_position?: string; is_hitter: number;
  bats: string; target_divisions: string; target_conferences: string;
  target_regions: string; target_schools: string; created_at: string;
};

export type Camp = {
  id: number; school_name: string; camp_name: string; division?: string;
  conference?: string; region?: string; state?: string; city?: string;
  start_date?: string; end_date?: string; month?: string; camp_type?: string;
  cost?: string; grad_years?: string; position_focus?: string;
  registration_link?: string; source?: string; verified: number;
  last_updated?: string; notes?: string; created_at: string;
};
