# TrustBin

TrustBin is a mobile-first web app that helps people dispose of waste correctly — and actually want to keep doing it. Point your camera at any item, and Claude's vision AI tells you whether it's Trash, Recycling, or Compost. Every correct disposal earns trust points, builds streaks, and shows up on a live leaderboard. The more you prove you know what you're doing, the less friction you face — trusted users skip the camera entirely and just tap to log.

Built for ASU's sustainability community, but designed to work anywhere.

---

## The Problem

Most people want to recycle correctly. They just don't know how. Contaminated recycling bins cost municipalities millions and often result in entire loads being sent to the landfill anyway. Existing apps are either lookup tools (no engagement) or gamified in ways that don't actually verify behavior. TrustBin closes that gap by combining AI-verified disposal with a reputation system that rewards consistent, correct behavior over time.

---

## How It Works

1. **Scan** — Open the app, point your camera at an item, and tap Capture. Claude analyzes the image and returns a classification (Trash, Recycling, or Compost) along with a confidence level and material type.

2. **Confirm** — You see the AI's recommendation. If you agree, select the bin. If you think it's wrong, you can override it manually.

3. **Earn** — Correct disposals earn +10 trust points. A streak bonus of +2 kicks in after 2 consecutive weeks of activity. Incorrect disposals earn nothing (no penalty — the goal is education, not punishment).

4. **Level up** — Once your trust score hits 100, you unlock **Tap-to-Log** mode. No photo required. You've proven you know what you're doing, so the app gets out of your way.

5. **Stay honest** — If you think an AI classification was wrong, you can flag it. Flagged events are frozen (no score impact) until an admin reviews them. Abuse triggers an account review that pauses scoring.

---

## Features

### AI Waste Classification
- Uses Claude's multimodal vision API (no traditional CV model — just one API call)
- Returns classification, confidence level, material type, and a plain-English explanation
- Handles both live camera capture and photo uploads

### Trust Score System
- Starts at 0, no ceiling
- +10 per correct disposal, +2 streak bonus after 2 weeks
- Decays 5 pts/day after 14 days of inactivity (floor: 0)
- Scoring paused while a flag is under review
- Unlocks Tap-to-Log mode at 100 points

### Streak Tracking
- Daily streak — requires at least 1 correct disposal per day
- ASU academic calendar holidays are built in — streaks are preserved on holidays automatically
- Displayed on dashboard and profile

### Impact Score
- Tracks the environmental weight of your disposals
- Material-specific weights (e.g. electronics = 2.0, aluminum can = 1.0, plastic bag = 0.1)
- Trash disposals earn zero impact score — only diverted waste counts
- Shown as human-readable equivalencies ("equivalent to planting X trees")

### Leaderboard
- Weekly competitive leaderboard
- Minimum 3 correct disposals required to qualify for ranking
- Real-time via Supabase Realtime subscriptions

### Quiz
- AI-generated quiz questions based on your disposal history
- Reinforces learning about the specific items you've scanned
- Powered by Claude

### Flagging & Admin Review
- Users can flag any of their disposal events if they believe the AI was wrong
- Flagged events are frozen — no score impact while under review
- Admin dashboard to review pending flags, resolve as valid or invalid
- Resolving a flag as invalid clears the user's review status

### Nearby Resources
- Shows ASU-specific recycling and composting resources
- Static data from `data/asu-resources.json`, easily extensible

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth & Database | Supabase (Postgres + Auth + Realtime + RLS) |
| AI | Anthropic Claude (vision + text) |
| Animations | Framer Motion |
| Testing | Vitest + fast-check (property-based testing) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

### 1. Clone and install

```bash
git clone https://github.com/costomato/trustbin.git
cd trustbin
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
CRON_SECRET=any_random_string
```

### 3. Run database migrations

Apply the SQL files in `supabase/migrations/` to your Supabase project in order:

- `001_initial_schema.sql` — all tables, indexes, and RLS policies
- `002_realtime.sql` — enables Realtime on leaderboard tables
- `003_create_profile_trigger.sql` — auto-creates a user profile on signup

You can run these via the Supabase SQL editor or the Supabase CLI.

### 4. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## Project Structure

```
trustbin/
├── app/
│   ├── (app)/          # Authenticated routes (dashboard, scan, quiz, leaderboard, profile, trashcan)
│   ├── (auth)/         # Login and register pages
│   ├── admin/          # Admin flag review dashboard
│   ├── api/            # API routes (classify, disposal, quiz, flag, admin, cron)
│   └── actions/        # Server actions (auth)
├── components/         # UI components
├── lib/                # Business logic (trust, streak, impact, leaderboard, quiz, disposal)
├── data/               # Static data (ASU resources)
├── supabase/
│   └── migrations/     # Database schema
└── __tests__/          # Unit and property-based tests
```

---

## Database Schema

**`user_profiles`** — trust score, streak, impact score, leaderboard score, admin flag, display name

**`disposal_events`** — every scan: item description, material type, AI classification, user's bin selection, correctness, trust delta, flagged status

**`flags`** — dispute records linking a disposal event to a review status (pending / resolved_valid / resolved_invalid)

**`quiz_questions`** — AI-generated questions tied to disposal events, with choices, correct answer, and explanation

**`leaderboard_periods`** / **`leaderboard_entries`** — weekly competitive periods with per-user scores and qualification status

All tables have Row Level Security enabled. Users can only read and write their own data. Admin operations use the service role key server-side.

---

## Testing

```bash
npm run test
```

The test suite uses Vitest with fast-check for property-based testing. PBT properties cover:

- Trust score is always non-negative
- Flagged events never change the trust score
- Inactive users decay toward 0 but never below it
- Streak resets to 0 on missed non-holiday days
- Impact score is always 0 for Trash disposals
- Leaderboard qualification requires a minimum weekly correct disposals

---

## Cron Job

A decay cron runs at `/api/cron/decay` to apply trust score decay for inactive users. It's secured with a `CRON_SECRET` header and configured in `vercel.json` to run daily.

---

## Team

Built at the Kiro Spark Challenge by Kirobusters.

---

## License

MIT
