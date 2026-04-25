# Tasks

## Task List

- [x] 1. Project Setup and Infrastructure
  - [x] 1.1 Initialize Next.js project with App Router, TypeScript, and Tailwind CSS
  - [x] 1.2 Configure Supabase project: create database, enable auth, set up environment variables
  - [x] 1.3 Run database migrations to create all tables (user_profiles, disposal_events, flags, quiz_questions, leaderboard_periods, leaderboard_entries)
  - [x] 1.4 Configure Vercel project with environment variables and cron job for daily trust decay
  - [x] 1.5 Set up Anthropic SDK and verify API key connectivity

- [x] 2. User Authentication
  - [x] 2.1 Build registration page with email/password form and Supabase Auth integration
  - [x] 2.2 Build login page with email/password form and session handling
  - [x] 2.3 Implement logout action that ends session and redirects to login
  - [x] 2.4 Add auth middleware to protect all `/app` routes and redirect unauthenticated users
  - [x] 2.5 Create user_profiles row on registration with trust_score=0 and default values
  - [x] 2.6 Write unit tests for auth error cases (duplicate email, invalid credentials)

- [x] 3. AI Image Classification
  - [x] 3.1 Build `CameraCapture` client component using browser MediaDevices API for photo capture
  - [x] 3.2 Implement `/api/classify` route that sends image to Anthropic claude-sonnet-4-20250514 with classification prompt
  - [x] 3.3 Parse Anthropic response to extract Classification (Trash/Recycling/Compost), explanation, and confidence
  - [x] 3.4 Build `ClassificationResult` component to display result, explanation, and flag button
  - [x] 3.5 Handle low-confidence and API error cases with retry prompt and manual selection fallback
  - [x] 3.6 Write integration tests for classify route with mocked Anthropic responses

- [x] 4. Disposal Event Logging
  - [x] 4.1 Build `BinSelector` component with three buttons (Trash, Recycling, Compost)
  - [x] 4.2 Implement `/api/disposal` route with transactional disposal event recording
  - [x] 4.3 Add abuse detection check (>20 identical classifications in 24hrs) inside disposal transaction
  - [x] 4.4 Compute `is_correct` by comparing AI classification to selected bin type
  - [x] 4.5 Build `DisposalFeedback` component showing correct/incorrect result with animation
  - [x] 4.6 Load and serve static ASU campus resources dataset from `/data/asu-resources.json`
  - [x] 4.7 Implement nearest-resource lookup function and display in scan flow when location is available
  - [x] 4.8 Write unit tests for `computeIsCorrect` and nearest-resource lookup logic

- [x] 5. Trust Score System
  - [x] 5.1 Implement `computeTrustDelta(profile, disposalEvent)` pure function with streak bonus logic
  - [x] 5.2 Integrate trust delta computation into `/api/disposal` transaction
  - [x] 5.3 Implement tap-to-log mode: skip camera step when trust_score >= 100
  - [x] 5.4 Build `TrustScoreBar` component showing progress toward 100-point threshold
  - [x] 5.5 Implement `/api/cron/decay` route for daily trust score decay (5pts/day after 14 days inactive, floor 0)
  - [x] 5.6 Configure Vercel Cron to call decay route daily at midnight UTC
  - [x] 5.7 Write property-based tests for trust delta computation (Properties 1, 2, 3, 4, 9)
  - [x] 5.8 Write property-based tests for decay computation (Properties 1, 9)

- [x] 6. Streak System
  - [x] 6.1 Implement weekly streak evaluation logic: increment if current_week_correct >= 3, else reset to 0
  - [x] 6.2 Add streak evaluation to end-of-week processing (cron or on-demand check)
  - [x] 6.3 Update `current_week_correct` counter in disposal transaction for correct events
  - [x] 6.4 Build `StreakDisplay` component showing current streak and weekly progress (X/3)
  - [x] 6.5 Write property-based tests for streak increment/reset logic (Property 6)

- [x] 7. Quiz System
  - [x] 7.1 Implement `/api/quiz/generate` route that calls Anthropic to generate a quiz question from a disposal event
  - [x] 7.2 Parse and validate Anthropic quiz response: question string, 4 choices, correct answer, explanation
  - [x] 7.3 Store generated quiz questions in `quiz_questions` table
  - [x] 7.4 Build `QuizCard` component with image display and 4-choice answer buttons
  - [x] 7.5 Implement `/api/quiz/answer` route that validates answer and increments leaderboard score by 5 for correct answers
  - [x] 7.6 Build quiz page that loads unanswered questions for the current user
  - [x] 7.7 Write property-based tests for quiz question structural validation (Property 7)
  - [x] 7.8 Write unit tests for quiz answer scoring logic

- [x] 8. Leaderboard
  - [x] 8.1 Implement leaderboard query that filters to users with `qualified=true` for the current period
  - [x] 8.2 Update leaderboard qualification status when user meets Weekly_Minimum (3 correct events/week)
  - [x] 8.3 Build `Leaderboard` component displaying ranked users, scores, and period label
  - [x] 8.4 Suspend leaderboard score increments for users with `flag_active=true`
  - [x] 8.5 Write property-based tests for leaderboard qualification filtering (Property 5)

- [x] 9. Virtual Trashcan
  - [x] 9.1 Build `VirtualTrashcan` component with three animated bin graphics using Framer Motion
  - [x] 9.2 Implement fill level calculation: map item count per classification to visual fill percentage
  - [x] 9.3 Build `ItemIcon` component for each logged item, positioned inside its classification bin
  - [x] 9.4 Implement `DropAnimation` using Framer Motion for item-drops-into-bin animation on new disposal
  - [x] 9.5 Build item detail view (tap/click on icon) showing classification, date, material type, and educational tip
  - [x] 9.6 Set up Supabase Realtime subscription to update virtual trashcan on new disposal events
  - [x] 9.7 Write property-based tests for item grouping by classification (Property 7.3) and fill level monotonicity (Property 7.6)
  - [x] 9.8 Write snapshot tests for VirtualTrashcan component rendering

- [x] 10. Impact Visualization
  - [x] 10.1 Implement `computeImpactDelta(classification, materialType)` with material weight table (Trash = 0)
  - [x] 10.2 Integrate impact delta computation into `/api/disposal` transaction
  - [x] 10.3 Build `ImpactCard` component displaying impact score with concrete equivalency text
  - [x] 10.4 Add industrial waste contextualization text to impact display
  - [x] 10.5 Write property-based tests for impact delta computation (Property 8)

- [x] 11. Flag System
  - [x] 11.1 Build flag button in `ClassificationResult` component with reason input
  - [x] 11.2 Implement `/api/flag` route that inserts flag record and sets `flagged=true` on disposal event
  - [x] 11.3 Ensure flagged disposal events do not apply trust score penalties (Property 10)
  - [x] 11.4 Build admin flags review page at `/admin/flags` listing pending flags
  - [x] 11.5 Implement `/api/admin/flags` PATCH route to resolve flags and resume trust score processing
  - [x] 11.6 Add user notification when `flag_active=true` on their account
  - [x] 11.7 Write property-based tests for flag suspension of trust score penalization (Property 10)

- [x] 12. Contextual Education
  - [x] 12.1 Implement loading screen tip display using recently scanned item context
  - [x] 12.2 Wire beverage container classification to nearest water fountain lookup
  - [x] 12.3 Wire electronics/e-waste classification to nearest e-waste drop-off lookup
  - [x] 12.4 Generate educational tips contextually from classification and material type (via Anthropic or static dataset)

- [x] 13. Profile Page
  - [x] 13.1 Build profile page displaying trust score bar, streak count, weekly progress, and impact card
  - [x] 13.2 Display account-under-review notice when `flag_active=true`
  - [x] 13.3 Show disposal history summary on profile

- [x] 14. End-to-End Integration and Polish
  - [x] 14.1 Wire full scan flow: camera → classify → bin select → feedback → score updates
  - [x] 14.2 Verify Realtime subscriptions update virtual trashcan and impact card without page reload
  - [x] 14.3 Add responsive mobile-first styling for all pages
  - [x] 14.4 Write end-to-end integration tests for full disposal flow and abuse detection
  - [x] 14.5 Audit all server actions for auth checks and input validation
