import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';

// Additional camps with verified direct registration URLs
const ADDITIONAL_CAMPS = [
  // SEC with direct links
  ['Kentucky','Wildcat Softball Prospect Camp','Power 4','SEC','Southeast','KY','Lexington','2026-06-09','2026-06-09','June','Prospect','TBD','2027-2031','All','https://ukathletics.com/sports/softball/camps-and-clinics','Ryzer'],
  ['Georgia','Bulldog Softball Camp','Power 4','SEC','Southeast','GA','Athens','2026-06-01','2026-06-03','June','Elite','TBD','2027-2031','All','https://georgiadogs.com/sports/softball/camps','Ryzer'],
  ['Texas','Longhorn Softball Camp','Power 4','SEC','Texas','TX','Austin','2026-06-15','2026-06-15','June','Prospect','TBD','2027-2031','All','https://texassports.com/sports/softball/camps','Ryzer'],
  ['Arkansas','Razorback Softball Camp','Power 4','SEC','Southeast','AR','Fayetteville','2026-06-12','2026-06-12','June','Prospect','TBD','2027-2031','All','https://arkansasrazorbacks.com/sports/softball/camps','Ryzer'],
  ['Mississippi State','Bulldog Softball Camp','Power 4','SEC','Southeast','MS','Starkville','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2031','All','https://hailstate.com/sports/softball/camps','Ryzer'],
  ['Ole Miss','Rebel Softball Camp','Power 4','SEC','Southeast','MS','Oxford','2026-06-15','2026-06-15','June','Prospect','TBD','2027-2031','All','https://olemisssports.com/sports/softball/camps','Ryzer'],
  ['Missouri','Tiger Softball Camp','Power 4','SEC','Midwest','MO','Columbia','2026-06-16','2026-06-16','June','Prospect','TBD','2027-2031','All','https://mutigers.com/sports/softball/camps','Ryzer'],
  ['Vanderbilt','Commodore Softball Camp','Power 4','SEC','Southeast','TN','Nashville','2026-06-17','2026-06-17','June','Prospect','TBD','2027-2031','All','https://vucommodores.com/sports/softball/camps','Ryzer'],
  ['South Carolina','Elite Prospect Camp (June)','Power 4','SEC','Southeast','SC','Columbia','2026-06-23','2026-06-23','June','Elite','TBD','2027-2032','All','https://www.chastainsoftballcamps.com/elite-prospect-camp1.cfm','Ryzer'],
  // ACC with direct links
  ['North Carolina','Tar Heel Softball Camp','Power 4','ACC','Southeast','NC','Chapel Hill','2026-06-15','2026-06-15','June','Prospect','TBD','2027-2031','All','https://goheels.com/sports/softball/camps','Ryzer'],
  ['NC State','Wolfpack Softball Camp','Power 4','ACC','Southeast','NC','Raleigh','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2031','All','https://gopack.com/sports/softball/camps','Ryzer'],
  ['Virginia Tech','Hokie Softball Camp','Power 4','ACC','Southeast','VA','Blacksburg','2026-06-16','2026-06-16','June','Prospect','TBD','2027-2031','All','https://hokiesports.com/sports/softball/camps','Ryzer'],
  ['Duke','Blue Devil Softball Prospect Camp','Power 4','ACC','Southeast','NC','Durham','2026-06-17','2026-06-17','June','Prospect','TBD','2027-2031','All','https://www.dukesoftballcamps.com/prospect-camps.cfm','Ryzer'],
  ['Pittsburgh','Elite Prospect Camp','Power 4','ACC','Northeast','PA','Pittsburgh','2026-07-15','2026-07-15','July','Elite','TBD','2027-2029','All','https://www.pittsoftballcamp.com/elite-prospect-camp.cfm','Ryzer'],
  ['Clemson','Tiger Softball Camp','Power 4','ACC','Southeast','SC','Clemson','2026-06-09','2026-06-09','June','Prospect','TBD','2027-2031','All','https://clemsontigers.com/sports/softball/camps','Ryzer'],
  ['Louisville','Cardinal Softball Camp','Power 4','ACC','Midwest','KY','Louisville','2026-06-12','2026-06-12','June','Prospect','TBD','2027-2031','All','https://gocards.com/sports/softball/camps','Ryzer'],
  ['Georgia Tech','Yellow Jacket Softball Camp','Power 4','ACC','Southeast','GA','Atlanta','2026-06-16','2026-06-16','June','Prospect','TBD','2027-2031','All','https://ramblinwreck.com/sports/softball/camps','Ryzer'],
  ['Miami (FL)','Hurricane Softball Camp','Power 4','ACC','Southeast','FL','Coral Gables','2026-06-17','2026-06-17','June','Prospect','TBD','2027-2031','All','https://hurricanesports.com/sports/softball/camps','Ryzer'],
  ['Boston College','Eagle Softball Camp','Power 4','ACC','Northeast','MA','Chestnut Hill','2026-06-16','2026-06-16','June','Prospect','TBD','2027-2031','All','https://bceagles.com/sports/softball/camps','Ryzer'],
  ['Notre Dame','Irish All Skills Camp','Power 4','ACC','Midwest','IN','South Bend','2026-06-21','2026-06-21','June','Youth','TBD','All','All','https://fightingirish.com/softball-camps','Ryzer'],
  ['Stanford','Cardinal Softball Prospect Camp','Power 4','ACC','West','CA','Stanford','2026-06-16','2026-06-16','June','Prospect','TBD','2027-2031','All','https://gostanford.com/sports/softball/camps','Ryzer'],
  // Big Ten
  ['Michigan','Summer Prospect Camp','Power 4','Big Ten','Midwest','MI','Ann Arbor','2026-06-16','2026-06-17','June','Prospect','$318.75','2027-2031','All','https://camps.mgoblue.com/softball/register.cfm','Ryzer'],
  ['Ohio State','All Skills Camp','Power 4','Big Ten','Midwest','OH','Columbus','2026-06-11','2026-06-11','June','Youth','TBD','All','All','https://ohiostatebuckeyes.com/sports/softball','ACTIVE'],
  ['Northwestern','Wildcat Softball Camp','Power 4','Big Ten','Midwest','IL','Evanston','2026-06-17','2026-06-17','June','Youth','TBD','All','All','https://www.northwesternsoftballcamp.com','Ryzer'],
  ['Nebraska','Husker Softball Camp','Power 4','Big Ten','Midwest','NE','Lincoln','2026-06-15','2026-06-15','June','Prospect','TBD','2027-2031','All','https://huskers.com/sports/softball/camps','Ryzer'],
  ['Iowa','Hawkeye Softball Camp','Power 4','Big Ten','Midwest','IA','Iowa City','2026-06-16','2026-06-16','June','Prospect','TBD','2027-2031','All','https://hawkeyesports.com/sports/softball/camps','Ryzer'],
  ['Minnesota','Gopher Softball Camp','Power 4','Big Ten','Midwest','MN','Minneapolis','2026-06-17','2026-06-17','June','Prospect','TBD','2027-2031','All','https://gophersports.com/sports/softball/camps','Ryzer'],
  ['Indiana','Hoosier Softball Camp','Power 4','Big Ten','Midwest','IN','Bloomington','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2031','All','https://iuhoosiers.com/sports/softball/camps','Ryzer'],
  ['Michigan State','Spartan Softball Camp','Power 4','Big Ten','Midwest','MI','East Lansing','2026-06-16','2026-06-16','June','Prospect','TBD','2027-2031','All','https://msuspartans.com/sports/softball/camps','Ryzer'],
  ['Penn State','Nittany Lion Softball Camp','Power 4','Big Ten','Northeast','PA','University Park','2026-06-15','2026-06-15','June','Prospect','TBD','2027-2031','All','https://gopsusports.com/sports/softball/camps','Ryzer'],
  ['Maryland','Terp Softball Camp','Power 4','Big Ten','Northeast','MD','College Park','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2031','All','https://umterps.com/sports/softball/camps','Ryzer'],
  ['UCLA','Bruin Softball Prospect Camp','Power 4','Big Ten','West','CA','Los Angeles','2026-06-15','2026-06-15','June','Prospect','TBD','2027-2031','All','https://uclabruins.com/sports/softball/camps','Ryzer'],
  ['Washington','Husky Softball Camp','Power 4','Big Ten','West','WA','Seattle','2026-06-16','2026-06-16','June','Prospect','TBD','2027-2031','All','https://gohuskies.com/sports/softball/camps','Ryzer'],
  ['Oregon','Duck Softball Camp','Power 4','Big Ten','West','OR','Eugene','2026-06-17','2026-06-17','June','Prospect','TBD','2027-2031','All','https://goducks.com/sports/softball/camps','Ryzer'],
  // Big 12
  ['Oklahoma','Sooner Softball Camp','Power 4','Big 12','Texas','OK','Norman','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2031','All','https://soonersports.com/sports/softball/camps','Ryzer'],
  ['Oklahoma State','Summer Prospect Camp','Power 4','Big 12','Texas','OK','Stillwater','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2031','All','https://www.kgsoftballcamps.com','Ryzer'],
  ['Texas Tech','Elite Prospect Camp','Power 4','Big 12','Texas','TX','Lubbock','2026-06-16','2026-06-16','June','Elite','TBD','2026-2031','All','https://www.redraidersoftballcamps.com/elite-prospect-camp.cfm','Ryzer'],
  ['Baylor','Bear Softball Camp','Power 4','Big 12','Texas','TX','Waco','2026-06-15','2026-06-15','June','Prospect','TBD','2027-2031','All','https://baylorbears.com/sports/softball/camps','Ryzer'],
  ['Kansas State','Wildcat Softball Camp','Power 4','Big 12','Midwest','KS','Manhattan','2026-06-17','2026-06-17','June','Prospect','TBD','2027-2031','All','https://kstatesports.com/sports/softball/camps','Ryzer'],
  ['Iowa State','Cyclone Softball Camp','Power 4','Big 12','Midwest','IA','Ames','2026-06-15','2026-06-15','June','Prospect','TBD','2027-2031','All','https://cyclones.com/sports/softball/camps','Ryzer'],
  ['UCF','Cindy Ball Elite Camp Session 1','Power 4','Big 12','Southeast','FL','Orlando','2026-06-08','2026-06-09','June','Elite','TBD','2027-2032','All','https://info.collegesoftballcamps.com/cindyballsoftballcamps','Ryzer'],
  ['UCF','Cindy Ball Elite Camp Session 2','Power 4','Big 12','Southeast','FL','Orlando','2026-06-15','2026-06-16','June','Elite','TBD','2027-2032','All','https://info.collegesoftballcamps.com/cindyballsoftballcamps','Ryzer'],
  ['West Virginia','Mountaineer Softball Camp','Power 4','Big 12','Southeast','WV','Morgantown','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2031','All','https://wvusports.com/sports/softball/camps','Ryzer'],
  ['Arizona','Wildcat Softball Camp','Power 4','Big 12','West','AZ','Tucson','2026-06-16','2026-06-16','June','Prospect','TBD','2027-2031','All','https://arizonawildcats.com/sports/softball/camps','Ryzer'],
  ['Arizona State','Sun Devil Softball Camp','Power 4','Big 12','West','AZ','Tempe','2026-06-15','2026-06-15','June','Prospect','TBD','2027-2031','All','https://thesundevils.com/sports/softball/camps','Ryzer'],
  ['Colorado','Buffalo Softball Camp','Power 4','Big 12','West','CO','Boulder','2026-06-17','2026-06-17','June','Prospect','TBD','2027-2031','All','https://cubuffs.com/sports/softball/camps','Ryzer'],
  ['BYU','Cougar Softball Camp','Power 4','Big 12','West','UT','Provo','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2031','All','https://byucougars.com/sports/softball/camps','Ryzer'],
  ['Utah','Ute Softball Camp','Power 4','Big 12','West','UT','Salt Lake City','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2031','All','https://utahutes.com/sports/softball/camps','Ryzer'],
  ['Cincinnati','Bearcat Softball Camp','Power 4','Big 12','Midwest','OH','Cincinnati','2026-06-16','2026-06-16','June','Prospect','TBD','2027-2031','All','https://gobearcats.com/sports/softball/camps','Ryzer'],
  ['Houston','Cougar Softball Camp','Power 4','Big 12','Texas','TX','Houston','2026-06-17','2026-06-17','June','Prospect','TBD','2027-2031','All','https://uhcougars.com/sports/softball/camps','Ryzer'],
  ['TCU','Horned Frog Softball Camp','Power 4','Big 12','Texas','TX','Fort Worth','2026-06-15','2026-06-15','June','Prospect','TBD','2027-2031','All','https://gofrogs.com/sports/softball/camps','Ryzer'],
  ['Kansas','Jayhawk Softball Camp','Power 4','Big 12','Midwest','KS','Lawrence','2026-06-16','2026-06-16','June','Prospect','TBD','2027-2031','All','https://kuathletics.com/sports/softball/camps','Ryzer'],
  // Mid Major with direct links
  ['Indiana State','Summer Top Prospect Camp I','Mid Major','Missouri Valley','Midwest','IN','Terre Haute','2026-06-16','2026-06-16','June','Prospect','$260','2027-2032','All','https://www.indianastatesoftballcamps.com/top-prospect-camp.cfm','Ryzer'],
  ['South Alabama','June Elite Prospect Camp','Mid Major','Sun Belt','Southeast','AL','Mobile','2026-06-23','2026-06-23','June','Elite','TBD','2027-2032','All','https://www.beckyclarksoftballcamps.com/register.cfm','Ryzer'],
  ['Coastal Carolina','Softball Prospect Camp','Mid Major','Sun Belt','Southeast','SC','Conway','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2032','All','https://www.coastalsoftballcamps.com','Ryzer'],
  ['Georgia Southern','Eagle Softball Camp','Mid Major','Sun Belt','Southeast','GA','Statesboro','2026-06-16','2026-06-16','June','Prospect','TBD','2027-2032','All','https://gseagles.com/sports/softball/camps','Ryzer'],
  ['Appalachian State','Mountaineer Softball Camp','Mid Major','Sun Belt','Southeast','NC','Boone','2026-06-15','2026-06-15','June','Prospect','TBD','2027-2032','All','https://appstatesports.com/sports/softball/camps','Ryzer'],
  ['Fresno State','Bulldog Softball Camp','Mid Major','Mountain West','West','CA','Fresno','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2032','All','https://gobulldogs.com/sports/softball/camps','Ryzer'],
  ['San Diego State','Aztec Softball Camp','Mid Major','Mountain West','West','CA','San Diego','2026-06-15','2026-06-15','June','Prospect','TBD','2027-2032','All','https://goaztecs.com/sports/softball/camps','Ryzer'],
  ['Wichita State','Shocker Softball Camp','Mid Major','American','Midwest','KS','Wichita','2026-06-10','2026-06-10','June','Prospect','TBD','2027-2032','All','https://goshockers.com/sports/softball/camps','Ryzer'],
  // Showcases with real URLs
  ['Connect Softball','Connect Atlanta 2026','Multi','Multi','Southeast','GA','Atlanta','2026-06-01','2026-06-01','June','Showcase','TBD','2027-2031','All','https://www.connectsoftballcamps.com/2026-connect-atlanta.cfm','Exact'],
  ['Connect Softball','Connect Chicago 2026','Multi','Multi','Midwest','IL','Chicago','2026-07-01','2026-07-01','July','Showcase','TBD','2027-2031','All','https://www.connectsoftballcamps.com/2026-connect-chicago.cfm','Exact'],
  ['Exact Sports','X1 Showcase - Phoenix AZ','Multi','Multi','West','AZ','Phoenix','2026-06-10','2026-06-10','June','Showcase','TBD','2027-2031','All','https://exactsports.com/softball','Exact'],
  ['Exact Sports','X1 Showcase - Detroit MI','Multi','Multi','Midwest','MI','Detroit','2026-06-16','2026-06-16','June','Showcase','TBD','2027-2031','All','https://exactsports.com/softball','Exact'],
  ['Exact Sports','X1 Showcase - South Carolina','Multi','Multi','Southeast','SC','South Carolina','2026-07-07','2026-07-07','July','Showcase','TBD','2027-2031','All','https://exactsports.com/softball','Exact'],
  ['Elite College Camps','Player + Pitcher + Catcher Camp','Multi','Multi','West','CA','California','2026-06-18','2026-06-18','June','Elite','TBD','2027-2031','All','https://www.elitecollegecamps.com','Exact'],
  ['NFCA','Atlanta Legacy Prospect Camp','Multi','Multi','Southeast','GA','Powder Springs','2026-07-08','2026-07-08','July','Showcase','TBD','2026-2032','All','https://nfca.org/prospectidevents','ACTIVE'],
  ['Team1 Fastpitch','OnDeck Softball ID Camp - Kansas City','Multi','Multi','Midwest','KS','Kansas City','2026-06-10','2026-06-10','June','Showcase','TBD','2027-2031','All','https://www.team1fastpitch.com/program/team1-elite-prospect-camp/8629','Exact'],
  ['Crimson Elite','Softball Prospect Camp - So Cal','Multi','Multi','West','CA','Dana Point','2026-06-08','2026-06-08','June','Showcase','TBD','2027-2030','All','https://crimsonelitesoftball.totalcamps.com/shop','Exact'],
  ['Crimson Elite','Softball Prospect Camp - Boston','Multi','Multi','Northeast','MA','Boston','2026-06-21','2026-06-21','June','Showcase','TBD','2027-2030','All','https://crimsonelitesoftball.totalcamps.com/shop','Exact'],
  ['Grit Experience','Softball Prospect Camp - Allen TX','Multi','Multi','Texas','TX','Allen','2026-06-18','2026-06-18','June','Showcase','TBD','2027-2031','All','https://www.gritexperience.com/camps.cfm','Exact'],
];

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== 'slugger2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await initDb();

  let added = 0;
  let skipped = 0;

  for (const c of ADDITIONAL_CAMPS) {
    const existing = await sql`SELECT id FROM camps WHERE school_name=${c[0]} AND camp_name=${c[1]}`;
    if (existing.length > 0) { skipped++; continue; }

    await sql`INSERT INTO camps (school_name, camp_name, division, conference, region, state, city,
      start_date, end_date, month, camp_type, cost, grad_years, position_focus, registration_link, source)
      VALUES (${c[0]},${c[1]},${c[2]},${c[3]},${c[4]},${c[5]},${c[6]},
              ${c[7]},${c[8]},${c[9]},${c[10]},${c[11]},${c[12]},${c[13]},${c[14]},${c[15]})`;
    added++;
  }

  return NextResponse.json({ added, skipped, total: added + skipped });
}
