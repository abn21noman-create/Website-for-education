# ডেটা কোথায় সংরক্ষিত হয় (Data Persistence Map)

এই অ্যাপের **সব** অগ্রগতি দুই স্তরে থাকে:

| স্তর | কোথায় | কখন কাজ করে |
|---|---|---|
| ১. লোকাল | ব্রাউজারের `localStorage` | সবসময় — অফলাইনেও |
| ২. ক্লাউড | Supabase (`hsc28_*` টেবিল) | লগইন করা থাকলে |

লগইন না করলে ডেটা **শুধু ওই ডিভাইসে** থাকে। নেভবারে তখন `শুধু এই ডিভাইসে` দেখায়।
লগইন করলে নেভবারে `সংরক্ষণ হচ্ছে…` → `ক্লাউডে সংরক্ষিত` দেখাবে।

---

## কোন স্ক্রিন কোন টেবিলে যায়

| স্ক্রিন / ফিচার | Supabase টেবিল | কী সংরক্ষিত হয় |
|---|---|---|
| লগইন / প্রোফাইল | `hsc28_profiles` | নাম, কলেজ, বোর্ড, টার্গেট, XP, স্ট্রিক, বুকমার্ক, solved CQ, mistake IDs, SRS mastered, **completed_practicals**, private-by-default `leaderboard_visible` consent |
| Admin Portal | private `hsc28_admin_allowlist`, `hsc28_admins` + RPC | server-authoritative role, aggregate stats ও সীমিত account directory; password/token/study content নয় |
| সিলেবাস ট্র্যাকার | `hsc28_chapter_progress` | প্রতি অধ্যায়ের ৪টি ধাপ (থিওরি / নোটস / MCQ / CQ) |
| সূত্র ভল্ট → ব্যক্তিগত নোট | `hsc28_personal_notes` | নোটের শিরোনাম, লেখা, সূত্র |
| MCQ পরীক্ষা | `hsc28_quiz_attempts` | প্রতিটি পরীক্ষার স্কোর, নির্ভুলতা, সময় |
| স্টাডি প্ল্যানার → টাস্ক | `hsc28_study_tasks` | টাস্ক, বিষয়, প্রায়োরিটি, সম্পন্ন কিনা |
| স্টাডি প্ল্যানার → সেশন | `hsc28_study_sessions` | পমোডোরো/ফোকাস মিনিট ও নোট |
| স্টুডেন্ট হাব → প্রশ্ন | `hsc28_student_doubts` | প্রশ্ন, লেখক, বোর্ড, আপভোট |
| স্টুডেন্ট হাব → উত্তর | `hsc28_doubt_replies` | উত্তর ও সহায়ক কিনা |
| স্টুডেন্ট হাব → আপভোট | `hsc28_doubt_votes` | কে কোন প্রশ্নে ভোট দিয়েছে (এক ইউজার এক ভোট) |
| অগ্রগতি ও কমিউনিটি XP | private `hsc28_profiles` + authenticated view `hsc28_leaderboard` | নিজের metrics; `leaderboard_visible=true` opt-in করা profile-গুলোর সীমিত XP summary (email নয়) |
| ৫-প্রশ্নের শিক্ষার্থী মতামত | `hsc28_student_feedback` + aggregate-only Admin RPC | এক account-এ একটি constrained উত্তর; Admin শুধু totals/averages দেখে—নাম, email, user ID, free text বা individual row নয় |
| লাইফ হাব | `hsc28_life_data` | অভ্যাস, **কলেজ উপস্থিতি**, ডেডলাইন, পরীক্ষা, **ফলাফল**, চেকলিস্ট, **ক্লাস রুটিন** — এক JSONB ডকুমেন্টে |
| **ক্লাউড ভল্ট** (বাকি সব) | `hsc28_kv` | মাস্টার রুটিন, নিশ্চয়তা-ট্যাগ ও অনুমান, মক-প্ল্যান, ভুলের খাতা, সাপ্তাহিক টার্গেট, চ্যাপ্টার ড্রিল, ভাষা/থিম, ব্যক্তিগত নোট-ক্যাশ — `hsc28_*` দিয়ে শুরু হওয়া প্রতিটি লোকাল কি |

বাকি সব (সূত্র, MCQ প্রশ্ন, CQ ব্যাংক, ল্যাব, GPA ক্যালকুলেটর) **স্ট্যাটিক ডেটা** —
`src/data/` ফোল্ডারে থাকে, ক্লাউডে যায় না।

---

## লেখা কীভাবে যায় (durable sync)

`src/lib/sync.ts` সব লেখা একটি কিউয়ের মধ্য দিয়ে পাঠায়:

```
ইউজার কিছু করল
      ↓
syncWrite()  ── সফল ──→  নেভবারে "ক্লাউডে সংরক্ষিত"
      │
      ├── অফলাইন/টাইমআউট ──→ localStorage কিউতে জমা
      │                        নেভবারে "Nটি বাকি"
      │                        ইন্টারনেট ফিরলে নিজে থেকেই পাঠাবে
      │
      └── RLS/permission ──→ আর রিট্রাই করে না, বরং
                             নেভবারে "সিঙ্ক ব্যর্থ" + কারণ দেখায়
```

আগে প্রতিটি লেখা `.then(() => {})` দিয়ে চুপচাপ ফেলে দেওয়া হতো — তাই নেটওয়ার্ক ফেল করলেও
"সংরক্ষিত হয়েছে" টোস্ট দেখাত, আর রিলোডে ডেটা হারিয়ে যেত।

---

## লাইফ হাবের সিঙ্ক কীভাবে কাজ করে

লাইফ হাবের পুরো ডকুমেন্ট (অভ্যাস, ডেডলাইন, পরীক্ষা, রুটিন) একটি সারিতে থাকে:

```
লগইন করার সময়   →  ক্লাউডের সারি vs ডিভাইসের সারি
                     যেটি বেশি নতুন (data.updatedAt), সেটি জেতে
লগইন না করা      →  শুধু ডিভাইসে; মাইগ্রেশন না চললে অ্যাপ নিজেই
                     "শুধু এই ডিভাইসে" দেখায়, ভুল সিঙ্ক-এরর দেখায় না
তারপর প্রতিটি পরিবর্তন → ১.৪ সেকেন্ড ডিবাউন্স করে একবার upsert
```

## ক্লাউড ভল্ট: কে জেতে (second-device rules)

`src/lib/cloudVault.ts` লগইনের সময় প্রতিটি কি-এর জন্য একটাই সিদ্ধান্ত নেয়:

| অবস্থা | ফল |
|---|---|
| এই ডিভাইসে কি-টা নেই | ক্লাউড থেকে বসে |
| দুটোই একই | কিছুই হয় না (নেটওয়ার্ক বাঁচে) |
| এই ডিভাইস আগে কখনো সিঙ্ক করেনি | **ক্লাউড জেতে** — নতুন ফোনের ডিফল্ট ভ্যালু আসল ডেটা ঢাকতে পারে না |
| অন্য ডিভাইসে আমাদের শেষ পাঠানোর পরে বদলেছে | ক্লাউড জেতে |
| লোকাল বদলানো হয়েছে অথচ ক্লাউডে ওঠেনি | **লোকাল জেতে** — অফলাইনে করা কাজ কখনো মুছে যায় না |

পরে সবকিছু আবার ক্লাউডে তোলা হয়, তাই দুই ডিভাইস একই জায়গায় মিলে যায়।

## একবারের মাইগ্রেশন: গেস্ট → অ্যাকাউন্ট

লগইন করার সময় অ্যাপ নিজেই দেখে ক্লাউডে ওই টেবিল খালি কিনা। খালি থাকলে
লোকাল (গেস্ট অবস্থায় জমানো) টাস্ক, সেশন, অধ্যায়-অগ্রগতি স্বয়ংক্রিয়ভাবে আপলোড হয়।
ক্লাউডে ডেটা থাকলে সেটাই প্রাধান্য পায় — লোকাল ডেটা দিয়ে ক্লাউড লেখা মুছে যায় না।

---

## নতুন প্রজেক্টে সেটআপ

1. Supabase-এ প্রজেক্ট খুলুন → SQL Editor।
2. `supabase/migrations/2026-10-29-persist-all-data.sql` চালান।
   তারপর `supabase/migrations/2026-10-30-life-hub.sql`,
   `supabase/migrations/2026-11-01-life-hub-and-cloud-vault.sql`,
   এবং `supabase/migrations/2026-11-02-auth-privacy.sql` ক্রমানুসারে চালান।
   তারপর `supabase/migrations/2026-11-04-cloud-reset-marker.sql` চালান; এটি
   স্টাডি ডেটা ক্লিয়ার হলে অন্য ডিভাইসের পুরোনো লোকাল কপি আবার ক্লাউডে ওঠা আটকায়।
   এরপর `supabase/migrations/2026-11-07-admin-portal.sql` চালান। এটি private
   admin allowlist/membership, server-side role check এবং read-only dashboard RPC তৈরি করে।
   এরপর `supabase/migrations/2026-11-07-leaderboard-consent.sql` চালান; এটি
   community XP visibility-কে default `false` করে এবং শুধু explicit opt-in profile-কে
   authenticated-only, email-বিহীন view-তে রাখে। সর্বশেষে
   `supabase/migrations/2026-11-07-student-pulse.sql` এবং তারপর
   `supabase/migrations/2026-11-07-student-pulse-privacy-threshold.sql` চালান;
   এতে owner-only row, constrained choices, identity-free aggregate Admin RPC এবং
   ৫-response privacy threshold তৈরি হয়।
3. প্রথম owner email অনুমোদন করুন (email-টি source code-এ রাখবেন না):

   ```sql
   insert into public.hsc28_admin_allowlist (email)
   values (lower(trim('owner@example.com')))
   on conflict (email) do nothing;

   -- email-টি আগে register করা থাকলে membership backfill করুন
   insert into public.hsc28_admins (user_id)
   select u.id from auth.users u
   join public.hsc28_admin_allowlist a on a.email = lower(trim(u.email))
   on conflict (user_id) do nothing;
   ```

   এরপর ওই ইমেইল দিয়ে সাধারণ **রেজিস্ট্রেশন / লগইন** ব্যবহার করুন। Public login screen-এ
   আলাদা Admin tab নেই; server role যাচাই করে শুধু অনুমোদিত account-কে স্বয়ংক্রিয়ভাবে
   `/#/admin` Admin Portal-এ নেয়। Allowlist ও membership
   table-এ `anon`/`authenticated`-এর কোনো direct grant বা RLS policy নেই—শুধু Supabase
   Dashboard/management connection থেকে owner যোগ করা যায়।
4. ক্লায়েন্ট আগে ভল্ট ও queued writes সিঙ্ক করে, তারপর একই tab-এর নতুন table writes pause/discard করে `hsc28_clear_my_study_data()` চালায়। RPC-এর পর reset marker পড়ে local cache clear ও reload হয়; RPC response অনিশ্চিত হলে marker reconcile না হওয়া পর্যন্ত write পুনরায় খোলে না। `npm run smoke`-এর deferred-RPC regression এই ordering, concurrent same-user write, duplicate reset, queue ownership ও error recovery যাচাই করে—এটি নিজে live PostgreSQL/Supabase integration test নয়।
5. **Live verification (2026-11-04):** সক্রিয় Supabase প্রজেক্টের DB/Auth/REST healthy; `hsc28_cloud_reset_marker` migration প্রয়োগ হয়েছে; catalog check-এ RPC-এর marker logic ও `authenticated`-only EXECUTE grant নিশ্চিত হয়েছে। Live SQL transaction-এ disposable synthetic auth user ও প্রতিটি private-study table-এ probe row দিয়ে RPC চালিয়ে marker, row deletion এবং profile reset যাচাই করা হয়েছে; deliberate subtransaction rollback-এর পরে test user/row/marker একটিও থাকেনি। `is_demo` profile-ও পাওয়া যায়নি। বাস্তব profile বা browser sign-in দিয়ে reset চালানো হয়নি, তাই frontend-auth end-to-end ও cross-tab reset behavior এখনো আলাদা করে যাচাই করা হয়নি; কোনো live user data বদলানো/মোছা হয়নি।
6. **Live privacy verification (2026-11-07):** migration `20261107160500_leaderboard_private_opt_in` প্রয়োগ হয়েছে। Catalog/query check-এ consent default `false`, `anon` SELECT বন্ধ, `authenticated` SELECT চালু, owner-only profile UPDATE RLS এবং view-তে শুধু `leaderboard_visible=true AND is_demo=false` নিশ্চিত। একমাত্র existing real profile private default পেয়েছে (`0` opted-in / `0` visible); কোনো নাম, XP বা study row বদলানো/মোছা হয়নি।
7. **Live student-pulse verification (2026-11-07):** migrations `20261107173529_student_pulse_private_aggregate` ও `20261107174523_student_pulse_privacy_threshold` প্রয়োগ হয়েছে। Live catalog check-এ table RLS on, ৪টি owner policy, `anon` table/RPC access off, authenticated own-row access on, aggregate RPC `SECURITY DEFINER` + server admin guard, ৬টি answer constraint এবং কোনো name/email/free-text column নেই। RPC body-তে ৫-response threshold ও small-sample suppression-ও catalog থেকে নিশ্চিত। টেবিলটি যাচাইয়ের সময় খালি ছিল; কোনো synthetic বা real response লেখা হয়নি।
8. আগের ৮টি `hsc28_*` টেবিল আগে থেকেই থাকতে হবে (RLS সহ)।
9. Vercel-এ এনভায়রনমেন্ট ভেরিয়েবল দিন:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (anon key পাবলিক, তবে service_role key কখনো ফ্রন্টএন্ডে দেবেন না।)
10. Supabase → Authentication → URL Configuration:
   - Site URL: `https://nokkhotro-hsc-2028.vercel.app`
   - Redirect URLs: Vercel domain + `http://localhost:5173/**`

---

## যাচাই করার কুয়েরি

```sql
-- কোন টেবিলে কত ডেটা জমেছে
select
  (select count(*) from hsc28_profiles)         as profiles,
  (select count(*) from hsc28_study_tasks)      as tasks,
  (select count(*) from hsc28_study_sessions)   as sessions,
  (select count(*) from hsc28_quiz_attempts)    as quizzes,
  (select count(*) from hsc28_chapter_progress) as progress,
  (select count(*) from hsc28_personal_notes)   as notes,
  (select count(*) from hsc28_doubt_votes)      as votes,
  (select count(*) from hsc28_student_feedback) as pulse_responses;

-- ক্লাউড ভল্টে কোন কী কত বড় হয়ে জমেছে
select key, length(value) as chars, updated_at
from hsc28_kv order by updated_at desc limit 10;

-- RLS চালু আছে কি না (সবগুলো true হওয়া উচিত)
select tablename, rowsecurity from pg_tables
where schemaname='public' and tablename like 'hsc28%' order by tablename;
```
