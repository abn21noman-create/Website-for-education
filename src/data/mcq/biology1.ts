import type { McqQuestion } from '../../types';

/** Generated from the single bank during the per-paper split; edit via the data pipeline. */
const QUESTIONS: McqQuestion[] = [
  {
    "id": "q-bio1-1",
    "subjectKey": "biology1",
    "chapter": {
      "bn": "কোষ ও এর গঠন",
      "en": "Cell & Its Structure"
    },
    "question": {
      "bn": "কোষের ‘প্রোটিন ফ্যাক্টরি’ বলা হয় কোন অঙ্গাণুকে এবং আদি কোষে (Prokaryote) এর ধরন কোনটি?",
      "en": "Which organelle is called the protein factory of the cell, and what is its type in prokaryotes?"
    },
    "options": [
      {
        "bn": "মাইটোকন্ড্রিয়া, 70S",
        "en": "Mitochondria, 70S"
      },
      {
        "bn": "রাইবোসোম, 70S (50S + 30S)",
        "en": "Ribosome, 70S (50S + 30S)"
      },
      {
        "bn": "রাইবোসোম, 80S (60S + 40S)",
        "en": "Ribosome, 80S (60S + 40S)"
      },
      {
        "bn": "গলগি বডি, 70S",
        "en": "Golgi body, 70S"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "রাইবোসোমে প্রোটিন সংশ্লেষিত হয় বলে একে প্রোটিন ফ্যাক্টরি বলে। আদি কোষে 70S (সাব-ইউনিট 50S ও 30S) এবং প্রকৃত কোষের সাইটোপ্লাজমে 80S রাইবোসোম থাকে।",
      "en": "Ribosomes synthesize proteins; prokaryotes possess 70S ribosomes composed of 50S and 30S subunits."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio1-2",
    "subjectKey": "biology1",
    "chapter": {
      "bn": "কোষ বিভাজন",
      "en": "Cell Division"
    },
    "question": {
      "bn": "মায়োসিস-১ এর প্রোফেজ-১ এর কোন উপ-পর্যায়ে নন-সিস্টার ক্রোমাটিডের মধ্যে ক্রসিং ওভার (Crossing Over) ঘটে?",
      "en": "In which sub-stage of Meiosis Prophase-I does crossing over occur between non-sister chromatids?"
    },
    "options": [
      {
        "bn": "লেপ্টোটিন (Leptotene)",
        "en": "Leptotene"
      },
      {
        "bn": "জাইগোটিন (Zygotene)",
        "en": "Zygotene"
      },
      {
        "bn": "প্যাকাইটিন (Pachytene)",
        "en": "Pachytene"
      },
      {
        "bn": "ডিপ্লোটিন (Diplotene)",
        "en": "Diplotene"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "জাইগোটিনে সিনেপসিস ও বাইভ্যালেন্ট তৈরি হয় এবং প্যাকাইটিন উপ-পর্যায়ে কায়াজমা সৃষ্টি হয়ে ক্রসিং ওভার সম্পন্ন হয়।",
      "en": "Synapsis occurs in Zygotene, whereas chiasma formation and crossing over take place during Pachytene."
    },
    "boardTag": {
      "bn": "মেডিকেল ও যশোর বোর্ড",
      "en": "Medical & Jashore Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio1-3",
    "subjectKey": "biology1",
    "chapter": {
      "bn": "উদ্ভিদ শারীরতত্ত্ব",
      "en": "Plant Physiology"
    },
    "question": {
      "bn": "C4 উদ্ভিদে সালোকসংশ্লেষণের অন্ধকার পর্যায়ে উৎপন্ন প্রথম স্থায়ী যৌগ কোনটি?",
      "en": "What is the first stable compound formed during carbon fixation in C4 plants?"
    },
    "options": [
      {
        "bn": "৩-ফসফোগ্লিসারিক এসিড (3-PGA)",
        "en": "3-Phosphoglyceric acid (3-PGA)"
      },
      {
        "bn": "রাইবুলোজ ১,৫-বিসফসফেট",
        "en": "Ribulose 1,5-bisphosphate"
      },
      {
        "bn": "অক্সালো অ্যাসিটিক এসিড (4C)",
        "en": "Oxaloacetic acid (OAA - 4C)"
      },
      {
        "bn": "পাইরুভিক এসিড",
        "en": "Pyruvic acid"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "হ্যাচ ও স্ল্যাক চক্রে (C4) মেসোফিল কোষে প্রথম স্থায়ী ৪-কার্বনবিশিষ্ট যৌগ হলো অক্সালো অ্যাসিটিক এসিড (OAA)। C3 চক্রে প্রথম স্থায়ী যৌগ 3-PGA।",
      "en": "In the Hatch-Slack (C4) pathway, 4-carbon Oxaloacetic Acid (OAA) is the first stable product."
    },
    "boardTag": {
      "bn": "ঢাকা ও রাজশাহী বোর্ড",
      "en": "Dhaka & Rajshahi Board"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-bio1-4",
    "subjectKey": "biology1",
    "chapter": {
      "bn": "জীবপ্রযুক্তি",
      "en": "Biotechnology"
    },
    "question": {
      "bn": "রিকম্বিনেন্ট DNA প্রযুক্তিতে ‘আণবিক কাঁচি’ (Molecular Scissors) হিসেবে কোন এনজাইমটি ব্যবহৃত হয়?",
      "en": "Which enzyme acts as \"Molecular Scissors\" in recombinant DNA technology?"
    },
    "options": [
      {
        "bn": "DNA লাইগেজ (Ligase)",
        "en": "DNA Ligase"
      },
      {
        "bn": "রেস্ট্রিকশন এন্ডোনিউক্লিয়েজ",
        "en": "Restriction Endonuclease"
      },
      {
        "bn": "DNA পলিমারেজ",
        "en": "DNA Polymerase"
      },
      {
        "bn": "হেলিকেজ (Helicase)",
        "en": "Helicase"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "রেস্ট্রিকশন এনজাইম DNA-এর নির্দিষ্ট সিকোয়েন্স কাটে বলে একে আণবিক কাঁচি এবং DNA লাইগেজ জোড়া লাগায় বলে একে আণবিক আঠা (Molecular Glue) বলা হয়।",
      "en": "Restriction endonuclease cuts DNA at specific sites (molecular scissors), while DNA ligase joins fragments (molecular glue)."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio1-5",
    "subjectKey": "biology1",
    "chapter": {
      "bn": "অণুজীব",
      "en": "Microorganisms"
    },
    "question": {
      "bn": "ম্যালেরিয়া পরজীবীর (Plasmodium) কোন দশাটি মশকীর লালাগ্রন্থিতে অবস্থান করে এবং মানুষের দেহে সংক্রমণ ঘটায়?",
      "en": "Which stage of the malaria parasite (Plasmodium) resides in the mosquito salivary gland and infects humans?"
    },
    "options": [
      {
        "bn": "মেরোজয়েট (Merozoite)",
        "en": "Merozoite"
      },
      {
        "bn": "স্পোরোজয়েট (Sporozoite)",
        "en": "Sporozoite"
      },
      {
        "bn": "ট্রফোজয়েট (Trophozoite)",
        "en": "Trophozoite"
      },
      {
        "bn": "গ্যামিটোসাইট (Gametocyte)",
        "en": "Gametocyte"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "মানবদেহে ম্যালেরিয়ার সংক্রামক দশা হলো মাকু আকৃতির ‘স্পোরোজয়েট’, আর মশকীর দেহে সংক্রামক দশা হলো ‘গ্যামিটোসাইট’।",
      "en": "Spindle-shaped Sporozoites are the infectious stage injected into humans; Gametocytes infect the Anopheles mosquito."
    },
    "boardTag": {
      "bn": "মেডিকেল ১০০% হট টপিক",
      "en": "Medical Hot Topic"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio1-4-b",
    "subjectKey": "biology1",
    "chapter": {
      "bn": "কোষ বিভাজন",
      "en": "Cell Division"
    },
    "question": {
      "bn": "মায়োসিস কোষ বিভাজনের কোন উপ-পর্যায়ে ক্রসিং ওভার (Crossing over) সংঘটিত হয়?",
      "en": "During which sub-stage of Meiosis Prophase-I does crossing over take place?"
    },
    "options": [
      {
        "bn": "লেপ্টোটিন",
        "en": "Leptotene"
      },
      {
        "bn": "জাইগোটিন",
        "en": "Zygotene"
      },
      {
        "bn": "প্যাকাইটিন (Pachytene)",
        "en": "Pachytene"
      },
      {
        "bn": "ডিপ্লোটিন",
        "en": "Diplotene"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "জাইগোটিনে সিনেপসিস/বাইভ্যালেন্ট ঘটে এবং প্যাকাইটিন উপ-পর্যায়ে টেট্রাড গঠন ও ক্রসিং ওভার সম্পন্ন হয়।",
      "en": "Synapsis occurs in Zygotene, while tetrad formation and crossing over occur in Pachytene."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio1-5-b",
    "subjectKey": "biology1",
    "chapter": {
      "bn": "উদ্ভিদ শারীরতত্ত্ব",
      "en": "Plant Physiology"
    },
    "question": {
      "bn": "C₄ উদ্ভিদে (যেমন ভুট্টা, আখ) কার্বন বিজারণের প্রথম স্থায়ী পদার্থ কোনটি?",
      "en": "What is the first stable carbon fixation product in C₄ plants (e.g., maize, sugarcane)?"
    },
    "options": [
      {
        "bn": "৩-ফসফোগ্লিসারিক এসিড",
        "en": "3-Phosphoglyceric acid"
      },
      {
        "bn": "অক্সালো অ্যাসিটিক এসিড (OAA)",
        "en": "Oxaloacetic acid (OAA)"
      },
      {
        "bn": "রাইবুলোজ ১,৫-বিসফসফেট",
        "en": "RuBP"
      },
      {
        "bn": "পাইরুভিক এসিড",
        "en": "Pyruvic acid"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "হ্যাচ ও স্ল্যাক (C₄) চক্রে প্রথম স্থায়ী পদার্থ হলো ৪-কার্বন বিশিষ্ট অক্সালো অ্যাসিটিক এসিড (OAA); C₃ চক্রে ৩-PGA।",
      "en": "In the Hatch-Slack (C₄) pathway, the first stable compound is 4-carbon Oxaloacetic Acid (OAA)."
    },
    "boardTag": {
      "bn": "মেডিকেল ও যশোর বোর্ড",
      "en": "Medical & Jashore Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio1-c1",
    "subjectKey": "biology1",
    "chapter": {
      "bn": "কোষ ও এর গঠন",
      "en": "Cell Structure"
    },
    "question": {
      "bn": "কোষের শক্তি উৎপাদনকেন্দ্র (Powerhouse) কোনটি?",
      "en": "Which organelle is called the powerhouse of the cell?"
    },
    "options": [
      {
        "bn": "রাইবোজোম",
        "en": "Ribosome"
      },
      {
        "bn": "মাইটোকন্ড্রিয়া",
        "en": "Mitochondria"
      },
      {
        "bn": "লাইসোজোম",
        "en": "Lysosome"
      },
      {
        "bn": "গলগি বডি",
        "en": "Golgi body"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "মাইটোকন্ড্রিয়ায় শ্বসনের মাধ্যমে ATP উৎপন্ন হয়, তাই এটি কোষের শক্তিঘর।",
      "en": "Mitochondria generate ATP through respiration, hence the powerhouse."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio1-c2",
    "subjectKey": "biology1",
    "chapter": {
      "bn": "উদ্ভিদ শারীরতত্ত্ব",
      "en": "Plant Physiology"
    },
    "question": {
      "bn": "সালোকসংশ্লেষে নির্গত অক্সিজেন কোন পদার্থ থেকে আসে?",
      "en": "The oxygen released in photosynthesis comes from which substance?"
    },
    "options": [
      {
        "bn": "কার্বন ডাই-অক্সাইড",
        "en": "Carbon dioxide"
      },
      {
        "bn": "পানি",
        "en": "Water"
      },
      {
        "bn": "গ্লুকোজ",
        "en": "Glucose"
      },
      {
        "bn": "ক্লোরোফিল",
        "en": "Chlorophyll"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "আলোক-বিশ্লেষণে পানির ফটোলাইসিসে O₂ উৎপন্ন হয়; CO₂ থেকে আসে কার্বন, যা গ্লুকোজে যায়।",
      "en": "Photolysis of water releases O₂; the carbon for glucose comes from CO₂."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-bio1-c3",
    "subjectKey": "biology1",
    "chapter": {
      "bn": "কোষ রসায়ন",
      "en": "Cell Chemistry"
    },
    "question": {
      "bn": "DNA-তে কোন চারটি ক্ষারক থাকে?",
      "en": "Which four bases occur in DNA?"
    },
    "options": [
      {
        "bn": "A, T, G, C",
        "en": "A, T, G, C"
      },
      {
        "bn": "A, U, G, C",
        "en": "A, U, G, C"
      },
      {
        "bn": "A, T, G, U",
        "en": "A, T, G, U"
      },
      {
        "bn": "A, C, U, T",
        "en": "A, C, U, T"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "DNA-তে অ্যাডেনিন, থাইমিন, গুয়ানিন, সাইটোসিন; আর RNA-তে থাইমিনের বদলে ইউরাসিল।",
      "en": "DNA uses adenine, thymine, guanine and cytosine; RNA swaps thymine for uracil."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio1-c4",
    "subjectKey": "biology1",
    "chapter": {
      "bn": "কোষ বিভাজন",
      "en": "Cell Division"
    },
    "question": {
      "bn": "মাইটোসিস বিভাজনের ফলে সৃষ্ট কোষে ক্রোমোজোম সংখ্যা কেমন হয়?",
      "en": "What happens to the chromosome number in cells produced by mitosis?"
    },
    "options": [
      {
        "bn": "অর্ধেক হয়",
        "en": "Halved"
      },
      {
        "bn": "দ্বিগুণ হয়",
        "en": "Doubled"
      },
      {
        "bn": "অপরিবর্তিত থাকে",
        "en": "Unchanged"
      },
      {
        "bn": "শূন্য হয়",
        "en": "Becomes zero"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "মাইটোসিসে মাতৃকোষের সমান (2n) ক্রোমোজোমবিশিষ্ট দুইটি কোষ তৈরি হয়; মিয়োসিসে অর্ধেক হয়।",
      "en": "Mitosis yields two cells with the same 2n chromosome number; meiosis halves it."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio1-c5",
    "subjectKey": "biology1",
    "chapter": {
      "bn": "উদ্ভিদ শারীরতত্ত্ব",
      "en": "Plant Physiology"
    },
    "question": {
      "bn": "উদ্ভিদে খাদ্য (শর্করা) পরিবহন করে কোন টিস্যু?",
      "en": "Which tissue transports food (sugars) in plants?"
    },
    "options": [
      {
        "bn": "জাইলেম",
        "en": "Xylem"
      },
      {
        "bn": "ফ্লোয়েম",
        "en": "Phloem"
      },
      {
        "bn": "ক্যাম্বিয়াম",
        "en": "Cambium"
      },
      {
        "bn": "এপিডার্মিস",
        "en": "Epidermis"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "ফ্লোয়েম খাদ্য পরিবহন করে, জাইলেম পানি ও খনিজ লবণ উপরে তোলে।",
      "en": "Phloem transports food; xylem carries water and minerals upward."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-bio1-c6",
    "subjectKey": "biology1",
    "chapter": {
      "bn": "প্রাণীর পরিচিতি",
      "en": "Introduction to Animals"
    },
    "question": {
      "bn": "পরিণত মানব লোহিত রক্তকণিকায় কোনটি অনুপস্থিত?",
      "en": "What is absent in mature human red blood cells?"
    },
    "options": [
      {
        "bn": "হিমোগ্লোবিন",
        "en": "Haemoglobin"
      },
      {
        "bn": "নিউক্লিয়াস",
        "en": "Nucleus"
      },
      {
        "bn": "সাইটোপ্লাজম",
        "en": "Cytoplasm"
      },
      {
        "bn": "কোষঝিল্লি",
        "en": "Cell membrane"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "পরিণত RBC-তে নিউক্লিয়াস থাকে না — এতে হিমোগ্লোবিনের জন্য বেশি জায়গা পাওয়া যায়।",
      "en": "Mature RBCs lack a nucleus, leaving more room for haemoglobin."
    },
    "boardTag": {
      "bn": "মেডিকেল ও সকল বোর্ড",
      "en": "Medical & All Boards"
    },
    "difficulty": "medium"
  }
];

export default QUESTIONS;
