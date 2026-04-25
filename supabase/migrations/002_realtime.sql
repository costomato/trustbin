-- 002_realtime.sql
-- Enable Realtime on disposal_events table

ALTER PUBLICATION supabase_realtime ADD TABLE disposal_events;
