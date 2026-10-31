import type { BilingualText } from '../types';

/**
 * Admission eligibility checks.
 *
 * The GPA screen used to compare raw marks against made-up thresholds
 * ("PCM 85%+"), which told a student nothing about the real circulars. These
 * rules follow the published 2026 requirements: combined SSC+HSC GPA, per-exam
 * minimums, and the subject-grade conditions. They are a guide — the circular
 * of the year still wins, which the UI says next to every row.
 *
 * Verified against public circulars on 2026-10-30.
 */

export const ELIGIBILITY_VERIFIED_ON = '2026-10-30';

export type StudyGroup = 'science' | 'humanities' | 'business';

export interface EligibilityInput {
  sscGpa: number;
  hscGpa: number;
  subjectGps: {
    physics: number;
    chemistry: number;
    math: number;
    biology: number;
  };
  group: StudyGroup;
}

export interface EligibilityResult {
  id: 'buet' | 'medical' | 'du' | 'engineering';
  name: BilingualText;
  /** One-line description of the test this unlocks. */
  exam: BilingualText;
  ok: boolean;
  /** Everything still standing between the student and applying. */
  missing: BilingualText[];
  note: BilingualText;
  officialUrl: string;
  checkedOn: string;
}

const EPS = 1e-9;
const atLeast = (value: number, target: number) => value + EPS >= target;

const fmt = (value: number) => value.toFixed(2);
/** Bangla copy should keep Bangla numerals, like the rest of the app. */
const toBn = (value: string) => value.replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

const scienceOnly: BilingualText = {
  bn: 'বিজ্ঞান বিভাগ থেকে HSC পাস করা লাগবে',
  en: 'HSC from the science group is required',
};

export function evaluateEligibility(input: EligibilityInput): EligibilityResult[] {
  const { sscGpa, hscGpa, subjectGps, group } = input;
  const combined = sscGpa + hscGpa;
  const isScience = group === 'science';

  // ---------- BUET ----------
  const buetMissing: BilingualText[] = [];
  if (!isScience) buetMissing.push(scienceOnly);
  if (!atLeast(hscGpa, 5)) {
    buetMissing.push({
      bn: `HSC GPA ৫.০০ দরকার (এখন ${toBn(fmt(hscGpa))})`,
      en: `HSC GPA must be 5.00 (now ${fmt(hscGpa)})`,
    });
  }
  (
    [
      ['physics', 'পদার্থবিজ্ঞান', 'Physics'],
      ['chemistry', 'রসায়ন', 'Chemistry'],
      ['math', 'উচ্চতর গণিত', 'Higher Math'],
    ] as const
  ).forEach(([key, bn, en]) => {
    if (!atLeast(subjectGps[key], 5)) {
      buetMissing.push({
        bn: `${bn}-এ A+ (GP ৫.০০) দরকার (এখন ${toBn(fmt(subjectGps[key]))})`,
        en: `${en} needs A+ / GP 5.00 (now ${fmt(subjectGps[key])})`,
      });
    }
  });

  // ---------- Medical ----------
  const medicalMissing: BilingualText[] = [];
  if (!isScience) medicalMissing.push(scienceOnly);
  if (!atLeast(combined, 9)) {
    medicalMissing.push({
      bn: `SSC + HSC মোট GPA ৯.০০ দরকার (এখন ${toBn(fmt(combined))})`,
      en: `SSC + HSC combined GPA must be 9.00 (now ${fmt(combined)})`,
    });
  }
  if (!atLeast(sscGpa, 4) || !atLeast(hscGpa, 4)) {
    medicalMissing.push({
      bn: 'SSC ও HSC — দুইটিতেই কমপক্ষে GPA ৪.০০',
      en: 'At least GPA 4.00 in both SSC and HSC',
    });
  }
  if (!atLeast(subjectGps.biology, 4)) {
    medicalMissing.push({
      bn: `জীববিজ্ঞানে কমপক্ষে GPA ৪.০০ (এখন ${toBn(fmt(subjectGps.biology))})`,
      en: `Biology needs at least GPA 4.00 (now ${fmt(subjectGps.biology)})`,
    });
  }

  // ---------- DU Ka unit ----------
  const duMissing: BilingualText[] = [];
  if (!isScience) duMissing.push(scienceOnly);
  if (!atLeast(combined, 8)) {
    duMissing.push({
      bn: `SSC + HSC মোট GPA ৮.০০ দরকার (এখন ${toBn(fmt(combined))})`,
      en: `SSC + HSC combined GPA must be 8.00 (now ${fmt(combined)})`,
    });
  }
  if (!atLeast(sscGpa, 3.5) || !atLeast(hscGpa, 3.5)) {
    duMissing.push({
      bn: 'SSC ও HSC — কোনোটিতেই GPA ৩.৫০-এর কম নয়',
      en: 'Neither SSC nor HSC may fall below GPA 3.50',
    });
  }

  // ---------- Engineering (CUET / KUET / RUET) ----------
  const engMissing: BilingualText[] = [];
  if (!isScience) engMissing.push(scienceOnly);
  if (!atLeast(combined, 8)) {
    engMissing.push({
      bn: `SSC + HSC মোট GPA ৮.০০ দরকার (এখন ${toBn(fmt(combined))})`,
      en: `SSC + HSC combined GPA must be 8.00 (now ${fmt(combined)})`,
    });
  }
  if (!atLeast(subjectGps.physics, 4) || !atLeast(subjectGps.chemistry, 4) || !atLeast(subjectGps.math, 4)) {
    engMissing.push({
      bn: 'পদার্থ, রসায়ন ও গণিত — তিনটিতেই কমপক্ষে GPA ৪.০০',
      en: 'Physics, Chemistry and Math each need at least GPA 4.00',
    });
  }

  return [
    {
      id: 'buet',
      name: { bn: 'BUET (প্রিলি ১০০ + লিখিত ৪০০)', en: 'BUET (100 preli + 400 written)' },
      exam: {
        bn: 'গণিত ৩৪ + পদার্থ ৩৩ + রসায়ন ৩৩ • −০.২৫',
        en: 'Math 34 + Physics 33 + Chemistry 33 • −0.25',
      },
      ok: buetMissing.length === 0,
      missing: buetMissing,
      note: {
        bn: 'HSC-তে গণিত, পদার্থ ও রসায়নে A+ এবং SSC-তেও ভালো ফল — দুটোই দেখা হয়।',
        en: 'A+ in Math, Physics and Chemistry plus a strong SSC result — both are checked.',
      },
      officialUrl: 'https://www.buet.ac.bd/',
      checkedOn: ELIGIBILITY_VERIFIED_ON,
    },
    {
      id: 'medical',
      name: { bn: 'সরকারি মেডিকেল (MBBS)', en: 'Government Medical (MBBS)' },
      exam: {
        bn: '১০০ MCQ • ৬০ মিনিট • −০.২৫ • পাস ৪০',
        en: '100 MCQ • 60 min • −0.25 • pass 40',
      },
      ok: medicalMissing.length === 0,
      missing: medicalMissing,
      note: {
        bn: 'উপজাতি/পার্বত্য কোটায় মোট GPA ৮.০০ পর্যন্ত শিথিল হয়; পাসের পর মেধা = টেস্ট + SSC×৮ + HSC×১২।',
        en: 'Quota candidates get a combined 8.00 relaxation; merit = test + SSC×8 + HSC×12.',
      },
      officialUrl: 'https://dgme.gov.bd/',
      checkedOn: ELIGIBILITY_VERIFIED_ON,
    },
    {
      id: 'du',
      name: { bn: 'ঢাবি ‘ক’ ইউনিট (বিজ্ঞান)', en: 'DU Ka-Unit (Science)' },
      exam: {
        bn: '৬০ MCQ (৪৫ মিনিট) + ৪০ লিখিত + GPA ২০ = ১২০',
        en: '60 MCQ (45 min) + 40 written + 20 GPA = 120',
      },
      ok: duMissing.length === 0,
      missing: duMissing,
      note: {
        bn: 'ইউনিটভেদে শর্ত বদলায় — আবেদনের আগে ওই বছরের বিজ্ঞপ্তি মিলিয়ে নিন।',
        en: 'Unit rules change year to year — check the current circular before applying.',
      },
      officialUrl: 'https://admission.eis.du.ac.bd/',
      checkedOn: ELIGIBILITY_VERIFIED_ON,
    },
    {
      id: 'engineering',
      name: { bn: 'CUET / KUET / RUET (ইঞ্জিনিয়ারিং)', en: 'CUET / KUET / RUET (Engineering)' },
      exam: {
        bn: 'বিষয়ভিত্তিক MCQ + লিখিত • বিশ্ববিদ্যালয়ভেদে ভিন্ন',
        en: 'Subject-wise MCQ + written • varies by university',
      },
      ok: engMissing.length === 0,
      missing: engMissing,
      note: {
        bn: 'প্রতিটি বিশ্ববিদ্যালয়ের নিজস্ব বিজ্ঞপ্তি আছে — এখানে সাধারণ শর্ত만 দেখানো হচ্ছে।',
        en: 'Each university publishes its own circular — only the common conditions are shown here.',
      },
      officialUrl: 'https://www.cuet.ac.bd/',
      checkedOn: ELIGIBILITY_VERIFIED_ON,
    },
  ];
}
