-- Make an explicit study-data clear win over stale local copies on every device.
-- Apply after 2026-11-02-auth-privacy.sql. The marker survives the KV deletion,
-- but the client treats it as control metadata rather than a study-data key.
CREATE OR REPLACE FUNCTION public.hsc28_clear_my_study_data()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  uid uuid := auth.uid();
  reset_token text := clock_timestamp()::text || ':' || txid_current()::text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.hsc28_kv WHERE user_id = uid;
  INSERT INTO public.hsc28_kv (user_id, key, value, updated_at)
  VALUES (uid, 'hsc28_vault_reset_marker', reset_token, now())
  ON CONFLICT (user_id, key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;

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
