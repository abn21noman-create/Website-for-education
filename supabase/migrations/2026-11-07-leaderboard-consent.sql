-- Make community XP participation explicit and private by default.
-- Existing and new profiles remain absent from the community view until their
-- owner opts in. The base profile table stays owner-readable under RLS.
ALTER TABLE public.hsc28_profiles
  ADD COLUMN IF NOT EXISTS leaderboard_visible boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.hsc28_profiles.leaderboard_visible IS
  'Owner-controlled consent to appear in the authenticated community XP view.';

CREATE INDEX IF NOT EXISTS hsc28_profiles_visible_xp_idx
  ON public.hsc28_profiles (xp DESC)
  WHERE leaderboard_visible = true AND is_demo = false;

CREATE OR REPLACE VIEW public.hsc28_leaderboard AS
SELECT id, full_name, college_name, board, target_goal, avatar_color,
       xp, chapters_mastered, quizzes_taken, best_accuracy, study_minutes,
       streak_days, is_demo
FROM public.hsc28_profiles
WHERE leaderboard_visible = true AND is_demo = false;

REVOKE ALL ON public.hsc28_leaderboard FROM PUBLIC, anon;
GRANT SELECT ON public.hsc28_leaderboard TO authenticated;
