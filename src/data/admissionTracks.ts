import type { BilingualText } from '../types';

/**
 * What each admission test actually is.
 *
 * The admission hub used to describe tracks in prose with no source or cycle.
 * Each fact now names the session it describes and links to the institution's
 * official admission site; users must still check the newest circular before
 * applying, because published requirements can change by cycle.
 */

export type AdmissionTrackId = 'buet' | 'medical' | 'du';

export interface TrackFact {
  label: BilingualText;
  value: BilingualText;
  officialUrl?: string;
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

export const ADMIN_VERIFIED_ON = '2026-11-04';

export const ADMISSION_TRACK_INFO: Record<AdmissionTrackId, AdmissionTrackInfo> = {
  buet: {
    id: 'buet',
    fullName: {
      bn: 'বুয়েট ও ইঞ্জিনিয়ারিং (BUET / CUET / KUET / RUET)',
      en: 'BUET & Engineering (BUET / CUET / KUET / RUET)',
    },
    structure: {
      bn: '২০২৫–২৬ সংবাদ-সারাংশে BUET সরাসরি লিখিত; CUET/KUET/RUET-এর আলাদা পরীক্ষা ও নিয়ম',
      en: '2025–26 reports describe BUET as direct written; CUET/KUET/RUET have separate tests and rules',
    },
    facts: [
      {
        label: { bn: 'BUET পরীক্ষা (২০২৫–২৬ প্রতিবেদন)', en: 'BUET test (2025–26 reports)' },
        value: { bn: 'প্রকাশিত সংবাদ-সারাংশে MCQ প্রিলি নেই — সরাসরি লিখিত পরীক্ষা বলা হয়েছে', en: 'Published reports say no MCQ preliminary — direct written admission test' },
        officialUrl: 'https://www.buet.ac.bd/web/#/ugAdmission',
      },
      {
        label: { bn: 'BUET GPA শর্ত (২০২৫–২৬ সারাংশ)', en: 'BUET GPA rule (2025–26 summaries)' },
        value: {
          bn: 'SSC GPA ≥ ৪.০০; HSC GPA ৫.০০; উচ্চতর গণিত, পদার্থ ও রসায়নে GP ৫.০০',
          en: 'SSC GPA ≥ 4.00; HSC GPA 5.00; GP 5.00 in Higher Math, Physics and Chemistry',
        },
        officialUrl: 'https://www.buet.ac.bd/web/#/ugAdmission',
      },
      {
        label: { bn: 'CUET GPA শর্ত (২০২৫–২৬)', en: 'CUET GPA screen (2025–26)' },
        value: {
          bn: 'SSC ≥ ৪.০০; HSC পদার্থ+রসায়ন+গণিত ≥ ১৪.০০; ইংরেজি ≥ ৩.০০',
          en: 'SSC ≥ 4.00; HSC Physics+Chemistry+Math ≥ 14.00; English ≥ 3.00',
        },
        officialUrl: 'https://app.cuet.ac.bd/storage/Notices/69314898a5ea4.pdf',
      },
      {
        label: { bn: 'KUET GPA শর্ত (২০২৫–২৬)', en: 'KUET GPA screen (2025–26)' },
        value: {
          bn: 'SSC ≥ ৪.০০; HSC পদার্থ+রসায়ন+গণিত+ইংরেজি ≥ ১৮.০০; PCM প্রতিটিতে ≥ ৪.০০',
          en: 'SSC ≥ 4.00; HSC Physics+Chemistry+Math+English ≥ 18.00; each PCM ≥ 4.00',
        },
        officialUrl: 'https://web.archive.org/web/20251216215521id_/http://admission.kuet.ac.bd/adm/fNotice/AdmissionNotice2026.pdf',
      },
      {
        label: { bn: 'RUET GPA শর্ত (২০২৫–২৬)', en: 'RUET GPA screen (2025–26)' },
        value: {
          bn: 'SSC ≥ ৪.০০; HSC পদার্থ+রসায়ন+গণিত ≥ ১৪.০০',
          en: 'SSC ≥ 4.00; HSC Physics+Chemistry+Math ≥ 14.00',
        },
        officialUrl: 'https://admission.ruet.ac.bd/notices/admission-circular-for-ruet-2025-2026-session.pdf',
      },
      {
        label: { bn: 'BUET আসন (২০২৫–২৬ secondary summary)', en: 'BUET places (2025–26 secondary summary)' },
        value: { bn: 'প্রকাশিত সারাংশ অনুযায়ী ১,৩০৯ (সংরক্ষিতসহ)', en: '1,309 including reserved seats, per published summaries' },
        officialUrl: 'https://www.buet.ac.bd/web/#/ugAdmission',
      },
    ],
    eligibility: {
      bn: 'শুধু BUET: ২০২৫–২৬-এর প্রকাশিত সারাংশে SSC GPA ≥ ৪.০০, HSC GPA ৫.০০ এবং PCM-এ GP ৫.০০ বলা হয়েছে; এই যাচাইয়ে BUET-এর মূল PDF উদ্ধার হয়নি। CUET/KUET/RUET-এর শর্ত আলাদা।',
      en: 'BUET only: published 2025–26 summaries report SSC GPA ≥ 4.00, HSC GPA 5.00 and PCM GP 5.00; BUET’s primary PDF was not retrieved in this audit. CUET/KUET/RUET rules differ.',
    },
    pitfalls: [
      {
        bn: 'প্রকাশিত প্রতিবেদন অনুযায়ী BUET-এর ২০২৫–২৬ পরীক্ষায় MCQ প্রিলি ছিল না; আগের বছরের ১০০-MCQ ফরম্যাট ধরে নেবেন না, নতুন অফিসিয়াল বিজ্ঞপ্তি মিলিয়ে নিন।',
        en: 'Published reports say BUET had no MCQ preliminary in 2025–26; do not assume the previous 100-MCQ format and recheck the official notice.',
      },
      {
        bn: 'CUET, KUET ও RUET আলাদা ভর্তি পরীক্ষা নেয়; GPA-শর্ত, pass year ও shortlist এক নয়—প্রতিটির নতুন বিজ্ঞপ্তি দেখুন।',
        en: 'CUET, KUET and RUET run separate admissions; GPA rules, pass years and shortlists differ. Check each current circular.',
      },
    ],
    officialUrl: 'https://www.buet.ac.bd/web/#/ugAdmission',
    officialLabel: { bn: 'BUET ভর্তি বিজ্ঞপ্তি', en: 'BUET admission notices' },
    checkedOn: ADMIN_VERIFIED_ON,
  },
  medical: {
    id: 'medical',
    fullName: { bn: 'মেডিকেল ও ডেন্টাল (MBBS / BDS)', en: 'Medical & Dental (MBBS / BDS)' },
    structure: {
      bn: 'সর্বশেষ প্রকাশিত ২০২৫–২৬: ১০০ MCQ • ১০০ নম্বর • ৭৫ মিনিট • −০.২৫ • পাস ৪০',
      en: 'Latest published 2025–26: 100 MCQs • 100 marks • 75 min • −0.25 • pass 40',
    },
    facts: [
      {
        label: { bn: 'বিষয়ভার (২০২৫–২৬)', en: 'Subject weight (2025–26)' },
        value: {
          bn: 'জীববিজ্ঞান ৩০ + রসায়ন ২৫ + পদার্থ ১৫ + ইংরেজি ১৫ + GK/aptitude/human qualities ১৫',
          en: 'Biology 30 + Chemistry 25 + Physics 15 + English 15 + GK/aptitude/human qualities 15',
        },
        officialUrl: 'https://dgme.gov.bd/',
      },
      {
        label: { bn: 'নেগেটিভ মার্কিং', en: 'Negative marking' },
        value: { bn: 'প্রতি ভুলে −০.২৫ (৪ ভুলে ১ নম্বর)', en: '−0.25 per wrong (4 wrong = 1 mark lost)' },
        officialUrl: 'https://dgme.gov.bd/',
      },
      {
        label: { bn: 'মেধার হিসাব (২০২৫–২৬)', en: 'Merit formula (2025–26)' },
        value: {
          bn: 'টেস্ট + SSC GPA×৮ + HSC GPA×১২ = ২০০; পুনরায় পরীক্ষার্থীর কর্তন প্রযোজ্য',
          en: 'Test + SSC GPA×8 + HSC GPA×12 = 200; repeat-candidate deductions apply',
        },
        officialUrl: 'https://dgme.gov.bd/',
      },
      {
        label: { bn: 'সরকারি MBBS আসন (২০২৫–২৬ প্রতিবেদন)', en: 'Government MBBS seats (2025–26 reports)' },
        value: { bn: 'প্রকাশিত প্রতিবেদন অনুযায়ী ৫,১০০', en: '5,100, as reported' },
        officialUrl: 'https://dgme.gov.bd/',
      },
    ],
    eligibility: {
      bn: 'সাধারণ প্রার্থী (২০২৫–২৬): SSC + HSC মোট GPA ≥ ৮.৫০, প্রতিটিতে ≥ ৪.০০; HSC পদার্থ, রসায়ন ও জীববিজ্ঞানে প্রত্যেকটিতে GP ≥ ৩.৫০।',
      en: 'General applicants (2025–26): combined GPA ≥ 8.50, each exam ≥ 4.00; HSC Physics, Chemistry and Biology each need GP ≥ 3.50.',
    },
    pitfalls: [
      {
        bn: 'HSC পদার্থ, রসায়ন ও জীববিজ্ঞানে GP ৩.৫০ করে এবং SSC/HSC-তে GPA ৪.০০-এর শর্ত আলাদা — শুধু মোট GPA মিললেই হবে না।',
        en: 'HSC Physics, Chemistry and Biology each need GP 3.50, plus the 4.00 floor in both exams; a combined GPA alone is not enough.',
      },
      {
        bn: 'উপজাতি/পার্বত্য এলাকার প্রার্থীদের জন্য কিছু শর্ত শিথিল; ২০২৬–২৭ বিজ্ঞপ্তি এই যাচাইয়ে ২০২৬-১০-৩১ পর্যন্ত পাওয়া যায়নি—নতুন বিজ্ঞপ্তি না দেখে ২০২৫–২৬ নিয়ম ধরে নেবেন না।',
        en: 'Some thresholds are relaxed for tribal/hill-district applicants. This audit had not found the 2026–27 circular by 2026-10-31; recheck the official notice instead of carrying over 2025–26 rules.',
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
