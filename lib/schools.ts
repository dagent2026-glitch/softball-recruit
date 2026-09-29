// Normalizes a school name for comparison so 'Auburn' and 'Auburn University'
// (or 'Florida' and 'University of Florida') are recognized as the same
// school. Target-school picks use short colloquial names (see D1_SCHOOLS
// below); scraped/admin-entered camp data doesn't always match that
// convention, so any code comparing the two must go through this rather
// than a raw string/lowercase equality check.
export function normalizeSchoolName(s: string): string {
  return s
    .toLowerCase()
    .replace(/^(the )?university of /, '')
    .replace(/^the /, '')
    .replace(/ university$/, '')
    .replace(/ college$/, '')
    .replace(/[.,']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function schoolNamesMatch(a: string, b: string): boolean {
  return normalizeSchoolName(a) === normalizeSchoolName(b);
}

// Complete D1 softball programs — verified active programs only
export const D1_SCHOOLS = [
  // SEC (16) — includes Oklahoma and Texas, who joined for the 2024-25 season
  'Alabama','Arkansas','Auburn','Florida','Georgia','Kentucky','LSU',
  'Mississippi State','Missouri','Oklahoma','Ole Miss','South Carolina',
  'Tennessee','Texas','Texas A&M','Vanderbilt',
  // ACC (15)
  'Boston College','California','Clemson','Duke','Florida State','Georgia Tech',
  'Louisville','Miami (FL)','NC State','North Carolina','Notre Dame',
  'Pittsburgh','Stanford','Syracuse','Virginia','Virginia Tech',
  // Big Ten (18)
  'Illinois','Indiana','Iowa','Maryland','Michigan','Michigan State',
  'Minnesota','Nebraska','Northwestern','Ohio State','Oregon','Penn State',
  'Purdue','Rutgers','UCLA','USC','Washington','Wisconsin',
  // Big 12 (16) — Oklahoma moved to the SEC, see above
  'Arizona','Arizona State','Baylor','BYU','Cincinnati','Colorado',
  'Houston','Iowa State','Kansas','Kansas State','Oklahoma State',
  'TCU','Texas Tech','UCF','Utah','West Virginia',
  // Texas (in-state, various non-Power-4 conferences)
  'Texas State','Sam Houston State','Lamar','Stephen F. Austin',
  'UTSA','UT Arlington',
  // Sun Belt
  'Appalachian State','Arkansas State','Coastal Carolina','Georgia Southern',
  'Georgia State','James Madison','Louisiana','Marshall','Old Dominion',
  'South Alabama','Southern Miss','Troy','ULM',
  // American Athletic
  'Charlotte','East Carolina','Memphis','Navy','North Texas','South Florida',
  'Temple','Tulane','Tulsa','UAB','Wichita State',
  // Mountain West
  'Air Force','Boise State','Colorado State','Fresno State','Nevada',
  'New Mexico','San Diego State','UNLV','Utah State','Wyoming',
  // Big West
  'Cal Poly','Cal State Fullerton','Cal State Northridge','Hawaii',
  'Long Beach State','UC Davis','UC Irvine','UC Riverside','UC Santa Barbara',
  'UC San Diego',
  // MAC
  'Akron','Ball State','Bowling Green','Central Michigan','Eastern Michigan',
  'Kent State','Miami (OH)','NIU','Ohio','Toledo','Western Michigan',
  // Missouri Valley
  'Drake','Illinois State','Indiana State','Missouri State',
  'Northern Iowa','South Dakota State','Southern Illinois','Valparaiso',
  // Southern Conference
  'East Tennessee State','Furman','Mercer','Samford','VMI','Wofford',
  // CUSA
  'FIU','Florida Atlantic','Louisiana Tech','Middle Tennessee','UTEP',
  'Western Kentucky',
  // Atlantic 10
  'Davidson','Dayton','Duquesne','Fordham','George Washington','La Salle',
  'Rhode Island','Richmond','Saint Louis','UMass','VCU',
  // Big East
  'Butler','Connecticut','Creighton','Georgetown','Marquette','Providence',
  'Seton Hall','St. John\'s','Villanova','Xavier',
  // WAC
  'Abilene Christian','California Baptist','Grand Canyon','New Mexico State',
  'Sacramento State','Tarleton State','Utah Valley',
  // Southland
  'Houston Baptist','Incarnate Word','Nicholls State','Northwestern State',
  'SE Louisiana','Texas A&M-Corpus Christi',
  // Horizon League
  'Detroit Mercy','Green Bay','Illinois-Chicago','Milwaukee','Oakland',
  'Purdue Fort Wayne','Wright State','Youngstown State',
  // Other D1
  'Alabama State','Albany','American','Belmont','Bethune-Cookman',
  'Campbell','College of Charleston','Columbia','Cornell','Delaware',
  'Drexel','Eastern Illinois','Eastern Kentucky','Elon',
  'Florida A&M','Florida Gulf Coast','Gardner-Webb','Harvard',
  'High Point','Hofstra','Jacksonville','Jacksonville State',
  'Kennesaw State','Lehigh','Liberty','Lipscomb',
  'Long Island','Longwood','Maine','Marist','McNeese State',
  'Montana','Monmouth','Morehead State','Murray State','North Dakota State',
  'Northern Illinois','Portland','Presbyterian','Sacred Heart',
  'San Jose State','Seattle','Siena','Southeast Missouri State',
  'Tennessee State','Tennessee Tech','Texas Southern',
  'Vermont','Wagner','Weber State','William & Mary',
  // America East
  'Binghamton','Bryant','UMass Lowell','UMBC',
  // ASUN
  'Bellarmine','North Florida','Queens University of Charlotte','Stetson',
  'West Florida',
  // Atlantic 10 (additional)
  'George Mason','Loyola Chicago','St. Bonaventure','Saint Joseph\'s',
  // Big East (additional)
  'DePaul',
  // Big Sky
  'Idaho State','Northern Colorado','Portland State','Southern Utah',
  'Utah Tech',
  // Big South
  'Charleston Southern','Radford','USC Upstate','Winthrop',
  // Big West (additional)
  'Bakersfield',
  // CAA
  'Hampton','North Carolina A&T','Stony Brook','Towson','UNC Wilmington',
  // Horizon League (additional)
  'IU Indy','Northern Kentucky','Robert Morris',
  // Ivy League
  'Brown','Dartmouth','Penn','Princeton','Yale',
  // MEAC
  'Coppin State','Delaware State','Howard','UMES','Morgan State',
  'Norfolk State','North Carolina Central','South Carolina State',
  // MAAC
  'Canisius','Fairfield','Iona','Manhattan','Merrimack','Mount St. Mary\'s',
  'Niagara','Quinnipiac','Rider','Saint Peter\'s',
  // MAC (additional)
  'Buffalo',
  // Missouri Valley (additional)
  'Bradley','Evansville',
  // Northeast
  'Central Connecticut State','Fairleigh Dickinson','Le Moyne','Mercyhurst',
  'New Haven','Stonehill',
  // Ohio Valley
  'Lindenwood','SIU Edwardsville','Southern Indiana','UT Martin',
  'Western Illinois',
  // Pac-12 (last-standing member sponsoring softball)
  'Oregon State',
  // Patriot League
  'Army','Bucknell','Colgate','Holy Cross','Lafayette',
  // SWAC
  'Alabama A&M','Alcorn State','Arkansas-Pine Bluff','Grambling State',
  'Jackson State','Mississippi Valley State','Prairie View A&M',
  'Southern University',
  // Southern (additional)
  'Chattanooga','UNC Greensboro','Western Carolina',
  // Southland (additional)
  'East Texas A&M','Houston Christian',
  // Summit League
  'Kansas City','North Dakota','Omaha','St. Thomas','South Dakota',
  // United Athletic
  'Austin Peay','Central Arkansas','North Alabama','West Georgia',
  // West Coast
  'Loyola Marymount','Pacific','Saint Mary\'s (CA)','San Diego','Santa Clara',
].sort();

export const CONFERENCES = [
  'SEC','ACC','Big Ten','Big 12','Sun Belt','American',
  'Mountain West','Big West','MAC','Missouri Valley','Southern',
  'CUSA','Atlantic 10','Big East','WAC','Southland','Horizon League',
  'Patriot','Ivy League','MEAC','SWAC','Big South','OVC','NEC','Other',
  'America East','ASUN','Big Sky','CAA','MAAC','Pac-12','Summit League',
  'United Athletic','West Coast'
];
