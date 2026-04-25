-- 004_seed_leaderboard_period.sql
-- Seed the first leaderboard period for the current week.

INSERT INTO leaderboard_periods (period_label, starts_at, ends_at)
VALUES (
  'Week of ' || to_char(date_trunc('week', NOW()), 'Mon DD, YYYY'),
  date_trunc('week', NOW()),
  date_trunc('week', NOW()) + INTERVAL '7 days'
);
