-- Add policy to allow users to update their own quiz questions (mark as answered)
CREATE POLICY "users_update_own_quiz"
  ON quiz_questions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
