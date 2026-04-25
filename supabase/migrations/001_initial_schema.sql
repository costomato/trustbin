-- 001_initial_schema.sql
-- Full initial schema for Trustbin

-- user_profiles
CREATE TABLE user_profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id),
  email                 TEXT NOT NULL,
  display_name          TEXT,
  trust_score           INTEGER NOT NULL DEFAULT 0 CHECK (trust_score >= 0),
  streak_weeks          INTEGER NOT NULL DEFAULT 0,
  current_week_correct  INTEGER NOT NULL DEFAULT 0,
  last_disposal_at      TIMESTAMPTZ,
  leaderboard_score     INTEGER NOT NULL DEFAULT 0,
  impact_score          NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_admin              BOOLEAN NOT NULL DEFAULT FALSE,
  flag_active           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- disposal_events
CREATE TABLE disposal_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES user_profiles(id),
  item_description  TEXT NOT NULL,
  material_type     TEXT,
  ai_classification TEXT NOT NULL CHECK (ai_classification IN ('Trash','Recycling','Compost')),
  selected_bin      TEXT NOT NULL CHECK (selected_bin IN ('Trash','Recycling','Compost')),
  is_correct        BOOLEAN NOT NULL,
  image_url         TEXT,
  trust_delta       INTEGER NOT NULL DEFAULT 0,
  flagged           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_disposal_user_created ON disposal_events(user_id, created_at DESC);
CREATE INDEX idx_disposal_abuse_check ON disposal_events(user_id, ai_classification, created_at);

-- flags
CREATE TABLE flags (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disposal_event_id UUID NOT NULL REFERENCES disposal_events(id),
  user_id           UUID NOT NULL REFERENCES user_profiles(id),
  reason            TEXT,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','resolved_valid','resolved_invalid')),
  admin_note        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ
);

-- quiz_questions
CREATE TABLE quiz_questions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES user_profiles(id),
  disposal_event_id UUID REFERENCES disposal_events(id),
  question_text     TEXT NOT NULL,
  image_url         TEXT,
  choices           JSONB NOT NULL,
  correct_answer    TEXT NOT NULL,
  explanation       TEXT NOT NULL,
  answered          BOOLEAN NOT NULL DEFAULT FALSE,
  answered_correctly BOOLEAN,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- leaderboard_periods
CREATE TABLE leaderboard_periods (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_label TEXT NOT NULL,
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ NOT NULL
);

-- leaderboard_entries
CREATE TABLE leaderboard_entries (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES leaderboard_periods(id),
  user_id   UUID NOT NULL REFERENCES user_profiles(id),
  score     INTEGER NOT NULL DEFAULT 0,
  qualified BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(period_id, user_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE user_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE disposal_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags               ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "users_read_own_profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "admins_read_all_profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.is_admin = TRUE
    )
  );

-- disposal_events policies
CREATE POLICY "users_insert_own_disposal"
  ON disposal_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_read_own_disposal"
  ON disposal_events FOR SELECT
  USING (auth.uid() = user_id);

-- flags policies
CREATE POLICY "users_insert_flags"
  ON flags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_read_all_flags"
  ON flags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.is_admin = TRUE
    )
  );

CREATE POLICY "admins_update_all_flags"
  ON flags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.is_admin = TRUE
    )
  );

-- quiz_questions policies
CREATE POLICY "users_read_own_quiz"
  ON quiz_questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_quiz"
  ON quiz_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- leaderboard_periods: all authenticated users can read
CREATE POLICY "authenticated_read_leaderboard_periods"
  ON leaderboard_periods FOR SELECT
  USING (auth.role() = 'authenticated');

-- leaderboard_entries policies
CREATE POLICY "authenticated_read_leaderboard_entries"
  ON leaderboard_entries FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "service_role_insert_leaderboard_entries"
  ON leaderboard_entries FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_role_update_leaderboard_entries"
  ON leaderboard_entries FOR UPDATE
  USING (auth.role() = 'service_role');
