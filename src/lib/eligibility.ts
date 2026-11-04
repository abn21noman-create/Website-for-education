import type { BilingualText } from '../types';

/**
 * Admission eligibility checks.
 *
 * The GPA screen used to compare raw marks against made-up thresholds
 * ("PCM 85%+"), which told a student nothing about the real circulars. These
 * rules follow the latest published 2025–26 admission requirements checked on
 * 2026-11-04; BUET's SSC threshold is based on secondary summaries because its
 * primary PDF was not retrieved in this audit. Some 2026–27 circulars are not
 * yet available; this is a guide, not a promise of eligibility, and the
 * circular for the student's target year always wins.
 */

export const ELIGIBILITY_VERIFIED_ON = '2026-11-04';

export type StudyGroup = 'science' | 'humanities' | 'business';

export interface EligibilityInput {
  sscGpa: number;
  hscGpa: number;
  subjectGps: {
    physics: number;
    chemistry: number;
    math: number;
    biology: number;
    english: number;
  };
  group: StudyGroup;
}

export interface EligibilityResult {
  id: 'buet' | 'medical' | 'du' | 'cuet' | 'kuet' | 'ruet';
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

  // ---------- BUET (2025–26 secondary-summary criteria; recheck the official circular) ----------
  const buetMissing: BilingualText[] = [];
  if (!isScience) buetMissing.push(scienceOnly);
  if (!atLeast(sscGpa, 4)) {
    buetMissing.push({
      bn: `SSC GPA ৪.০০ দরকার (এখন ${toBn(fmt(sscGpa))})`,
      en: `SSC GPA must be at least 4.00 (now ${fmt(sscGpa)})`,
    });
  }
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

  // ---------- Medical (latest published 2025–26 circular) ----------
  const medicalMissing: BilingualText[] = [];
  if (!isScience) medicalMissing.push(scienceOnly);
  if (!atLeast(combined, 8.5)) {
    medicalMissing.push({
      bn: `SSC + HSC মোট GPA ৮.৫০ দরকার (এখন ${toBn(fmt(combined))})`,
      en: `SSC + HSC combined GPA must be 8.50 (now ${fmt(combined)})`,
    });
  }
  if (!atLeast(sscGpa, 4) || !atLeast(hscGpa, 4)) {
    medicalMissing.push({
      bn: 'SSC ও HSC — দুইটিতেই কমপক্ষে GPA ৪.০০',
      en: 'At least GPA 4.00 in both SSC and HSC',
    });
  }
  (
    [
      ['physics', 'পদার্থবিজ্ঞান', 'Physics'],
      ['chemistry', 'রসায়ন', 'Chemistry'],
      ['biology', 'জীববিজ্ঞান', 'Biology'],
    ] as const
  ).forEach(([key, bn, en]) => {
    if (!atLeast(subjectGps[key], 3.5)) {
      medicalMissing.push({
        bn: `HSC ${bn}-এ কমপক্ষে GP ৩.৫০ দরকার (এখন ${toBn(fmt(subjectGps[key]))})`,
        en: `HSC ${en} needs at least GP 3.50 (now ${fmt(subjectGps[key])})`,
      });
    }
  });

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

  // ---------- Engineering universities (2025–26 criteria vary) ----------
  const sscEngineeringFloor: BilingualText = {
    bn: `SSC GPA ৪.০০ দরকার (এখন ${toBn(fmt(sscGpa))})`,
    en: `SSC GPA must be at least 4.00 (now ${fmt(sscGpa)})`,
  };
  const pcmTotal = subjectGps.physics + subjectGps.chemistry + subjectGps.math;
  const kuetFour = pcmTotal + subjectGps.english;
  const cuetMissing: BilingualText[] = [];
  if (!isScience) cuetMissing.push(scienceOnly);
  if (!atLeast(sscGpa, 4)) cuetMissing.push(sscEngineeringFloor);
  if (!atLeast(pcmTotal, 14)) {
    cuetMissing.push({
      bn: `HSC পদার্থ + রসায়ন + গণিতে মোট GP ১৪.০০ দরকার (এখন ${toBn(fmt(pcmTotal))})`,
      en: `HSC Physics + Chemistry + Math must total GP 14.00 (now ${fmt(pcmTotal)})`,
    });
  }
  if (!atLeast(subjectGps.english, 3)) {
    cuetMissing.push({
      bn: `HSC ইংরেজিতে কমপক্ষে GP ৩.০০ দরকার (এখন ${toBn(fmt(subjectGps.english))})`,
      en: `HSC English needs at least GP 3.00 (now ${fmt(subjectGps.english)})`,
    });
  }

  const kuetMissing: BilingualText[] = [];
  if (!isScience) kuetMissing.push(scienceOnly);
  if (!atLeast(sscGpa, 4)) kuetMissing.push(sscEngineeringFloor);
  if (!atLeast(kuetFour, 18)) {
    kuetMissing.push({
      bn: `HSC পদার্থ + রসায়ন + গণিত + ইংরেজিতে মোট GP ১৮.০০ দরকার (এখন ${toBn(fmt(kuetFour))})`,
      en: `HSC Physics + Chemistry + Math + English must total GP 18.00 (now ${fmt(kuetFour)})`,
    });
  }
  if (!atLeast(subjectGps.physics, 4) || !atLeast(subjectGps.chemistry, 4) || !atLeast(subjectGps.math, 4)) {
    kuetMissing.push({
      bn: 'HSC পদার্থ, রসায়ন ও গণিত—প্রতিটিতে কমপক্ষে GP ৪.০০ দরকার',
      en: 'HSC Physics, Chemistry and Math each need at least GP 4.00',
    });
  }

  const ruetMissing: BilingualText[] = [];
  if (!isScience) ruetMissing.push(scienceOnly);
  if (!atLeast(sscGpa, 4)) ruetMissing.push(sscEngineeringFloor);
  if (!atLeast(pcmTotal, 14)) {
    ruetMissing.push({
      bn: `HSC পদার্থ + রসায়ন + গণিতে মোট GP ১৪.০০ দরকার (এখন ${toBn(fmt(pcmTotal))})`,
      en: `HSC Physics + Chemistry + Math must total GP 14.00 (now ${fmt(pcmTotal)})`,
    });
  }

  return [
    {
      id: 'buet',
      name: { bn: 'BUET (লিখিত পরীক্ষা)', en: 'BUET (written admission test)' },
      exam: {
        bn: '২০২৫–২৬ প্রকাশিত সংবাদ-সারাংশে সরাসরি লিখিত পরীক্ষা; MCQ প্রিলি নেই বলা হয়েছে',
        en: 'Published 2025–26 reports say direct written test; no MCQ preliminary',
      },
      ok: buetMissing.length === 0,
      missing: buetMissing,
      note: {
        bn: '২০২৫–২৬-এর প্রকাশিত সারাংশে SSC GPA ৪.০০, HSC GPA ৫.০০ এবং উচ্চতর গণিত, পদার্থ ও রসায়নে GP ৫.০০ বলা হয়েছে; এই যাচাইয়ে BUET-এর মূল PDF পাওয়া যায়নি। অফিসিয়াল বিজ্ঞপ্তি ও পরের সেশন যাচাই করুন।',
        en: 'Published 2025–26 summaries report SSC GPA 4.00, HSC GPA 5.00 and GP 5.00 in Higher Math, Physics and Chemistry; BUET’s primary PDF was not retrieved in this audit. Verify the official notice and next cycle.',
      },
      officialUrl: 'https://www.buet.ac.bd/',
      checkedOn: ELIGIBILITY_VERIFIED_ON,
    },
    {
      id: 'medical',
      name: { bn: 'মেডিকেল ও ডেন্টাল (MBBS/BDS)', en: 'Medical & Dental (MBBS/BDS)' },
      exam: {
        bn: 'সর্বশেষ প্রকাশিত প্যাটার্ন: ১০০ MCQ • ৭৫ মিনিট • −০.২৫ • পাস ৪০',
        en: 'Latest published pattern: 100 MCQs • 75 min • −0.25 • pass 40',
      },
      ok: medicalMissing.length === 0,
      missing: medicalMissing,
      note: {
        bn: 'সাধারণ প্রার্থী: SSC+HSC মোট GPA ৮.৫০, প্রতিটিতে ৪.০০, HSC পদার্থ/রসায়ন/জীববিজ্ঞানে GP ৩.৫০ করে। কোটা আলাদাভাবে হিসাব হয় না; ২০২৫–২৬-এ কিছু কোটায় মোট GPA ৮.০০ ও প্রতিটিতে ৩.৫০ ছিল। মেধা = টেস্ট + SSC×৮ + HSC×১২।',
        en: 'General applicants: combined GPA 8.50, each exam 4.00, and GP 3.50 each in HSC Physics/Chemistry/Biology. Quotas are not calculated separately; some 2025–26 quotas used combined GPA 8.00 and 3.50 in each exam. Merit = test + SSC×8 + HSC×12.',
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
      id: 'cuet',
      name: { bn: 'CUET ইঞ্জিনিয়ারিং', en: 'CUET Engineering' },
      exam: {
        bn: '২০২৫–২৬ GPA যাচাই: SSC ≥৪.০০; HSC PCM মোট ≥১৪.০০; English ≥৩.০০',
        en: '2025–26 GPA screen: SSC ≥4.00; HSC PCM total ≥14.00; English ≥3.00',
      },
      ok: cuetMissing.length === 0,
      missing: cuetMissing,
      note: {
        bn: 'এটি শুধু GPA শর্ত; পাসের বছর, মেধাভিত্তিক shortlist এবং Biomedical-এর Biology শর্ত যাচাই করে না। নতুন বিজ্ঞপ্তি মিলিয়ে নিন।',
        en: 'GPA screen only; pass years, merit-based shortlisting and the Biomedical Biology requirement are not checked. Verify the new circular.',
      },
      officialUrl: 'https://admissioncuet.ac.bd/',
      checkedOn: ELIGIBILITY_VERIFIED_ON,
    },
    {
      id: 'kuet',
      name: { bn: 'KUET ইঞ্জিনিয়ারিং', en: 'KUET Engineering' },
      exam: {
        bn: '২০২৫–২৬ GPA যাচাই: SSC ≥৪.০০; HSC PCM+English মোট ≥১৮.০০; PCM প্রতিটি ≥৪.০০',
        en: '2025–26 GPA screen: SSC ≥4.00; HSC PCM+English total ≥18.00; each PCM ≥4.00',
      },
      ok: kuetMissing.length === 0,
      missing: kuetMissing,
      note: {
        bn: 'এটি শুধু GPA শর্ত; পাসের বছর, মেধাভিত্তিক shortlist এবং Biomedical-এর Biology শর্ত যাচাই করে না। নতুন বিজ্ঞপ্তি মিলিয়ে নিন।',
        en: 'GPA screen only; pass years, merit-based shortlisting and the Biomedical Biology requirement are not checked. Verify the new circular.',
      },
      officialUrl: 'https://admission.kuet.ac.bd/',
      checkedOn: ELIGIBILITY_VERIFIED_ON,
    },
    {
      id: 'ruet',
      name: { bn: 'RUET ইঞ্জিনিয়ারিং', en: 'RUET Engineering' },
      exam: {
        bn: '২০২৫–২৬ GPA যাচাই: SSC ≥৪.০০; HSC PCM মোট ≥১৪.০০',
        en: '2025–26 GPA screen: SSC ≥4.00; HSC PCM total ≥14.00',
      },
      ok: ruetMissing.length === 0,
      missing: ruetMissing,
      note: {
        bn: 'এটি শুধু GPA শর্ত; পাসের বছর, মেধাভিত্তিক shortlist এবং Biomedical-এর Biology শর্ত যাচাই করে না। নতুন বিজ্ঞপ্তি মিলিয়ে নিন।',
        en: 'GPA screen only; pass years, merit-based shortlisting and the Biomedical Biology requirement are not checked. Verify the new circular.',
      },
      officialUrl: 'https://admission.ruet.ac.bd/notice.html',
      checkedOn: ELIGIBILITY_VERIFIED_ON,
    },
  ];
}
