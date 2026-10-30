import type { BilingualText } from '../types';

/**
 * What each admission test actually is.
 *
 * The admission hub used to describe the three tracks in prose with no source
 * and no date, so a student could not tell whether a rule was from this year or
 * three years ago. Every figure below is shown with the date it was checked and
 * a link to the body that publishes it.
 */

export type AdmissionTrackId = 'buet' | 'medical' | 'du';

export interface TrackFact {
  label: BilingualText;
  value: BilingualText;
}

export interface AdmissionTrackInfo {
  id: AdmissionTrackId;
  fullName: BilingualText;
  /** Short structure line used in the switcher. */
  structure: BilingualText;
  facts: TrackFact[];
  eligibility: BilingualText;
  /** The 1-2 things students most often get wrong. */
  pitfalls: BilingualText[];
  officialUrl: string;
  officialLabel: BilingualText;
  checkedOn: string;
}

export const ADMIN_VERIFIED_ON = '2026-10-30';

export const ADMISSION_TRACK_INFO: Record<AdmissionTrackId, AdmissionTrackInfo> = {
  buet: {
    id: 'buet',
    fullName: {
      bn: 'বুয়েট ও ইঞ্জিনিয়ারিং (BUET / CUET / KUET / RUET)',
      en: 'BUET & Engineering (BUET / CUET / KUET / RUET)',
    },
    structure: {
      bn: 'প্রিলি ১০০ MCQ (৬০ মিনিট, −০.২৫) → লিখিত ৪০০',
      en: 'Prelims 100 MCQ (60 min, −0.25) → 400-mark written',
    },
    facts: [
      {
        label: { bn: 'প্রিলি নম্বর বণ্টন', en: 'Prelims distribution' },
        value: { bn: 'গণিত ৩৪ + পদার্থ ৩৩ + রসায়ন ৩৩', en: 'Math 34 + Physics 33 + Chemistry 33' },
      },
      {
        label: { bn: 'নেগেটিভ মার্কিং', en: 'Negative marking' },
        value: { bn: 'প্রতি ভুলে −০.২৫', en: '−0.25 per wrong answer' },
      },
      {
        label: { bn: 'লিখিত পরীক্ষা', en: 'Written test' },
        value: {
          bn: '৪০টি প্রশ্ন × ১০ = ৪০০ নম্বর, ২ ঘণ্টা',
          en: '40 questions × 10 = 400 marks, 2 hours',
        },
      },
      {
        label: { bn: 'আসন (প্রায়)', en: 'Seats (approx.)' },
        value: { bn: '১,৩০৫', en: '1,305' },
      },
    ],
    eligibility: {
      bn: 'বিজ্ঞান বিভাগে HSC GPA ৫.০০, গণিত-পদার্থ-রসায়নে A+',
      en: 'Science group, HSC GPA 5.00 with A+ in Math, Physics and Chemistry',
    },
    pitfalls: [
      {
        bn: 'প্রিলিতে ভুলের কর্তন আছে — অন্ধকারে অনুমান করা সবচেয়ে বড় ক্ষতি।',
        en: 'Prelims deduct for wrong answers — blind guessing costs you dearly.',
      },
      {
        bn: 'প্রিলি পাস মানেই ভর্তি নয়; চূড়ান্ত মেধা লিখিত পরীক্ষার ওপর।',
        en: 'Passing prelims is not admission; the written test decides the merit list.',
      },
    ],
    officialUrl: 'https://www.buet.ac.bd/',
    officialLabel: { bn: 'BUET ভর্তি সাইট', en: 'BUET admission site' },
    checkedOn: ADMIN_VERIFIED_ON,
  },
  medical: {
    id: 'medical',
    fullName: { bn: 'মেডিকেল ও ডেন্টাল (MBBS / BDS)', en: 'Medical & Dental (MBBS / BDS)' },
    structure: {
      bn: '১০০ MCQ • ১০০ নম্বর • ৬০ মিনিট • −০.২৫ • পাস ৪০',
      en: '100 MCQ • 100 marks • 60 min • −0.25 • pass 40',
    },
    facts: [
      {
        label: { bn: 'বিষয়ভার', en: 'Subject weight' },
        value: {
          bn: 'জীব ৩০ + রসায়ন ২৫ + পদার্থ ২০ + ইংরেজি ১৫ + GK ১০',
          en: 'Bio 30 + Chem 25 + Phys 20 + Eng 15 + GK 10',
        },
      },
      {
        label: { bn: 'নেগেটিভ মার্কিং', en: 'Negative marking' },
        value: { bn: 'প্রতি ভুলে −০.২৫ (৪ ভুলে ১ নম্বর)', en: '−0.25 per wrong (4 wrong = 1 mark lost)' },
      },
      {
        label: { bn: 'মেধার হিসাব', en: 'Merit formula' },
        value: {
          bn: 'টেস্ট + SSC GPA×৮ + HSC GPA×১২ = ২০০',
          en: 'Test + SSC GPA×8 + HSC GPA×12 = 200',
        },
      },
      {
        label: { bn: 'সরকারি আসন (প্রায়)', en: 'Government seats (approx.)' },
        value: { bn: '১১,৬০০', en: '11,600' },
      },
    ],
    eligibility: {
      bn: 'SSC + HSC মোট GPA ৯.০০ (প্রতিটিতে ≥ ৪.০০), জীববিজ্ঞানে ≥ ৪.০০',
      en: 'SSC + HSC combined GPA 9.00 (each ≥ 4.00), Biology ≥ 4.00',
    },
    pitfalls: [
      {
        bn: 'জীববিজ্ঞানে GPA ৪.০০ না হলে অন্য সব ঠিক থাকলেও আবেদন করা যায় না।',
        en: 'Without GPA 4.00 in Biology you cannot apply, even if everything else is fine.',
      },
      {
        bn: 'SSC-র GPA-ও মেধাতালিকায় যোগ হয় — একাদশে অবহেলা করলে পরে ক্ষতি।',
        en: 'SSC GPA counts in the merit list — a weak SSC still costs you marks.',
      },
    ],
    officialUrl: 'https://dgme.gov.bd/',
    officialLabel: { bn: 'স্বাস্থ্য শিক্ষা অধিদপ্তর', en: 'DGME (Health Education)' },
    checkedOn: ADMIN_VERIFIED_ON,
  },
  du: {
    id: 'du',
    fullName: { bn: 'ঢাকা বিশ্ববিদ্যালয় ‘ক’ ইউনিট ও GST', en: 'DU Ka-Unit & GST Science' },
    structure: {
      bn: 'MCQ ৬০ (৪৫ মিনিট) + লিখিত ৪০ (৪৫ মিনিট) + GPA ২০ = ১২০',
      en: 'MCQ 60 (45 min) + written 40 (45 min) + GPA 20 = 120',
    },
    facts: [
      {
        label: { bn: 'প্রশ্নভাগ', en: 'Paper split' },
        value: { bn: 'MCQ ৬০ নম্বর + লিখিত ৪০ নম্বর', en: 'MCQ 60 marks + written 40 marks' },
      },
      {
        label: { bn: 'নেগেটিভ মার্কিং', en: 'Negative marking' },
        value: { bn: 'প্রতি ভুলে −০.২৫', en: '−0.25 per wrong answer' },
      },
      {
        label: { bn: 'GPA থেকে', en: 'From GPA' },
        value: { bn: 'SSC + HSC মিলিয়ে সর্বোচ্চ ২০ নম্বর', en: 'Up to 20 marks from SSC + HSC GPA' },
      },
      {
        label: { bn: 'বিজ্ঞান ইউনিট আসন (প্রায়)', en: 'Science unit seats (approx.)' },
        value: { bn: '১,৮৫১', en: '1,851' },
      },
    ],
    eligibility: {
      bn: 'SSC + HSC মোট GPA ≥ ৮.০০ এবং কোনোটিতেই ৩.৫০-এর কম নয়',
      en: 'SSC + HSC combined GPA ≥ 8.00, neither below 3.50',
    },
    pitfalls: [
      {
        bn: 'লিখিত অংশে হাতের লেখা ও ধাপ দেখানো হয় — শুধু উত্তর নয়।',
        en: 'The written part is marked on steps and presentation, not just the final answer.',
      },
      {
        bn: '৪৫ মিনিটে ৬০ MCQ — গতি না থাকলে শেষই হবে না।',
        en: '60 MCQs in 45 minutes — without pace you will not finish.',
      },
    ],
    officialUrl: 'https://admission.eis.du.ac.bd/',
    officialLabel: { bn: 'ঢাবি ভর্তি সাইট', en: 'DU admission site' },
    checkedOn: ADMIN_VERIFIED_ON,
  },
};
