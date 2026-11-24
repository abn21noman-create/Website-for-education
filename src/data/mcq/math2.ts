import type { McqQuestion } from '../../types';

/** Generated from the single bank during the per-paper split; edit via the data pipeline. */
const QUESTIONS: McqQuestion[] = [
  {
    "id": "q-math2-1",
    "subjectKey": "math2",
    "chapter": {
      "bn": "জটিল সংখ্যা",
      "en": "Complex Numbers"
    },
    "question": {
      "bn": "1, ω, ω² এককের ঘনমূল হলে (1 - ω + ω²)(1 + ω - ω²) এর মান কত?",
      "en": "If 1, ω, ω² are the cube roots of unity, what is (1 - ω + ω²)(1 + ω - ω²)?"
    },
    "options": [
      {
        "bn": "-4",
        "en": "-4"
      },
      {
        "bn": "2",
        "en": "2"
      },
      {
        "bn": "4",
        "en": "4"
      },
      {
        "bn": "0",
        "en": "0"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "1 + ω² = -ω এবং 1 + ω = -ω² বসালে পাই: (-ω - ω)(-ω² - ω²) = (-2ω)(-2ω²) = 4ω³ = 4(1) = 4।",
      "en": "Since 1 + ω + ω² = 0, (1 + ω² - ω)(1 + ω - ω²) = (-2ω)(-2ω²) = 4ω³ = 4."
    },
    "boardTag": {
      "bn": "ঢাকা ও যশোর বোর্ড",
      "en": "Dhaka & Jashore Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math2-2",
    "subjectKey": "math2",
    "chapter": {
      "bn": "কণিক",
      "en": "Conics"
    },
    "question": {
      "bn": "y² = 12x পরাবৃত্তের উপকেন্দ্র (Focus) এবং উপকেন্দ্রিক লম্বের দৈর্ঘ্য কোনটি?",
      "en": "What are the focus and length of the latus rectum of the parabola y² = 12x?"
    },
    "options": [
      {
        "bn": "(3, 0) এবং 12 একক",
        "en": "(3, 0) and 12 units"
      },
      {
        "bn": "(0, 3) এবং 12 একক",
        "en": "(0, 3) and 12 units"
      },
      {
        "bn": "(3, 0) এবং 6 একক",
        "en": "(3, 0) and 6 units"
      },
      {
        "bn": "(-3, 0) এবং 12 একক",
        "en": "(-3, 0) and 12 units"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "y² = 4ax এর সাথে তুলনা করে 4a = 12 ⇒ a = 3। সুতরাং উপকেন্দ্র (a, 0) = (3, 0) এবং উপকেন্দ্রিক লম্বের দৈর্ঘ্য |4a| = 12 একক।",
      "en": "Comparing with y² = 4ax gives 4a = 12 ⇒ a = 3. Focus is (a, 0) = (3, 0) and latus rectum |4a| = 12."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math2-3",
    "subjectKey": "math2",
    "chapter": {
      "bn": "বহুপদী সমীকরণ",
      "en": "Polynomial Equations"
    },
    "question": {
      "bn": "x² - 5x + 6 = 0 সমীকরণের মূলদ্বয় α ও β হলে 1/α + 1/β এর মান কত?",
      "en": "If α and β are the roots of x² - 5x + 6 = 0, what is the value of 1/α + 1/β?"
    },
    "options": [
      {
        "bn": "5/6",
        "en": "5/6"
      },
      {
        "bn": "-5/6",
        "en": "-5/6"
      },
      {
        "bn": "6/5",
        "en": "6/5"
      },
      {
        "bn": "1/6",
        "en": "1/6"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "α + β = 5 এবং αβ = 6। সুতরাং 1/α + 1/β = (α + β) / αβ = 5/6।",
      "en": "α + β = 5 and αβ = 6, so 1/α + 1/β = (α + β)/(αβ) = 5/6."
    },
    "boardTag": {
      "bn": "রাজশাহী বোর্ড",
      "en": "Rajshahi Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math2-4",
    "subjectKey": "math2",
    "chapter": {
      "bn": "স্থিতিবিদ্যা",
      "en": "Statics"
    },
    "question": {
      "bn": "একটি বিন্দুতে ক্রিয়ারত তিনটি বল সাম্যাবস্থায় থাকলে প্রত্যেকটি বল অপর বলদ্বয়ের মধ্যবর্তী কোণের sine-এর সমানুপাতিক — এটি কার উপপাদ্য?",
      "en": "If three coplanar concurrent forces are in equilibrium, each is proportional to the sine of the angle between the other two — whose theorem is this?"
    },
    "options": [
      {
        "bn": "ভ্যারিগননের উপপাদ্য",
        "en": "Varignons theorem"
      },
      {
        "bn": "লামির উপপাদ্য (Lamis Theorem)",
        "en": "Lamis theorem"
      },
      {
        "bn": "লম্বাংশ উপপাদ্য",
        "en": "Resolved parts theorem"
      },
      {
        "bn": "ডি-মরগ্যানের উপপাদ্য",
        "en": "De Morgans theorem"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "লামির উপপাদ্য অনুসারে: P / sin α = Q / sin β = R / sin γ (যখন তিনটি সমতলীয় সমবিন্দু বল সাম্যাবস্থায় থাকে)।",
      "en": "Lamis theorem states P / sin α = Q / sin β = R / sin γ for three concurrent forces in equilibrium."
    },
    "boardTag": {
      "bn": "যশোর ও কুমিল্লা বোর্ড",
      "en": "Jashore & Cumilla Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math2-4-b",
    "subjectKey": "math2",
    "chapter": {
      "bn": "জটিল সংখ্যা",
      "en": "Complex Numbers"
    },
    "question": {
      "bn": "এককের জটিল ঘনমূল ω হলে (1 + ω - ω²)(ω + ω² - 1)(ω² + 1 - ω) এর মান কত?",
      "en": "If ω is a complex cube root of unity, find the value of (1 + ω - ω²)(ω + ω² - 1)(ω² + 1 - ω)."
    },
    "options": [
      {
        "bn": "8",
        "en": "8"
      },
      {
        "bn": "-8",
        "en": "-8"
      },
      {
        "bn": "0",
        "en": "0"
      },
      {
        "bn": "1",
        "en": "1"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "1 + ω + ω² = 0 এবং ω³ = 1। তাই (-2ω²)(-2)(-2ω) = -8ω³ = -8(1) = -8।",
      "en": "Using 1 + ω + ω² = 0: (-2ω²)(-2)(-2ω) = -8ω³ = -8."
    },
    "boardTag": {
      "bn": "BUET ও রাজশাহী বোর্ড",
      "en": "BUET & Rajshahi Board"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-math2-5",
    "subjectKey": "math2",
    "chapter": {
      "bn": "কণিক",
      "en": "Conics"
    },
    "question": {
      "bn": "y² = 12x পরাবৃত্তের উপকেন্দ্রিক লম্বের (Latus Rectum) দৈর্ঘ্য কত?",
      "en": "What is the length of the latus rectum of the parabola y² = 12x?"
    },
    "options": [
      {
        "bn": "3 একক",
        "en": "3 units"
      },
      {
        "bn": "6 একক",
        "en": "6 units"
      },
      {
        "bn": "12 একক",
        "en": "12 units"
      },
      {
        "bn": "24 একক",
        "en": "24 units"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "y² = 4ax সমীকরণের সাথে তুলনা করে পাই 4a = 12, আর উপকেন্দ্রিক লম্বের দৈর্ঘ্য |4a| = 12 একক।",
      "en": "Comparing with y² = 4ax gives latus rectum length |4a| = 12."
    },
    "boardTag": {
      "bn": "ঢাকা ও যশোর বোর্ড",
      "en": "Dhaka & Jashore Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math2-7",
    "subjectKey": "math2",
    "chapter": {
      "bn": "ম্যাট্রিক্স ও নির্ণায়ক",
      "en": "Matrices & Determinants"
    },
    "question": {
      "bn": "[[2, 3], [1, 4]] ম্যাট্রিক্সের নির্ণায়কের মান কত?",
      "en": "What is the determinant of the matrix [[2, 3], [1, 4]]?"
    },
    "options": [
      {
        "bn": "৫",
        "en": "5"
      },
      {
        "bn": "১১",
        "en": "11"
      },
      {
        "bn": "−৫",
        "en": "−5"
      },
      {
        "bn": "৮",
        "en": "8"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "২×২ নির্ণায়ক = ad − bc = 2×4 − 3×1 = ৮ − ৩ = ৫।",
      "en": "For a 2×2 matrix, determinant = ad − bc = 8 − 3 = 5."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math2-8",
    "subjectKey": "math2",
    "chapter": {
      "bn": "সম্ভাবনা",
      "en": "Probability"
    },
    "question": {
      "bn": "একটি ন্যায্য মুদ্রা দুইবার নিক্ষেপ করলে দুইবারই হেড আসার সম্ভাবনা কত?",
      "en": "A fair coin is tossed twice. What is the probability of two heads?"
    },
    "options": [
      {
        "bn": "১/২",
        "en": "1/2"
      },
      {
        "bn": "১/৩",
        "en": "1/3"
      },
      {
        "bn": "১/৪",
        "en": "1/4"
      },
      {
        "bn": "৩/৪",
        "en": "3/4"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "মোট ফল ৪টি (HH, HT, TH, TT); অনুকূল ফল ১টি — তাই সম্ভাবনা ১/৪।",
      "en": "Four equally likely outcomes (HH, HT, TH, TT) and one favourable, so 1/4."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math2-9",
    "subjectKey": "math2",
    "chapter": {
      "bn": "ত্রিকোণমিতি: যৌগিক কোণ",
      "en": "Trigonometry: Compound Angles"
    },
    "question": {
      "bn": "sin 2θ = কত?",
      "en": "sin 2θ equals which expression?"
    },
    "options": [
      {
        "bn": "2 sinθ cosθ",
        "en": "2 sinθ cosθ"
      },
      {
        "bn": "sin²θ − cos²θ",
        "en": "sin²θ − cos²θ"
      },
      {
        "bn": "1 − 2sin²θ",
        "en": "1 − 2sin²θ"
      },
      {
        "bn": "2 cos²θ − 1",
        "en": "2 cos²θ − 1"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "sin2θ = 2 sinθ cosθ; বাকি তিনটি cos2θ-এর রূপ (cos²θ − sin²θ, 1 − 2sin²θ, 2cos²θ − 1)।",
      "en": "sin2θ = 2 sinθ cosθ; the others are the three forms of cos2θ."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math2-10",
    "subjectKey": "math2",
    "chapter": {
      "bn": "জটিল সংখ্যা",
      "en": "Complex Numbers"
    },
    "question": {
      "bn": "i² + i⁴ এর মান কত?",
      "en": "What is the value of i² + i⁴?"
    },
    "options": [
      {
        "bn": "০",
        "en": "0"
      },
      {
        "bn": "−২",
        "en": "−2"
      },
      {
        "bn": "২",
        "en": "2"
      },
      {
        "bn": "১ − i",
        "en": "1 − i"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "i² = −1 এবং i⁴ = (i²)² = 1; তাই যোগফল ০।",
      "en": "i² = −1 and i⁴ = 1, so the sum is 0."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-math2-11",
    "subjectKey": "math2",
    "chapter": {
      "bn": "কলনবিদ্যা: সমাকলন",
      "en": "Calculus: Integration"
    },
    "question": {
      "bn": "∫ x² dx = ?",
      "en": "What is ∫ x² dx?"
    },
    "options": [
      {
        "bn": "x³/3 + c",
        "en": "x³/3 + c"
      },
      {
        "bn": "2x + c",
        "en": "2x + c"
      },
      {
        "bn": "x³ + c",
        "en": "x³ + c"
      },
      {
        "bn": "3x² + c",
        "en": "3x² + c"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "∫xⁿ dx = xⁿ⁺¹/(n+1) + c (n ≠ −1); এখানে n = 2, তাই x³/3 + c।",
      "en": "∫xⁿ dx = xⁿ⁺¹/(n+1) + c (n ≠ −1); with n = 2 this gives x³/3 + c."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
{
  "id": "q-math2-12",
  "subjectKey": "math2",
  "chapter": {
    "bn": "ত্রিকোণমিতি: যৌগিক কোণ",
    "en": "Trigonometry: Compound Angles"
  },
  "question": {
    "bn": "cos 2θ = কোনটি?",
    "en": "Which expression equals cos 2θ?"
  },
  "options": [
    {
      "bn": "2 sinθ cosθ",
      "en": "2 sinθ cosθ"
    },
    {
      "bn": "1 − 2sin²θ",
      "en": "1 − 2sin²θ"
    },
    {
      "bn": "1 + 2cos²θ",
      "en": "1 + 2cos²θ"
    },
    {
      "bn": "2 sin²θ − 1",
      "en": "2 sin²θ − 1"
    }
  ],
  "correctIndex": 1,
  "explanation": {
    "bn": "cos2θ = cos²θ − sin²θ = 1 − 2sin²θ = 2cos²θ − 1; 2sinθcosθ হলো sin2θ।",
    "en": "cos2θ = cos²θ − sin²θ = 1 − 2sin²θ = 2cos²θ − 1; 2sinθcosθ is sin2θ."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "easy"
},
{
  "id": "q-math2-13",
  "subjectKey": "math2",
  "chapter": {
    "bn": "কলনবিদ্যা: নির্দিষ্ট সমাকলন",
    "en": "Calculus: Definite Integral"
  },
  "question": {
    "bn": "∫₀¹ x dx = কত?",
    "en": "What is ∫₀¹ x dx?"
  },
  "options": [
    {
      "bn": "১/৪",
      "en": "1/4"
    },
    {
      "bn": "১/২",
      "en": "1/2"
    },
    {
      "bn": "১",
      "en": "1"
    },
    {
      "bn": "২",
      "en": "2"
    }
  ],
  "correctIndex": 1,
  "explanation": {
    "bn": "∫x dx = x²/2; ০ থেকে ১ পর্যন্ত মান = 1/2 − 0 = 1/2।",
    "en": "∫x dx = x²/2, so from 0 to 1 the value is 1/2."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "easy"
},
{
  "id": "q-math2-14",
  "subjectKey": "math2",
  "chapter": {
    "bn": "ম্যাট্রিক্স",
    "en": "Matrices"
  },
  "question": {
    "bn": "সাধারণভাবে ম্যাট্রিক্স গুণন সম্পর্কে কোনটি সত্য?",
    "en": "Which statement about matrix multiplication is generally true?"
  },
  "options": [
    {
      "bn": "AB সর্বদা BA-এর সমান",
      "en": "AB always equals BA"
    },
    {
      "bn": "AB = BA হলে তবেই গুণন সম্ভব",
      "en": "Multiplication needs AB = BA"
    },
    {
      "bn": "সাধারণভাবে AB ≠ BA",
      "en": "Generally AB ≠ BA"
    },
    {
      "bn": "A ও B বর্গ ম্যাট্রিক্স হলে AB = BA",
      "en": "AB = BA when both are square"
    }
  ],
  "correctIndex": 2,
  "explanation": {
    "bn": "ম্যাট্রিক্স গুণন বিনিময়যোগ্য নয় — সাধারণভাবে AB ≠ BA; তবে কিছু বিশেষ ক্ষেত্রে সমান হতে পারে।",
    "en": "Matrix multiplication is not commutative in general: AB ≠ BA, though special cases can be equal."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "medium"
},
{
  "id": "q-math2-15",
  "subjectKey": "math2",
  "chapter": {
    "bn": "সম্ভাবনা",
    "en": "Probability"
  },
  "question": {
    "bn": "নিশ্চিত ঘটনার সম্ভাবনা কত?",
    "en": "What is the probability of a sure event?"
  },
  "options": [
    {
      "bn": "০",
      "en": "0"
    },
    {
      "bn": "১/২",
      "en": "1/2"
    },
    {
      "bn": "১",
      "en": "1"
    },
    {
      "bn": "অসীম",
      "en": "Infinity"
    }
  ],
  "correctIndex": 2,
  "explanation": {
    "bn": "নিশ্চিত ঘটনার অনুকূল ফল = মোট ফল, তাই সম্ভাবনা n(S)/n(S) = 1; অসম্ভব ঘটনার সম্ভাবনা ০।",
    "en": "A sure event has all outcomes favourable, so P = 1; an impossible event has P = 0."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "easy"
},
  {
    "id": "q-math2-16",
    "subjectKey": "math2",
    "chapter": {
      "bn": "বাস্তব সংখ্যা ও অসমতা",
      "en": "Real Numbers & Inequalities"
    },
    "question": {
      "bn": "|2x − 3| < 5 অসমতাটির সমাধান সেট কোনটি?",
      "en": "What is the solution set of the inequality |2x − 3| < 5?"
    },
    "options": [
      {
        "bn": "(−1, 4)",
        "en": "(−1, 4)"
      },
      {
        "bn": "[−1, 4]",
        "en": "[−1, 4]"
      },
      {
        "bn": "(−4, 1)",
        "en": "(−4, 1)"
      },
      {
        "bn": "(1, 4)",
        "en": "(1, 4)"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "−5 < 2x − 3 < 5 ⇒ −2 < 2x < 8 ⇒ −1 < x < 4, অর্থাৎ সমাধান সেট (−1, 4)।",
      "en": "−5 < 2x − 3 < 5 ⇒ −2 < 2x < 8 ⇒ −1 < x < 4, giving the open interval (−1, 4)."
    },
    "boardTag": {
      "bn": "ঢাকা ও যশোর বোর্ড",
      "en": "Dhaka & Jashore Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math2-17",
    "subjectKey": "math2",
    "chapter": {
      "bn": "যোগাশ্রয়ী প্রোগ্রাম",
      "en": "Linear Programming"
    },
    "question": {
      "bn": "যোগাশ্রয়ী প্রোগ্রামিং সমস্যায় (LPP) অনুকূল সমাধান ক্ষেত্রের (feasible region) কোথায় অভীষ্ট ফাংশনের চরম মান পাওয়া যায়?",
      "en": "In a linear programming problem, where does the objective function attain its optimal (maximum/minimum) value?"
    },
    "options": [
      {
        "bn": "কেবল মূলবিন্দুতে",
        "en": "Only at the origin"
      },
      {
        "bn": "কৌণিক বিন্দুতে (Corner / Extreme points)",
        "en": "At corner (extreme) points of the feasible region"
      },
      {
        "bn": "অক্ষরেখার বাইরে",
        "en": "Outside the coordinate axes"
      },
      {
        "bn": "ভরকেন্দ্রে",
        "en": "At the centroid only"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "যোগাশ্রয়ী প্রোগ্রামের মৌলিক উপপাদ্য অনুযায়ী সীমাবদ্ধ উত্তল অনুকূল ক্ষেত্রের কৌণিক বিন্দুগুলোতেই অভীষ্ট ফাংশনের সর্বোচ্চ বা সর্বনিম্ন মান পাওয়া যায়।",
      "en": "By the fundamental theorem of linear programming, optimal values on a bounded convex feasible polygon occur at its corner points."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math2-18",
    "subjectKey": "math2",
    "chapter": {
      "bn": "দ্বিপদী বিস্তৃতি",
      "en": "Binomial Expansion"
    },
    "question": {
      "bn": "(x + 1/x)⁶ এর দ্বিপদী বিস্তৃতিতে x-বর্জিত পদটির মান কত?",
      "en": "What is the term independent of x in the binomial expansion of (x + 1/x)⁶?"
    },
    "options": [
      {
        "bn": "15",
        "en": "15"
      },
      {
        "bn": "20",
        "en": "20"
      },
      {
        "bn": "6",
        "en": "6"
      },
      {
        "bn": "60",
        "en": "60"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "(r+1)-তম পদে x^(6−2r) থাকে; x-বর্জিত পদের জন্য 6 − 2r = 0 ⇒ r = 3। সুতরাং পদটির মান = ⁶C₃ = 20।",
      "en": "General term has x^(6−2r); setting 6 − 2r = 0 gives r = 3, so the constant term is ⁶C₃ = 20."
    },
    "boardTag": {
      "bn": "বুয়েট ও ঢাকা বোর্ড",
      "en": "BUET & Dhaka Board"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-math2-19",
    "subjectKey": "math2",
    "chapter": {
      "bn": "বিপরীত ত্রিকোণমিতিক ফাংশন ও ত্রিকোণমিতিক সমীকরণ",
      "en": "Inverse Trig Functions & Equations"
    },
    "question": {
      "bn": "tan⁻¹(1/2) + tan⁻¹(1/3) এর মুখ্য মান কত?",
      "en": "What is the principal value of tan⁻¹(1/2) + tan⁻¹(1/3)?"
    },
    "options": [
      {
        "bn": "π / 6",
        "en": "π / 6"
      },
      {
        "bn": "π / 4",
        "en": "π / 4"
      },
      {
        "bn": "π / 3",
        "en": "π / 3"
      },
      {
        "bn": "π / 2",
        "en": "π / 2"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "tan⁻¹[(1/2 + 1/3) / (1 − 1/6)] = tan⁻¹[(5/6) / (5/6)] = tan⁻¹(1) = π/4।",
      "en": "tan⁻¹[(1/2 + 1/3)/(1 − 1/6)] = tan⁻¹(1) = π/4."
    },
    "boardTag": {
      "bn": "ঢাবি ও সকল বোর্ড",
      "en": "DU & All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math2-20",
    "subjectKey": "math2",
    "chapter": {
      "bn": "সমতলে বস্তুকণার গতি",
      "en": "Motion of Particles in a Plane"
    },
    "question": {
      "bn": "u আদিবেগে আনুভূমিকের সাথে কত কোণে প্রক্ষেপ করলে প্রাসের আনুভূমিক পাল্লা (Horizontal range) সর্বাধিক হয়?",
      "en": "At what launch angle with the horizontal does a projectile achieve maximum horizontal range for a given initial speed u?"
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
        "bn": "90°",
        "en": "90°"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "পাল্লা R = (u² sin 2α)/g সর্বাধিক হয় যখন sin 2α = 1 ⇒ 2α = 90° ⇒ α = 45°।",
      "en": "Range R = (u² sin 2α)/g is maximized when sin 2α = 1, i.e., α = 45°."
    },
    "boardTag": {
      "bn": "বুয়েট ও সকল বোর্ড",
      "en": "BUET & All Boards"
    },
    "difficulty": "easy"
  }
];

export default QUESTIONS;
