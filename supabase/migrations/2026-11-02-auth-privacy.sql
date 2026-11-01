-- Apply together with the frontend that reads hsc28_leaderboard.
-- Public ranking contains only explicitly selected, non-private fields.
CREATE OR REPLACE VIEW public.hsc28_leaderboard AS
SELECT id, full_name, college_name, board, target_goal, avatar_color,
       xp, chapters_mastered, quizzes_taken, best_accuracy, study_minutes, streak_days, is_demo
FROM public.hsc28_profiles WHERE is_demo = false;
REVOKE ALL ON public.hsc28_leaderboard FROM PUBLIC, anon;
GRANT SELECT ON public.hsc28_leaderboard TO authenticated;

DROP POLICY IF EXISTS hsc28_profiles_select_all ON public.hsc28_profiles;
DROP POLICY IF EXISTS hsc28_profiles_select_own ON public.hsc28_profiles;
CREATE POLICY hsc28_profiles_select_own ON public.hsc28_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.hsc28_create_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  INSERT INTO public.hsc28_profiles (id, full_name, is_demo)
  VALUES (NEW.id, COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), 'HSC 2028 শিক্ষার্থী'), false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.hsc28_create_profile() FROM PUBLIC;
DROP TRIGGER IF EXISTS hsc28_on_user_created ON auth.users;
CREATE TRIGGER hsc28_on_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.hsc28_create_profile();

-- Deletes only the caller's private study data; forum posts are intentionally
-- excluded so another student's replies can never be removed by cascade.
CREATE OR REPLACE FUNCTION public.hsc28_clear_my_study_data()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501'; END IF;
  DELETE FROM public.hsc28_kv WHERE user_id = uid;
  DELETE FROM public.hsc28_life_data WHERE user_id = uid;
  DELETE FROM public.hsc28_chapter_progress WHERE user_id = uid;
  DELETE FROM public.hsc28_personal_notes WHERE user_id = uid;
  DELETE FROM public.hsc28_quiz_attempts WHERE user_id = uid;
  DELETE FROM public.hsc28_study_sessions WHERE user_id = uid;
  DELETE FROM public.hsc28_study_tasks WHERE user_id = uid;
  UPDATE public.hsc28_profiles SET xp = 0, chapters_mastered = 0, quizzes_taken = 0,
    best_accuracy = 0, study_minutes = 0, streak_days = 1, bookmarks = '{}',
    solved_cqs = '{}', mistake_ids = '{}', srs_mastered_ids = '{}', completed_practicals = '{}',
    updated_at = now() WHERE id = uid;
END;
$$;
REVOKE ALL ON FUNCTION public.hsc28_clear_my_study_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hsc28_clear_my_study_data() TO authenticated;
