-- নক্ষত্র HSC ’28 — লাইফ হাব ডেটা (Supabase)
--
-- অভ্যাস, ডেডলাইন, পরীক্ষা, চেকলিস্ট ও ক্লাস রুটিন — একটি JSONB ডকুমেন্টে
-- ইউজারপ্রতি এক সারি। স্কিমা বদলালে নতুন কলাম লাগে না, তাই ভবিষ্যতের
-- ফিচার যোগ করাও সহজ।
--
-- Idempotent: safe to re-run.
-- চালানোর নিয়ম: Supabase Dashboard → SQL Editor → এই ফাইল পেস্ট করে Run.

CREATE TABLE IF NOT EXISTS public.hsc28_life_data (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data       jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hsc28_life_data ENABLE ROW LEVEL SECURITY;

-- একজন শিক্ষার্থী শুধু নিজের সারি পড়তে/লিখতে পারবে।
DROP POLICY IF EXISTS hsc28_life_select_own ON public.hsc28_life_data;
CREATE POLICY hsc28_life_select_own ON public.hsc28_life_data
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS hsc28_life_insert_own ON public.hsc28_life_data;
CREATE POLICY hsc28_life_insert_own ON public.hsc28_life_data
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS hsc28_life_update_own ON public.hsc28_life_data;
CREATE POLICY hsc28_life_update_own ON public.hsc28_life_data
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS hsc28_life_delete_own ON public.hsc28_life_data;
CREATE POLICY hsc28_life_delete_own ON public.hsc28_life_data
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- যাচাই:
--   select user_id, updated_at, jsonb_array_length(coalesce(data->'deadlines','[]'::jsonb))
--     from public.hsc28_life_data;
