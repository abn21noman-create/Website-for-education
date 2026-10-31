import type { McqQuestion } from '../../types';

/** Generated from the single bank during the per-paper split; edit via the data pipeline. */
const QUESTIONS: McqQuestion[] = [
  {
    "id": "q-bio2-1",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "প্রাণীর পরিচিতি",
      "en": "Animal Identity"
    },
    "question": {
      "bn": "হাইড্রার কোন নেমাটোসিস্টে হিপনোটক্সিন (Hypnotoxin) নামক বিষাক্ত রস থাকে?",
      "en": "Which nematocyst of Hydra contains the paralyzing venom Hypnotoxin?"
    },
    "options": [
      {
        "bn": "ভলভেন্ট (Volvent)",
        "en": "Volvent"
      },
      {
        "bn": "স্টেনোটিল / পেনিট্র্যান্ট (Stenotele)",
        "en": "Stenotele / Penetrant"
      },
      {
        "bn": "স্ট্রেপ্টোলিন গ্লুটিন্যান্ট",
        "en": "Streptoline glutinant"
      },
      {
        "bn": "স্টেরিওলিন গ্লুটিন্যান্ট",
        "en": "Stereoline glutinant"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "হাইড্রার ৪ প্রকার নেমাটোসিস্টের মধ্যে স্টেনোটিল (পেনিট্র্যান্ট) বৃহত্তম এবং এতে প্রোটিন ও ফেনল নির্মিত বিষাক্ত তরল হিপনোটক্সিন থাকে।",
      "en": "Stenotele (penetrant) is the largest nematocyst in Hydra and injects neurotoxic hypnotoxin into prey."
    },
    "boardTag": {
      "bn": "মেডিকেল ও যশোর বোর্ড",
      "en": "Medical & Jashore Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio2-2",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "মানব শারীরতত্ত্ব: রক্ত ও সঞ্চালন",
      "en": "Blood & Circulation"
    },
    "question": {
      "bn": "মানুষের হৃদপিণ্ডের প্রাকৃতিক পেসমেকার (Natural Pacemaker) বলা হয় কোনটিকে?",
      "en": "Which structure is known as the natural pacemaker of the human heart?"
    },
    "options": [
      {
        "bn": "AV নোড (AVN)",
        "en": "AV Node (AVN)"
      },
      {
        "bn": "SA নোড (সাইনো-অ্যাট্রিয়াল নোড)",
        "en": "SA Node (Sinoatrial Node)"
      },
      {
        "bn": "বান্ডল অব হিজ",
        "en": "Bundle of His"
      },
      {
        "bn": "পারকিনজি তন্তু",
        "en": "Purkinje fibers"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "ডান অ্যাট্রিয়ামের প্রাচীরে অবস্থিত সাইনো-অ্যাট্রিয়াল নোড (SAN) স্বয়ংক্রিয়ভাবে হৃদস্পন্দনের তড়িৎ উদ্দীপনা শুরু করে বলে একে প্রাকৃতিক পেসমেকার বলে।",
      "en": "The Sinoatrial Node (SAN) in the right atrium initiates rhythmic electrical impulses, serving as the natural pacemaker."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio2-3",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "জিনতত্ত্ব ও বিবর্তন",
      "en": "Genetics & Evolution"
    },
    "question": {
      "bn": "মেন্ডেলের দ্বিতীয় সূত্রের ব্যতিক্রম ‘প্রকট এপিস্ট্যাসিস’ (Dominant Epistasis)-এর ফিনোটাইপিক অনুপাত কত?",
      "en": "What is the F₂ phenotypic ratio of Dominant Epistasis (an exception to Mendels 2nd law)?"
    },
    "options": [
      {
        "bn": "9 : 3 : 3 : 1",
        "en": "9 : 3 : 3 : 1"
      },
      {
        "bn": "9 : 7",
        "en": "9 : 7"
      },
      {
        "bn": "13 : 3",
        "en": "13 : 3"
      },
      {
        "bn": "1 : 2 : 1",
        "en": "1 : 2 : 1"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "সাদা লেগহর্ন ও সাদা ওয়াইন্ডট মোরগ-মুরগির ক্রসে প্রকট এপিস্ট্যাসিসের কারণে F₂ জনুতে সাদা ও রঙিন পালকের অনুপাত হয় 13 : 3 (পরিপূরক জিন ও দ্বৈত প্রচ্ছন্ন এপিস্ট্যাসিসে 9 : 7)।",
      "en": "Dominant epistasis (e.g., plumage in White Leghorn × Wyandotte) modifies 9:3:3:1 into 13:3."
    },
    "boardTag": {
      "bn": "মেডিকেল ও ঢাকা বোর্ড",
      "en": "Medical & Dhaka Board"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-bio2-4",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "মানব শারীরতত্ত্ব: পরিপাক ও শোষণ",
      "en": "Digestion & Absorption"
    },
    "question": {
      "bn": "মানবদেহের সবচেয়ে বড় গ্রন্থি (জৈব রসায়নাগার) কোনটি?",
      "en": "Which is the largest gland (often called the organic chemical laboratory) of the human body?"
    },
    "options": [
      {
        "bn": "অগ্ন্যাশয় (Pancreas)",
        "en": "Pancreas"
      },
      {
        "bn": "যকৃত (Liver)",
        "en": "Liver"
      },
      {
        "bn": "থাইরয়েড গ্রন্থি",
        "en": "Thyroid gland"
      },
      {
        "bn": "প্যারোটিড গ্রন্থি",
        "en": "Parotid gland"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "যকৃত (Liver) মানবদেহের বৃহত্তম গ্রন্থি (ওজন প্রায় ১.৫–২.০ কেজি); প্রায় ৫০০-এর বেশি বিপাকীয় কাজের জন্য একে জৈব রসায়নাগার বলা হয়।",
      "en": "The liver (1.5–2.0 kg) is the largest gland in the human body and performs over 500 metabolic functions."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio2-5",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "মানব শারীরতত্ত্ব: রক্ত ও সংবহন",
      "en": "Blood & Circulation"
    },
    "question": {
      "bn": "মানব হৃৎপিণ্ডের প্রাকৃতিক পেসমেকার (Natural Pacemaker) বলা হয় কোনটিকে?",
      "en": "Which node is known as the natural pacemaker of the human heart?"
    },
    "options": [
      {
        "bn": "AV নোড",
        "en": "AV Node"
      },
      {
        "bn": "SA নোড (Sino-atrial Node)",
        "en": "SA Node"
      },
      {
        "bn": "বান্ডল অব হিজ",
        "en": "Bundle of His"
      },
      {
        "bn": "পারকিনজি তন্তু",
        "en": "Purkinje fibers"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "ডান অলিন্দের প্রাচীরে অবস্থিত SA নোড স্বয়ংক্রিয়ভাবে তড়িৎ উদ্দীপনা সৃষ্টি করে হৃৎস্পন্দন শুরু করে বলে একে প্রাকৃতিক পেসমেকার বলে।",
      "en": "Located in the right atrium wall, the SA node initiates cardiac electrical impulses spontaneously."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio2-6",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "জিনতত্ত্ব ও বিবর্তন",
      "en": "Genetics & Evolution"
    },
    "question": {
      "bn": "মেন্ডেলের দ্বিতীয় সূত্রের ব্যতিক্রম ‘পরিপূরক জিন’ (Complementary gene)-এর ফিনোটাইপিক অনুপাত কত?",
      "en": "What is the F₂ phenotypic ratio for Complementary Genes (an exception to Mendel’s 2nd law)?"
    },
    "options": [
      {
        "bn": "9 : 3 : 3 : 1",
        "en": "9 : 3 : 3 : 1"
      },
      {
        "bn": "9 : 7",
        "en": "9 : 7"
      },
      {
        "bn": "13 : 3",
        "en": "13 : 3"
      },
      {
        "bn": "12 : 3 : 1",
        "en": "12 : 3 : 1"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "মিষ্টি মটর উদ্ভিদে পরিপূরক জিনের (দ্বৈত প্রচ্ছন্ন এপিস্ট্যাসিস) অনুপাত ৯ : ৭ এবং প্রকট এপিস্ট্যাসিসের অনুপাত ১৩ : ৩।",
      "en": "Complementary genes in sweet pea (Lathyrus odoratus) modify 9:3:3:1 into 9:7."
    },
    "boardTag": {
      "bn": "মেডিকেল ও ঢাবি ক",
      "en": "Medical & DU Ka"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-bio2-7",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "রক্ত ও সঞ্চালন",
      "en": "Blood & Circulation"
    },
    "question": {
      "bn": "সুস্থ মানুষের রক্তের pH কত?",
      "en": "What is the pH of human blood?"
    },
    "options": [
      {
        "bn": "৭.০",
        "en": "7.0"
      },
      {
        "bn": "৭.৪",
        "en": "7.4"
      },
      {
        "bn": "৭.৮",
        "en": "7.8"
      },
      {
        "bn": "৬.৪",
        "en": "6.4"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "মানব রক্ত সামান্য ক্ষারীয় — pH প্রায় ৭.৩৫–৭.৪৫; এই সীমার বাইরে গেলে অ্যাসিডোসিস/অ্যালকালোসিস।",
      "en": "Human blood is slightly alkaline at pH ≈ 7.35–7.45; outside that range is acidosis or alkalosis."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio2-8",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "রক্ত ও সঞ্চালন",
      "en": "Blood & Circulation"
    },
    "question": {
      "bn": "সর্বজনীন রক্তদাতা (Universal donor) কোন রক্তগ্রুপ?",
      "en": "Which blood group is the universal donor?"
    },
    "options": [
      {
        "bn": "A+",
        "en": "A+"
      },
      {
        "bn": "B+",
        "en": "B+"
      },
      {
        "bn": "AB+",
        "en": "AB+"
      },
      {
        "bn": "O−",
        "en": "O−"
      }
    ],
    "correctIndex": 3,
    "explanation": {
      "bn": "O− লোহিত কণিকায় A, B বা Rh অ্যান্টিজেন নেই, তাই সর্বজনীন দাতা; আর AB+ সর্বজনীন গ্রহীতা।",
      "en": "O− red cells carry no A, B or Rh antigen, making it the universal donor; AB+ is the universal recipient."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio2-9",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "রেচন ও নিষ্কাশন",
      "en": "Excretion"
    },
    "question": {
      "bn": "বৃক্কের গঠনগত ও কার্যিক একক কোনটি?",
      "en": "What is the structural and functional unit of the kidney?"
    },
    "options": [
      {
        "bn": "নিউরন",
        "en": "Neuron"
      },
      {
        "bn": "নেফ্রন",
        "en": "Nephron"
      },
      {
        "bn": "অ্যালভিওলাস",
        "en": "Alveolus"
      },
      {
        "bn": "অ্যাক্সন",
        "en": "Axon"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "প্রতিটি বৃক্কে প্রায় ১০ লক্ষ নেফ্রন থাকে; রেচন প্রক্রিয়ার মূল একক এটি।",
      "en": "Each kidney holds about a million nephrons, the functional units of excretion."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio2-10",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "সমন্বয় ও নিয়ন্ত্রণ",
      "en": "Coordination & Control"
    },
    "question": {
      "bn": "ইনসুলিন হরমোন কোন কোষ থেকে নিঃসৃত হয়?",
      "en": "Which cells secrete the hormone insulin?"
    },
    "options": [
      {
        "bn": "আলফা কোষ",
        "en": "Alpha cells"
      },
      {
        "bn": "বিটা কোষ",
        "en": "Beta cells"
      },
      {
        "bn": "থাইরয়েড ফলিকল",
        "en": "Thyroid follicles"
      },
      {
        "bn": "অ্যাড্রিনাল মেডালা",
        "en": "Adrenal medulla"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "অগ্ন্যাশয়ের ল্যাঙ্গারহ্যান্স আইলেটের বিটা কোষ ইনসুলিন নিঃসরণ করে; আলফা কোষ গ্লুকাগন।",
      "en": "Beta cells of the islets of Langerhans secrete insulin; alpha cells secrete glucagon."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "medium"
  }
];

export default QUESTIONS;
