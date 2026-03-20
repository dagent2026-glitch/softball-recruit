# softball-recruit MVP Brief

## What We're Building
A web app that lets softball athletes create a profile and get instant alerts when colleges they care about post new camps.

## Stack
- **Frontend:** Next.js 14 (App Router), Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** SQLite via better-sqlite3 (local, no setup required for MVP)
- **Auth:** Simple email + password (bcrypt), JWT stored in httpOnly cookie
- **Email alerts:** Nodemailer with Gmail SMTP (or console.log for MVP)

## Core Features (MVP only — no payment, no complex UX)

### 1. Athlete Profile (signup + edit)
Fields:
- Name, email, password, phone, address
- Birthdate, graduation year
- High school name, travel team name
- Specialty: Pitcher (boolean), Catcher (boolean)
- Primary position: select from [Pitcher, Catcher, 1B, 2B, 3B, SS, Middle Infield, Corner Infield, OF, Utility]
- Hitter (boolean)
- Bats: Left / Right / Switch

### 2. Recruiting Preferences (saved to profile)
- Target Division: multi-select [Power 4, Mid Major, D2, D3, NAIA]
- Target Conference: multi-select [SEC, ACC, Big Ten, Big 12, Sun Belt, American, Mountain West, Big West, MAC, Other]
- Target Region: multi-select [Southeast, Northeast, Midwest, West, Texas]
- Target Schools: searchable checkbox list — pre-seed with at least 50 D1 schools

### 3. Camp Database (admin-seeded)
SQLite table with the 19 columns from the master camp database:
School Name, Camp Name, Division, Conference, Region, State, City, Start Date, End Date, Month, Camp Type, Cost, Grad Years, Position Focus, Registration Link, Source, Verified, Last Updated, Notes

Pre-seed with at least 20 sample camps on first run (use seed script).

### 4. Camp Feed (authenticated)
- Athlete sees camps that match their profile (school, division, region)
- Filterable by: Region, Division, Month, Camp Type
- Each camp card shows: School, Camp Name, Dates, Type, Cost, Registration Link

### 5. Alert System (simplified for MVP)
- When a new camp is added to the database: check all athlete profiles
- If the camp's school is in an athlete's target schools → send alert email
- If no target schools match but division+region match → send weekly digest (just log for MVP, implement email later)
- Alert log table in SQLite: athlete_id, camp_id, sent_at, type

### 6. Admin Panel (basic, password-protected)
- /admin page (hardcoded password: "slugger2026")
- Add new camp form
- View all camps
- Trigger "check alerts" manually
- View alert log

## Pages
- / — landing page (value prop + signup CTA)
- /signup — athlete registration
- /login — login
- /profile — edit profile + recruiting preferences
- /camps — main feed with filters
- /admin — camp management

## Design
- Clean, modern, mobile-friendly
- Color scheme: navy + gold + white (softball/athletic feel)
- No fancy animations — fast and functional

## File Structure
```
softball-recruit/
├── app/
│   ├── page.tsx              (landing)
│   ├── signup/page.tsx
│   ├── login/page.tsx
│   ├── profile/page.tsx
│   ├── camps/page.tsx
│   ├── admin/page.tsx
│   └── api/
│       ├── auth/
│       ├── profile/
│       ├── camps/
│       └── alerts/
├── lib/
│   ├── db.ts                 (SQLite setup + schema)
│   ├── auth.ts               (JWT helpers)
│   └── alerts.ts             (matching + notification logic)
├── components/
├── BRIEF.md
└── package.json
```

## MVP Success Criteria
1. Athlete can sign up, fill out full profile including target schools
2. Admin can add a new camp
3. System checks if any athlete has that school in their targets
4. Alert is logged (console or email)
5. Athlete can see their matched camps on the /camps feed

## DO NOT build
- Payment / subscriptions
- Complex animations
- OAuth / social login
- Mobile app
- Real-time websockets
- Anything not listed above

Build it clean, working, and deployable. Run `npm run dev` to start.
