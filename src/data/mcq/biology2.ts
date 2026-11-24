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
  },
{
  "id": "q-bio2-11",
  "subjectKey": "biology2",
  "chapter": {
    "bn": "রক্ত ও সঞ্চালন",
    "en": "Blood & Circulation"
  },
  "question": {
    "bn": "হৃৎপিণ্ডের কোন প্রকোষ্ঠের দেয়াল সবচেয়ে পুরু?",
    "en": "Which chamber of the heart has the thickest wall?"
  },
  "options": [
    {
      "bn": "ডান অলিন্দ",
      "en": "Right atrium"
    },
    {
      "bn": "ডান নিলয়",
      "en": "Right ventricle"
    },
    {
      "bn": "বাম অলিন্দ",
      "en": "Left atrium"
    },
    {
      "bn": "বাম নিলয়",
      "en": "Left ventricle"
    }
  ],
  "correctIndex": 3,
  "explanation": {
    "bn": "বাম নিলয়কে সারা দেহে রক্ত পাম্প করতে হয়, তাই উচ্চ চাপ সহ্য করার জন্য এর দেয়াল সবচেয়ে পুরু।",
    "en": "The left ventricle pumps blood to the whole body, so its wall is thickest to withstand high pressure."
  },
  "boardTag": {
    "bn": "মেডিকেল ও সকল বোর্ড",
    "en": "Medical & All Boards"
  },
  "difficulty": "easy"
},
{
  "id": "q-bio2-12",
  "subjectKey": "biology2",
  "chapter": {
    "bn": "রক্ত ও সঞ্চালন",
    "en": "Blood & Circulation"
  },
  "question": {
    "bn": "রক্ত জমাট বাঁধতে কোন ভিটামিন সবচেয়ে গুরুত্বপূর্ণ?",
    "en": "Which vitamin is most important for blood clotting?"
  },
  "options": [
    {
      "bn": "ভিটামিন A",
      "en": "Vitamin A"
    },
    {
      "bn": "ভিটামিন C",
      "en": "Vitamin C"
    },
    {
      "bn": "ভিটামিন K",
      "en": "Vitamin K"
    },
    {
      "bn": "ভিটামিন D",
      "en": "Vitamin D"
    }
  ],
  "correctIndex": 2,
  "explanation": {
    "bn": "ভিটামিন K যকৃতকে প্রোথ্রমবিন তৈরি করতে সাহায্য করে, যা রক্ত জমাট বাঁধার জন্য অপরিহার্য।",
    "en": "Vitamin K is needed by the liver to make prothrombin, essential for clotting."
  },
  "boardTag": {
    "bn": "মেডিকেল ও সকল বোর্ড",
    "en": "Medical & All Boards"
  },
  "difficulty": "easy"
},
{
  "id": "q-bio2-13",
  "subjectKey": "biology2",
  "chapter": {
    "bn": "শ্বসন ও রেচন",
    "en": "Respiration & Excretion"
  },
  "question": {
    "bn": "ফুসফুসে গ্যাসের বিনিময় কোথায় ঘটে?",
    "en": "Where does gas exchange take place in the lungs?"
  },
  "options": [
    {
      "bn": "ব্রংকাই",
      "en": "Bronchi"
    },
    {
      "bn": "অ্যালভিওলাই",
      "en": "Alveoli"
    },
    {
      "bn": "ট্রাকিয়া",
      "en": "Trachea"
    },
    {
      "bn": "প্লুরা",
      "en": "Pleura"
    }
  ],
  "correctIndex": 1,
  "explanation": {
    "bn": "অ্যালভিওলাইয়ের পাতলা দেয়াল ও বিপুল সংখ্যক কৈশিকের কারণে O₂ ও CO₂ বিনিময় ঘটে।",
    "en": "Alveoli have thin walls and dense capillaries, so O₂ and CO₂ exchange happens there."
  },
  "boardTag": {
    "bn": "মেডিকেল ও সকল বোর্ড",
    "en": "Medical & All Boards"
  },
  "difficulty": "easy"
},
{
  "id": "q-bio2-14",
  "subjectKey": "biology2",
  "chapter": {
    "bn": "সমন্বয় ও নিয়ন্ত্রণ",
    "en": "Coordination & Control"
  },
  "question": {
    "bn": "ইনসুলিনের অভাবে কোন রোগ হয়?",
    "en": "Deficiency of insulin causes which disease?"
  },
  "options": [
    {
      "bn": "ডায়াবেটিস মেলিটাস",
      "en": "Diabetes mellitus"
    },
    {
      "bn": "ডায়াবেটিস ইনসিপিডাস",
      "en": "Diabetes insipidus"
    },
    {
      "bn": "গয়টার",
      "en": "Goitre"
    },
    {
      "bn": "বেরিবেরি",
      "en": "Beri-beri"
    }
  ],
  "correctIndex": 0,
  "explanation": {
    "bn": "ইনসুলিন রক্তের গ্লুকোজ কোষে প্রবেশ করায়; অভাব হলে রক্তে গ্লুকোজ বাড়ে — এটি ডায়াবেটিস মেলিটাস।",
    "en": "Insulin moves glucose into cells; without it blood glucose rises (diabetes mellitus)."
  },
  "boardTag": {
    "bn": "মেডিকেল ও সকল বোর্ড",
    "en": "Medical & All Boards"
  },
  "difficulty": "easy"
},
  {
    "id": "q-bio2-15",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস",
      "en": "Animal Diversity & Classification"
    },
    "question": {
      "bn": "শিখাকোষ (Flame cell) কোন পর্বের প্রাণীর প্রধান রেচন অঙ্গ?",
      "en": "Flame cells serve as the excretory organ of which animal phylum?"
    },
    "options": [
      {
        "bn": "পরিফেরা (Porifera)",
        "en": "Porifera"
      },
      {
        "bn": "প্লাটিহেলমিনথেস (Platyhelminthes)",
        "en": "Platyhelminthes"
      },
      {
        "bn": "অ্যানিলিডা (Annelida)",
        "en": "Annelida"
      },
      {
        "bn": "আর্থ্রোপোডা (Arthropoda)",
        "en": "Arthropoda"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "চ্যাপ্টা কৃমি বা প্লাটিহেলমিনথেস পর্বের রেচন অঙ্গ শিখাকোষ; অ্যানিলিডায় নেফ্রিডিয়া এবং আর্থ্রোপোডায় মালপিজিয়ান নালিকা থাকে।",
      "en": "Platyhelminthes excrete via flame cells (protonephridia), Annelida via nephridia, and Arthropoda via Malpighian tubules."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio2-16",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "মানব শারীরতত্ত্ব: চলন ও অঙ্গচালনা",
      "en": "Human Physiology: Locomotion & Movement"
    },
    "question": {
      "bn": "পূর্ণবয়স্ক মানব কঙ্কালতন্ত্রে মোট অস্থির সংখ্যা কয়টি?",
      "en": "How many bones are present in a normal adult human skeleton?"
    },
    "options": [
      {
        "bn": "186টি",
        "en": "186"
      },
      {
        "bn": "206টি",
        "en": "206"
      },
      {
        "bn": "216টি",
        "en": "216"
      },
      {
        "bn": "300টি",
        "en": "300"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "পূর্ণবয়স্ক মানুষের দেহে মোট 206টি অস্থি থাকে (অক্ষীয় কঙ্কালে 80টি এবং উপাঙ্গীয় কঙ্কালে 126টি)।",
      "en": "An adult human skeleton comprises 206 bones: 80 axial bones and 126 appendicular bones."
    },
    "boardTag": {
      "bn": "মেডিকেল ও ঢাকা বোর্ড",
      "en": "Medical & Dhaka Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio2-17",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "মানব জীবনের ধারাবাহিকতা",
      "en": "Continuity of Human Life"
    },
    "question": {
      "bn": "মানবদেহে নিষেক (Fertilization) সাধারণত স্ত্রী প্রজননতন্ত্রের কোন অংশে সংঘটিত হয়?",
      "en": "In which part of the human female reproductive tract does fertilization normally take place?"
    },
    "options": [
      {
        "bn": "ডিম্বাশয় (Ovary)",
        "en": "Ovary"
      },
      {
        "bn": "ফ্যালোপিয়ান নালি / ডিম্বনালি (Fallopian tube)",
        "en": "Fallopian tube (ampulla)"
      },
      {
        "bn": "জরায়ু গাত্র (Endometrium)",
        "en": "Endometrium"
      },
      {
        "bn": "সার্ভিক্স",
        "en": "Cervix"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "ডিম্বনালির অ্যাম্পুলা অংশে শুক্রাণু ও ডিম্বাণুর নিষেক ঘটে এবং পরবর্তীতে ব্লাস্টোসিস্ট দশায় জরায়ুর এন্ডোমেট্রিয়ামে রোপণ (Implantation) হয়।",
      "en": "Fertilization occurs in the ampulla of the Fallopian tube, followed by blastocyst implantation in the uterine endometrium."
    },
    "boardTag": {
      "bn": "মেডিকেল ও চট্টগ্রাম বোর্ড",
      "en": "Medical & Chattogram Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio2-18",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "মানবদেহের প্রতিরক্ষা",
      "en": "Immunity of Human Body"
    },
    "question": {
      "bn": "মায়ের প্রথম দুধে (শালদুধ / Colostrum) নবজাতকের প্রতিরক্ষার জন্য কোন অ্যান্টিবডি সর্বাধিক থাকে?",
      "en": "Which immunoglobulin is most abundant in colostrum (mother's first milk), providing passive mucosal immunity?"
    },
    "options": [
      {
        "bn": "IgA",
        "en": "IgA"
      },
      {
        "bn": "IgE",
        "en": "IgE"
      },
      {
        "bn": "IgM",
        "en": "IgM"
      },
      {
        "bn": "IgD",
        "en": "IgD"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "শালদুধ, অশ্রু ও লালায় ক্ষরণকারী IgA সর্বাধিক থাকে; আর অমরা (Placenta) অতিক্রম করতে পারে একমাত্র IgG।",
      "en": "Secretory IgA dominates colostrum, tears, and saliva, while IgG is the only antibody that crosses the placenta."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-bio2-19",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "প্রাণীর আচরণ",
      "en": "Animal Behavior"
    },
    "question": {
      "bn": "মৌমাছির নৃত্যভাষা (Waggle dance) আবিষ্কারের জন্য কোন বিজ্ঞানী নোবেল পুরস্কার পান?",
      "en": "Which ethologist won the Nobel Prize for decoding the waggle-dance communication of honeybees?"
    },
    "options": [
      {
        "bn": "আইভান প্যাভলভ",
        "en": "Ivan Pavlov"
      },
      {
        "bn": "কার্ল ভন ফ্রিশ (Karl von Frisch)",
        "en": "Karl von Frisch"
      },
      {
        "bn": "গ্রেগর মেন্ডেল",
        "en": "Gregor Mendel"
      },
      {
        "bn": "চার্লস ডারউইন",
        "en": "Charles Darwin"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "কার্ল ভন ফ্রিশ মৌমাছির রাউন্ড ড্যান্স ও ওয়াগল ড্যান্স বিশ্লেষণের জন্য ১৯৭৩ সালে চিকিৎসাবিজ্ঞানে নোবেল পান।",
      "en": "Karl von Frisch shared the 1973 Nobel Prize for demonstrating how honeybees communicate food direction and distance via dance."
    },
    "boardTag": {
      "bn": "মেডিকেল ও যশোর বোর্ড",
      "en": "Medical & Jashore Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio2-20",
    "subjectKey": "biology2",
    "chapter": {
      "bn": "প্রাণীর আচরণ",
      "en": "Animal Behavior"
    },
    "question": {
      "bn": "আলোর উদ্দীপনার দিকে বা বিপরীতে প্রাণীর দিকমুখী চলনকে কী বলা হয়?",
      "en": "What is the directed movement of an organism toward or away from a light stimulus called?"
    },
    "options": [
      {
        "bn": "জিওট্যাক্সিস",
        "en": "Geotaxis"
      },
      {
        "bn": "ফটোট্যাক্সিস (Phototaxis)",
        "en": "Phototaxis"
      },
      {
        "bn": "কেমোট্যাক্সিস",
        "en": "Chemotaxis"
      },
      {
        "bn": "রিওট্যাক্সিস",
        "en": "Rheotaxis"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "আলো দ্বারা নিয়ন্ত্রিত সমগ্র দেহের দিকমুখী চলনকে ফটোট্যাক্সিস বলে (যেমন: ইউগ্লিনার আলোর দিকে গমন ধনাত্মক ফটোট্যাক্সিস)।",
      "en": "Whole-body orientation and locomotion in response to light is phototaxis (e.g., positive phototaxis in Euglena)."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  }
];

export default QUESTIONS;
