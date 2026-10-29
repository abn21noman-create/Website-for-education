import React, { useState } from 'react';
import {
  Compass,
  Stethoscope,
  GraduationCap,
  CheckCircle2,
  Eye,
  EyeOff,
  Zap,
  Calculator,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  ActiveTab,
  ChapterProgressState,
  Lang,
  StudentProfile,
  SubjectKey,
  Theme,
} from '../types';
import { CHAPTERS } from '../data/syllabusData';
import { formatNum } from '../lib/i18n';

interface AdmissionViewProps {
  lang: Lang;
  theme: Theme;
  profile: StudentProfile;
  progressMap: Record<string, ChapterProgressState>;
  onNavigate: (tab: ActiveTab, subjectKey?: SubjectKey) => void;
  onAwardXp: (points: number, msgBn: string, msgEn: string) => void;
}

type AdmissionTrack = 'buet' | 'medical' | 'du';

interface TrackProblem {
  id: string;
  tag: { bn: string; en: string };
  question: { bn: string; en: string };
  trick: { bn: string; en: string };
  solution: { bn: string; en: string };
}

const TRACK_PROBLEMS: Record<AdmissionTrack, TrackProblem[]> = {
  buet: [
    {
      id: 'buet-1',
      tag: {
        bn: 'BUET Written • পদার্থবিজ্ঞান ১ম (ভেক্টর ও গতিবিদ্যা)',
        en: 'BUET Written • Physics 1st (Vectors & Projectile)',
      },
      question: {
        bn: 'ভূমি হতে 40 m/s বেগে 60° কোণে নিক্ষিপ্ত একটি প্রাস নিক্ষেপের 3 s পর কত বেগে এবং অনুভূমিকের সাথে কত কোণে গতিশীল থাকবে?',
        en: 'A projectile is launched at 40 m/s at 60° above horizontal. Find the magnitude and angle of its velocity after t = 3 s.',
      },
      trick: {
        bn: 'অনুভূমিক বেগ v_x সর্বদা ধ্রুব থাকে; শুধুমাত্র উল্লম্ব বেগ v_y = v₀ sinθ - gt পরিবর্তিত হয়!',
        en: 'Horizontal component v_x never changes; only v_y = v₀ sinθ - gt changes!',
      },
      solution: {
        bn: 'v_x = 40 cos60° = 20 m/s। v_y = 40 sin60° - 9.8×3 = 34.64 - 29.4 = 5.24 m/s। সুতরাং v = √(20² + 5.24²) = 20.68 m/s এবং কোণ α = tan⁻¹(5.24 / 20) = 14.68° (উপরের দিকে)।',
        en: 'v_x = 40 cos60° = 20 m/s; v_y = 40 sin60° - 9.8(3) = 5.24 m/s ⇒ v = √(20² + 5.24²) = 20.68 m/s at α = tan⁻¹(5.24/20) = 14.68°.',
      },
    },
    {
      id: 'buet-2',
      tag: {
        bn: 'BUET Written • উচ্চতর গণিত ১ম (অন্তরীকরণ ও স্পর্শক)',
        en: 'BUET Written • Higher Math 1st (Calculus)',
      },
      question: {
        bn: 'x² + y² - 4x - 6y + 4 = 0 বৃত্তের (4, 2) বিন্দুতে স্পর্শক ও অভিলম্বের সমীকরণ নির্ণয় করো।',
        en: 'Find the equations of the tangent and normal to the circle x² + y² - 4x - 6y + 4 = 0 at the point (4, 2).',
      },
      trick: {
        bn: 'বৃত্তে x² → xx₁, y² → yy₁, 2x → (x+x₁), 2y → (y+y₁) প্রতিস্থাপন করলেই ১ লাইনে স্পর্শক পাওয়া যায়!',
        en: 'Replace x² → xx₁, y² → yy₁, 2x → (x+x₁), 2y → (y+y₁) for instant tangent!',
      },
      solution: {
        bn: 'স্পর্শক: 4x + 2y - 2(x + 4) - 3(y + 2) + 4 = 0 ⇒ 2x - y - 10 = 0। অভিলম্ব (লম্ব রেখা যা (4,2)গামী): x + 2y = 4 + 2(2) ⇒ x + 2y - 8 = 0।',
        en: 'Tangent: 4x + 2y - 2(x+4) - 3(y+2) + 4 = 0 ⇒ 2x - y - 10 = 0. Normal through (4,2): x + 2y - 8 = 0.',
      },
    },
  ],
  medical: [
    {
      id: 'med-1',
      tag: {
        bn: 'Medical Admission • জীববিজ্ঞান ১ম (কোষ ও এর গঠন)',
        en: 'Medical Admission • Biology 1st (Cell Structure)',
      },
      question: {
        bn: 'কোন কোন কোষীয় অঙ্গাণু দ্বিস্তরী আবরণী (Double membrane) বিশিষ্ট এবং কোনটি আবরণীবিহীন?',
        en: 'Which cell organelles have a double membrane vs. NO membrane at all?',
      },
      trick: {
        bn: 'মনে রাখার ছন্দ — আবরণীবিহীন: “রাইবো-সেন্ট্রো-নিউক্লিও” (রাইবোজোম, সেন্ট্রিওল, নিউক্লিওলাস, সাইটোস্কেলেটন)!',
        en: 'Non-membranous mnemonic: Ribosome, Centriole, Nucleolus & Cytoskeleton!',
      },
      solution: {
        bn: 'দ্বিস্তরী আবরণী: মাইটোকন্ড্রিয়া, ক্লোরোপ্লাস্ট (প্লাস্টিড) ও নিউক্লিয়াস। একস্তরী: লাইসোজোম, গলগি বডি, এন্ডোপ্লাজমিক রেটিকুলাম, পারঅক্সিজোম। আবরণীবিহীন: রাইবোজোম ও সেন্ট্রিওল।',
        en: 'Double: Mitochondria, Plastid, Nucleus. Single: Lysosome, Golgi, ER, Peroxisome. None: Ribosome & Centriole.',
      },
    },
    {
      id: 'med-2',
      tag: {
        bn: 'Medical Admission • রসায়ন ১ম (গুণগত রসায়ন — শিখা পরীক্ষা)',
        en: 'Medical Admission • Chemistry 1st (Flame Test Colors)',
      },
      question: {
        bn: 'খালি চোখে ও ব্লু-গ্লাস দিয়ে শিখা পরীক্ষায় Na⁺, K⁺, Ca²⁺ এবং Cu²⁺ আয়নের বর্ণ কী রূপ দেখায়?',
        en: 'What colors do Na⁺, K⁺, Ca²⁺, and Cu²⁺ produce in the Bunsen flame test?',
      },
      trick: {
        bn: 'শিখা পরীক্ষায় গাঢ় HCl ব্যবহার করা হয় কারণ ধাতব ক্লোরাইড লবণসমূহ অধিক উদ্বায়ী (Volatile)!',
        en: 'Conc. HCl converts metal salts into volatile chlorides so they vaporize in the flame!',
      },
      solution: {
        bn: 'Na⁺ = সোনালি হলুদ (Golden yellow), K⁺ = বেগুনি (Lilac/Violet; ব্লু-গ্লাসে গোলাপি-লাল), Ca²⁺ = ইটের মতো লাল (Brick red), Cu²⁺ = নীলাভ সবুজ (Bluish green)। (Be ও Mg শিখা পরীক্ষা দেয় না!)।',
        en: 'Na⁺: Golden yellow; K⁺: Lilac; Ca²⁺: Brick red; Cu²⁺: Bluish green. Note: Be²⁺ & Mg²⁺ do NOT give flame colors!',
      },
    },
  ],
  du: [
    {
      id: 'du-1',
      tag: {
        bn: 'ঢাবি ‘ক’ ইউনিট (ক্যালকুলেটর ছাড়া!) • রসায়ন pH শর্টকাট',
        en: 'DU Ka-Unit (No Calculator!) • Instant pH Trick',
      },
      question: {
        bn: 'ক্যালকুলেটর ছাড়াই ৫ সেকেন্ডে বের করো: [H⁺] = 3 × 10⁻⁴ M হলে দ্রবণের pH কত?',
        en: 'Without a calculator, find the pH when [H⁺] = 3 × 10⁻⁴ M in 5 seconds!',
      },
      trick: {
        bn: 'সূত্র: [H⁺] = a × 10⁻ᵇ হলে pH = b - log₁₀(a)। শুধু ৩টি মান মুখস্থ রাখো: log 2 ≈ 0.30, log 3 ≈ 0.48, log 5 ≈ 0.70!',
        en: 'For [H⁺] = a × 10⁻ᵇ, pH = b - log₁₀(a). Memorize log 2 = 0.30, log 3 = 0.48, log 5 = 0.70!',
      },
      solution: {
        bn: 'এখানে b = 4 এবং a = 3। সুতরাং pH = 4 - log₁₀(3) = 4 - 0.48 = 3.52! কোনো ক্যালকুলেটর ছাড়াই নিখুঁত উত্তর।',
        en: 'pH = 4 - log₁₀(3) = 4 - 0.48 = 3.52!',
      },
    },
    {
      id: 'du-2',
      tag: {
        bn: 'ঢাবি ‘ক’ Written + MCQ • উচ্চতর গণিত ১ম (ত্রিকোণমিতি ও লিমিট)',
        en: 'DU Ka Written + MCQ • Higher Math Limit Shortcut',
      },
      question: {
        bn: 'মান নির্ণয় করো: lim(x→0) (e^(5x) - e^(2x)) / sin(3x)।',
        en: 'Evaluate without calculator: lim(x→0) (e^(5x) - e^(2x)) / sin(3x).',
      },
      trick: {
        bn: 'L’Hôpital বা শর্টকাট: lim(x→0) (e^(ax) - e^(bx)) / sin(cx) = (a - b) / c!',
        en: 'By L’Hôpital’s rule at x = 0: (a·e⁰ - b·e⁰) / (c·cos 0) = (a - b) / c!',
      },
      solution: {
        bn: 'লব ও হরকে x-এর সাপেক্ষে অন্তরীকরণ করে x = 0 বসালে: (5e⁰ - 2e⁰) / (3 cos0) = (5 - 2) / 3 = 3 / 3 = 1।',
        en: 'Differentiating numerator and denominator: (5 - 2) / 3 = 1.',
      },
    },
  ],
};

const MENTAL_DRILLS = [
  {
    q: '-log₁₀(2 × 10⁻⁵) = ?  (Hint: log 2 = 0.30)',
    options: ['4.70', '5.30', '4.30', '3.70'],
    ans: 0,
    exp: '5 - log₁₀(2) = 5 - 0.30 = 4.70',
  },
  {
    q: 'cos 120° এর মান কত?',
    options: ['+1/2', '-1/2', '-√3/2', '0'],
    ans: 1,
    exp: 'cos(180° - 60°) = -cos 60° = -1/2 = -0.5',
  },
  {
    q: '72 km/h = কত m/s?',
    options: ['15 m/s', '20 m/s', '25 m/s', '18 m/s'],
    ans: 1,
    exp: 'km/h কে 3.6 দিয়ে ভাগ করলে m/s পাওয়া যায়: 72 / 3.6 = 20 m/s',
  },
  {
    q: '√50 এর আসন্ন মান কোনটি? (ক্যালকুলেটর ছাড়া)',
    options: ['6.85', '7.07', '7.25', '7.50'],
    ans: 1,
    exp: '√50 = √(25 × 2) = 5 × √2 = 5 × 1.414 = 7.07',
  },
];

export const AdmissionView: React.FC<AdmissionViewProps> = ({
  lang,
  theme,
  profile,
  progressMap,
  onNavigate,
  onAwardXp,
}) => {
  const isDark = theme === 'dark';

  const defaultTrack: AdmissionTrack = profile.targetGoal
    .toLowerCase()
    .includes('med')
    ? 'medical'
    : profile.targetGoal.toLowerCase().includes('du')
    ? 'du'
    : 'buet';

  const [track, setTrack] = useState<AdmissionTrack>(defaultTrack);
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({});
  const [drillIdx, setDrillIdx] = useState<number>(0);
  const [drillPicked, setDrillPicked] = useState<number | null>(null);

  // Class 11 High-Yield Foundation Chapters for the chosen Admission Track
  const trackSubjects: Record<AdmissionTrack, SubjectKey[]> = {
    buet: ['physics1', 'math1', 'chemistry1'],
    medical: ['biology1', 'chemistry1', 'physics1', 'english'],
    du: ['physics1', 'chemistry1', 'math1', 'biology1'],
  };

  const foundationChapters = CHAPTERS.filter(
    (c) => trackSubjects[track].includes(c.subjectKey) && c.highYield
  ).slice(0, 6);

  const cardClass = `p-5 sm:p-6 rounded-2xl border transition-all ${
    isDark
      ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
      : 'bg-white/95 border-slate-200/80 card-soft-light'
  }`;

  const activeDrill = MENTAL_DRILLS[drillIdx];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/80'
        }`}
      >
        <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          {lang === 'bn'
            ? 'অ্যাডমিশন ফাউন্ডেশন • HSC 2028 বিজ্ঞান ব্যাচ'
            : 'ADMISSION FOUNDATION • HSC 2028 SCIENCE'}
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 mt-0.5">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span>
            {lang === 'bn'
              ? 'BUET, মেডিকেল ও ঢাবি ‘ক’ প্রিপারেশন হাব'
              : 'BUET, Medical & DU Ka-Unit Prep Hub'}
          </span>
        </h1>
        <p
          className={`text-xs sm:text-sm mt-1 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {lang === 'bn'
            ? 'একাদশ শ্রেণি থেকেই বোর্ড পড়ার পাশাপাশি তোমার স্বপ্নের বিশ্ববিদ্যালয়ের বেসিক, শর্টকাট ও ক্যালকুলেটর-বিহীন হিসাব আয়ত্ত করো।'
            : 'Build rock-solid Class 11 fundamentals, written techniques, and calculator-free mental math for your target admission track.'}
        </p>
      </div>

      {/* Track Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            id: 'buet' as AdmissionTrack,
            icon: <Compass className="w-4 h-4" />,
            bn: 'BUET / CKRUET ইঞ্জিনিয়ারিং',
            en: 'BUET / Engineering Track',
            subBn: 'প্রিলি ১০০ MCQ + লিখিত ৪০০ নম্বর (ক্যালকুলেটর অনুমোদিত)',
            subEn: 'Prelim 100 MCQ + 400 Written (Sci. Calculator Allowed)',
          },
          {
            id: 'medical' as AdmissionTrack,
            icon: <Stethoscope className="w-4 h-4" />,
            bn: 'মেডিকেল ও ডেন্টাল (MBBS/BDS)',
            en: 'Medical & Dental Track',
            subBn: '১০০ MCQ (জীব ৩০, রসা ২৫, পদা ২০, ইং ১৫, GK ১০ • ক্যালকুলেটর নিষিদ্ধ)',
            subEn: '100 MCQ • -0.25 Negative Marking • NO Calculator',
          },
          {
            id: 'du' as AdmissionTrack,
            icon: <GraduationCap className="w-4 h-4" />,
            bn: 'ঢাকা বিশ্ববিদ্যালয় ‘ক’ ও GST',
            en: 'DU Ka-Unit & GST Science',
            subBn: '৬০ MCQ + ৪০ লিখিত = ১০০ নম্বর (ক্যালকুলেটর সম্পূর্ণ নিষিদ্ধ!)',
            subEn: '60 MCQ + 40 Written • Strictly NO Calculator!',
          },
        ].map((item) => {
          const active = track === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTrack(item.id)}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                active
                  ? isDark
                    ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-100 shadow-xs'
                    : 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:border-slate-500'
                  : 'bg-white border-slate-200/85 text-slate-700 hover:border-indigo-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2 font-extrabold text-sm">
                {item.icon}
                <span>{lang === 'bn' ? item.bn : item.en}</span>
              </div>
              <p
                className={`text-[11px] mt-1.5 leading-relaxed ${
                  active ? 'opacity-90' : 'opacity-65'
                }`}
              >
                {lang === 'bn' ? item.subBn : item.subEn}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Track Concept & Written/Trick Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className={cardClass}>
            <h2 className="font-bold text-base mb-4">
              {lang === 'bn'
                ? 'নির্বাচিত ভর্তি পরীক্ষার আদর্শ প্রশ্ন ও শর্টকাট কৌশল'
                : 'Curated Admission Questions & Exam-Hall Shortcuts'}
            </h2>

            <div className="space-y-4">
              {TRACK_PROBLEMS[track].map((prob) => {
                const isOpen = !!openSolutions[prob.id];
                return (
                  <div
                    key={prob.id}
                    className={`p-4 rounded-xl border space-y-3 ${
                      isDark
                        ? 'bg-slate-900/55 border-slate-700/80'
                        : 'bg-slate-50/80 border-slate-200/85'
                    }`}
                  >
                    <span className="inline-block text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-300">
                      {prob.tag[lang]}
                    </span>
                    <p className="text-sm font-bold leading-relaxed">
                      {prob.question[lang]}
                    </p>
                    <div
                      className={`p-3 rounded-lg border text-xs ${
                        isDark
                          ? 'bg-amber-500/10 border-amber-400/25 text-amber-200'
                          : 'bg-amber-50/90 border-amber-200 text-amber-900'
                      }`}
                    >
                      <span className="font-extrabold">
                        {lang === 'bn' ? 'ট্রিক / মূলসূত্র: ' : 'Key Trick: '}
                      </span>
                      {prob.trick[lang]}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setOpenSolutions((prev) => ({
                          ...prev,
                          [prob.id]: !isOpen,
                        }))
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-teal-300'
                          : 'bg-white border-slate-200 text-teal-700 shadow-2xs'
                      }`}
                    >
                      {isOpen ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isOpen
                          ? lang === 'bn'
                            ? 'সমাধান লুকান'
                            : 'Hide Solution'
                          : lang === 'bn'
                          ? 'পূর্ণাঙ্গ সমাধান দেখুন'
                          : 'Reveal Full Solution'}
                      </span>
                    </button>

                    {isOpen && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                          isDark
                            ? 'bg-emerald-500/10 border-emerald-400/25 text-emerald-100'
                            : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        }`}
                      >
                        {prob.solution[lang]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Calculator-Free Mental Math Trainer + Class 11 Golden Chapters */}
        <div className="lg:col-span-5 space-y-6">
          {/* No-Calculator Drill */}
          <div className={`${cardClass} space-y-4`}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Calculator className="w-4 h-4 text-teal-500" />
                <span>
                  {lang === 'bn'
                    ? 'ক্যালকুলেটর-বিহীন দ্রুত হিসাব ড্রিল'
                    : 'No-Calculator Mental Math Drill'}
                </span>
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-300 font-bold">
                +10 XP
              </span>
            </div>

            <div
              className={`p-4 rounded-xl border font-formula text-sm font-bold ${
                isDark
                  ? 'bg-slate-900/70 border-slate-700 text-indigo-200'
                  : 'bg-indigo-50/60 border-indigo-100 text-indigo-950'
              }`}
            >
              {activeDrill.q}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {activeDrill.options.map((opt, idx) => {
                const chosen = drillPicked === idx;
                const isRight = idx === activeDrill.ans;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={drillPicked !== null}
                    onClick={() => {
                      setDrillPicked(idx);
                      if (isRight) {
                        onAwardXp(
                          10,
                          'ক্যালকুলেটর ছাড়া সঠিক হিসাব! (+১০ XP)',
                          'Correct mental calculation! (+10 XP)'
                        );
                      }
                    }}
                    className={`py-2.5 px-3 rounded-xl border font-mono text-xs font-bold cursor-pointer transition-all ${
                      drillPicked === null
                        ? isDark
                          ? 'bg-slate-900/50 border-slate-700 hover:border-indigo-400'
                          : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                        : isRight
                        ? isDark
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : chosen
                        ? isDark
                          ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'opacity-50'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {drillPicked !== null && (
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs font-mono opacity-80">
                  {activeDrill.exp}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDrillPicked(null);
                    setDrillIdx((prev) => (prev + 1) % MENTAL_DRILLS.length);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer shrink-0"
                >
                  {lang === 'bn' ? 'পরবর্তী →' : 'Next →'}
                </button>
              </div>
            )}
          </div>

          {/* Class 11 High-Yield Checklist for this Track */}
          <div className={`${cardClass} space-y-3`}>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>
                {lang === 'bn'
                  ? '১ম বর্ষে (একাদশ শ্রেণি) এই ট্র্যাকের সবচেয়ে গুরুত্বপূর্ণ অধ্যায়'
                  : 'Top Class 11 Golden Chapters for Your Track'}
              </span>
            </h3>

            <div className="space-y-2">
              {foundationChapters.map((ch) => {
                const st = progressMap[ch.id];
                const done =
                  !!st && st.theoryDone && st.notesDone && st.mcqDone && st.cqDone;
                return (
                  <button
                    key={ch.id}
                    onClick={() => onNavigate('syllabus', ch.subjectKey)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left text-xs cursor-pointer transition-colors ${
                      isDark
                        ? 'bg-slate-900/50 border-slate-700/80 hover:border-indigo-400/40'
                        : 'bg-slate-50/80 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          done ? 'text-emerald-500' : 'opacity-30'
                        }`}
                      />
                      <span className="font-bold truncate">{ch.title[lang]}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-45 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
