-- Nokkhotro HSC '28 — privacy-bounded five-question student pulse
--
-- One constrained response per authenticated account. The student can read,
-- update, or delete only their own row. Administrators do not receive rows,
-- user IDs, names, emails, or free text: the privileged RPC returns aggregate
-- counts and two averages only.

CREATE TABLE IF NOT EXISTS public.hsc28_student_feedback (
  user_id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  survey_version     smallint NOT NULL DEFAULT 1,
  primary_need       text NOT NULL,
  biggest_blocker    text NOT NULL,
  app_helpfulness    smallint NOT NULL,
  today_plan_clarity smallint NOT NULL,
  next_priority      text NOT NULL,
  submitted_at       timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hsc28_student_feedback_version CHECK (survey_version = 1),
  CONSTRAINT hsc28_student_feedback_primary_need CHECK (
    primary_need IN ('daily_plan', 'board_practice', 'revision', 'admission_prep')
  ),
  CONSTRAINT hsc28_student_feedback_biggest_blocker CHECK (
    biggest_blocker IN ('know_what_next', 'understand_concepts', 'stay_consistent', 'find_time')
  ),
  CONSTRAINT hsc28_student_feedback_helpfulness CHECK (app_helpfulness BETWEEN 1 AND 5),
  CONSTRAINT hsc28_student_feedback_plan_clarity CHECK (today_plan_clarity BETWEEN 1 AND 5),
  CONSTRAINT hsc28_student_feedback_next_priority CHECK (
    next_priority IN ('more_mcq', 'more_cq_models', 'routine_reminders', 'simpler_faster')
  )
);

ALTER TABLE public.hsc28_student_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.hsc28_student_feedback FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.hsc28_student_feedback TO authenticated;

DROP POLICY IF EXISTS "students read own feedback" ON public.hsc28_student_feedback;
CREATE POLICY "students read own feedback"
  ON public.hsc28_student_feedback FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "students create own feedback" ON public.hsc28_student_feedback;
CREATE POLICY "students create own feedback"
  ON public.hsc28_student_feedback FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "students update own feedback" ON public.hsc28_student_feedback;
CREATE POLICY "students update own feedback"
  ON public.hsc28_student_feedback FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "students delete own feedback" ON public.hsc28_student_feedback;
CREATE POLICY "students delete own feedback"
  ON public.hsc28_student_feedback FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION public.hsc28_admin_survey_insights()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result jsonb;
  response_total bigint;
  recent_total bigint;
  privacy_threshold constant integer := 5;
BEGIN
  PERFORM public.hsc28_assert_admin();

  SELECT count(*), count(*) FILTER (WHERE updated_at >= now() - interval '30 days')
    INTO response_total, recent_total
    FROM public.hsc28_student_feedback;

  -- Do not let a one-person "aggregate" reveal that person's choices. Counts
  -- remain measurable, while scores/distributions unlock only at k >= 5.
  IF response_total < privacy_threshold THEN
    RETURN jsonb_build_object(
      'responses', response_total,
      'updatedLast30Days', recent_total,
      'privacyThreshold', privacy_threshold,
      'insightsReady', false,
      'averageHelpfulness', null,
      'averagePlanClarity', null,
      'primaryNeeds', '{}'::jsonb,
      'biggestBlockers', '{}'::jsonb,
      'nextPriorities', '{}'::jsonb
    );
  END IF;

  SELECT jsonb_build_object(
    'responses', response_total,
    'updatedLast30Days', recent_total,
    'privacyThreshold', privacy_threshold,
    'insightsReady', true,
    'averageHelpfulness', COALESCE((
      SELECT round(avg(app_helpfulness)::numeric, 1)
      FROM public.hsc28_student_feedback
    ), 0),
    'averagePlanClarity', COALESCE((
      SELECT round(avg(today_plan_clarity)::numeric, 1)
      FROM public.hsc28_student_feedback
    ), 0),
    'primaryNeeds', COALESCE((
      SELECT jsonb_object_agg(primary_need, response_count)
      FROM (
        SELECT primary_need, count(*) AS response_count
        FROM public.hsc28_student_feedback
        GROUP BY primary_need
      ) grouped_primary_needs
    ), '{}'::jsonb),
    'biggestBlockers', COALESCE((
      SELECT jsonb_object_agg(biggest_blocker, response_count)
      FROM (
        SELECT biggest_blocker, count(*) AS response_count
        FROM public.hsc28_student_feedback
        GROUP BY biggest_blocker
      ) grouped_blockers
    ), '{}'::jsonb),
    'nextPriorities', COALESCE((
      SELECT jsonb_object_agg(next_priority, response_count)
      FROM (
        SELECT next_priority, count(*) AS response_count
        FROM public.hsc28_student_feedback
        GROUP BY next_priority
      ) grouped_priorities
    ), '{}'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.hsc28_admin_survey_insights() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hsc28_admin_survey_insights() TO authenticated;
