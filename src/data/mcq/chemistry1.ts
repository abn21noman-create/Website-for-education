import type { McqQuestion } from '../../types';

/** Generated from the single bank during the per-paper split; edit via the data pipeline. */
const QUESTIONS: McqQuestion[] = [
  {
    "id": "q-chem1-1",
    "subjectKey": "chemistry1",
    "chapter": {
      "bn": "গুণগত রসায়ন",
      "en": "Qualitative Chemistry"
    },
    "question": {
      "bn": "হাইড্রোজেন পরমাণুর কোন বর্ণালি সিরিজটি দৃশ্যমান আলোর (Visible region) অঞ্চলে পাওয়া যায়?",
      "en": "Which spectral series of the hydrogen atom lies in the visible region of light?"
    },
    "options": [
      {
        "bn": "লাইম্যান সিরিজ (Lyman)",
        "en": "Lyman series"
      },
      {
        "bn": "বামার সিরিজ (Balmer)",
        "en": "Balmer series"
      },
      {
        "bn": "প্যাশ্চেন সিরিজ (Paschen)",
        "en": "Paschen series"
      },
      {
        "bn": "ব্র্যাকেট সিরিজ (Brackett)",
        "en": "Brackett series"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "উচ্চ শক্তিস্তর থেকে ইলেকট্রন ২য় শক্তিস্তরে (n₁ = 2) ফিরে আসলে বামার সিরিজ সৃষ্টি হয় যা দৃশ্যমান অঞ্চলে (380–780 nm) পড়ে। লাইম্যান UV অঞ্চলে এবং বাকিগুলো IR অঞ্চলে।",
      "en": "Transitions ending at n₁ = 2 form the Balmer series in the visible spectrum (380–780 nm)."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-chem1-2",
    "subjectKey": "chemistry1",
    "chapter": {
      "bn": "গুণগত রসায়ন",
      "en": "Qualitative Chemistry"
    },
    "question": {
      "bn": "নিচের কোন কোয়ান্টাম সংখ্যার সেটটি পরমাণুর কোনো ইলেকট্রনের জন্য অসম্ভব (অবৈধ)?",
      "en": "Which of the following sets of quantum numbers is impossible (invalid) for an electron?"
    },
    "options": [
      {
        "bn": "n = 3, l = 2, m = -2, s = +½",
        "en": "n = 3, l = 2, m = -2, s = +½"
      },
      {
        "bn": "n = 2, l = 2, m = 0, s = -½",
        "en": "n = 2, l = 2, m = 0, s = -½"
      },
      {
        "bn": "n = 4, l = 0, m = 0, s = +½",
        "en": "n = 4, l = 0, m = 0, s = +½"
      },
      {
        "bn": "n = 3, l = 1, m = +1, s = -½",
        "en": "n = 3, l = 1, m = +1, s = -½"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "সহকারী কোয়ান্টাম সংখ্যা l-এর মান 0 থেকে (n - 1) পর্যন্ত হতে পারে। তাই n = 2 হলে l কেবল 0 বা 1 হতে পারে; l = 2 হওয়া অসম্ভব!",
      "en": "Azimuthal quantum number l ranges from 0 to (n - 1). For n = 2, l cannot equal 2!"
    },
    "boardTag": {
      "bn": "ঢাকা ও যশোর বোর্ড",
      "en": "Dhaka & Jashore Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-chem1-3",
    "subjectKey": "chemistry1",
    "chapter": {
      "bn": "মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন",
      "en": "Periodic Properties & Bonding"
    },
    "question": {
      "bn": "NH₃ অণুতে কেন্দ্রীয় পরমাণুর সংকরায়ন ও বন্ধন কোণ কোনটি?",
      "en": "What are the hybridization of the central atom and bond angle in NH₃?"
    },
    "options": [
      {
        "bn": "sp³, 109.5°",
        "en": "sp³, 109.5°"
      },
      {
        "bn": "sp³, 107°",
        "en": "sp³, 107°"
      },
      {
        "bn": "sp³, 104.5°",
        "en": "sp³, 104.5°"
      },
      {
        "bn": "sp², 120°",
        "en": "sp², 120°"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "নাইট্রোজেনে sp³ সংকরায়ন ঘটে, কিন্তু ১টি মুক্তজোড় ইলেকট্রন (Lone pair) থাকায় l.p–b.p বিকর্ষণে বন্ধন কোণ 109.5° থেকে কমে 107° এবং আকৃতি ত্রিকোণাকার পিরামিডীয় হয়।",
      "en": "N undergoes sp³ hybridization, and 1 lone pair compresses the tetrahedral angle from 109.5° to 107°."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-chem1-4",
    "subjectKey": "chemistry1",
    "chapter": {
      "bn": "রাসায়নিক পরিবর্তন",
      "en": "Chemical Changes"
    },
    "question": {
      "bn": "0.005 M H₂SO₄ জলীয় দ্রবণের pH কত? (সম্পূর্ণ বিয়োজিত ধরে)",
      "en": "What is the pH of a 0.005 M aqueous H₂SO₄ solution (assuming complete dissociation)?"
    },
    "options": [
      {
        "bn": "2.0",
        "en": "2.0"
      },
      {
        "bn": "2.3",
        "en": "2.3"
      },
      {
        "bn": "3.0",
        "en": "3.0"
      },
      {
        "bn": "1.7",
        "en": "1.7"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "H₂SO₄ দ্বিক্ষারকীয় অম্ল হওয়ায় [H⁺] = 2 × 0.005 M = 0.01 M = 10⁻² M। সুতরাং pH = -log(10⁻²) = 2.0।",
      "en": "Since H₂SO₄ is diprotic, [H⁺] = 2 × 0.005 = 0.01 M = 10⁻² M. Thus pH = -log(10⁻²) = 2.0."
    },
    "boardTag": {
      "bn": "মেডিকেল ও যশোর বোর্ড",
      "en": "Medical & Jashore Board"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-chem1-5",
    "subjectKey": "chemistry1",
    "chapter": {
      "bn": "রাসায়নিক পরিবর্তন",
      "en": "Chemical Changes"
    },
    "question": {
      "bn": "N₂(g) + 3H₂(g) ⇌ 2NH₃(g) বিক্রিয়াটিতে Kp ও Kc এর সঠিক সম্পর্ক কোনটি?",
      "en": "What is the correct relation between Kp and Kc for N₂(g) + 3H₂(g) ⇌ 2NH₃(g)?"
    },
    "options": [
      {
        "bn": "Kp = Kc (RT)²",
        "en": "Kp = Kc (RT)²"
      },
      {
        "bn": "Kp = Kc (RT)⁻²",
        "en": "Kp = Kc (RT)⁻²"
      },
      {
        "bn": "Kp = Kc (RT)⁻¹",
        "en": "Kp = Kc (RT)⁻¹"
      },
      {
        "bn": "Kp = Kc",
        "en": "Kp = Kc"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "এখানে গ্যাসীয় মোল সংখ্যার পরিবর্তন Δn = 2 - (1 + 3) = -2। সুতরাং Kp = Kc (RT)^Δn = Kc (RT)⁻²।",
      "en": "Δn = 2 - (1 + 3) = -2, so Kp = Kc (RT)^(-2)."
    },
    "boardTag": {
      "bn": "ঢাকা ও যশোর বোর্ড",
      "en": "Dhaka & Jashore Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-chem1-5-b",
    "subjectKey": "chemistry1",
    "chapter": {
      "bn": "গুণগত রসায়ন",
      "en": "Qualitative Chemistry"
    },
    "question": {
      "bn": "হাইড্রোজেন পরমাণুর বর্ণালির কোন সিরিজটি দৃশ্যমান আলোর (Visible region) অন্তর্ভুক্ত?",
      "en": "Which spectral series of the hydrogen atom lies in the visible region?"
    },
    "options": [
      {
        "bn": "লাইম্যান (Lyman)",
        "en": "Lyman series"
      },
      {
        "bn": "বামার (Balmer)",
        "en": "Balmer series"
      },
      {
        "bn": "প্যাশ্চেন (Paschen)",
        "en": "Paschen series"
      },
      {
        "bn": "ব্র্যাকেট (Brackett)",
        "en": "Brackett series"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "n₁ = 2 স্তরে ইলেকট্রন ধাপান্তরের ফলে বামার সিরিজ (৩৮০–৭৮০ nm দৃশ্যমান অঞ্চল) সৃষ্টি হয়; লাইম্যান অতিবেগুনি (UV) অঞ্চলে।",
      "en": "Transitions to n₁ = 2 form the Balmer series in the visible spectrum (380–780 nm)."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-chem1-6",
    "subjectKey": "chemistry1",
    "chapter": {
      "bn": "মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন",
      "en": "Periodic Properties & Bonding"
    },
    "question": {
      "bn": "অ্যামোনিয়া (NH₃) অণুতে কেন্দ্রীয় পরমাণুর সংকরায়ন ও বন্ধন কোণ কত?",
      "en": "What are the hybridization of nitrogen and the H–N–H bond angle in NH₃?"
    },
    "options": [
      {
        "bn": "sp³, 109.5°",
        "en": "sp³, 109.5°"
      },
      {
        "bn": "sp³, 107°",
        "en": "sp³, 107°"
      },
      {
        "bn": "sp³, 104.5°",
        "en": "sp³, 104.5°"
      },
      {
        "bn": "sp², 120°",
        "en": "sp², 120°"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "NH₃-এ N পরমাণুতে sp³ সংকরায়ন ঘটে, কিন্তু ১টি মুক্তজোড় ইলেকট্রন (Lone pair) থাকায় বন্ধন কোণ 109.5° থেকে কমে 107° হয় (H₂O-তে ২টি মুক্তজোড় থাকায় 104.5°)।",
      "en": "NH₃ has sp³ hybridization with 1 lone pair, compressing the tetrahedral angle from 109.5° to 107°."
    },
    "boardTag": {
      "bn": "যশোর ও ঢাকা বোর্ড",
      "en": "Jashore & Dhaka Board"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-chem1-7",
    "subjectKey": "chemistry1",
    "chapter": {
      "bn": "রাসায়নিক পরিবর্তন",
      "en": "Chemical Changes"
    },
    "question": {
      "bn": "0.005 M H₂SO₄ জলীয় দ্রবণের pH কত? (সম্পূর্ণ বিয়োজিত ধরে)",
      "en": "What is the pH of a 0.005 M aqueous solution of H₂SO₄ (assuming complete dissociation)?"
    },
    "options": [
      {
        "bn": "2.3",
        "en": "2.3"
      },
      {
        "bn": "2.0",
        "en": "2.0"
      },
      {
        "bn": "3.0",
        "en": "3.0"
      },
      {
        "bn": "1.7",
        "en": "1.7"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "H₂SO₄ দ্বিক্ষারকীয় অম্ল হওয়ায় [H⁺] = 2 × 0.005 M = 0.01 M = 10⁻² M। সুতরাং pH = -log(10⁻²) = 2.0!",
      "en": "Since H₂SO₄ is diprotic, [H⁺] = 2 × 0.005 = 0.01 = 10⁻² M ⇒ pH = -log(10⁻²) = 2.0."
    },
    "boardTag": {
      "bn": "মেডিকেল ও ঢাবি ক ১০০% কমন",
      "en": "Medical & DU Ka Classic"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-chem1-c1",
    "subjectKey": "chemistry1",
    "chapter": {
      "bn": "মৌলের পর্যায়বৃত্ত ধর্ম",
      "en": "Periodic Properties"
    },
    "question": {
      "bn": "ক্লোরাইড আয়ন (Cl⁻)-এর ইলেকট্রন বিন্যাস কোনটি?",
      "en": "What is the electron configuration of the chloride ion (Cl⁻)?"
    },
    "options": [
      {
        "bn": "২, ৮, ৭",
        "en": "2, 8, 7"
      },
      {
        "bn": "২, ৮, ৮",
        "en": "2, 8, 8"
      },
      {
        "bn": "২, ৮, ৬",
        "en": "2, 8, 6"
      },
      {
        "bn": "২, ৮, ৯",
        "en": "2, 8, 9"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "নিরপেক্ষ Cl-এ ১৭টি ইলেকট্রন; একটি গ্রহণ করলে ১৮টি হয় — তাই ২, ৮, ৮ (আর্গনের মতো)।",
      "en": "Neutral chlorine has 17 electrons; gaining one gives 18, so 2, 8, 8 (argon-like)."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-chem1-c2",
    "subjectKey": "chemistry1",
    "chapter": {
      "bn": "মৌলের পর্যায়বৃত্ত ধর্ম",
      "en": "Periodic Properties"
    },
    "question": {
      "bn": "হ্যালোজেন মৌলগুলো পর্যায় সারণির কোন গ্রুপে অবস্থিত?",
      "en": "Halogens belong to which group of the periodic table?"
    },
    "options": [
      {
        "bn": "গ্রুপ ১",
        "en": "Group 1"
      },
      {
        "bn": "গ্রুপ ২",
        "en": "Group 2"
      },
      {
        "bn": "গ্রুপ ১৭",
        "en": "Group 17"
      },
      {
        "bn": "গ্রুপ ১৮",
        "en": "Group 18"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "F, Cl, Br, I, At — গ্রুপ ১৭ (VIIA)। গ্রুপ ১৮ হলো নোবেল গ্যাস।",
      "en": "F, Cl, Br, I, At sit in Group 17 (VIIA); Group 18 is the noble gases."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-chem1-c3",
    "subjectKey": "chemistry1",
    "chapter": {
      "bn": "রাসায়নিক বন্ধন",
      "en": "Chemical Bonding"
    },
    "question": {
      "bn": "সোডিয়াম ক্লোরাইড (NaCl)-এ কোন ধরনের বন্ধন বিদ্যমান?",
      "en": "What type of bond exists in sodium chloride (NaCl)?"
    },
    "options": [
      {
        "bn": "সমযোজী বন্ধন",
        "en": "Covalent bond"
      },
      {
        "bn": "আয়নিক বন্ধন",
        "en": "Ionic bond"
      },
      {
        "bn": "ধাতব বন্ধন",
        "en": "Metallic bond"
      },
      {
        "bn": "হাইড্রোজেন বন্ধন",
        "en": "Hydrogen bond"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "Na একটি ইলেকট্রন ছেড়ে Na⁺ হয়, Cl গ্রহণ করে Cl⁻; বিপরীত আধানের আকর্ষণেই আয়নিক বন্ধন।",
      "en": "Na loses an electron to become Na⁺ and Cl gains one to become Cl⁻; the attraction is ionic."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-chem1-c4",
    "subjectKey": "chemistry1",
    "chapter": {
      "bn": "গুণগত রসায়ন",
      "en": "Qualitative Chemistry"
    },
    "question": {
      "bn": "কোনটি নোবেল গ্যাস?",
      "en": "Which of these is a noble gas?"
    },
    "options": [
      {
        "bn": "নাইট্রোজেন",
        "en": "Nitrogen"
      },
      {
        "bn": "অক্সিজেন",
        "en": "Oxygen"
      },
      {
        "bn": "আর্গন",
        "en": "Argon"
      },
      {
        "bn": "ক্লোরিন",
        "en": "Chlorine"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "আর্গন (Ar) নোবেল গ্যাস — গ্রুপ ১৮, সবচেয়ে বাইরের শেল পূর্ণ, তাই রাসায়নিকভাবে নিষ্ক্রিয়।",
      "en": "Argon (Ar) is a noble gas in Group 18 with a full outer shell, hence chemically inert."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-chem1-c5",
    "subjectKey": "chemistry1",
    "chapter": {
      "bn": "মৌলের পর্যায়বৃত্ত ধর্ম",
      "en": "Periodic Properties"
    },
    "question": {
      "bn": "পর্যায় সারণিতে বাম থেকে ডানে গেলে আয়নীকরণ শক্তির কী হয়?",
      "en": "Moving left to right across a period, what happens to ionisation energy?"
    },
    "options": [
      {
        "bn": "বাড়ে",
        "en": "Increases"
      },
      {
        "bn": "কমে",
        "en": "Decreases"
      },
      {
        "bn": "অপরিবর্তিত থাকে",
        "en": "Stays the same"
      },
      {
        "bn": "প্রথমে বাড়ে, পরে শূন্য হয়",
        "en": "Rises then becomes zero"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "নিউক্লিয়ার চার্জ বাড়ে আর পারমাণবিক ব্যাসার্ধ কমে, ফলে বাইরের ইলেকট্রন আটকে রাখার শক্তি বাড়ে।",
      "en": "Effective nuclear charge rises while atomic radius shrinks, so the outer electron is held more tightly."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-chem1-c6",
    "subjectKey": "chemistry1",
    "chapter": {
      "bn": "মোল ও অ্যাভোগাড্রো সংখ্যা",
      "en": "Mole & Avogadro"
    },
    "question": {
      "bn": "১ মোলে কতটি কণা থাকে?",
      "en": "How many particles are there in one mole?"
    },
    "options": [
      {
        "bn": "৬.০২৩ × ১০²³",
        "en": "6.023 × 10²³"
      },
      {
        "bn": "৩.১৪ × ১০²³",
        "en": "3.14 × 10²³"
      },
      {
        "bn": "৯.১ × ১০⁻³¹",
        "en": "9.1 × 10⁻³¹"
      },
      {
        "bn": "১.৬ × ১০⁻¹⁹",
        "en": "1.6 × 10⁻¹⁹"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "অ্যাভোগাড্রো সংখ্যা N_A ≈ ৬.০২৩ × ১০²³ — ১ মোল পদার্থে এই সংখ্যক অণু/পরমাণু থাকে।",
      "en": "Avogadro’s number N_A ≈ 6.023 × 10²³ particles per mole."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "easy"
  },
{
  "id": "q-chem1-15",
  "subjectKey": "chemistry1",
  "chapter": {
    "bn": "মৌলের শ্রেণিবিন্যাস",
    "en": "Classification of Elements"
  },
  "question": {
    "bn": "নিচের কোনটি ক্ষার ধাতু?",
    "en": "Which of the following is an alkali metal?"
  },
  "options": [
    {
      "bn": "Mg",
      "en": "Mg"
    },
    {
      "bn": "Na",
      "en": "Na"
    },
    {
      "bn": "Al",
      "en": "Al"
    },
    {
      "bn": "Fe",
      "en": "Fe"
    }
  ],
  "correctIndex": 1,
  "explanation": {
    "bn": "Na (সোডিয়াম) 1ম শ্রেণির ক্ষার ধাতু; Mg ও Al ধাতু হলেও ক্ষার ধাতু নয়।",
    "en": "Sodium is a group-1 alkali metal; Mg and Al are metals but not alkali metals."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "easy"
},
{
  "id": "q-chem1-16",
  "subjectKey": "chemistry1",
  "chapter": {
    "bn": "মোল ও রসায়নিক গণনা",
    "en": "Mole Concept"
  },
  "question": {
    "bn": "৪.৪ গ্রাম CO₂-এর মোল সংখ্যা কত? (C = 12, O = 16)",
    "en": "How many moles are there in 4.4 g of CO₂? (C = 12, O = 16)"
  },
  "options": [
    {
      "bn": "০.০৫",
      "en": "0.05"
    },
    {
      "bn": "০.১",
      "en": "0.1"
    },
    {
      "bn": "০.২",
      "en": "0.2"
    },
    {
      "bn": "১",
      "en": "1"
    }
  ],
  "correctIndex": 1,
  "explanation": {
    "bn": "CO₂-এর মোলার ভর = 12 + 32 = 44 g; মোল = 4.4/44 = 0.1।",
    "en": "Molar mass of CO₂ is 44 g, so 4.4/44 = 0.1 mol."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "easy"
}
];

export default QUESTIONS;
