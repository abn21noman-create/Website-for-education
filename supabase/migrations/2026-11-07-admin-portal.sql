-- Nokkhotro HSC '28 — secure administrator portal
--
-- Admin access is server-authoritative. The browser can only ask whether the
-- signed-in user is an admin and call narrowly scoped read-only RPCs. It never
-- receives the allowlist and cannot promote itself with user metadata.
--
-- This migration intentionally does not seed a personal email address. Add the
-- first owner from the Supabase SQL editor after applying it:
--
--   insert into public.hsc28_admin_allowlist (email)
--   values (lower(trim('owner@example.com')))
--   on conflict (email) do nothing;
--
-- Anyone already registered with that email can be backfilled with:
--
--   insert into public.hsc28_admins (user_id)
--   select u.id from auth.users u
--   join public.hsc28_admin_allowlist a on a.email = lower(trim(u.email))
--   on conflict (user_id) do nothing;

-- Private configuration. There are deliberately no client-facing policies.
CREATE TABLE IF NOT EXISTS public.hsc28_admin_allowlist (
  email      text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hsc28_admin_allowlist_normalized
    CHECK (email = lower(trim(email)) AND position('@' IN email) > 1)
);

ALTER TABLE public.hsc28_admin_allowlist ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.hsc28_admin_allowlist FROM PUBLIC, anon, authenticated;

-- Membership is tied to auth.users, so deleting an account also removes its
-- administrator grant. The email itself is not duplicated here.
CREATE TABLE IF NOT EXISTS public.hsc28_admins (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hsc28_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.hsc28_admins FROM PUBLIC, anon, authenticated;

-- Grant/revoke membership whenever an auth account is created or its email is
-- changed. SECURITY DEFINER is required because Auth owns auth.users and the two
-- admin tables are intentionally inaccessible to browser roles.
CREATE OR REPLACE FUNCTION public.hsc28_sync_admin_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND EXISTS (
    SELECT 1
      FROM public.hsc28_admin_allowlist a
     WHERE a.email = lower(trim(NEW.email))
  ) THEN
    INSERT INTO public.hsc28_admins (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    DELETE FROM public.hsc28_admins WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.hsc28_sync_admin_membership() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS hsc28_sync_admin_membership ON auth.users;
CREATE TRIGGER hsc28_sync_admin_membership
AFTER INSERT OR UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.hsc28_sync_admin_membership();

-- Backfill any allowlisted account that existed before this migration.
INSERT INTO public.hsc28_admins (user_id)
SELECT u.id
  FROM auth.users u
  JOIN public.hsc28_admin_allowlist a
    ON a.email = lower(trim(u.email))
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.hsc28_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid() IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM public.hsc28_admins a WHERE a.user_id = auth.uid()
     );
$$;

REVOKE ALL ON FUNCTION public.hsc28_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hsc28_is_admin() TO authenticated;

-- Internal guard shared by every privileged RPC. It is not callable from the
-- API, even by a normal authenticated account.
CREATE OR REPLACE FUNCTION public.hsc28_assert_admin()
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.hsc28_admins a WHERE a.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'administrator access required' USING ERRCODE = '42501';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.hsc28_assert_admin() FROM PUBLIC, anon, authenticated;

-- Aggregate cards for the admin home. No password hashes, tokens, identities,
-- or private study documents are returned.
CREATE OR REPLACE FUNCTION public.hsc28_admin_overview()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public.hsc28_assert_admin();

  SELECT jsonb_build_object(
    'totalUsers',          (SELECT count(*) FROM auth.users u WHERE u.deleted_at IS NULL),
    'confirmedUsers',      (SELECT count(*) FROM auth.users u WHERE u.deleted_at IS NULL AND u.email_confirmed_at IS NOT NULL),
    'newLast7Days',        (SELECT count(*) FROM auth.users u WHERE u.deleted_at IS NULL AND u.created_at >= now() - interval '7 days'),
    'activeLast7Days',     (SELECT count(*) FROM auth.users u WHERE u.deleted_at IS NULL AND u.last_sign_in_at >= now() - interval '7 days'),
    'adminUsers',          (SELECT count(*) FROM public.hsc28_admins),
    'totalStudyMinutes',   (SELECT COALESCE(sum(p.study_minutes), 0) FROM public.hsc28_profiles p WHERE p.is_demo = false),
    'totalXp',             (SELECT COALESCE(sum(p.xp), 0) FROM public.hsc28_profiles p WHERE p.is_demo = false),
    'openDoubts',          (SELECT count(*) FROM public.hsc28_student_doubts d WHERE d.solved = false),
    'totalReplies',        (SELECT count(*) FROM public.hsc28_doubt_replies)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.hsc28_admin_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hsc28_admin_overview() TO authenticated;

-- Searchable, bounded account list for the portal. Authentication secrets and
-- study content never leave the server. The total_count window supports the UI
-- without a second broad query.
CREATE OR REPLACE FUNCTION public.hsc28_admin_list_users(
  p_search text DEFAULT '',
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  board text,
  target_goal text,
  xp integer,
  study_minutes integer,
  joined_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed boolean,
  is_admin boolean,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  term text := trim(COALESCE(p_search, ''));
BEGIN
  PERFORM public.hsc28_assert_admin();

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    COALESCE(NULLIF(trim(p.full_name), ''), 'HSC 2028 শিক্ষার্থী')::text,
    COALESCE(p.board, '')::text,
    COALESCE(p.target_goal, '')::text,
    COALESCE(p.xp, 0)::integer,
    COALESCE(p.study_minutes, 0)::integer,
    u.created_at,
    u.last_sign_in_at,
    (u.email_confirmed_at IS NOT NULL),
    EXISTS (SELECT 1 FROM public.hsc28_admins a WHERE a.user_id = u.id),
    count(*) OVER ()
  FROM auth.users u
  LEFT JOIN public.hsc28_profiles p ON p.id = u.id
  WHERE u.deleted_at IS NULL
    AND (
      term = ''
      OR COALESCE(u.email, '') ILIKE '%' || term || '%'
      OR COALESCE(p.full_name, '') ILIKE '%' || term || '%'
      OR COALESCE(p.college_name, '') ILIKE '%' || term || '%'
    )
  ORDER BY u.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$$;

REVOKE ALL ON FUNCTION public.hsc28_admin_list_users(text, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hsc28_admin_list_users(text, integer, integer) TO authenticated;
