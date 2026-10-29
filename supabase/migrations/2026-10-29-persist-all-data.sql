-- নক্ষত্র HSC ’28 — সম্পূর্ণ ডেটা সংরক্ষণ (Supabase)
--
-- Applied to project "hsc-ultimate" (ref: ougxoabibdvlaehsilfw).
-- Idempotent: safe to re-run.
--
-- চালানোর নিয়ম: Supabase Dashboard → SQL Editor → এই ফাইল পেস্ট করে Run.
-- অথবা: supabase db push (CLI ব্যবহার করলে)

-- ─────────────────────────────────────────────────────────────
-- ১) ব্যবহারিক ট্র্যাকার: আগে কোনো কলামই ছিল না, তাই কখনো সেভ হয়নি
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.hsc28_profiles
  ADD COLUMN IF NOT EXISTS completed_practicals text[] NOT NULL DEFAULT '{}'::text[];

-- ─────────────────────────────────────────────────────────────
-- ২) এক ইউজার = এক ভোট (ডুপ্লিকেট ভোট আটকাতে লেজার টেবিল)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hsc28_doubt_votes (
  doubt_id uuid NOT NULL REFERENCES public.hsc28_student_doubts(id) ON DELETE CASCADE,
  user_id  uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (doubt_id, user_id)
);

ALTER TABLE public.hsc28_doubt_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hsc28_votes_select_own ON public.hsc28_doubt_votes;
CREATE POLICY hsc28_votes_select_own ON public.hsc28_doubt_votes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS hsc28_votes_delete_own ON public.hsc28_doubt_votes;
CREATE POLICY hsc28_votes_delete_own ON public.hsc28_doubt_votes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- ৩) আপভোট: atomic + idempotent
--    security definer, কারণ ক্লায়েন্টের পোস্টে UPDATE পলিসি নেই —
--    থাকলে যে কেউ অন্যের প্রশ্নের পুরো লেখা বদলে দিতে পারত।
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.hsc28_upvote_doubt(p_doubt_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_count integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.hsc28_doubt_votes (doubt_id, user_id)
  VALUES (p_doubt_id, v_user)
  ON CONFLICT (doubt_id, user_id) DO NOTHING;

  IF FOUND THEN
    UPDATE public.hsc28_student_doubts
       SET upvotes = upvotes + 1
     WHERE id = p_doubt_id
    RETURNING upvotes INTO v_count;
  ELSE
    SELECT upvotes INTO v_count
      FROM public.hsc28_student_doubts
     WHERE id = p_doubt_id;
  END IF;

  RETURN COALESCE(v_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.hsc28_unvote_doubt(p_doubt_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_count integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.hsc28_doubt_votes
   WHERE doubt_id = p_doubt_id AND user_id = v_user;

  IF FOUND THEN
    UPDATE public.hsc28_student_doubts
       SET upvotes = GREATEST(upvotes - 1, 0)
     WHERE id = p_doubt_id
    RETURNING upvotes INTO v_count;
  ELSE
    SELECT upvotes INTO v_count
      FROM public.hsc28_student_doubts
     WHERE id = p_doubt_id;
  END IF;

  RETURN COALESCE(v_count, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.hsc28_upvote_doubt(uuid) FROM public;
REVOKE ALL ON FUNCTION public.hsc28_unvote_doubt(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.hsc28_upvote_doubt(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hsc28_unvote_doubt(uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- ৪) ইনডেক্স: লগইনে প্রতিটি টেবিল user_id দিয়ে ফিল্টার হয়
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS hsc28_chapter_progress_user_idx ON public.hsc28_chapter_progress (user_id);
CREATE INDEX IF NOT EXISTS hsc28_quiz_attempts_user_idx   ON public.hsc28_quiz_attempts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS hsc28_study_tasks_user_idx     ON public.hsc28_study_tasks (user_id);
CREATE INDEX IF NOT EXISTS hsc28_study_sessions_user_idx  ON public.hsc28_study_sessions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS hsc28_personal_notes_user_idx  ON public.hsc28_personal_notes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS hsc28_profiles_xp_idx          ON public.hsc28_profiles (xp DESC);
