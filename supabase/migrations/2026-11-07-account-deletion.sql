-- Nokkhotro HSC '28 — complete, server-authoritative account deletion
--
-- The browser can only call the delete-account Edge Function with its own JWT.
-- The Edge Function hard-deletes that verified Auth user. This migration makes
-- the Auth deletion the single transactional boundary for all hsc28 data and
-- prevents a still-open tab from recreating rows after the Auth user is gone.

-- Existing community foreign keys preserved authored text with ON DELETE SET
-- NULL. Full-account deletion instead removes authored questions/replies, as the
-- public privacy/deletion pages promise.
ALTER TABLE public.hsc28_student_doubts
  DROP CONSTRAINT IF EXISTS hsc28_student_doubts_user_id_fkey;
ALTER TABLE public.hsc28_student_doubts
  ADD CONSTRAINT hsc28_student_doubts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE public.hsc28_doubt_replies
  DROP CONSTRAINT IF EXISTS hsc28_doubt_replies_user_id_fkey;
ALTER TABLE public.hsc28_doubt_replies
  ADD CONSTRAINT hsc28_doubt_replies_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

-- Profiles and vote ownership predated an Auth foreign key. Enforcing these
-- links both supplies a cascade fallback and rejects writes made with a stale
-- JWT after account deletion.
ALTER TABLE public.hsc28_profiles
  DROP CONSTRAINT IF EXISTS hsc28_profiles_id_fkey;
ALTER TABLE public.hsc28_profiles
  ADD CONSTRAINT hsc28_profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE public.hsc28_doubt_votes
  DROP CONSTRAINT IF EXISTS hsc28_doubt_votes_user_id_fkey;
ALTER TABLE public.hsc28_doubt_votes
  ADD CONSTRAINT hsc28_doubt_votes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

-- Validate where the installation has no legacy/demo orphan. NOT VALID still
-- enforces new writes and cascades existing matching rows; an old standalone
-- demo profile therefore cannot block the whole migration on another install.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.hsc28_student_doubts d
    LEFT JOIN auth.users u ON u.id = d.user_id
    WHERE d.user_id IS NOT NULL AND u.id IS NULL
  ) THEN
    ALTER TABLE public.hsc28_student_doubts
      VALIDATE CONSTRAINT hsc28_student_doubts_user_id_fkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.hsc28_doubt_replies r
    LEFT JOIN auth.users u ON u.id = r.user_id
    WHERE r.user_id IS NOT NULL AND u.id IS NULL
  ) THEN
    ALTER TABLE public.hsc28_doubt_replies
      VALIDATE CONSTRAINT hsc28_doubt_replies_user_id_fkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.hsc28_profiles p
    LEFT JOIN auth.users u ON u.id = p.id
    WHERE u.id IS NULL
  ) THEN
    ALTER TABLE public.hsc28_profiles
      VALIDATE CONSTRAINT hsc28_profiles_id_fkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.hsc28_doubt_votes v
    LEFT JOIN auth.users u ON u.id = v.user_id
    WHERE u.id IS NULL
  ) THEN
    ALTER TABLE public.hsc28_doubt_votes
      VALIDATE CONSTRAINT hsc28_doubt_votes_user_id_fkey;
  END IF;
END;
$$;

-- Account deletion is stricter than the separate study-data reset: it removes
-- community contributions as well. Recompute denormalized upvote counts when a
-- deleting user had voted on another student's surviving question.
CREATE OR REPLACE FUNCTION public.hsc28_purge_account_before_auth_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  affected_doubt_id uuid;
BEGIN
  -- Removing a question also removes every reply/vote in its thread through the
  -- existing doubt_id cascades. This matches the disclosure shown to the user.
  DELETE FROM public.hsc28_student_doubts WHERE user_id = OLD.id;
  DELETE FROM public.hsc28_doubt_replies WHERE user_id = OLD.id;

  -- Keep this sequential: a data-modifying CTE uses one SQL snapshot and could
  -- count the just-removed vote. Each loop iteration deletes first and then
  -- recomputes the surviving thread's denormalized total.
  FOR affected_doubt_id IN
    SELECT DISTINCT doubt_id
      FROM public.hsc28_doubt_votes
     WHERE user_id = OLD.id
  LOOP
    DELETE FROM public.hsc28_doubt_votes
     WHERE user_id = OLD.id
       AND doubt_id = affected_doubt_id;

    UPDATE public.hsc28_student_doubts d
       SET upvotes = (
         SELECT count(*)::integer
           FROM public.hsc28_doubt_votes v
          WHERE v.doubt_id = d.id
       )
     WHERE d.id = affected_doubt_id;
  END LOOP;

  -- Defensive cleanup if a legacy row somehow has a null doubt_id.
  DELETE FROM public.hsc28_doubt_votes WHERE user_id = OLD.id;

  DELETE FROM public.hsc28_student_feedback WHERE user_id = OLD.id;
  DELETE FROM public.hsc28_kv WHERE user_id = OLD.id;
  DELETE FROM public.hsc28_life_data WHERE user_id = OLD.id;
  DELETE FROM public.hsc28_chapter_progress WHERE user_id = OLD.id;
  DELETE FROM public.hsc28_personal_notes WHERE user_id = OLD.id;
  DELETE FROM public.hsc28_quiz_attempts WHERE user_id = OLD.id;
  DELETE FROM public.hsc28_study_sessions WHERE user_id = OLD.id;
  DELETE FROM public.hsc28_study_tasks WHERE user_id = OLD.id;
  DELETE FROM public.hsc28_admins WHERE user_id = OLD.id;
  DELETE FROM public.hsc28_profiles WHERE id = OLD.id;

  -- The private allowlist is operational configuration but still contains the
  -- administrator's email, so a deleting administrator is removed from it too.
  IF OLD.email IS NOT NULL THEN
    DELETE FROM public.hsc28_admin_allowlist
     WHERE email = lower(trim(OLD.email));
  END IF;

  RETURN OLD;
END;
$$;

REVOKE ALL ON FUNCTION public.hsc28_purge_account_before_auth_delete()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS hsc28_purge_account_before_delete ON auth.users;
CREATE TRIGGER hsc28_purge_account_before_delete
BEFORE DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.hsc28_purge_account_before_auth_delete();

-- The application requires authentication before opening Peer Q&A. Match the
-- database boundary to that product behavior instead of leaving posts readable
-- through the anonymous REST role.
DROP POLICY IF EXISTS hsc28_doubts_select_all ON public.hsc28_student_doubts;
DROP POLICY IF EXISTS hsc28_doubts_select_authenticated ON public.hsc28_student_doubts;
CREATE POLICY hsc28_doubts_select_authenticated
  ON public.hsc28_student_doubts FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS hsc28_replies_select_all ON public.hsc28_doubt_replies;
DROP POLICY IF EXISTS hsc28_replies_select_authenticated ON public.hsc28_doubt_replies;
CREATE POLICY hsc28_replies_select_authenticated
  ON public.hsc28_doubt_replies FOR SELECT
  TO authenticated USING (true);

COMMENT ON FUNCTION public.hsc28_purge_account_before_auth_delete() IS
  'Transactionally removes all Nokkhotro account data before an Auth user is hard-deleted.';
