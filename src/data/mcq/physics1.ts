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
  },

  {
    "id": "q-phy1-17",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "ভৌত জগৎ ও পরিমাপ",
      "en": "Physical World & Measurement"
    },
    "question": {
      "bn": "চাপের মাত্রা সমীকরণ কোনটি?",
      "en": "Which is the dimensional formula of pressure?"
    },
    "options": [
      {
        "bn": "[MLT⁻²]",
        "en": "[MLT⁻²]"
      },
      {
        "bn": "[ML⁻¹T⁻²]",
        "en": "[ML⁻¹T⁻²]"
      },
      {
        "bn": "[ML²T⁻²]",
        "en": "[ML²T⁻²]"
      },
      {
        "bn": "[M⁻¹LT⁻²]",
        "en": "[M⁻¹LT⁻²]"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "চাপ = বল/ক্ষেত্রফল। তাই [P] = [MLT⁻²]/[L²] = [ML⁻¹T⁻²]।",
      "en": "Pressure is force per unit area, so [P] = [MLT⁻²]/[L²] = [ML⁻¹T⁻²]."
    },
    "boardTag": {
      "bn": "ধারণাভিত্তিক অনুশীলন",
      "en": "Concept practice"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-phy1-18",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "ভৌত জগৎ ও পরিমাপ",
      "en": "Physical World & Measurement"
    },
    "question": {
      "bn": "একটি স্ক্রু গজের পিচ 0.5 mm এবং বৃত্তাকার স্কেলে 50টি ভাগ থাকলে লঘিষ্ঠ গণন কত?",
      "en": "A screw gauge has a pitch of 0.5 mm and 50 circular-scale divisions. What is its least count?"
    },
    "options": [
      {
        "bn": "0.1 mm",
        "en": "0.1 mm"
      },
      {
        "bn": "0.05 mm",
        "en": "0.05 mm"
      },
      {
        "bn": "0.01 mm",
        "en": "0.01 mm"
      },
      {
        "bn": "0.001 mm",
        "en": "0.001 mm"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "লঘিষ্ঠ গণন = পিচ/বৃত্তাকার স্কেলের ভাগসংখ্যা = 0.5/50 = 0.01 mm।",
      "en": "Least count = pitch / circular-scale divisions = 0.5/50 = 0.01 mm."
    },
    "boardTag": {
      "bn": "ধারণাভিত্তিক অনুশীলন",
      "en": "Concept practice"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-phy1-19",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "ভেক্টর",
      "en": "Vectors"
    },
    "question": {
      "bn": "A⃗ = 3î + 4ĵ হলে A⃗-এর দিকে একক ভেক্টর কোনটি?",
      "en": "If A⃗ = 3î + 4ĵ, which is the unit vector along A⃗?"
    },
    "options": [
      {
        "bn": "3î + 4ĵ",
        "en": "3î + 4ĵ"
      },
      {
        "bn": "(4/5)î + (3/5)ĵ",
        "en": "(4/5)î + (3/5)ĵ"
      },
      {
        "bn": "(3/5)î + (4/5)ĵ",
        "en": "(3/5)î + (4/5)ĵ"
      },
      {
        "bn": "(3/7)î + (4/7)ĵ",
        "en": "(3/7)î + (4/7)ĵ"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "|A⃗| = √(3²+4²) = 5। তাই Â = A⃗/|A⃗| = (3/5)î + (4/5)ĵ।",
      "en": "|A⃗| = √(3²+4²) = 5, hence Â = A⃗/|A⃗| = (3/5)î + (4/5)ĵ."
    },
    "boardTag": {
      "bn": "ধারণাভিত্তিক অনুশীলন",
      "en": "Concept practice"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-20",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "গতিবিদ্যা",
      "en": "Dynamics"
    },
    "question": {
      "bn": "স্থির অবস্থা থেকে একটি বস্তু 2 m/s² সুষম ত্বরণে 5 s চললে কত দূরত্ব অতিক্রম করবে?",
      "en": "Starting from rest, how far does an object travel in 5 s with uniform acceleration 2 m/s²?"
    },
    "options": [
      {
        "bn": "10 m",
        "en": "10 m"
      },
      {
        "bn": "20 m",
        "en": "20 m"
      },
      {
        "bn": "25 m",
        "en": "25 m"
      },
      {
        "bn": "50 m",
        "en": "50 m"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "s = ut + ½at² = 0 + ½ × 2 × 5² = 25 m।",
      "en": "s = ut + ½at² = 0 + ½ × 2 × 5² = 25 m."
    },
    "boardTag": {
      "bn": "ধারণাভিত্তিক অনুশীলন",
      "en": "Concept practice"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-21",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "নিউটনিয়ান বলবিদ্যা",
      "en": "Newtonian Mechanics"
    },
    "question": {
      "bn": "2 kg ভরের বস্তুর ওপর 10 N লব্ধি বল কাজ করলে ত্বরণ কত হবে?",
      "en": "What acceleration is produced when a net force of 10 N acts on a 2 kg mass?"
    },
    "options": [
      {
        "bn": "2 m/s²",
        "en": "2 m/s²"
      },
      {
        "bn": "5 m/s²",
        "en": "5 m/s²"
      },
      {
        "bn": "10 m/s²",
        "en": "10 m/s²"
      },
      {
        "bn": "20 m/s²",
        "en": "20 m/s²"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "নিউটনের দ্বিতীয় সূত্রে a = F/m = 10/2 = 5 m/s²।",
      "en": "By Newton's second law, a = F/m = 10/2 = 5 m/s²."
    },
    "boardTag": {
      "bn": "ধারণাভিত্তিক অনুশীলন",
      "en": "Concept practice"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-22",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "নিউটনিয়ান বলবিদ্যা",
      "en": "Newtonian Mechanics"
    },
    "question": {
      "bn": "2 kg ভরের একটি বস্তু 4 m/s বেগে এসে স্থির 2 kg বস্তুর সঙ্গে লেগে গেলে যৌথ বেগ কত?",
      "en": "A 2 kg object moving at 4 m/s sticks to a stationary 2 kg object. What is their common speed?"
    },
    "options": [
      {
        "bn": "1 m/s",
        "en": "1 m/s"
      },
      {
        "bn": "2 m/s",
        "en": "2 m/s"
      },
      {
        "bn": "3 m/s",
        "en": "3 m/s"
      },
      {
        "bn": "4 m/s",
        "en": "4 m/s"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "ভরবেগ সংরক্ষণে v = (2×4 + 2×0)/(2+2) = 2 m/s।",
      "en": "Conservation of momentum gives v = (2×4 + 2×0)/(2+2) = 2 m/s."
    },
    "boardTag": {
      "bn": "ধারণাভিত্তিক অনুশীলন",
      "en": "Concept practice"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-phy1-23",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "কাজ, শক্তি ও ক্ষমতা",
      "en": "Work, Energy & Power"
    },
    "question": {
      "bn": "60 kg ভরের একজন শিক্ষার্থী 10 s-এ 5 m উঁচু সিঁড়ি উঠলে তার গড় ক্ষমতা কত? (g = 10 m/s²)",
      "en": "A 60 kg student climbs 5 m in 10 s. What is the average power? (g = 10 m/s²)"
    },
    "options": [
      {
        "bn": "30 W",
        "en": "30 W"
      },
      {
        "bn": "150 W",
        "en": "150 W"
      },
      {
        "bn": "300 W",
        "en": "300 W"
      },
      {
        "bn": "600 W",
        "en": "600 W"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "P = mgh/t = (60×10×5)/10 = 300 W।",
      "en": "P = mgh/t = (60×10×5)/10 = 300 W."
    },
    "boardTag": {
      "bn": "ধারণাভিত্তিক অনুশীলন",
      "en": "Concept practice"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-24",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "মহাকর্ষ ও অভিকর্ষ",
      "en": "Gravitation & Gravity"
    },
    "question": {
      "bn": "পৃথিবীপৃষ্ঠের নিকটে কক্ষীয় বেগ vₒ এবং মুক্তিবেগ vₑ-এর সম্পর্ক কোনটি?",
      "en": "Near Earth's surface, what is the relation between orbital speed vₒ and escape speed vₑ?"
    },
    "options": [
      {
        "bn": "vₒ = vₑ",
        "en": "vₒ = vₑ"
      },
      {
        "bn": "vₒ = √2vₑ",
        "en": "vₒ = √2vₑ"
      },
      {
        "bn": "vₒ = vₑ/√2",
        "en": "vₒ = vₑ/√2"
      },
      {
        "bn": "vₒ = vₑ/2",
        "en": "vₒ = vₑ/2"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "vₒ = √(gR) এবং vₑ = √(2gR)। তাই vₒ = vₑ/√2।",
      "en": "Since vₒ = √(gR) and vₑ = √(2gR), vₒ = vₑ/√2."
    },
    "boardTag": {
      "bn": "ধারণাভিত্তিক অনুশীলন",
      "en": "Concept practice"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-phy1-25",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "পদার্থের গাঠনিক ধর্ম",
      "en": "Structural Properties of Matter"
    },
    "question": {
      "bn": "কোনো তারে পীড়ন 2×10⁸ Pa এবং বিকৃতি 1×10⁻³ হলে ইয়াং-এর গুণাঙ্ক কত?",
      "en": "A wire has stress 2×10⁸ Pa and strain 1×10⁻³. What is Young's modulus?"
    },
    "options": [
      {
        "bn": "2×10⁵ Pa",
        "en": "2×10⁵ Pa"
      },
      {
        "bn": "2×10⁸ Pa",
        "en": "2×10⁸ Pa"
      },
      {
        "bn": "2×10¹¹ Pa",
        "en": "2×10¹¹ Pa"
      },
      {
        "bn": "5×10¹¹ Pa",
        "en": "5×10¹¹ Pa"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "Y = পীড়ন/বিকৃতি = (2×10⁸)/(1×10⁻³) = 2×10¹¹ Pa।",
      "en": "Y = stress/strain = (2×10⁸)/(1×10⁻³) = 2×10¹¹ Pa."
    },
    "boardTag": {
      "bn": "ধারণাভিত্তিক অনুশীলন",
      "en": "Concept practice"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-phy1-26",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "পদার্থের গাঠনিক ধর্ম",
      "en": "Structural Properties of Matter"
    },
    "question": {
      "bn": "স্টোকসের সূত্র অনুযায়ী অন্য সব অপরিবর্তিত রেখে একটি গোলকের ব্যাসার্ধ দ্বিগুণ করলে প্রান্তীয় বেগ কতগুণ হয়?",
      "en": "By Stokes' law, if a sphere's radius is doubled while everything else stays constant, how does terminal speed change?"
    },
    "options": [
      {
        "bn": "2 গুণ",
        "en": "2 times"
      },
      {
        "bn": "4 গুণ",
        "en": "4 times"
      },
      {
        "bn": "8 গুণ",
        "en": "8 times"
      },
      {
        "bn": "অপরিবর্তিত",
        "en": "Unchanged"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "প্রান্তীয় বেগ vₜ ∝ r²। তাই r দ্বিগুণ হলে vₜ চার গুণ হয়।",
      "en": "Terminal speed vₜ ∝ r², so doubling r makes vₜ four times as large."
    },
    "boardTag": {
      "bn": "ধারণাভিত্তিক অনুশীলন",
      "en": "Concept practice"
    },
    "difficulty": "hard"
  },
  {
    "id": "q-phy1-27",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "পর্যাবৃত্ত গতি",
      "en": "Periodic Motion"
    },
    "question": {
      "bn": "সরল ছন্দিত স্পন্দনে কণা সাম্য অবস্থানে থাকলে তার ত্বরণ কত?",
      "en": "In simple harmonic motion, what is the particle's acceleration at equilibrium?"
    },
    "options": [
      {
        "bn": "সর্বাধিক",
        "en": "Maximum"
      },
      {
        "bn": "সর্বনিম্ন কিন্তু শূন্য নয়",
        "en": "Minimum but non-zero"
      },
      {
        "bn": "শূন্য",
        "en": "Zero"
      },
      {
        "bn": "অসীম",
        "en": "Infinite"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "SHM-এ a = −ω²x। সাম্য অবস্থানে x = 0, তাই a = 0।",
      "en": "For SHM, a = −ω²x. At equilibrium x = 0, so a = 0."
    },
    "boardTag": {
      "bn": "ধারণাভিত্তিক অনুশীলন",
      "en": "Concept practice"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-28",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "তরঙ্গ",
      "en": "Waves"
    },
    "question": {
      "bn": "340 m/s বেগের শব্দের কম্পাঙ্ক 170 Hz হলে তরঙ্গদৈর্ঘ্য কত?",
      "en": "A sound wave travels at 340 m/s with frequency 170 Hz. What is its wavelength?"
    },
    "options": [
      {
        "bn": "0.5 m",
        "en": "0.5 m"
      },
      {
        "bn": "1 m",
        "en": "1 m"
      },
      {
        "bn": "2 m",
        "en": "2 m"
      },
      {
        "bn": "510 m",
        "en": "510 m"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "λ = v/f = 340/170 = 2 m।",
      "en": "λ = v/f = 340/170 = 2 m."
    },
    "boardTag": {
      "bn": "ধারণাভিত্তিক অনুশীলন",
      "en": "Concept practice"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-29",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "তরঙ্গ",
      "en": "Waves"
    },
    "question": {
      "bn": "256 Hz ও 260 Hz কম্পাঙ্কের দুটি সুর একসঙ্গে বাজালে প্রতি সেকেন্ডে কয়টি বীট শোনা যাবে?",
      "en": "How many beats per second are heard when tones of 256 Hz and 260 Hz sound together?"
    },
    "options": [
      {
        "bn": "2",
        "en": "2"
      },
      {
        "bn": "4",
        "en": "4"
      },
      {
        "bn": "8",
        "en": "8"
      },
      {
        "bn": "516",
        "en": "516"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "বীট কম্পাঙ্ক = |f₁ − f₂| = |260 − 256| = 4 Hz।",
      "en": "Beat frequency = |f₁ − f₂| = |260 − 256| = 4 Hz."
    },
    "boardTag": {
      "bn": "ধারণাভিত্তিক অনুশীলন",
      "en": "Concept practice"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-phy1-30",
    "subjectKey": "physics1",
    "chapter": {
      "bn": "আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব",
      "en": "Ideal Gas & Kinetic Theory of Gases"
    },
    "question": {
      "bn": "একই গ্যাসের পরম তাপমাত্রা চার গুণ করলে অণুগুলোর RMS বেগ কতগুণ হবে?",
      "en": "For the same gas, if absolute temperature becomes four times, how does molecular RMS speed change?"
    },
    "options": [
      {
        "bn": "2 গুণ",
        "en": "2 times"
      },
      {
        "bn": "4 গুণ",
        "en": "4 times"
      },
      {
        "bn": "8 গুণ",
        "en": "8 times"
      },
      {
        "bn": "16 গুণ",
        "en": "16 times"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "vᵣₘₛ ∝ √T। তাই T চার গুণ হলে RMS বেগ √4 = 2 গুণ হয়।",
      "en": "vᵣₘₛ ∝ √T, so quadrupling T doubles the RMS speed."
    },
    "boardTag": {
      "bn": "ধারণাভিত্তিক অনুশীলন",
      "en": "Concept practice"
    },
    "difficulty": "medium"
  }

];

export default QUESTIONS;
