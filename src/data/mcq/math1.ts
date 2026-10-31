import type { McqQuestion } from '../../types';

/** Generated from the single bank during the per-paper split; edit via the data pipeline. */
const QUESTIONS: McqQuestion[] = [
  {
    "id": "q-math1-1",
    "subjectKey": "math1",
    "chapter": {
      "bn": "ম্যাট্রিক্স ও নির্ণায়ক",
      "en": "Matrices & Determinants"
    },
    "question": {
      "bn": "A = [[2, k], [4, 6]] ম্যাট্রিক্সটি ব্যতিক্রমী (Singular) হলে k-এর মান কত?",
      "en": "For what value of k is the matrix A = [[2, k], [4, 6]] singular?"
    },
    "options": [
      {
        "bn": "2",
        "en": "2"
      },
      {
        "bn": "3",
        "en": "3"
      },
      {
        "bn": "-3",
        "en": "-3"
      },
      {
        "bn": "12",
        "en": "12"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "ব্যতিক্রমী ম্যাট্রিক্সের নির্ণায়ক |A| = 0। সুতরাং (2 × 6) - 4k = 0 ⇒ 12 - 4k = 0 ⇒ k = 3।",
      "en": "A matrix is singular when det(A) = 0 ⇒ 12 - 4k = 0 ⇒ k = 3."
    },
    "boardTag": {
      "bn": "যশোর বোর্ড",
      "en": "Jashore Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math1-2",
    "subjectKey": "math1",
    "chapter": {
      "bn": "সরলরেখা",
      "en": "Straight Lines"
    },
    "question": {
      "bn": "3x - 4y + 12 = 0 এবং 3x - 4y - 8 = 0 সমান্তরাল রেখাদ্বয়ের মধ্যবর্তী লম্ব দূরত্ব কত একক?",
      "en": "What is the perpendicular distance between the parallel lines 3x - 4y + 12 = 0 and 3x - 4y - 8 = 0?"
    },
    "options": [
      {
        "bn": "4/5 একক",
        "en": "4/5 units"
      },
      {
        "bn": "4 একক",
        "en": "4 units"
      },
      {
        "bn": "5 একক",
        "en": "5 units"
      },
      {
        "bn": "20 একক",
        "en": "20 units"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "সমান্তরাল রেখাদ্বয়ের দূরত্ব d = |c₁ - c₂| / √(a² + b²) = |12 - (-8)| / √(3² + (-4)²) = 20 / 5 = 4 একক।",
      "en": "Distance d = |12 - (-8)| / √(3² + (-4)²) = 20 / 5 = 4 units."
    },
    "boardTag": {
      "bn": "ঢাকা ও রাজশাহী বোর্ড",
      "en": "Dhaka & Rajshahi Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math1-3",
    "subjectKey": "math1",
    "chapter": {
      "bn": "বৃত্ত",
      "en": "Circles"
    },
    "question": {
      "bn": "x² + y² - 6x + 8y + 9 = 0 বৃত্তের ব্যাসার্ধ কত এবং এটি কোন অক্ষকে স্পর্শ করে?",
      "en": "What is the radius of the circle x² + y² - 6x + 8y + 9 = 0 and which axis does it touch?"
    },
    "options": [
      {
        "bn": "ব্যাসার্ধ 4, x-অক্ষকে স্পর্শ করে",
        "en": "Radius 4, touches x-axis"
      },
      {
        "bn": "ব্যাসার্ধ 3, y-অক্ষকে স্পর্শ করে",
        "en": "Radius 3, touches y-axis"
      },
      {
        "bn": "ব্যাসার্ধ 5, কোনো অক্ষ স্পর্শ করে না",
        "en": "Radius 5, touches neither axis"
      },
      {
        "bn": "ব্যাসার্ধ 4, y-অক্ষকে স্পর্শ করে",
        "en": "Radius 4, touches y-axis"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "এখানে g = -3, f = 4, c = 9। ব্যাসার্ধ r = √((-3)² + 4² - 9) = √16 = 4। যেহেতু g² = (-3)² = 9 = c, তাই বৃত্তটি x-অক্ষকে স্পর্শ করে!",
      "en": "g = -3, f = 4, c = 9. Radius r = √(9 + 16 - 9) = 4. Since g² = c = 9, the circle touches the x-axis!"
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-math1-4",
    "subjectKey": "math1",
    "chapter": {
      "bn": "অন্তরীকরণ",
      "en": "Differentiation"
    },
    "question": {
      "bn": "lim (x→0) [ (1 - cos 2x) / x² ] এর মান কত?",
      "en": "Evaluate lim (x→0) [ (1 - cos 2x) / x² ]."
    },
    "options": [
      {
        "bn": "0",
        "en": "0"
      },
      {
        "bn": "1",
        "en": "1"
      },
      {
        "bn": "2",
        "en": "2"
      },
      {
        "bn": "4",
        "en": "4"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "1 - cos 2x = 2 sin²x বসালে পাই: lim (x→0) [ 2 (sin x / x)² ] = 2 × 1² = 2। (শর্টকাট: (1 - cos ax)/x² এর লিমিট = a²/2 = 4/2 = 2)।",
      "en": "Using 1 - cos 2x = 2 sin²x, limit = 2 · lim (sin x / x)² = 2 × 1 = 2."
    },
    "boardTag": {
      "bn": "BUET, DU ও সকল বোর্ড",
      "en": "BUET, DU & All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-math1-5",
    "subjectKey": "math1",
    "chapter": {
      "bn": "যোগজীকরণ",
      "en": "Integration"
    },
    "question": {
      "bn": "∫ eˣ (sin x + cos x) dx এর মান কোনটি?",
      "en": "What is the value of ∫ eˣ (sin x + cos x) dx?"
    },
    "options": [
      {
        "bn": "eˣ cos x + c",
        "en": "eˣ cos x + c"
      },
      {
        "bn": "eˣ sin x + c",
        "en": "eˣ sin x + c"
      },
      {
        "bn": "-eˣ sin x + c",
        "en": "-eˣ sin x + c"
      },
      {
        "bn": "eˣ (sin x - cos x) + c",
        "en": "eˣ (sin x - cos x) + c"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "সূত্র ∫ eˣ [f(x) + f′(x)] dx = eˣ f(x) + c। এখানে f(x) = sin x হলে f′(x) = cos x, তাই উত্তর eˣ sin x + c।",
      "en": "By ∫ eˣ [f(x) + f′(x)] dx = eˣ f(x) + c with f(x) = sin x, the integral equals eˣ sin x + c."
    },
    "boardTag": {
      "bn": "যশোর ও চট্টগ্রাম বোর্ড",
      "en": "Jashore & Chattogram Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math1-5-b",
    "subjectKey": "math1",
    "chapter": {
      "bn": "ম্যাট্রিক্স ও নির্ণায়ক",
      "en": "Matrices & Determinants"
    },
    "question": {
      "bn": "A একটি 3×3 ক্রমের বর্গ ম্যাট্রিক্স এবং |A| = 5 হলে, |2A|-এর মান কত?",
      "en": "If A is a 3×3 square matrix with determinant |A| = 5, what is the value of |2A|?"
    },
    "options": [
      {
        "bn": "10",
        "en": "10"
      },
      {
        "bn": "30",
        "en": "30"
      },
      {
        "bn": "40",
        "en": "40"
      },
      {
        "bn": "125",
        "en": "125"
      }
    ],
    "correctIndex": 2,
    "explanation": {
      "bn": "n×n ম্যাট্রিক্সের জন্য |kA| = kⁿ |A|। এখানে n = 3 এবং k = 2, তাই |2A| = 2³ × 5 = 8 × 5 = 40!",
      "en": "For an n×n matrix, |kA| = kⁿ|A|. With n = 3 and k = 2, |2A| = 2³ × 5 = 40."
    },
    "boardTag": {
      "bn": "ঢাবি ক ও সকল বোর্ড",
      "en": "DU Ka & All Boards"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-math1-6",
    "subjectKey": "math1",
    "chapter": {
      "bn": "সরলরেখা",
      "en": "Straight Lines"
    },
    "question": {
      "bn": "3x + 4y - 12 = 0 এবং 3x + 4y + 8 = 0 সমান্তরাল রেখাদ্বয়ের মধ্যবর্তী লম্ব দূরত্ব কত একক?",
      "en": "What is the perpendicular distance between the parallel lines 3x + 4y - 12 = 0 and 3x + 4y + 8 = 0?"
    },
    "options": [
      {
        "bn": "4 একক",
        "en": "4 units"
      },
      {
        "bn": "20/7 একক",
        "en": "20/7 units"
      },
      {
        "bn": "4/5 একক",
        "en": "4/5 units"
      },
      {
        "bn": "5 একক",
        "en": "5 units"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "দূরত্ব d = |c₁ - c₂| / √(a² + b²) = |-12 - 8| / √(3² + 4²) = 20 / 5 = 4 একক।",
      "en": "Distance d = |-12 - 8| / √(3² + 4²) = 20 / 5 = 4 units."
    },
    "boardTag": {
      "bn": "যশোর ও রাজশাহী বোর্ড",
      "en": "Jashore & Rajshahi Board"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math1-7",
    "subjectKey": "math1",
    "chapter": {
      "bn": "অন্তরীকরণ",
      "en": "Differentiation"
    },
    "question": {
      "bn": "lim(x→0) (1 - cos 4x) / x² এর মান কত?",
      "en": "Evaluate the limit: lim(x→0) (1 - cos 4x) / x²."
    },
    "options": [
      {
        "bn": "4",
        "en": "4"
      },
      {
        "bn": "8",
        "en": "8"
      },
      {
        "bn": "16",
        "en": "16"
      },
      {
        "bn": "2",
        "en": "2"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "সুপার শর্টকাট: lim(x→0) (1 - cos ax) / x² = a² / 2। এখানে a = 4, তাই মান = 4² / 2 = 16 / 2 = 8!",
      "en": "Shortcut: lim(x→0) (1 - cos ax) / x² = a² / 2 = 4² / 2 = 8."
    },
    "boardTag": {
      "bn": "ঢাবি ক ও BUET প্রিলি",
      "en": "DU Ka & BUET Preli"
    },
    "difficulty": "medium"
  },
  {
    "id": "q-math1-8",
    "subjectKey": "math1",
    "chapter": {
      "bn": "যোগজীকরণ",
      "en": "Integration"
    },
    "question": {
      "bn": "∫₀^(π/2) sin⁵x / (sin⁵x + cos⁵x) dx এর মান কত?",
      "en": "What is the value of the definite integral ∫₀^(π/2) sin⁵x / (sin⁵x + cos⁵x) dx?"
    },
    "options": [
      {
        "bn": "π / 2",
        "en": "π / 2"
      },
      {
        "bn": "π / 4",
        "en": "π / 4"
      },
      {
        "bn": "1",
        "en": "1"
      },
      {
        "bn": "0",
        "en": "0"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "ধ্রুপদী বৈশিষ্ট্য ∫₀^(a) f(x)dx = ∫₀^(a) f(a-x)dx অনুযায়ী ∫₀^(π/2) sinⁿx / (sinⁿx + cosⁿx) dx সর্বদা π/4 হয়!",
      "en": "By King’s rule f(a - x), ∫₀^(π/2) sinⁿx / (sinⁿx + cosⁿx) dx = π / 4 for any real n."
    },
    "boardTag": {
      "bn": "সকল বোর্ড ও ঢাবি ক",
      "en": "All Boards & DU Ka"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math1-c1",
    "subjectKey": "math1",
    "chapter": {
      "bn": "ত্রিকোণমিতি",
      "en": "Trigonometry"
    },
    "question": {
      "bn": "sin²θ + cos²θ = ?",
      "en": "sin²θ + cos²θ = ?"
    },
    "options": [
      {
        "bn": "০",
        "en": "0"
      },
      {
        "bn": "১",
        "en": "1"
      },
      {
        "bn": "2",
        "en": "2"
      },
      {
        "bn": "θ",
        "en": "θ"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "এটি ত্রিকোণমিতির মৌলিক অভেদ — যেকোনো কোণের জন্য সর্বদা ১।",
      "en": "A fundamental identity: always 1, for every angle."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math1-c2",
    "subjectKey": "math1",
    "chapter": {
      "bn": "সরলরেখা",
      "en": "Straight Lines"
    },
    "question": {
      "bn": "y = mx + c সমীকরণে m কী নির্দেশ করে?",
      "en": "In y = mx + c, what does m represent?"
    },
    "options": [
      {
        "bn": "y-অক্ষে ছেদবিন্দু",
        "en": "y-intercept"
      },
      {
        "bn": "রেখার ঢাল",
        "en": "Gradient of the line"
      },
      {
        "bn": "x-অক্ষে ছেদবিন্দু",
        "en": "x-intercept"
      },
      {
        "bn": "মূলবিন্দু থেকে দূরত্ব",
        "en": "Distance from origin"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "m = ঢাল (rise/run), আর c হলো y-অক্ষে ছেদবিন্দু।",
      "en": "m is the gradient (rise/run) and c is the y-intercept."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math1-c3",
    "subjectKey": "math1",
    "chapter": {
      "bn": "বৃত্ত",
      "en": "Circle"
    },
    "question": {
      "bn": "x² + y² = 25 বৃত্তের কেন্দ্র ও ব্যাসার্ধ কোনটি?",
      "en": "What are the centre and radius of the circle x² + y² = 25?"
    },
    "options": [
      {
        "bn": "(0, 0) এবং ৫",
        "en": "(0, 0) and 5"
      },
      {
        "bn": "(5, 5) এবং ৫",
        "en": "(5, 5) and 5"
      },
      {
        "bn": "(0, 0) এবং ২৫",
        "en": "(0, 0) and 25"
      },
      {
        "bn": "(0, 5) এবং ৫",
        "en": "(0, 5) and 5"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "x² + y² = r² আকারে কেন্দ্র মূলবিন্দুতে; এখানে r² = ২৫, তাই r = ৫।",
      "en": "The form x² + y² = r² is centred at the origin; r² = 25 gives r = 5."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math1-c4",
    "subjectKey": "math1",
    "chapter": {
      "bn": "সমান্তর ধারা",
      "en": "Arithmetic Progression"
    },
    "question": {
      "bn": "সমান্তর ধারার n-তম পদ কোনটি? (প্রথম পদ a, সাধারণ অন্তর d)",
      "en": "What is the nth term of an arithmetic progression (first term a, common difference d)?"
    },
    "options": [
      {
        "bn": "a + (n − 1)d",
        "en": "a + (n − 1)d"
      },
      {
        "bn": "a + nd",
        "en": "a + nd"
      },
      {
        "bn": "a × dⁿ",
        "en": "a × dⁿ"
      },
      {
        "bn": "n/2 (2a + d)",
        "en": "n/2 (2a + d)"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "tₙ = a + (n − 1)d; আর n/2(2a + (n−1)d) হলো n পদের সমষ্টি।",
      "en": "tₙ = a + (n − 1)d, while the sum of n terms is n/2(2a + (n−1)d)."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math1-c5",
    "subjectKey": "math1",
    "chapter": {
      "bn": "সূচক ও লগারিদম",
      "en": "Exponents & Logarithms"
    },
    "question": {
      "bn": "log₂ 8 = কত?",
      "en": "log₂ 8 = ?"
    },
    "options": [
      {
        "bn": "২",
        "en": "2"
      },
      {
        "bn": "৩",
        "en": "3"
      },
      {
        "bn": "৪",
        "en": "4"
      },
      {
        "bn": "৮",
        "en": "8"
      }
    ],
    "correctIndex": 1,
    "explanation": {
      "bn": "২³ = ৮, তাই log₂ 8 = ৩।",
      "en": "Since 2³ = 8, log₂ 8 = 3."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "easy"
  },
  {
    "id": "q-math1-c6",
    "subjectKey": "math1",
    "chapter": {
      "bn": "বিন্যাস ও সমাবেশ",
      "en": "Permutations & Combinations"
    },
    "question": {
      "bn": "ⁿPᵣ এর সূত্র কোনটি?",
      "en": "Which is the formula for ⁿPᵣ?"
    },
    "options": [
      {
        "bn": "n!/(n − r)!",
        "en": "n!/(n − r)!"
      },
      {
        "bn": "n!/(r!(n − r)!)",
        "en": "n!/(r!(n − r)!)"
      },
      {
        "bn": "n!/r!",
        "en": "n!/r!"
      },
      {
        "bn": "n! × r!",
        "en": "n! × r!"
      }
    ],
    "correctIndex": 0,
    "explanation": {
      "bn": "ক্রম গুরুত্বপূর্ণ হলে বিন্যাস: n!/(n−r)!; আর সমাবেশ ⁿCᵣ = n!/(r!(n−r)!)।",
      "en": "Order matters for permutations: n!/(n−r)!; combinations use n!/(r!(n−r)!)."
    },
    "boardTag": {
      "bn": "সকল বোর্ড",
      "en": "All Boards"
    },
    "difficulty": "medium"
  },
{
  "id": "q-math1-16",
  "subjectKey": "math1",
  "chapter": {
    "bn": "সসীম ধারা",
    "en": "Finite Series"
  },
  "question": {
    "bn": "১ + ২ + ৩ + … + n = কত?",
    "en": "What is 1 + 2 + 3 + … + n?"
  },
  "options": [
    {
      "bn": "n(n+1)/2",
      "en": "n(n+1)/2"
    },
    {
      "bn": "n(n−1)/2",
      "en": "n(n−1)/2"
    },
    {
      "bn": "n²/2",
      "en": "n²/2"
    },
    {
      "bn": "n(n+1)",
      "en": "n(n+1)"
    }
  ],
  "correctIndex": 0,
  "explanation": {
    "bn": "সমান্তর ধারার যোগফল = n/2 × (প্রথম + শেষ) = n(n+1)/2।",
    "en": "Arithmetic-series sum = n/2 (first + last) = n(n+1)/2."
  },
  "boardTag": {
    "bn": "সকল বোর্ড",
    "en": "All Boards"
  },
  "difficulty": "easy"
}
];

export default QUESTIONS;
