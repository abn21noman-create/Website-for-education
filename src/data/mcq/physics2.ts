import type { McqQuestion } from '../../types';

/** Generated from the single bank during the per-paper split; edit via the data pipeline. */
const QUESTIONS: McqQuestion[] = [
  {
    "id": "q-phy2-1",
    "subjectKey": "physics2",
    "chapter": {
      "bn": "তাপগতিবিদ্যা",
      "en": "Thermodynamics"
    },
    "question": {
      "bn": "একটি কার্নো ইঞ্জিন 127°C ও 27°C তাপমাত্রার মধ্যে কাজ করলে এর কর্মদক্ষতা কত?",
      "en": "What is the efficiency of a Carnot engine operating between 127°C and 27°C?"
    },
    "options": [
      {
        "bn": "25%",
        "en": "25%"
      },
      {
        "bn": "50%",
        "en": "50%"
      },
      {
        "bn": "75%",
        "en": "75%"
      },
      {
        "bn": "78.7%",
        "en": "78.7%"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "T₁ = 127 + 273 = 400 K এবং T₂ = 27 + 273 = 300 K। কর্মদক্ষতা η = (1 - T₂/T₁) × 100% = (1 - 300/400) × 100% = 25%।",
      "en": "Convert to Kelvin: T₁ = 400 K, T₂ = 300 K. Efficiency η = (1 - 300/400) × 100% = 25%."
    },
    "boardTag": {
      "bn": "ঢাকা ও যশোর বোর্ড",
      "en": "Dhaka & Jashore Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy2-2",
    "subjectKey": "physics2",
    "chapter": {
      "bn": "চল তড়িৎ",
      "en": "Current Electricity"
    },
    "question": {
      "bn": "99 Ω রোধের একটি গ্যালভানোমিটারের পাল্লা ১০ গুণ বৃদ্ধি করতে এর সাথে কত মানের শান্ট যুক্ত করতে হবে?",
      "en": "What shunt resistance must be connected to a 99 Ω galvanometer to increase its range 10 times?"
    },
    "options": [
      {
        "bn": "9.9 Ω (সমান্তরালে)",
        "en": "9.9 Ω (in parallel)"
      },
      {
        "bn": "11 Ω (সমান্তরালে)",
        "en": "11 Ω (in parallel)"
      },
      {
        "bn": "11 Ω (শ্রেণিতে)",
        "en": "11 Ω (in series)"
      },
      {
        "bn": "90 Ω (সমান্তরালে)",
        "en": "90 Ω (in parallel)"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "শান্ট সর্বদা সমান্তরালে যুক্ত হয় এবং S = G / (n - 1) = 99 / (10 - 1) = 99 / 9 = 11 Ω।",
      "en": "Shunt is always connected in parallel: S = G / (n - 1) = 99 / (10 - 1) = 11 Ω."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-phy2-3",
    "subjectKey": "physics2",
    "chapter": {
      "bn": "নিউক্লিয়ার পদার্থবিজ্ঞান",
      "en": "Nuclear Physics"
    },
    "question": {
      "bn": "কোনো তেজস্ক্রিয় পদার্থের অর্ধায়ু ৫ দিন হলে ১৫ দিন পর এর কত অংশ অক্ষত (অবশিষ্ট) থাকবে?",
      "en": "If the half-life of a radioactive element is 5 days, what fraction remains undecayed after 15 days?"
    },
    "options": [
      {
        "bn": "1/3 অংশ",
        "en": "1/3"
      },
      {
        "bn": "1/4 অংশ",
        "en": "1/4"
      },
      {
        "bn": "1/8 অংশ",
        "en": "1/8"
      },
      {
        "bn": "7/8 অংশ",
        "en": "7/8"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "অর্ধায়ু সংখ্যা n = t / T₁/₂ = 15 / 5 = 3। অবশিষ্ট অংশ N / N₀ = 1 / 2ⁿ = 1 / 2³ = 1/8 অংশ। (ক্ষয়প্রাপ্ত অংশ 7/8)।",
      "en": "Number of half-lives n = 15 / 5 = 3. Remaining fraction = (1/2)³ = 1/8."
    },
    "boardTag": {
      "bn": "রাজশাহী ও কুমিল্লা বোর্ড",
      "en": "Rajshahi & Cumilla Board"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-phy2-4",
    "subjectKey": "physics2",
    "chapter": {
      "bn": "সেমিকন্ডাক্টর ও ইলেকট্রনিক্স",
      "en": "Semiconductors & Electronics"
    },
    "question": {
      "bn": "একটি ট্রানজিস্টরের α = 0.98 হলে এর প্রবাহ বিবর্ধন গুণক β-এর মান কত?",
      "en": "If the common-base current gain of a transistor is α = 0.98, what is its β value?"
    },
    "options": [
      {
        "bn": "19",
        "en": "19"
      },
      {
        "bn": "49",
        "en": "49"
      },
      {
        "bn": "98",
        "en": "98"
      },
      {
        "bn": "0.49",
        "en": "0.49"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "আমরা জানি, β = α / (1 - α) = 0.98 / (1 - 0.98) = 0.98 / 0.02 = 49।",
      "en": "β = α / (1 - α) = 0.98 / 0.02 = 49."
    },
    "boardTag": {
      "bn": "যশোর বোর্ড",
      "en": "Jashore Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy2-5",
    "subjectKey": "physics2",
    "chapter": {
      "bn": "ভৌত আলোকবিজ্ঞান",
      "en": "Physical Optics"
    },
    "question": {
      "bn": "নিচের কোন ধর্মটি প্রমাণ করে যে আলো একটি আড় বা অনুপ্রস্থ তরঙ্গ (Transverse Wave)?",
      "en": "Which optical phenomenon proves that light is a transverse wave?"
    },
    "options": [
      {
        "bn": "ব্যতিচার (Interference)",
        "en": "Interference"
      },
      {
        "bn": "অপবর্তন (Diffraction)",
        "en": "Diffraction"
      },
      {
        "bn": "সমাবর্তন বা পোলারায়ন (Polarization)",
        "en": "Polarization"
      },
      {
        "bn": "প্রতিসরণ (Refraction)",
        "en": "Refraction"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "অনুদৈর্ঘ্য তরঙ্গের (যেমন শব্দ) সমাবর্তন ঘটে না; শুধুমাত্র অনুপ্রস্থ তরঙ্গেরই সমাবর্তন (Polarization) ঘটে।",
      "en": "Only transverse waves can be polarized; longitudinal waves like sound cannot undergo polarization."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy2-4-b",
    "subjectKey": "physics2",
    "chapter": {
      "bn": "তাপগতিবিদ্যা",
      "en": "Thermodynamics"
    },
    "question": {
      "bn": "একটি কার্নো ইঞ্জিন 327°C ও 27°C তাপমাত্রার মধ্যে কাজ করলে এর কর্মদক্ষতা (η) কত?",
      "en": "What is the efficiency (η) of a Carnot engine operating between 327°C and 27°C?"
    },
    "options": [
      {
        "bn": "40%",
        "en": "40%"
      },
      {
        "bn": "50%",
        "en": "50%"
      },
      {
        "bn": "60%",
        "en": "60%"
      },
      {
        "bn": "91.7%",
        "en": "91.7%"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "T₁ = 327 + 273 = 600 K এবং T₂ = 27 + 273 = 300 K। η = (1 - T₂/T₁) × 100% = (1 - 300/600) × 100% = 50%।",
      "en": "Convert to Kelvin first! T₁ = 600 K, T₂ = 300 K. η = (1 - 300/600) × 100% = 50%."
    },
    "boardTag": {
      "bn": "BUET ও সকল বোর্ড",
      "en": "BUET & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy2-5-b",
    "subjectKey": "physics2",
    "chapter": {
      "bn": "চল তড়িৎ",
      "en": "Current Electricity"
    },
    "question": {
      "bn": "প্রতিটি 6 Ω মানের তিনটি রোধ সমান্তরালে যুক্ত করলে তুল্য রোধ কত হবে?",
      "en": "If three resistors of 6 Ω each are connected in parallel, what is the equivalent resistance?"
    },
    "options": [
      {
        "bn": "18 Ω",
        "en": "18 Ω"
      },
      {
        "bn": "3 Ω",
        "en": "3 Ω"
      },
      {
        "bn": "2 Ω",
        "en": "2 Ω"
      },
      {
        "bn": "0.5 Ω",
        "en": "0.5 Ω"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "সমান মানের n সংখ্যক রোধ সমান্তরালে থাকলে R_p = R / n = 6 / 3 = 2 Ω।",
      "en": "For n equal resistors in parallel, R_p = R / n = 6 / 3 = 2 Ω."
    },
    "boardTag": {
      "bn": "চট্টগ্রাম বোর্ড",
      "en": "Chattogram Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy2-6",
    "subjectKey": "physics2",
    "chapter": {
      "bn": "আধুনিক পদার্থবিজ্ঞানের সূচনা",
      "en": "Modern Physics"
    },
    "question": {
      "bn": "কোনো বস্তুকণা আলোর বেগের (c) কত গুণ বেগে চললে এর গতিশীল ভর স্থির ভরের দ্বিগুণ হবে?",
      "en": "At what fraction of the speed of light c must a particle move so that its relativistic mass becomes twice its rest mass?"
    },
    "options": [
      {
        "bn": "c / 2",
        "en": "c / 2"
      },
      {
        "bn": "(√3 / 2) c",
        "en": "(√3 / 2) c"
      },
      {
        "bn": "(1 / √2) c",
        "en": "(1 / √2) c"
      },
      {
        "bn": "0.99 c",
        "en": "0.99 c"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "m = m₀ / √(1 - v²/c²) = 2m₀ ⇒ √(1 - v²/c²) = 1/2 ⇒ 1 - v²/c² = 1/4 ⇒ v = (√3 / 2)c ≈ 0.866c।",
      "en": "Setting γ = 2 gives 1 - v²/c² = 1/4 ⇒ v = (√3 / 2)c."
    },
    "boardTag": {
      "bn": "BUET ও ঢাবি ক",
      "en": "BUET & DU Ka"
    },
    "difficulty": "hard"
  },
  {
    "id": "q-phy2-9",
    "subjectKey": "physics2",
    "chapter": {
      "bn": "স্থির তড়িৎ",
      "en": "Current Electricity"
    },
    "question": {
      "bn": "রোধের এসআই একক কী?",
      "en": "What is the SI unit of resistance?"
    },
    "options": [
      {
        "bn": "ভোল্ট",
        "en": "Volt"
      },
      {
        "bn": "অ্যাম্পিয়ার",
        "en": "Ampere"
      },
      {
        "bn": "ওহম",
        "en": "Ohm"
      },
      {
        "bn": "কুলম্ব",
        "en": "Coulomb"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "R = V/I — ভোল্ট/অ্যাম্পিয়ার = ওহম (Ω)।",
      "en": "R = V/I, so volt per ampere is the ohm (Ω)."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy2-10",
    "subjectKey": "physics2",
    "chapter": {
      "bn": "তড়িৎ প্রবাহের ক্রিয়া",
      "en": "Effects of Current"
    },
    "question": {
      "bn": "শ্রেণি সমবায়ে (series) সংযুক্ত রোধগুলোর মধ্য দিয়ে কী অপরিবর্তিত থাকে?",
      "en": "What stays the same through resistors connected in series?"
    },
    "options": [
      {
        "bn": "বিভব পার্থক্য",
        "en": "Potential difference"
      },
      {
        "bn": "তড়িৎ প্রবাহ",
        "en": "Current"
      },
      {
        "bn": "রোধ",
        "en": "Resistance"
      },
      {
        "bn": "শক্তি",
        "en": "Power"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "শ্রেণিতে একটি মাত্র পথ, তাই প্রতিটি রোধে একই তড়িৎ প্রবাহ; সমান্তরালে বিভব সমান থাকে।",
      "en": "A series circuit has one path, so the current is the same through each resistor; parallel branches share voltage."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy2-11",
    "subjectKey": "physics2",
    "chapter": {
      "bn": "জ্যামিতিক আলোকবিজ্ঞান",
      "en": "Geometrical Optics"
    },
    "question": {
      "bn": "সমতল দর্পণের ফোকাস দূরত্ব কত?",
      "en": "What is the focal length of a plane mirror?"
    },
    "options": [
      {
        "bn": "শূন্য",
        "en": "Zero"
      },
      {
        "bn": "অসীম",
        "en": "Infinity"
      },
      {
        "bn": "দর্পণ থেকে বস্তুর দূরত্বের সমান",
        "en": "Equal to the object distance"
      },
      {
        "bn": "অর্ধেক বস্তু দূরত্ব",
        "en": "Half the object distance"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "সমতল দর্পণের বক্রতার ব্যাসার্ধ অসীম, তাই f = R/2 = অসীম।",
      "en": "A plane mirror has an infinite radius of curvature, so f = R/2 = infinity."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-phy2-12",
    "subjectKey": "physics2",
    "chapter": {
      "bn": "আধুনিক পদার্থবিজ্ঞান",
      "en": "Modern Physics"
    },
    "question": {
      "bn": "শূন্যস্থানে আলোর বেগ প্রায় কত?",
      "en": "What is the speed of light in vacuum, approximately?"
    },
    "options": [
      {
        "bn": "3 × 10⁶ m/s",
        "en": "3 × 10⁶ m/s"
      },
      {
        "bn": "3 × 10⁸ m/s",
        "en": "3 × 10⁸ m/s"
      },
      {
        "bn": "3 × 10¹⁰ m/s",
        "en": "3 × 10¹⁰ m/s"
      },
      {
        "bn": "1.5 × 10⁸ m/s",
        "en": "1.5 × 10⁸ m/s"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "c ≈ 3 × 10⁸ m/s (প্রায় ২.৯৯৮ × 10⁸)। 1.5 × 10⁸ হলো কাচ/পানির মতো মাধ্যমে আলোর বেগ।",
      "en": "c ≈ 3 × 10⁸ m/s (2.998 × 10⁸ exactly). ~1.5 × 10⁸ is light speed in glass or water."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
{
  "id": "q-phy2-13",
  "subjectKey": "physics2",
  "chapter": {
    "bn": "ধারকত্ব",
    "en": "Capacitance"
  },
  "question": {
    "bn": "ধারকত্বের এসআই একক কী?",
    "en": "What is the SI unit of capacitance?"
  },
  "options": [
    {
      "bn": "ফ্যারাড",
      "en": "Farad"
    },
    {
      "bn": "কুলম্ব",
      "en": "Coulomb"
    },
    {
      "bn": "ভোল্ট",
      "en": "Volt"
    },
    {
      "bn": "হেনরি",
      "en": "Henry"
    }
  ],
  "correctIndex": 0,
  "explanation": {
    "bn": "C = Q/V, তাই কুলম্ব/ভোল্ট = ফ্যারাড (F)। হেনরি হলো আবেশের একক।",
    "en": "C = Q/V, so coulomb per volt is the farad; the henry is the unit of inductance."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "easy"
},
{
  "id": "q-phy2-14",
  "subjectKey": "physics2",
  "chapter": {
    "bn": "জ্যামিতিক আলোকবিজ্ঞান",
    "en": "Geometrical Optics"
  },
  "question": {
    "bn": "পূর্ণ অভ্যন্তরীণ প্রতিফলন ঘটার শর্ত কোনটি?",
    "en": "What is the condition for total internal reflection?"
  },
  "options": [
    {
      "bn": "আপতন কোণ সংকট কোণের সমান",
      "en": "Angle of incidence equals the critical angle"
    },
    {
      "bn": "আপতন কোণ সংকট কোণের চেয়ে বড়",
      "en": "Angle of incidence exceeds the critical angle"
    },
    {
      "bn": "আলো ঘন মাধ্যম থেকে হালকা মাধ্যমে যায়",
      "en": "Light travels from rarer to denser medium"
    },
    {
      "bn": "আপতন কোণ ০°",
      "en": "Angle of incidence is 0°"
    }
  ],
  "correctIndex": 1,
  "explanation": {
    "bn": "আলো ঘন থেকে হালকা মাধ্যমে গিয়ে আপতন কোণ সংকট কোণের চেয়ে বড় হলে প্রতিসরণ না হয়ে সম্পূর্ণ প্রতিফলিত হয়।",
    "en": "Light going from denser to rarer medium reflects completely when the incidence angle exceeds the critical angle."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "medium"
},
{
  "id": "q-phy2-15",
  "subjectKey": "physics2",
  "chapter": {
    "bn": "তড়িৎ চৌম্বকীয় আবেশ",
    "en": "Electromagnetic Induction"
  },
  "question": {
    "bn": "ট্রান্সফর্মার কোন নীতিতে কাজ করে?",
    "en": "On which principle does a transformer work?"
  },
  "options": [
    {
      "bn": "স্বকীয় আবেশ",
      "en": "Self induction"
    },
    {
      "bn": "পারস্পরিক আবেশ",
      "en": "Mutual induction"
    },
    {
      "bn": "তাপীয় প্রভাব",
      "en": "Heating effect"
    },
    {
      "bn": "রাসায়নিক প্রভাব",
      "en": "Chemical effect"
    }
  ],
  "correctIndex": 1,
  "explanation": {
    "bn": "প্রাথমিক কয়েলের পরিবর্তনশীল চৌম্বক ফ্লাক্স দ্বিতীয় কয়েলে তড়িৎচালক বল সৃষ্টি করে — এটি পারস্পরিক আবেশ।",
    "en": "Changing flux from the primary coil induces an EMF in the secondary coil — mutual induction."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "easy"
},
{
  "id": "q-phy2-16",
  "subjectKey": "physics2",
  "chapter": {
    "bn": "আধুনিক পদার্থবিজ্ঞান",
    "en": "Modern Physics"
  },
  "question": {
    "bn": "কোনো তেজস্ক্রিয় পদার্থের অর্ধায়ু ৫ বছর হলে ১৫ বছর পর কত অংশ অবশিষ্ট থাকবে?",
    "en": "A radioactive substance has a half-life of 5 years. What fraction remains after 15 years?"
  },
  "options": [
    {
      "bn": "১/২",
      "en": "1/2"
    },
    {
      "bn": "১/৪",
      "en": "1/4"
    },
    {
      "bn": "১/৮",
      "en": "1/8"
    },
    {
      "bn": "১/১৬",
      "en": "1/16"
    }
  ],
  "correctIndex": 2,
  "explanation": {
    "bn": "১৫ বছরে ৩টি অর্ধায়ু (১৫/৫ = ৩); অবশিষ্ট = (১/২)³ = ১/৮।",
    "en": "15 years is three half-lives, so the remaining fraction is (1/2)³ = 1/8."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "medium"
}
];

export default QUESTIONS;
