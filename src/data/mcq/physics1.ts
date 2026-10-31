import type { McqQuestion } from '../../types';

/** Generated from the single bank during the per-paper split; edit via the data pipeline. */
const QUESTIONS: McqQuestion[] = [
  {
    "id": "q-phy1-1",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "ভেক্টর",
      "en": "Vectors"
    },
    "question": {
      "bn": "দুটি সমমানের ভেক্টরের মধ্যবর্তী কোণ কত হলে এদের লব্ধির মান যেকোনো একটি ভেক্টরের মানের সমান হবে?",
      "en": "At what angle between two vectors of equal magnitude will their resultant equal the magnitude of either vector?"
    },
    "options": [
      {
        "bn": "60°",
        "en": "60°"
      },
      {
        "bn": "90°",
        "en": "90°"
      },
      {
        "bn": "120°",
        "en": "120°"
      },
      {
        "bn": "180°",
        "en": "180°"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "ধরি P = Q = R। সূত্র R² = P² + Q² + 2PQ cosα তে বসিয়ে পাই: P² = P² + P² + 2P² cosα ⇒ 2P² cosα = -P² ⇒ cosα = -½ ⇒ α = 120°।",
      "en": "Let P = Q = R. From R² = P² + Q² + 2PQ cosα: P² = 2P² + 2P² cosα ⇒ cosα = -1/2 ⇒ α = 120°."
    },
    "boardTag": {
      "bn": "যশোর বোর্ড ও ঢাকা বোর্ড",
      "en": "Jashore & Dhaka Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-2",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "ভেক্টর",
      "en": "Vectors"
    },
    "question": {
      "bn": "A⃗ = 2î + 3ĵ - k̂ এবং B⃗ = 6î - m ĵ - 3k̂ ভেক্টর দুটি পরস্পর লম্ব হলে m-এর মান কত?",
      "en": "If vectors A⃗ = 2î + 3ĵ - k̂ and B⃗ = 6î - m ĵ - 3k̂ are perpendicular to each other, what is the value of m?"
    },
    "options": [
      {
        "bn": "3",
        "en": "3"
      },
      {
        "bn": "5",
        "en": "5"
      },
      {
        "bn": "-5",
        "en": "-5"
      },
      {
        "bn": "9",
        "en": "9"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "দুটি ভেক্টর পরস্পর লম্ব হলে A⃗ · B⃗ = 0। সুতরাং (2)(6) + (3)(-m) + (-1)(-3) = 0 ⇒ 12 - 3m + 3 = 0 ⇒ 3m = 15 ⇒ m = 5।",
      "en": "For perpendicular vectors, A⃗ · B⃗ = 0 ⇒ 12 - 3m + 3 = 0 ⇒ 3m = 15 ⇒ m = 5."
    },
    "boardTag": {
      "bn": "রাজশাহী বোর্ড",
      "en": "Rajshahi Board"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-phy1-3",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "গতিবিদ্যা",
      "en": "Dynamics"
    },
    "question": {
      "bn": "একটি প্রাসের সর্বাধিক উচ্চতা (H) ও অনুভূমিক পাল্লা (R) সমান হলে নিক্ষেপণ কোণ θ কত?",
      "en": "If the maximum height (H) and horizontal range (R) of a projectile are equal, what is the launch angle θ?"
    },
    "options": [
      {
        "bn": "45°",
        "en": "45°"
      },
      {
        "bn": "tan⁻¹(2)",
        "en": "tan⁻¹(2)"
      },
      {
        "bn": "tan⁻¹(4) ≈ 75.96°",
        "en": "tan⁻¹(4) ≈ 75.96°"
      },
      {
        "bn": "60°",
        "en": "60°"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "আমরা জানি, tanθ = 4H / R। যেহেতু H = R, তাই tanθ = 4 ⇒ θ = tan⁻¹(4) ≈ 75.96°।",
      "en": "Using the shortcut relation tanθ = 4H / R, when H = R we get tanθ = 4 ⇒ θ = tan⁻¹(4) ≈ 75.96°."
    },
    "boardTag": {
      "bn": "ঢাকা বোর্ড ও BUET",
      "en": "Dhaka Board & BUET"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-phy1-4",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "নিউটনিয়ান বলবিদ্যা",
      "en": "Newtonian Mechanics"
    },
    "question": {
      "bn": "বৃত্তাকার পথে ঘূর্ণনরত কণার ব্যাসার্ধ অর্ধেক এবং রৈখিক বেগ দ্বিগুণ করলে কেন্দ্রমুখী বল কতগুণ হবে?",
      "en": "If the radius of a circular path is halved and the linear speed is doubled, how many times will the centripetal force become?"
    },
    "options": [
      {
        "bn": "২ গুণ",
        "en": "2 times"
      },
      {
        "bn": "৪ গুণ",
        "en": "4 times"
      },
      {
        "bn": "৮ গুণ",
        "en": "8 times"
      },
      {
        "bn": "অপরিবর্তিত থাকবে",
        "en": "Unchanged"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "কেন্দ্রমুখী বল F = mv² / r। নতুন বল F′ = m(2v)² / (r/2) = 4mv² × (2/r) = 8(mv²/r) = 8F। অর্থাৎ ৮ গুণ হবে।",
      "en": "Centripetal force F = mv²/r. New force F′ = m(2v)² / (r/2) = 8(mv²/r) = 8F."
    },
    "boardTag": {
      "bn": "যশোর বোর্ড",
      "en": "Jashore Board"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-phy1-5",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "মহাকর্ষ ও অভিকর্ষ",
      "en": "Gravitation & Gravity"
    },
    "question": {
      "bn": "পৃথিবী পৃষ্ঠ হতে মুক্তিবেগের মান প্রায় কত?",
      "en": "What is the approximate escape velocity from the surface of the Earth?"
    },
    "options": [
      {
        "bn": "7.88 km/s",
        "en": "7.88 km/s"
      },
      {
        "bn": "9.8 km/s",
        "en": "9.8 km/s"
      },
      {
        "bn": "11.2 km/s",
        "en": "11.2 km/s"
      },
      {
        "bn": "42.1 km/s",
        "en": "42.1 km/s"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "মুক্তিবেগ v_e = √(2gR) = √(2 × 9.8 × 6.4 × 10⁶) ≈ 11.2 × 10³ m/s = 11.2 km/s।",
      "en": "Escape velocity v_e = √(2gR) ≈ 11.2 km/s."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-6",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "পর্যাবৃত্ত গতি",
      "en": "Periodic Motion"
    },
    "question": {
      "bn": "একটি সেকেন্ড দোলকের কার্যকরী দৈর্ঘ্য ৪ গুণ করা হলে এর নতুন দোলনকাল কত হবে?",
      "en": "If the effective length of a seconds pendulum is increased 4 times, what will be its new time period?"
    },
    "options": [
      {
        "bn": "1 s",
        "en": "1 s"
      },
      {
        "bn": "2 s",
        "en": "2 s"
      },
      {
        "bn": "4 s",
        "en": "4 s"
      },
      {
        "bn": "8 s",
        "en": "8 s"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "সেকেন্ড দোলকের আদি দোলনকাল T₁ = 2 s। যেহেতু T ∝ √L, তাই দৈর্ঘ্য ৪ গুণ করলে T₂ = T₁ × √4 = 2 × 2 = 4 s।",
      "en": "A seconds pendulum has T₁ = 2 s. Since T ∝ √L, making length 4L gives T₂ = 2 × √4 = 4 s."
    },
    "boardTag": {
      "bn": "চট্টগ্রাম ও যশোর বোর্ড",
      "en": "Chattogram & Jashore Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-7",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব",
      "en": "Ideal Gas & Kinetic Theory"
    },
    "question": {
      "bn": "দ্বি-পরমাণুক গ্যাসের (যেমন O₂, N₂) অণুর স্বাধীনতার মাত্রা (Degrees of Freedom) কত?",
      "en": "How many degrees of freedom does a diatomic gas molecule (such as O₂ or N₂) possess at room temperature?"
    },
    "options": [
      {
        "bn": "3",
        "en": "3"
      },
      {
        "bn": "5",
        "en": "5"
      },
      {
        "bn": "6",
        "en": "6"
      },
      {
        "bn": "7",
        "en": "7"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "দ্বি-পরমাণুক গ্যাসের ৩টি রৈখিক এবং ২টি ঘূর্ণন গতি মিলে মোট স্বাধীনতার মাত্রা f = 5 (একপরমাণুক = 3, বহুপরমাণুক = 6)।",
      "en": "A diatomic molecule has 3 translational + 2 rotational = 5 degrees of freedom at ordinary temperatures."
    },
    "boardTag": {
      "bn": "যশোর ও রাজশাহী বোর্ড",
      "en": "Jashore & Rajshahi Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-6-b",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "গতিবিদ্যা",
      "en": "Dynamics"
    },
    "question": {
      "bn": "একটি প্রাসের অনুভূমিক পাল্লা R এর সর্বোচ্চ উচ্চতা H-এর চারগুণ (R = 4H) হলে নিক্ষেপণ কোণ কত?",
      "en": "If the horizontal range R of a projectile is four times its maximum height H (R = 4H), what is the launch angle?"
    },
    "options": [
      {
        "bn": "30°",
        "en": "30°"
      },
      {
        "bn": "45°",
        "en": "45°"
      },
      {
        "bn": "60°",
        "en": "60°"
      },
      {
        "bn": "75°",
        "en": "75°"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "শর্টকাট সূত্র tanθ = 4H / R। যেহেতু R = 4H, তাই tanθ = 4H / 4H = 1 ⇒ θ = 45°।",
      "en": "Using tanθ = 4H / R: substituting R = 4H gives tanθ = 1 ⇒ θ = 45°."
    },
    "boardTag": {
      "bn": "ঢাকা বোর্ড ও BUET",
      "en": "Dhaka Board & BUET"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-7-b",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "নিউটনিয়ান বলবিদ্যা",
      "en": "Newtonian Mechanics"
    },
    "question": {
      "bn": "কৌণিক ভরবেগের (Angular Momentum) মাত্রা সমীকরণ কোনটি?",
      "en": "Which of the following is the dimensional formula of Angular Momentum (L)?"
    },
    "options": [
      {
        "bn": "[MLT⁻¹]",
        "en": "[MLT⁻¹]"
      },
      {
        "bn": "[ML²T⁻¹]",
        "en": "[ML²T⁻¹]"
      },
      {
        "bn": "[ML²T⁻²]",
        "en": "[ML²T⁻²]"
      },
      {
        "bn": "[MLT⁻²]",
        "en": "[MLT⁻²]"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "L = mvr = [M][LT⁻¹][L] = [ML²T⁻¹] (যা প্লাঙ্কের ধ্রুবক h-এর মাত্রার সমান!)।",
      "en": "L = mvr = [M][LT⁻¹][L] = [ML²T⁻¹], identical to Planck’s constant h."
    },
    "boardTag": {
      "bn": "রাজশাহী ও যশোর বোর্ড",
      "en": "Rajshahi & Jashore Board"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-phy1-8",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "পর্যাবৃত্ত গতি",
      "en": "Periodic Motion"
    },
    "question": {
      "bn": "সেকেন্ড দোলকের কার্যকরী দৈর্ঘ্য চন্দ্রপৃষ্ঠে পৃথিবীর তুলনায় কত গুণ হবে? (চন্দ্রে g_m = g_e / 6)",
      "en": "What is the effective length of a seconds pendulum on the Moon compared to Earth (g_m = g_e / 6)?"
    },
    "options": [
      {
        "bn": "6 গুণ",
        "en": "6 times"
      },
      {
        "bn": "1/6 গুণ",
        "en": "1/6 times"
      },
      {
        "bn": "√6 গুণ",
        "en": "√6 times"
      },
      {
        "bn": "1/36 গুণ",
        "en": "1/36 times"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "সেকেন্ড দোলকের দোলনকাল T = 2s স্থির। T = 2π√(L/g) হতে L ∝ g। তাই চন্দ্রপৃষ্ঠে L_m / L_e = g_m / g_e = 1/6।",
      "en": "Since T = 2s is constant, L ∝ g. Thus L_moon = L_earth / 6."
    },
    "boardTag": {
      "bn": "ঢাবি ক ও সকল বোর্ড",
      "en": "DU Ka & All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-phy1-c1",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "ভৌতজগৎ ও পরিমাপ",
      "en": "Physical World & Measurement"
    },
    "question": {
      "bn": "বলের মাত্রা সমীকরণ কোনটি?",
      "en": "What is the dimensional formula of force?"
    },
    "options": [
      {
        "bn": "MLT⁻²",
        "en": "MLT⁻²"
      },
      {
        "bn": "ML²T⁻²",
        "en": "ML²T⁻²"
      },
      {
        "bn": "MLT⁻¹",
        "en": "MLT⁻¹"
      },
      {
        "bn": "ML⁻¹T⁻²",
        "en": "ML⁻¹T⁻²"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "F = ma = MLT⁻²; ML²T⁻² হলো কাজ/শক্তি এবং MLT⁻¹ হলো ভরবেগের মাত্রা।",
      "en": "F = ma gives MLT⁻²; ML²T⁻² is work/energy and MLT⁻¹ is momentum."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-c2",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "গতিবিদ্যা",
      "en": "Kinematics"
    },
    "question": {
      "bn": "প্রাসের সর্বোচ্চ বিন্দুতে বেগের উল্লম্ব উপাংশ কত?",
      "en": "At the highest point of a projectile, what is the vertical component of velocity?"
    },
    "options": [
      {
        "bn": "সর্বোচ্চ",
        "en": "Maximum"
      },
      {
        "bn": "শূন্য",
        "en": "Zero"
      },
      {
        "bn": "অর্ধেক",
        "en": "Half the initial value"
      },
      {
        "bn": "অসীম",
        "en": "Infinite"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "সর্বোচ্চ বিন্দুতে বস্তু আর উপরে উঠছে না, তাই v_y = 0; তবে অনুভূমিক উপাংশ v_x অপরিবর্তিত থাকে।",
      "en": "At the top the object stops rising, so v_y = 0, while the horizontal component v_x is unchanged."
    },
    "boardTag": {
      "bn": "ঢাকা বোর্ড ও BUET",
      "en": "Dhaka Board & BUET"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-c3",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "মহাকর্ষ",
      "en": "Gravitation"
    },
    "question": {
      "bn": "মহাকর্ষীয় ধ্রুবক G-এর একক কোনটি?",
      "en": "What is the unit of the gravitational constant G?"
    },
    "options": [
      {
        "bn": "N·m²·kg⁻²",
        "en": "N·m²·kg⁻²"
      },
      {
        "bn": "N·m·kg⁻²",
        "en": "N·m·kg⁻²"
      },
      {
        "bn": "N·kg⁻²",
        "en": "N·kg⁻²"
      },
      {
        "bn": "m²·s⁻²",
        "en": "m²·s⁻²"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "F = Gm₁m₂/r² থেকে G = Fr²/(m₁m₂), তাই একক N·m²·kg⁻²।",
      "en": "From F = Gm₁m₂/r², G = Fr²/(m₁m₂), giving N·m²·kg⁻²."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-phy1-c4",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "কাজ, শক্তি ও ক্ষমতা",
      "en": "Work, Energy & Power"
    },
    "question": {
      "bn": "কাজ-শক্তি উপপাদ্য অনুযায়ী বস্তুর ওপর প্রযুক্ত মোট কাজ সমান কী?",
      "en": "According to the work-energy theorem, total work done equals what?"
    },
    "options": [
      {
        "bn": "বস্তুর ভরবেগের পরিবর্তন",
        "en": "Change in momentum"
      },
      {
        "bn": "বস্তুর গতিশক্তির পরিবর্তন",
        "en": "Change in kinetic energy"
      },
      {
        "bn": "বস্তুর স্থিতিশক্তির পরিবর্তন",
        "en": "Change in potential energy"
      },
      {
        "bn": "বস্তুর ত্বরণ",
        "en": "Acceleration"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "W_total = ΔK = ½mv² − ½mu²; ভরবেগের পরিবর্তন হলো ঘাত-বল।",
      "en": "W_total = ΔK = ½mv² − ½mu², while change in momentum is impulse."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-c5",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "নিউটনিয়ান বলবিদ্যা",
      "en": "Newtonian Mechanics"
    },
    "question": {
      "bn": "১ নিউটন বল সমান কত ডাইন?",
      "en": "One newton of force equals how many dynes?"
    },
    "options": [
      {
        "bn": "১০³",
        "en": "10³"
      },
      {
        "bn": "১০⁴",
        "en": "10⁴"
      },
      {
        "bn": "১০⁵",
        "en": "10⁵"
      },
      {
        "bn": "১০⁶",
        "en": "10⁶"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "1 N = 1 kg·m/s² = 10³ g × 10² cm/s² = 10⁵ dyne।",
      "en": "1 N = 1 kg·m/s² = 10³ g × 10² cm/s² = 10⁵ dyne."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-c6",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "গতিবিদ্যা",
      "en": "Kinematics"
    },
    "question": {
      "bn": "স্থির অবস্থান থেকে মুক্তভাবে পড়ন্ত বস্তুর t সময় পর বেগ কত? (বায়ুর বাধা উপেক্ষিত)",
      "en": "A body falls freely from rest. What is its velocity after time t? (ignore air resistance)"
    },
    "options": [
      {
        "bn": "gt",
        "en": "gt"
      },
      {
        "bn": "½gt²",
        "en": "½gt²"
      },
      {
        "bn": "g/t",
        "en": "g/t"
      },
      {
        "bn": "2gt",
        "en": "2gt"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "v = u + gt, এখানে u = 0, তাই v = gt; আর ½gt² হলো অতিক্রান্ত দূরত্ব।",
      "en": "v = u + gt with u = 0 gives v = gt; ½gt² is the distance fallen."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  }
];

export default QUESTIONS;
