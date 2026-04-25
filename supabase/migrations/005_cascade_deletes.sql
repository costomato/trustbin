-- 005_cascade_deletes.sql
-- Add ON DELETE CASCADE to all foreign keys referencing user_profiles
-- so deleting a user automatically cleans up all their data.

-- disposal_events → user_profiles
ALTER TABLE disposal_events DROP CONSTRAINT disposal_events_user_id_fkey;
ALTER TABLE disposal_events ADD CONSTRAINT disposal_events_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- flags → user_profiles
ALTER TABLE flags DROP CONSTRAINT flags_user_id_fkey;
ALTER TABLE flags ADD CONSTRAINT flags_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- flags → disposal_events
ALTER TABLE flags DROP CONSTRAINT flags_disposal_event_id_fkey;
ALTER TABLE flags ADD CONSTRAINT flags_disposal_event_id_fkey
  FOREIGN KEY (disposal_event_id) REFERENCES disposal_events(id) ON DELETE CASCADE;

-- quiz_questions → user_profiles
ALTER TABLE quiz_questions DROP CONSTRAINT quiz_questions_user_id_fkey;
ALTER TABLE quiz_questions ADD CONSTRAINT quiz_questions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- quiz_questions → disposal_events
ALTER TABLE quiz_questions DROP CONSTRAINT quiz_questions_disposal_event_id_fkey;
ALTER TABLE quiz_questions ADD CONSTRAINT quiz_questions_disposal_event_id_fkey
  FOREIGN KEY (disposal_event_id) REFERENCES disposal_events(id) ON DELETE CASCADE;

-- leaderboard_entries → user_profiles
ALTER TABLE leaderboard_entries DROP CONSTRAINT leaderboard_entries_user_id_fkey;
ALTER TABLE leaderboard_entries ADD CONSTRAINT leaderboard_entries_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- user_profiles → auth.users
ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_id_fkey;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
