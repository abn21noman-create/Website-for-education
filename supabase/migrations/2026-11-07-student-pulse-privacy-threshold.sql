-- Harden the student-pulse aggregate against one-person disclosure.
-- Apply after 2026-11-07-student-pulse.sql. The response count remains visible,
-- but scores and choice distributions stay hidden until at least five accounts
-- have answered.

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
