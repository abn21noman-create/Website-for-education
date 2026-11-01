import type { McqQuestion } from '../../types';

/** Generated from the single bank during the per-paper split; edit via the data pipeline. */
const QUESTIONS: McqQuestion[] = [
  {
    "id": "q-chem2-1",
    "subjectKey": "chemistry2",
    "chapter": {
      "bn": "পরিবেশ রসায়ন",
      "en": "Environmental Chemistry"
    },
    "question": {
      "bn": "পানিতে মাছ ও জলজ প্রাণীর বেঁচে থাকার জন্য দ্রবীভূত অক্সিজেন (DO) এর সর্বনিম্ন আদর্শ মাত্রা কত হওয়া প্রয়োজন?",
      "en": "What is the minimum standard Dissolved Oxygen (DO) required in water for aquatic life?"
    },
    "options": [
      {
        "bn": "1.0 – 2.0 ppm",
        "en": "1.0 – 2.0 ppm"
      },
      {
        "bn": "4.0 – 6.0 ppm",
        "en": "4.0 – 6.0 ppm"
      },
      {
        "bn": "12.0 – 15.0 ppm",
        "en": "12.0 – 15.0 ppm"
      },
      {
        "bn": "0.5 ppm",
        "en": "0.5 ppm"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "বিশুদ্ধ পানিতে মাছ ও জলজ জীবের জীবনধারণের জন্য DO মাত্রা কমপক্ষে 4.0 – 6.0 mg/L (ppm) হওয়া আবশ্যক।",
      "en": "Surface water needs at least 4.0 – 6.0 ppm (mg/L) of Dissolved Oxygen to sustain aquatic organisms."
    },
    "boardTag": {
      "bn": "ঢাকা ও দিনাজপুর বোর্ড",
      "en": "Dhaka & Dinajpur Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-chem2-2",
    "subjectKey": "chemistry2",
    "chapter": {
      "bn": "জৈব রসায়ন",
      "en": "Organic Chemistry"
    },
    "question": {
      "bn": "নিচের কোন যৌগটি টলেন বিকারক ও আয়োডোফর্ম উভয় পরীক্ষাতেই সাড়া দেয়?",
      "en": "Which of the following compounds responds positively to BOTH Tollens test and the Iodoform test?"
    },
    "options": [
      {
        "bn": "মিথান্যাল (HCHO)",
        "en": "Methanal (HCHO)"
      },
      {
        "bn": "ইথান্যাল (CH₃CHO)",
        "en": "Ethanal (CH₃CHO)"
      },
      {
        "bn": "প্রোপানোন (CH₃COCH₃)",
        "en": "Propanone (CH₃COCH₃)"
      },
      {
        "bn": "বেনজালডিহাইড (C₆H₅CHO)",
        "en": "Benzaldehyde (C₆H₅CHO)"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "ইথান্যালে (CH₃-CHO) অ্যালডিহাইড (-CHO) মূলক থাকায় টলেন বিকারকে সিলভার দর্পণ দেয় এবং মিথাইল কার্বনিল (CH₃-CO-) অংশ থাকায় আয়োডোফর্ম বিক্রিয়াও দেয়!",
      "en": "Ethanal (CH₃CHO) is the ONLY aldehyde with a CH₃-C(=O)- group, so it passes both Tollens and Haloform tests!"
    },
    "boardTag": {
      "bn": "BUET, মেডিকেল ও সকল বোর্ড",
      "en": "BUET, Medical & Boards"
    },
    "difficulty": "hard"
  },
  {
    "id": "q-chem2-3",
    "subjectKey": "chemistry2",
    "chapter": {
      "bn": "পরিমাণগত রসায়ন",
      "en": "Quantitative Chemistry"
    },
    "question": {
      "bn": "5% (w/v) Na₂CO₃ দ্রবণের মোলার ঘনমাত্রা (Molarity) কত? (Na₂CO₃ এর আণবিক ভর = 106)",
      "en": "What is the molarity of a 5% (w/v) Na₂CO₃ solution? (Molar mass = 106 g/mol)"
    },
    "options": [
      {
        "bn": "0.472 M",
        "en": "0.472 M"
      },
      {
        "bn": "0.943 M",
        "en": "0.943 M"
      },
      {
        "bn": "1.25 M",
        "en": "1.25 M"
      },
      {
        "bn": "0.530 M",
        "en": "0.530 M"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "শর্টকাট সূত্র S = 10x / M = (10 × 5) / 106 = 50 / 106 ≈ 0.472 M।",
      "en": "Using shortcut S = 10x / M = (10 × 5) / 106 = 0.472 M."
    },
    "boardTag": {
      "bn": "যশোর ও রাজশাহী বোর্ড",
      "en": "Jashore & Rajshahi Board"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-chem2-4",
    "subjectKey": "chemistry2",
    "chapter": {
      "bn": "তড়িৎ রসায়ন",
      "en": "Electrochemistry"
    },
    "question": {
      "bn": "গলিত AlCl₃ হতে 1 মোল (27 g) অ্যালুমিনিয়াম ধাতু ক্যাথোডে সঞ্চিত করতে কত ফ্যারাডে তড়িৎ প্রয়োজন?",
      "en": "How many Faradays of electricity are required to deposit 1 mole (27 g) of Al from molten AlCl₃?"
    },
    "options": [
      {
        "bn": "1 F",
        "en": "1 F"
      },
      {
        "bn": "2 F",
        "en": "2 F"
      },
      {
        "bn": "3 F",
        "en": "3 F"
      },
      {
        "bn": "6 F",
        "en": "6 F"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "ক্যাথোড বিক্রিয়া: Al³⁺ + 3e⁻ → Al। ১ মোল Al³⁺ বিজারিত করতে ৩ মোল ইলেকট্রন অর্থাৎ 3 ফ্যারাডে (3 × 96500 C) চার্জ প্রয়োজন।",
      "en": "Al³⁺ + 3e⁻ → Al requires 3 moles of electrons per mole of Aluminum, i.e., 3 Faradays."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-chem2-5",
    "subjectKey": "chemistry2",
    "chapter": {
      "bn": "জৈব রসায়ন",
      "en": "Organic Chemistry"
    },
    "question": {
      "bn": "বেনজিন বলয়ে নিচের কোন মূলকটি অর্থো-প্যারা নির্দেশক (Ortho-Para Director)?",
      "en": "Which of the following substituent groups on a benzene ring is an ortho-para director?"
    },
    "options": [
      {
        "bn": "-NO₂",
        "en": "-NO₂"
      },
      {
        "bn": "-CHO",
        "en": "-CHO"
      },
      {
        "bn": "-OH",
        "en": "-OH"
      },
      {
        "bn": "-COOH",
        "en": "-COOH"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "-OH, -NH₂, -CH₃, -X (হ্যালোজেন) বলয়ে ইলেকট্রন ঘনত্ব বাড়ায় বা অর্থো-প্যারা নির্দেশক; অন্যদিকে -NO₂, -CHO, -COOH, -CN মেটা নির্দেশক।",
      "en": "-OH donates electron density via resonance, directing incoming electrophiles to ortho and para positions."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-chem2-4-b",
    "subjectKey": "chemistry2",
    "chapter": {
      "bn": "পরিবেশ রসায়ন",
      "en": "Environmental Chemistry"
    },
    "question": {
      "bn": "SATP (প্রমাণ কক্ষ তাপমাত্রা ও চাপ)-তে ১ মোল আদর্শ গ্যাসের আয়তন কত লিটার?",
      "en": "What is the molar volume of an ideal gas at SATP (Standard Ambient Temperature and Pressure)?"
    },
    "options": [
      {
        "bn": "22.4 L",
        "en": "22.4 L"
      },
      {
        "bn": "24.789 L",
        "en": "24.789 L"
      },
      {
        "bn": "24.0 L",
        "en": "24.0 L"
      },
      {
        "bn": "25.4 L",
        "en": "25.4 L"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "STP (0°C, 1 atm)-তে মোলার আয়তন 22.4 L, কিন্তু SATP (25°C বা 298.15 K, 100 kPa)-তে মোলার আয়তন 24.789 L।",
      "en": "At STP molar volume is 22.4 L, whereas at SATP (298.15 K, 100 kPa) it is 24.789 L."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-chem2-5-b",
    "subjectKey": "chemistry2",
    "chapter": {
      "bn": "জৈব রসায়ন",
      "en": "Organic Chemistry"
    },
    "question": {
      "bn": "অ্যালডিহাইড ও কিটোনের মধ্যে পার্থক্য সূচক পরীক্ষায় ব্যবহৃত হয় কোনটি?",
      "en": "Which reagent distinguishes an aldehyde from a ketone?"
    },
    "options": [
      {
        "bn": "লুকাস বিকারক",
        "en": "Lucas reagent"
      },
      {
        "bn": "টলেন বিকারক (Tollens’ reagent)",
        "en": "Tollens’ reagent"
      },
      {
        "bn": "২,৪-DNPH",
        "en": "2,4-DNPH"
      },
      {
        "bn": "ব্রোমিন পানি",
        "en": "Bromine water"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "২,৪-DNPH অ্যালডিহাইড ও কিটোন উভয়ের সাথেই কমলা-হলুদ অধঃক্ষেপ দেয়, কিন্তু টলেন বিকারক (অ্যামোনিয়াক্যাল AgNO₃) শুধুমাত্র অ্যালডিহাইডের সাথে সিলভার দর্পণ দেয়।",
      "en": "2,4-DNPH tests positive for both carbonyls, whereas Tollens’ reagent gives a silver mirror ONLY with aldehydes."
    },
    "boardTag": {
      "bn": "সকল বোর্ড ও মেডিকেল",
      "en": "All Boards & Medical"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-chem2-6",
    "subjectKey": "chemistry2",
    "chapter": {
      "bn": "পরিমাণগত রসায়ন",
      "en": "Quantitative Chemistry"
    },
    "question": {
      "bn": "অম্লীয় মাধ্যমে KMnO₄-এ ম্যাঙ্গানিজের (Mn) জারণ সংখ্যার পরিবর্তন কত থেকে কত হয়?",
      "en": "In acidic medium, how does the oxidation state of Mn in KMnO₄ change during titration?"
    },
    "options": [
      {
        "bn": "+7 হতে +4",
        "en": "+7 to +4"
      },
      {
        "bn": "+7 হতে +2",
        "en": "+7 to +2"
      },
      {
        "bn": "+6 হতে +2",
        "en": "+6 to +2"
      },
      {
        "bn": "+7 হতে 0",
        "en": "+7 to 0"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "অম্লীয় মাধ্যমে MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O; অর্থাৎ জারণ সংখ্যা +7 হতে +2 হয় (তুল্য সংখ্যা = ৫)।",
      "en": "In acidic medium MnO₄⁻ gains 5 electrons to form Mn²⁺ (+7 → +2)."
    },
    "boardTag": {
      "bn": "BUET ও ঢাবি ক",
      "en": "BUET & DU Ka"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-chem2-9",
    "subjectKey": "chemistry2",
    "chapter": {
      "bn": "জৈব রসায়ন: হাইড্রোকার্বন",
      "en": "Organic: Hydrocarbons"
    },
    "question": {
      "bn": "অ্যালকেন শ্রেণির সাধারণ সংকেত কোনটি?",
      "en": "What is the general formula of the alkane series?"
    },
    "options": [
      {
        "bn": "CnH2n",
        "en": "CnH2n"
      },
      {
        "bn": "CnH2n+2",
        "en": "CnH2n+2"
      },
      {
        "bn": "CnH2n-2",
        "en": "CnH2n-2"
      },
      {
        "bn": "CnHn",
        "en": "CnHn"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "অ্যালকেন সম্পৃক্ত হাইড্রোকার্বন — CnH2n+2। অ্যালকিন CnH2n এবং অ্যালকাইন CnH2n-2।",
      "en": "Alkanes are saturated: CnH2n+2, while alkenes are CnH2n and alkynes CnH2n-2."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-chem2-10",
    "subjectKey": "chemistry2",
    "chapter": {
      "bn": "জৈব রসায়ন: আইইউপিএসি নামকরণ",
      "en": "Organic: IUPAC Naming"
    },
    "question": {
      "bn": "CH3–CH(CH3)–CH2–CH3 যৌগের আইইউপিএসি নাম কী?",
      "en": "What is the IUPAC name of CH3–CH(CH3)–CH2–CH3?"
    },
    "options": [
      {
        "bn": "২-মিথাইলবিউটেন",
        "en": "2-methylbutane"
      },
      {
        "bn": "৩-মিথাইলবিউটেন",
        "en": "3-methylbutane"
      },
      {
        "bn": "পেন্টেন",
        "en": "Pentane"
      },
      {
        "bn": "২-মিথাইলপ্রোপেন",
        "en": "2-methylpropane"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "দীর্ঘতম শিকলে ৪টি কার্বন (বিউটেন); মিথাইল শাখাটি ২ নম্বরে — তাই ২-মিথাইলবিউটেন।",
      "en": "The longest chain has 4 carbons (butane) and the methyl branch sits at C-2: 2-methylbutane."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-chem2-11",
    "subjectKey": "chemistry2",
    "chapter": {
      "bn": "পরিমাণগত রসায়ন: pH",
      "en": "Quantitative: pH"
    },
    "question": {
      "bn": "0.01 M HCl দ্রবণের pH কত?",
      "en": "What is the pH of a 0.01 M HCl solution?"
    },
    "options": [
      {
        "bn": "১",
        "en": "1"
      },
      {
        "bn": "২",
        "en": "2"
      },
      {
        "bn": "৩",
        "en": "3"
      },
      {
        "bn": "১২",
        "en": "12"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "HCl সম্পূর্ণ বিয়োজিত হয়, তাই [H+] = 10⁻² M; pH = −log(10⁻²) = ২।",
      "en": "HCl dissociates fully, so [H+] = 10⁻² M and pH = −log(10⁻²) = 2."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-chem2-12",
    "subjectKey": "chemistry2",
    "chapter": {
      "bn": "তড়িৎ রসায়ন",
      "en": "Electrochemistry"
    },
    "question": {
      "bn": "গলিত NaCl-এর তড়িৎ বিশ্লেষণে ক্যাথোডে কী জমা হয়?",
      "en": "In the electrolysis of molten NaCl, what is deposited at the cathode?"
    },
    "options": [
      {
        "bn": "ক্লোরিন গ্যাস",
        "en": "Chlorine gas"
      },
      {
        "bn": "সোডিয়াম ধাতু",
        "en": "Sodium metal"
      },
      {
        "bn": "হাইড্রোজেন গ্যাস",
        "en": "Hydrogen gas"
      },
      {
        "bn": "সোডিয়াম হাইড্রোক্সাইড",
        "en": "Sodium hydroxide"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "ক্যাথোডে বিজারণ ঘটে: Na⁺ + e⁻ → Na। অ্যানোডে Cl⁻ জারিত হয়ে Cl₂ গ্যাস উৎপন্ন করে।",
      "en": "Reduction occurs at the cathode: Na⁺ + e⁻ → Na; chloride ions oxidise to Cl₂ at the anode."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-chem2-13",
    "subjectKey": "chemistry2",
    "chapter": {
      "bn": "জৈব রসায়ন: সম্পৃক্ততা",
      "en": "Organic: Saturation"
    },
    "question": {
      "bn": "নিচের কোনটি সম্পৃক্ত হাইড্রোকার্বন?",
      "en": "Which of the following is a saturated hydrocarbon?"
    },
    "options": [
      {
        "bn": "মিথিন (ইথিন)",
        "en": "Ethene"
      },
      {
        "bn": "ইথাইন",
        "en": "Ethyne"
      },
      {
        "bn": "ইথেন",
        "en": "Ethane"
      },
      {
        "bn": "বেঞ্জিন",
        "en": "Benzene"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "ইথেন (C₂H₆)-এ শুধু একক বন্ধন, তাই সম্পৃক্ত। ইথিনে দ্বিবন্ধন, ইথাইনে ত্রিবন্ধন এবং বেঞ্জিন অ্যারোমেটিক।",
      "en": "Ethane (C₂H₆) has only single bonds; ethene, ethyne and benzene are unsaturated/aromatic."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
{
  "id": "q-chem2-14",
  "subjectKey": "chemistry2",
  "chapter": {
    "bn": "পরিমাণগত রসায়ন: pH",
    "en": "Quantitative: pH"
  },
  "question": {
    "bn": "কোনো দ্রবণের pH = 4 হলে সেটি কী?",
    "en": "If a solution has pH = 4, what is it?"
  },
  "options": [
    {
      "bn": "ক্ষারীয়",
      "en": "Basic"
    },
    {
      "bn": "অম্লীয়",
      "en": "Acidic"
    },
    {
      "bn": "নিরপেক্ষ",
      "en": "Neutral"
    },
    {
      "bn": "লবণাক্ত",
      "en": "Saline"
    }
  ],
  "correctIndex": 1,
  "explanation": {
    "bn": "pH < 7 হলে অম্লীয়, = 7 নিরপেক্ষ, > 7 ক্ষারীয়। pH 4 মানে [H⁺] = 10⁻⁴ M।",
    "en": "pH below 7 is acidic, 7 neutral, above 7 basic; pH 4 means [H⁺] = 10⁻⁴ M."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "easy"
},
{
  "id": "q-chem2-15",
  "subjectKey": "chemistry2",
  "chapter": {
    "bn": "জৈব রসায়ন: এস্টার",
    "en": "Organic: Esters"
  },
  "question": {
    "bn": "কার্বক্সিলিক অ্যাসিড ও অ্যালকোহলের বিক্রিয়ায় কী উৎপন্ন হয়?",
    "en": "Carboxylic acid reacts with alcohol to give what?"
  },
  "options": [
    {
      "bn": "অ্যালডিহাইড",
      "en": "Aldehyde"
    },
    {
      "bn": "কিটোন",
      "en": "Ketone"
    },
    {
      "bn": "এস্টার",
      "en": "Ester"
    },
    {
      "bn": "অ্যামিন",
      "en": "Amine"
    }
  ],
  "correctIndex": 2,
  "explanation": {
    "bn": "অ্যাসিড + অ্যালকোহল ⇌ এস্টার + পানি — এটি এস্টারিফিকেশন, সাধারণত H₂SO₄ অনুঘটক হিসেবে ব্যবহৃত হয়।",
    "en": "Acid + alcohol ⇌ ester + water (esterification), usually catalysed by H₂SO₄."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "medium"
},
{
  "id": "q-chem2-16",
  "subjectKey": "chemistry2",
  "chapter": {
    "bn": "জারণ-বিজারণ",
    "en": "Redox"
  },
  "question": {
    "bn": "KMnO₄-এ Mn-এর জারণ সংখ্যা কত?",
    "en": "What is the oxidation number of Mn in KMnO₄?"
  },
  "options": [
    {
      "bn": "+2",
      "en": "+2"
    },
    {
      "bn": "+4",
      "en": "+4"
    },
    {
      "bn": "+7",
      "en": "+7"
    },
    {
      "bn": "+6",
      "en": "+6"
    }
  ],
  "correctIndex": 2,
  "explanation": {
    "bn": "K = +1, O = −2 × 4 = −8; মোট শূন্য হতে Mn = +7।",
    "en": "K is +1 and four O give −8, so Mn must be +7 for a neutral molecule."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "medium"
},
{
  "id": "q-chem2-17",
  "subjectKey": "chemistry2",
  "chapter": {
    "bn": "তড়িৎ রসায়ন",
    "en": "Electrochemistry"
  },
  "question": {
    "bn": "ফ্যারাডে ধ্রুবকের মান কত?",
    "en": "What is the value of Faraday’s constant?"
  },
  "options": [
    {
      "bn": "96500 C/mol",
      "en": "96500 C/mol"
    },
    {
      "bn": "6.023 × 10²³ C/mol",
      "en": "6.023 × 10²³ C/mol"
    },
    {
      "bn": "9.65 C/mol",
      "en": "9.65 C/mol"
    },
    {
      "bn": "1.6 × 10⁻¹⁹ C/mol",
      "en": "1.6 × 10⁻¹⁹ C/mol"
    }
  ],
  "correctIndex": 0,
  "explanation": {
    "bn": "১ মোল ইলেকট্রনের চার্জ = 96500 C/mol (প্রায় 96485); অন্যগুলো যথাক্রমে অ্যাভোগাড্রো সংখ্যা ও একটি ইলেকট্রনের চার্জ।",
    "en": "One mole of electrons carries 96500 C (≈96485); the other values are Avogadro’s number and one electron’s charge."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "easy"
}
];

export default QUESTIONS;
