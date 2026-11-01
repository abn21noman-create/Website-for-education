-- নক্ষত্র HSC ’28 — ক্লাউড ভল্ট ও লাইফ হাব (Supabase)
--
-- ১) `hsc28_life_data` — লাইফ হাবের পুরো ডকুমেন্ট (অভ্যাস, উপস্থিতি,
--    ডেডলাইন, পরীক্ষা, ফলাফল, চেকলিস্ট, ক্লাস রুটিন) এক JSONB সারিতে।
-- ২) `hsc28_kv` — অ্যাপের প্রতিটি `hsc28_*` লোকাল কি-এর আয়না। ফলে মাস্টার
--    রুটিন, নিশ্চয়তা-ক্যালিব্রেশন, মক-প্ল্যান, ভুলের খাতা, সাপ্তাহিক টার্গেট
--    সবই এক ডিভাইস থেকে আরেক ডিভাইসে ফিরে আসে।
--
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS public.hsc28_life_data (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data       jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hsc28_life_data ENABLE ROW LEVEL SECURITY;

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

-- ---------------------------------------------------------------------------
-- ২. ক্লাউড ভল্ট — প্রতি ইউজারের জন্য কি → মান (text, তাই কোনো JSON পার্স
--    সমস্যা নেই; যা-ই লোকালে থাকে হুবহু তাই যায়)।
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.hsc28_kv (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key        text NOT NULL,
  value      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);

-- "কে সবচেয়ে সম্প্রতি লিখেছে" বোঝার জন্য এবং বড় হিসাবের জন্য ইনডেক্স।
CREATE INDEX IF NOT EXISTS hsc28_kv_updated_at_idx
  ON public.hsc28_kv (user_id, updated_at DESC);

ALTER TABLE public.hsc28_kv ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hsc28_kv_select_own ON public.hsc28_kv;
CREATE POLICY hsc28_kv_select_own ON public.hsc28_kv
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS hsc28_kv_insert_own ON public.hsc28_kv;
CREATE POLICY hsc28_kv_insert_own ON public.hsc28_kv
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS hsc28_kv_update_own ON public.hsc28_kv;
CREATE POLICY hsc28_kv_update_own ON public.hsc28_kv
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS hsc28_kv_delete_own ON public.hsc28_kv;
CREATE POLICY hsc28_kv_delete_own ON public.hsc28_kv
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- যাচাই:
--   select key, length(value), updated_at from public.hsc28_kv order by updated_at desc limit 10;
