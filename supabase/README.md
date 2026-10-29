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
| লগইন / প্রোফাইল | `hsc28_profiles` | নাম, কলেজ, বোর্ড, টার্গেট, XP, স্ট্রিক, বুকমার্ক, solved CQ, mistake IDs, SRS mastered, **completed_practicals** |
| সিলেবাস ট্র্যাকার | `hsc28_chapter_progress` | প্রতি অধ্যায়ের ৪টি ধাপ (থিওরি / নোটস / MCQ / CQ) |
| সূত্র ভল্ট → ব্যক্তিগত নোট | `hsc28_personal_notes` | নোটের শিরোনাম, লেখা, সূত্র |
| MCQ পরীক্ষা | `hsc28_quiz_attempts` | প্রতিটি পরীক্ষার স্কোর, নির্ভুলতা, সময় |
| স্টাডি প্ল্যানার → টাস্ক | `hsc28_study_tasks` | টাস্ক, বিষয়, প্রায়োরিটি, সম্পন্ন কিনা |
| স্টাডি প্ল্যানার → সেশন | `hsc28_study_sessions` | পমোডোরো/ফোকাস মিনিট ও নোট |
| স্টুডেন্ট হাব → প্রশ্ন | `hsc28_student_doubts` | প্রশ্ন, লেখক, বোর্ড, আপভোট |
| স্টুডেন্ট হাব → উত্তর | `hsc28_doubt_replies` | উত্তর ও সহায়ক কিনা |
| স্টুডেন্ট হাব → আপভোট | `hsc28_doubt_votes` | কে কোন প্রশ্নে ভোট দিয়েছে (এক ইউজার এক ভোট) |
| মেধাতালিকা | `hsc28_profiles` (xp desc) | সবার XP র‍্যাংকিং |

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

## একবারের মাইগ্রেশন: গেস্ট → অ্যাকাউন্ট

লগইন করার সময় অ্যাপ নিজেই দেখে ক্লাউডে ওই টেবিল খালি কিনা। খালি থাকলে
লোকাল (গেস্ট অবস্থায় জমানো) টাস্ক, সেশন, অধ্যায়-অগ্রগতি স্বয়ংক্রিয়ভাবে আপলোড হয়।
ক্লাউডে ডেটা থাকলে সেটাই প্রাধান্য পায় — লোকাল ডেটা দিয়ে ক্লাউড লেখা মুছে যায় না।

---

## নতুন প্রজেক্টে সেটআপ

1. Supabase-এ প্রজেক্ট খুলুন → SQL Editor।
2. `supabase/migrations/2026-10-29-persist-all-data.sql` চালান।
3. আগের ৮টি `hsc28_*` টেবিল আগে থেকেই থাকতে হবে (RLS সহ)।
4. Vercel-এ এনভায়রনমেন্ট ভেরিয়েবল দিন:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (anon key পাবলিক, তবে service_role key কখনো ফ্রন্টএন্ডে দেবেন না।)
5. Supabase → Authentication → URL Configuration:
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
  (select count(*) from hsc28_doubt_votes)      as votes;

-- RLS চালু আছে কি না (সবগুলো true হওয়া উচিত)
select tablename, rowsecurity from pg_tables
where schemaname='public' and tablename like 'hsc28%' order by tablename;
```
