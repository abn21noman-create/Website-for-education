import { CqQuestionItem } from '../types';

export const CQ_QUESTIONS: CqQuestionItem[] = [
  {
    id: 'cq-phy1-1',
    subjectKey: 'physics1',
    chapter: { bn: 'অধ্যায় ২: ভেক্টর', en: 'Ch 2: Vectors' },
    boardTag: { bn: 'যশোর বোর্ড ও ঢাকা বোর্ড আদর্শ সৃজনশীল', en: 'Jashore & Dhaka Board Standard' },
    stem: {
      bn: '১.৫ কিমি প্রশস্ত একটি নদীতে স্রোতের বেগ 4 km/h। প্রথম মাঝি স্রোতের সাথে 120° কোণে 8 km/h বেগে নৌকা চালনা করেন এবং দ্বিতীয় মাঝি একই বেগে স্রোতের সাথে লম্বভাবে (90° কোণে) নৌকা চালনা শুরু করেন।',
      en: 'A river is 1.5 km wide with a current speed of 4 km/h. Boatman-1 rows at 8 km/h making an angle of 120° with the current, while Boatman-2 rows at the same speed perpendicular (90°) to the current.',
    },
    qA: {
      bn: 'আয়ত একক ভেক্টর কাকে বলে?',
      en: 'Define rectangular unit vectors.',
    },
    qB: {
      bn: 'লন রোলার ঠেলা অপেক্ষা টানা সহজ কেন? ব্যাখ্যা করো।',
      en: 'Why is pulling a lawn roller easier than pushing it? Explain.',
    },
    qC: {
      bn: 'প্রথম মাঝির লব্ধি বেগ নির্ণয় করো।',
      en: 'Calculate the resultant velocity of the first boatman.',
    },
    qD: {
      bn: 'কোন মাঝি আগে নদীর অপর পাড়ে পৌঁছাবে এবং কে সোজাসুজি অপর পাড়ে পৌঁছাবে? গাণিতিক বিশ্লেষণ করো।',
      en: 'Which boatman reaches the opposite bank earlier, and who reaches directly across? Analyze mathematically.',
    },
    ansA: {
      bn: 'ত্রিমাত্রিক কার্তেসীয় স্থানাঙ্ক ব্যবস্থায় ধনাত্মক X, Y ও Z অক্ষের দিকে যে তিনটি একক ভেক্টর (î, ĵ, k̂) বিবেচনা করা হয়, তাদের আয়ত একক ভেক্টর বলে।',
      en: 'In a 3D Cartesian coordinate system, the unit vectors î, ĵ, and k̂ directed along the positive X, Y, and Z axes respectively are called rectangular unit vectors.',
    },
    ansB: {
      bn: 'টানার সময় প্রযুক্ত বলের উল্লম্ব উপাংশ (F sinθ) উপরের দিকে ক্রিয়া করে রোলারের আপাত ওজন (W - F sinθ) ও ঘর্ষণ বল হ্রাস করে। পক্ষান্তরে ঠেলার সময় আপাত ওজন (W + F sinθ) বৃদ্ধি পায়। তাই টানা সহজ।',
      en: 'When pulling, the vertical component F sinθ acts upward, reducing effective weight (W - F sinθ) and friction; pushing adds F sinθ downward, increasing friction.',
    },
    ansC: {
      bn: 'এখানে u = 4 km/h, v = 8 km/h, α = 120°। লব্ধি বেগ R = √(u² + v² + 2uv cos120°) = √(16 + 64 + 2×4×8×(-0.5)) = √(80 - 32) = √48 = 6.93 km/h।',
      en: 'Given u = 4 km/h, v = 8 km/h, α = 120°. Resultant R = √(4² + 8² + 2·4·8·cos120°) = √(80 - 32) = √48 ≈ 6.93 km/h.',
    },
    ansD: {
      bn: '১ম মাঝির সময় t₁ = d / (v sin120°) = 1.5 / (8 × 0.866) = 0.2165 h (≈ ১৩ মিনিট)। ২য় মাঝির সময় t₂ = d / (v sin90°) = 1.5 / 8 = 0.1875 h (≈ ১১.২৫ মিনিট)। সুতরাং ২য় মাঝি আগে পৌঁছাবে। আবার ১ম মাঝির জন্য cosα = -u/v = -4/8 = -0.5 ⇒ α = 120°, তাই ১ম মাঝি ঠিক সোজাসুজি অপর পাড়ে পৌঁছাবে।',
      en: 'Time for Boatman-1: t₁ = 1.5 / (8 sin120°) = 0.2165 h (13 min). Time for Boatman-2: t₂ = 1.5 / 8 = 0.1875 h (11.25 min), so Boatman-2 arrives earlier. However, since cos120° = -4/8 = -u/v, Boatman-1 crosses directly perpendicular with zero drift.',
    },
  },
  {
    id: 'cq-phy1-2',
    subjectKey: 'physics1',
    chapter: { bn: 'অধ্যায় ৫: কাজ, শক্তি ও ক্ষমতা', en: 'Ch 5: Work, Energy & Power' },
    boardTag: { bn: 'রাজশাহী ও চট্টগ্রাম বোর্ড আদর্শ সৃজনশীল', en: 'Rajshahi & Chattogram Board Standard' },
    stem: {
      bn: '১২ মিটার গভীর ও ১.৮ মিটার ব্যাসের একটি পানিপূর্ণ কুয়া খালি করার জন্য 2 HP ক্ষমতার এবং 75% কর্মদক্ষতার একটি পাম্প চালু করা হলো। অর্ধেক পানি উত্তোলনের পর পাম্পটি বন্ধ হয়ে গেলে অপর একটি 3 HP (80% দক্ষ) পাম্প লাগানো হলো।',
      en: 'A water-filled cylindrical well of depth 12 m and diameter 1.8 m is pumped by a 2 HP motor with 75% efficiency. After emptying half the well, it stops and is replaced by a 3 HP motor with 80% efficiency.',
    },
    qA: {
      bn: 'সংরক্ষণশীল বল কাকে বলে?',
      en: 'What is a conservative force?',
    },
    qB: {
      bn: 'গতিশক্তি কখনো ঋণাত্মক হতে পারে কি? ব্যাখ্যা করো।',
      en: 'Can kinetic energy ever be negative? Explain.',
    },
    qC: {
      bn: 'প্রথম পাম্পটি দিয়ে কুয়ার প্রথম অর্ধেক খালি করতে কত সময় লেগেছিল?',
      en: 'How long did the first pump take to empty the upper half of the well?',
    },
    qD: {
      bn: 'উভয় অর্ধেক খালি করতে সমান সময় লেগেছিল কি না—গাণিতিকভাবে যাচাই করো।',
      en: 'Verify mathematically whether both halves took the same amount of time to empty.',
    },
    ansA: {
      bn: 'যে বল দ্বারা কোনো কণাকে পূর্ণচক্রে ঘুরিয়ে পূর্বাবস্থায় আনলে কৃতকাজ শূন্য হয় (যেমন মহাকর্ষ বল), তাকে সংরক্ষণশীল বল বলে।',
      en: 'A force is conservative if the work done in moving a particle around any closed path is zero (e.g., gravitational force).',
    },
    ansB: {
      bn: 'গতিশক্তি E_k = ½ mv²। বস্তুর ভর m সর্বদা ধনাত্মক এবং বেগের বর্গ v²-ও সর্বদা অঋণাত্মক (≥ 0)। তাই গতিশক্তি কখনো ঋণাত্মক হতে পারে না।',
      en: 'Since E_k = ½ mv² where mass m > 0 and squared speed v² ≥ 0, kinetic energy can never be negative.',
    },
    ansC: {
      bn: 'ব্যাসার্ধ r = 0.9 m। অর্ধেক কুয়ার পানির ভর m₁ = πr²(L/2)ρ = 3.1416 × 0.81 × 6 × 1000 = 15268.18 kg। গড় সরণ h₁ = L/4 = 3 m। কার্যকর ক্ষমতা P₁ = 0.75 × 2 × 746 = 1119 W। সময় t₁ = m₁gh₁ / P₁ = (15268.18 × 9.8 × 3) / 1119 = 401.15 s (≈ ৬.৬৯ মিনিট)।',
      en: 'Radius r = 0.9 m; half mass m = π(0.9)²(6)(1000) = 15268.18 kg. Mean depth h₁ = L/4 = 3 m. P_eff1 = 0.75 × 2 × 746 = 1119 W. Time t₁ = mgh₁ / P_eff1 ≈ 401.15 s.',
    },
    ansD: {
      bn: 'নিচের অর্ধেকের ক্ষেত্রে ভর সমান (m₂ = 15268.18 kg), কিন্তু গড় সরণ h₂ = L/2 + L/4 = 9 m। দ্বিতীয় পাম্পের কার্যকর ক্ষমতা P₂ = 0.80 × 3 × 746 = 1790.4 W। সময় t₂ = m₂gh₂ / P₂ = (15268.18 × 9.8 × 9) / 1790.4 = 752.16 s। যেহেতু t₂ > t₁, তাই সমান সময় লাগেনি; দ্বিতীয় অর্ধেকে বেশি সময় লেগেছে।',
      en: 'For the bottom half, mean lift h₂ = 3L/4 = 9 m and P_eff2 = 0.80 × 3 × 746 = 1790.4 W. Thus t₂ = mgh₂ / P_eff2 ≈ 752.16 s ≠ t₁ (second half required more time).',
    },
  },
  {
    id: 'cq-phy2-1',
    subjectKey: 'physics2',
    chapter: { bn: 'অধ্যায় ১: তাপগতিবিদ্যা', en: 'Ch 1: Thermodynamics' },
    boardTag: { bn: 'ঢাকা ও যশোর বোর্ড আদর্শ সৃজনশীল', en: 'Dhaka & Jashore Board Standard' },
    stem: {
      bn: 'একটি প্রত্যাবর্তী কার্নো ইঞ্জিন যখন 27°C তাপমাত্রার তাপগ্রাহকে থাকে তখন এর কর্মদক্ষতা 50%। ইঞ্জিনটি উৎস থেকে প্রতি চক্রে 1200 J তাপ গ্রহণ করে।',
      en: 'A reversible Carnot engine operating with a heat sink at 27°C has an efficiency of 50%. It absorbs 1200 J of heat from the source per cycle.',
    },
    qA: {
      bn: 'তাপগতিবিদ্যার প্রথম সূত্রটি বিবৃত করো।',
      en: 'State the first law of thermodynamics.',
    },
    qB: {
      bn: 'রুদ্ধতাপীয় সংকোচনে সিস্টেমের অভ্যন্তরীণ শক্তি বৃদ্ধি পায় কেন?',
      en: 'Why does internal energy increase during adiabatic compression?',
    },
    qC: {
      bn: 'উৎসের তাপমাত্রা ও প্রতি চক্রে তাপগ্রাহকে বর্জিত তাপের পরিমাণ নির্ণয় করো।',
      en: 'Find the source temperature and the heat rejected to the sink per cycle.',
    },
    qD: {
      bn: 'তাপগ্রাহকের তাপমাত্রা অপরিবর্তিত রেখে ইঞ্জিনটির দক্ষতা 60% করতে উৎসের তাপমাত্রা কত বাড়াতে হবে?',
      en: 'Keeping sink temperature constant, by how much must the source temperature be raised to achieve 60% efficiency?',
    },
    ansA: {
      bn: 'কোনো সিস্টেমে তাপশক্তি সরবরাহ করলে তার কিছু অংশ অভ্যন্তরীণ শক্তি বৃদ্ধিতে এবং বাকি অংশ বাহ্যিক কাজ সম্পাদনে ব্যয় হয় (dQ = dU + dW)।',
      en: 'Heat supplied to a thermodynamic system equals the sum of the increase in internal energy and external work done (dQ = dU + dW).',
    },
    ansB: {
      bn: 'রুদ্ধতাপীয় প্রক্রিয়ায় dQ = 0, ফলে dU = -dW। সংকোচনের ক্ষেত্রে বাইরে থেকে কাজ করা হয় বলে dW ঋণাত্মক, ফলে dU ধনাত্মক হয়—অর্থাৎ অভ্যন্তরীণ শক্তি ও তাপমাত্রা বৃদ্ধি পায়।',
      en: 'In an adiabatic process dQ = 0, so dU = -dW. Compression makes dW negative, resulting in dU > 0 and raising internal energy.',
    },
    ansC: {
      bn: 'এখানে T₂ = 27 + 273 = 300 K এবং η = 0.50। সূত্র 1 - T₂/T₁ = 0.50 ⇒ T₂/T₁ = 0.50 ⇒ T₁ = 600 K (327°C)। আবার Q₂/Q₁ = T₂/T₁ = 0.5 ⇒ বর্জিত তাপ Q₂ = 0.5 × 1200 = 600 J।',
      en: 'T₂ = 300 K, η = 0.50 ⇒ 1 - 300/T₁ = 0.50 ⇒ T₁ = 600 K (327°C). Rejected heat Q₂ = Q₁(T₂/T₁) = 1200 × 0.5 = 600 J.',
    },
    ansD: {
      bn: 'নতুন দক্ষতা η′ = 0.60 হলে 1 - 300 / T₁′ = 0.60 ⇒ 300 / T₁′ = 0.40 ⇒ T₁′ = 750 K। সুতরাং উৎসের তাপমাত্রা বাড়াতে হবে ΔT = 750 - 600 = 150 K (বা 150°C)।',
      en: 'For η′ = 0.60: 1 - 300/T₁′ = 0.60 ⇒ T₁′ = 750 K. Required increase ΔT = 750 - 600 = 150 K (or 150°C).',
    },
  },
  {
    id: 'cq-chem1-1',
    subjectKey: 'chemistry1',
    chapter: { bn: 'অধ্যায় ৪: রাসায়নিক পরিবর্তন', en: 'Ch 4: Chemical Changes' },
    boardTag: { bn: 'সকল বোর্ড হট টপিক সৃজনশীল', en: 'All Boards High-Yield CQ' },
    stem: {
      bn: 'পাত্র-A তে 50 mL 0.2 M CH₃COOH (Ka = 1.8 × 10⁻⁵) এবং পাত্র-B তে 30 mL 0.15 M NaOH দ্রবণ রয়েছে। উভয় দ্রবণ একত্রে মিশ্রিত করে পাত্র-C তে রাখা হলো।',
      en: 'Vessel-A contains 50 mL of 0.2 M CH₃COOH (Ka = 1.8 × 10⁻⁵) and Vessel-B contains 30 mL of 0.15 M NaOH. Both are mixed into Vessel-C.',
    },
    qA: {
      bn: 'বাফার দ্রবণ কাকে বলে?',
      en: 'Define a buffer solution.',
    },
    qB: {
      bn: 'বিশুদ্ধ পানির pH তাপমাত্রা বৃদ্ধিতে হ্রাস পায় কেন?',
      en: 'Why does the pH of pure water decrease as temperature rises?',
    },
    qC: {
      bn: 'পাত্র-A দ্রবণের pH নির্ণয় করো।',
      en: 'Calculate the pH of the solution in Vessel-A.',
    },
    qD: {
      bn: 'পাত্র-C এর মিশ্র দ্রবণের pH নির্ণয়পূর্বক এর বাফার ক্রিয়াকৌশল ব্যাখ্যা করো।',
      en: 'Calculate the pH of the mixture in Vessel-C and explain its buffer mechanism.',
    },
    ansA: {
      bn: 'যে দ্রবণে সামান্য পরিমাণ সবল অম্ল বা সবল ক্ষার যোগ করলেও দ্রবণের pH মান কার্যত অপরিবর্তিত থাকে, তাকে বাফার দ্রবণ বলে।',
      en: 'A solution that resists any significant change in pH upon addition of small amounts of strong acid or strong base is called a buffer solution.',
    },
    ansB: {
      bn: 'পানির স্বয়ং-আয়নীকরণ তাপহারী প্রক্রিয়া। তাপমাত্রা বাড়ালে Kw বৃদ্ধি পায়, ফলে [H⁺] ঘনমাত্রা 10⁻⁷ M অপেক্ষা বাড়ে এবং pH = -log[H⁺] মান ৭ এর নিচে নেমে যায় (তবে পানি নিরপেক্ষই থাকে)।',
      en: 'Auto-ionization of water is endothermic; heating increases Kw and [H⁺], lowering pH below 7 while keeping [H⁺] = [OH⁻].',
    },
    ansC: {
      bn: 'মৃদু অম্লের জন্য [H⁺] = √(Ka · C) = √(1.8 × 10⁻⁵ × 0.2) = √(3.6 × 10⁻⁶) = 1.897 × 10⁻³ M। সুতরাং pH = -log(1.897 × 10⁻³) = 2.72।',
      en: 'For a weak monoprotic acid, [H⁺] = √(Ka·C) = √(1.8×10⁻⁵ × 0.2) = 1.897×10⁻³ M ⇒ pH = 2.72.',
    },
    ansD: {
      bn: 'CH₃COOH এর মিলিমোল = 50×0.2 = 10 mmol; NaOH এর মিলিমোল = 30×0.15 = 4.5 mmol। বিক্রিয়ার পর উৎপন্ন লবণ CH₃COONa = 4.5 mmol এবং অবশিষ্ট অম্ল = 10 - 4.5 = 5.5 mmol (অম্লীয় বাফার)। pH = pKa + log(4.5 / 5.5) = 4.7447 - 0.087 = 4.66। এতে H⁺ যোগ করলে CH₃COO⁻ আয়ন তাকে প্রশমিত করে CH₃COOH তৈরি করে এবং OH⁻ যোগ করলে CH₃COOH প্রশমিত করে pH স্থির রাখে।',
      en: 'Acid = 10 mmol, Base = 4.5 mmol ⇒ Salt formed = 4.5 mmol, Remaining acid = 5.5 mmol (acidic buffer). pH = -log(1.8×10⁻⁵) + log(4.5/5.5) = 4.66.',
    },
  },
  {
    id: 'cq-math1-1',
    subjectKey: 'math1',
    chapter: { bn: 'অধ্যায় ৪: বৃত্ত ও অধ্যায় ৯: অন্তরীকরণ', en: 'Ch 4: Circles & Ch 9: Calculus' },
    boardTag: { bn: 'যশোর ও রাজশাহী বোর্ড আদর্শ সৃজনশীল', en: 'Jashore & Rajshahi Board Standard' },
    stem: {
      bn: 'দৃশ্যকল্প-১: x² + y² - 8x - 6y + 16 = 0 একটি বৃত্তের সমীকরণ। দৃশ্যকল্প-২: f(x) = 2x³ - 21x² + 36x - 20 একটি বহুপদী ফাংশন।',
      en: 'Scenario-1: x² + y² - 8x - 6y + 16 = 0 represents a circle. Scenario-2: f(x) = 2x³ - 21x² + 36x - 20 is a cubic function.',
    },
    qA: {
      bn: 'r = 4 cosθ পোলার সমীকরণকে কার্তেসীয় সমীকরণে প্রকাশ করো।',
      en: 'Convert the polar equation r = 4 cosθ into Cartesian form.',
    },
    qB: {
      bn: 'দৃশ্যকল্প-১ এর বৃত্তটি দ্বারা x-অক্ষের খণ্ডিতাংশের দৈর্ঘ্য নির্ণয় করো।',
      en: 'Find the length of the x-axis intercept cut off by the circle in Scenario-1.',
    },
    qC: {
      bn: 'মূলবিন্দু হতে দৃশ্যকল্প-১ এর বৃত্তে অঙ্কিত স্পর্শকদ্বয়ের সমীকরণ নির্ণয় করো।',
      en: 'Determine the equations of the tangents drawn from the origin to the circle in Scenario-1.',
    },
    qD: {
      bn: 'দৃশ্যকল্প-২ বর্ণিত f(x) ফাংশনটির গুরুমান ও লঘুমান নির্ণয় করো।',
      en: 'Determine the local maximum and local minimum values of f(x) in Scenario-2.',
    },
    ansA: {
      bn: 'r = 4 cosθ ⇒ r² = 4r cosθ ⇒ x² + y² = 4x ⇒ x² + y² - 4x = 0।',
      en: 'Multiply by r: r² = 4r cosθ ⇒ x² + y² - 4x = 0.',
    },
    ansB: {
      bn: 'প্রদত্ত বৃত্তে 2g = -8 ⇒ g = -4 এবং c = 16। x-অক্ষের খণ্ডিতাংশ = 2√(g² - c) = 2√(16 - 16) = 0 (বৃত্তটি x-অক্ষকে স্পর্শ করে)।',
      en: 'Here g = -4, c = 16. x-intercept = 2√(g² - c) = 2√(16 - 16) = 0 (touches the x-axis).',
    },
    ansC: {
      bn: 'বৃত্তের কেন্দ্র (4, 3) এবং ব্যাসার্ধ r = √(16 + 9 - 16) = 3। যেহেতু স্পর্শক মূলবিন্দুগামী, ধরি y = mx ⇒ mx - y = 0। শর্তমতে |4m - 3| / √(m² + 1) = 3 ⇒ 16m² - 24m + 9 = 9m² + 9 ⇒ 7m² - 24m = 0 ⇒ m = 0 অথবা m = 24/7। নির্ণেয় স্পর্শকদ্বয়: y = 0 এবং 24x - 7y = 0।',
      en: 'Center (4, 3), radius r = 3. Setting distance from (4,3) to mx - y = 0 equal to 3 gives 7m² - 24m = 0 ⇒ m = 0 or 24/7. Tangents: y = 0 and 24x - 7y = 0.',
    },
    ansD: {
      bn: 'f′(x) = 6x² - 42x + 36 এবং f″(x) = 12x - 42। চরম মানের জন্য f′(x) = 0 ⇒ x² - 7x + 6 = 0 ⇒ x = 1, 6। x = 1 হলে f″(1) = -30 < 0, তাই গুরুমান f(1) = 2 - 21 + 36 - 20 = -3। আবার x = 6 হলে f″(6) = 30 > 0, তাই লঘুমান f(6) = 432 - 756 + 216 - 20 = -128।',
      en: 'f′(x) = 6(x - 1)(x - 6) = 0 ⇒ x = 1, 6. f″(1) = -30 < 0 ⇒ Local Max f(1) = -3; f″(6) = +30 > 0 ⇒ Local Min f(6) = -128.',
    },
  },
  {
    id: 'cq-bio1-1',
    subjectKey: 'biology1',
    chapter: { bn: 'অধ্যায় ২: কোষ বিভাজন', en: 'Ch 2: Cell Division' },
    boardTag: { bn: 'ঢাকা ও যশোর বোর্ড আদর্শ সৃজনশীল', en: 'Dhaka & Jashore Board Standard' },
    stem: {
      bn: 'উদ্ভিদের বর্ধিষ্ণু মূলের শীর্ষে এক ধরনের কোষ বিভাজন (P) ঘটে যার ফলে দৈহিক বৃদ্ধি হয়। অন্যদিকে জনন মাতৃকোষে অপর এক ধরনের বিভাজন (Q) ঘটে যেখানে হোমোলোগাস ক্রোমোজোমের মধ্যে অংশের বিনিময় ঘটে।',
      en: 'Cell division type-P occurs at growing root tips causing vegetative growth, whereas division type-Q occurs in reproductive mother cells involving segment exchange between homologous chromosomes.',
    },
    qA: {
      bn: 'কায়াজমা (Chiasma) কী?',
      en: 'What is a chiasma?',
    },
    qB: {
      bn: 'মাইটোসিসকে সমীকরণিক বিভাজন বলা হয় কেন?',
      en: 'Why is mitosis called equational division?',
    },
    qC: {
      bn: 'P বিভাজনের যে ধাপে ক্রোমোজোমগুলো বিষুবীয় অঞ্চলে বিন্যস্ত হয় তার সচিত্র বৈশিষ্ট্য বর্ণনা করো।',
      en: 'Describe the key features of the stage in division-P where chromosomes align at the equatorial plate.',
    },
    qD: {
      bn: 'জীবজগতে প্রকরণ সৃষ্টি ও প্রজাতির ক্রোমোজোম সংখ্যা ধ্রুব রাখায় Q বিভাজনের তাৎপর্য বিশ্লেষণ করো।',
      en: 'Analyze the significance of division-Q in creating genetic variation and maintaining constant species chromosome number.',
    },
    ansA: {
      bn: 'মায়োসিস প্রোফেজ-১ এর প্যাকাইটিন উপ-পর্যায়ে দুটি নন-সিস্টার ক্রোমাটিড যে স্থানে পরস্পরকে ইংরেজি X অক্ষরের ন্যায় অতিক্রম করে, সেই সংযোগস্থলকে কায়াজমা বলে।',
      en: 'The X-shaped point of contact between two non-sister chromatids of a bivalent during Pachytene of Prophase-I is called a chiasma.',
    },
    ansB: {
      bn: 'মাইটোসিসে মাতৃকোষের ক্রোমোজোম সংখ্যা ও গুণাগুণ উৎপন্ন দুটি অপত্য কোষে হুবহু সমান থাকে (2n → 2n), তাই একে সমীকরণিক বিভাজন বলে।',
      en: 'Daughter cells receive the exact same diploid chromosome number (2n) and genetic content as the parent cell.',
    },
    ansC: {
      bn: 'P হলো মাইটোসিস এবং উল্লিখিত ধাপটি হলো মেটাফেজ (Metaphase)। বৈশিষ্ট্য: ১) স্পিন্ডল যন্ত্রের বিষুবীয় অঞ্চলে ক্রোমোজোমগুলো সেন্ট্রোমিয়ারের সাহায্যে তন্তুর সাথে যুক্ত হয় (মেটাকাইনেসিস), ২) ক্রোমোজোমগুলো সর্বাধিক মোটা ও খাটো দেখায়, ৩) নিউক্লিয়ার এনভেলপ ও নিউক্লিওলাস সম্পূর্ণ বিলুপ্ত থাকে।',
      en: 'Stage is Metaphase of Mitosis: chromosomes reach maximum condensation, align along the equatorial plane via spindle fibers (metakinesis), and nuclear membrane is completely absent.',
    },
    ansD: {
      bn: 'Q হলো মায়োসিস বিভাজন। ডিপ্লয়েড (2n) জীবের গ্যামিট সৃষ্টিতে মায়োসিস ক্রোমোজোম সংখ্যা অর্ধেক (n) করে দেয়, ফলে নিষেকের পর জাইগোটে পুনরায় 2n ফিরে আসে। এছাড়া ক্রসিং ওভারের ফলে জিনের নতুন বিন্যাস ঘটে, যা জীববৈচিত্র্য ও অভিব্যক্তির মূল চালিকাশক্তি।',
      en: 'Meiosis halves chromosome count (2n → n) in gametes so fertilization restores 2n across generations, while crossing over shuffles alleles to generate genetic diversity.',
    },
  },
  {
    id: 'cq-ict-1',
    subjectKey: 'ict',
    chapter: { bn: 'অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস', en: 'Ch 3: Number Systems & Logic Gates' },
    boardTag: { bn: 'যশোর, ঢাকা ও রাজশাহী বোর্ড সৃজনশীল', en: 'Jashore, Dhaka & Rajshahi Board' },
    stem: {
      bn: 'রাহাত ও নুসরাতের আইসিটি ক্লাস টেস্টের নম্বর যথাক্রমে (35)₈ এবং (1F)₁₆। শিক্ষক তাদের একটি লজিক ফাংশন F = A′B + AB′ বাস্তবায়ন করতে বললেন।',
      en: 'Rahat and Nusrat scored (35)₈ and (1F)₁₆ respectively on an ICT quiz. Their teacher asked them to implement the Boolean function F = A′B + AB′.',
    },
    qA: {
      bn: 'BCD কোড কী?',
      en: 'What is BCD code?',
    },
    qB: {
      bn: '২-এর পরিপূরক গঠনের গুরুত্ব ব্যাখ্যা করো।',
      en: 'Explain the importance of 2s complement representation.',
    },
    qC: {
      bn: '২-এর পরিপূরক পদ্ধতিতে (৮-বিট রেজিস্টারে) নুসরাত ও রাহাতের নম্বরের পার্থক্য নির্ণয় করো।',
      en: 'Using 8-bit 2s complement arithmetic, find the difference between Nusrat and Rahats marks.',
    },
    qD: {
      bn: 'উদ্দীপকের F ফাংশনটি শুধুমাত্র NAND গেইটের সাহায্যে বাস্তবায়ন সম্ভব কি না—লজিক সার্কিট ও সমীকরণসহ বিশ্লেষণ করো।',
      en: 'Analyze with Boolean algebra and gate logic whether F can be implemented using ONLY NAND gates.',
    },
    ansA: {
      bn: 'দশমিক সংখ্যার প্রতিটি অঙ্ককে আলাদাভাবে ৪-বিট বাইনারি সংখ্যায় প্রকাশ করার পদ্ধতিকে BCD (Binary Coded Decimal) কোড বলে।',
      en: 'Binary Coded Decimal (BCD) encodes each decimal digit (0–9) individually into its 4-bit binary equivalent.',
    },
    ansB: {
      bn: '২-এর পরিপূরক পদ্ধতিতে যোগের সার্কিট (Adder) দিয়েই বিয়োগের কাজ সম্পন্ন করা যায় এবং +0 ও -0 এর দ্বৈত সমস্যা দূর হয়, ফলে ডিজিটাল কম্পিউটারের হার্ডওয়্যার সরল ও সাশ্রয়ী হয়।',
      en: '2s complement allows subtraction using standard adder circuits and eliminates dual representations of zero.',
    },
    ansC: {
      bn: 'রাহাত = (35)₈ = 3×8 + 5 = (29)₁₀ = (00011101)₂। নুসরাত = (1F)₁₆ = 1×16 + 15 = (31)₁₀ = (00011111)₂। (-29) এর ২-এর পরিপূরক = 11100010 + 1 = 11100011। যোগফল: 00011111 + 11100011 = (1) 00000010; ক্যারি বিট ১ বাদ দিয়ে পার্থক্য = (00000010)₂ = (+2)₁₀।',
      en: 'Rahat = (35)₈ = 29₁₀ (00011101₂); Nusrat = (1F)₁₆ = 31₁₀ (00011111₂). 2s complement of -29 is 11100011₂. Adding gives (1)00000010₂; discarding carry yields +2₁₀.',
    },
    ansD: {
      bn: 'F = A′B + AB′ (XOR ফাংশন)। ডি-মরগ্যান উপপাদ্য প্রয়োগ করে: F = [(A′B + AB′)′]′ = [(A′B)′ · (AB′)′]′। আবার A′B = A′B + AA′ = A′(A+B) নিলে মাত্র ৪টি ২-ইনপুট NAND গেইট: Y₁ = (AB)′, Y₂ = (A·Y₁)′, Y₃ = (B·Y₁)′, এবং F = (Y₂·Y₃)′ দ্বারা সম্পূর্ণ বাস্তবায়ন সম্ভব।',
      en: 'F = A ⊕ B can be built with just 4 two-input NAND gates: let Y₁ = (AB)′, Y₂ = (A·Y₁)′, Y₃ = (B·Y₁)′, then F = (Y₂·Y₃)′ = A′B + AB′.',
    },
  },
  {
    id: 'cq-phy2-2',
    subjectKey: 'physics2',
    chapter: { bn: 'অধ্যায় ১: তাপগতিবিদ্যা', en: 'Ch 1: Thermodynamics' },
    boardTag: { bn: 'ঢাকা ও যশোর বোর্ড সৃজনশীল', en: 'Dhaka & Jashore Board Standard' },
    stem: {
      bn: 'একটি প্রত্যাবর্তী কার্নো ইঞ্জিন 600 K তাপমাত্রার উৎস থেকে 1200 J তাপ গ্রহণ করে এবং তাপগ্রাহকে 480 J তাপ বর্জন করে। পরবর্তীতে ইঞ্জিনটির কর্মদক্ষতা 20% বৃদ্ধি করার উদ্যোগ নেওয়া হলো।',
      en: 'A reversible Carnot engine absorbs 1200 J of heat from a source at 600 K and rejects 480 J to a sink. Engineers then plan to raise its efficiency by an additional 20% (to 80%).',
    },
    qA: { bn: 'এনট্রপি কাকে বলে?', en: 'Define entropy.' },
    qB: { bn: 'রুদ্ধতাপীয় প্রক্রিয়ায় গ্যাসকে সংকুচিত করলে তাপমাত্রা বৃদ্ধি পায় কেন?', en: 'Why does compressing a gas adiabatically raise its temperature?' },
    qC: { bn: 'তাপগ্রাহকের তাপমাত্রা নির্ণয় করো।', en: 'Calculate the temperature of the heat sink.' },
    qD: { bn: 'তাপগ্রাহকের তাপমাত্রা স্থির রেখে উদ্দীপকের নতুন কর্মদক্ষতা অর্জন করতে উৎসের তাপমাত্রা কত পরিবর্তন করতে হবে?', en: 'Keeping sink temperature constant, how much must the source temperature be changed to achieve the new efficiency?' },
    ansA: {
      bn: 'রুদ্ধতাপীয় প্রক্রিয়ায় বস্তুর যে তাপীয় ধর্ম স্থির থাকে (বা ব্যবস্থার বিশৃঙ্খলার পরিমাপক রাশি), তাকে এনট্রপি বলে (dS = dQ/T)।',
      en: 'Entropy (dS = dQ/T) is the thermodynamic property measuring molecular disorder that remains constant during a reversible adiabatic process.',
    },
    ansB: {
      bn: 'রুদ্ধতাপীয় সংকোচনে dQ = 0, তাই ১ম সূত্র dQ = dU + dW অনুযায়ী dU = -dW। বাইরে থেকে কৃত কাজ অভ্যন্তরীণ শক্তি বৃদ্ধি করে, ফলে তাপমাত্রা বৃদ্ধি পায়।',
      en: 'In adiabatic compression dQ = 0, so dU = -dW > 0; external work done increases internal energy and temperature.',
    },
    ansC: {
      bn: 'প্রত্যাবর্তী ইঞ্জিনের ক্ষেত্রে Q₂ / Q₁ = T₂ / T₁ ⇒ T₂ = (480 / 1200) × 600 K = 240 K (বা -33°C)।',
      en: 'For a Carnot cycle, T₂ = T₁ × (Q₂ / Q₁) = 600 × (480 / 1200) = 240 K (-33°C).',
    },
    ansD: {
      bn: 'প্রাথমিক দক্ষতা η₁ = (1 - 240/600) × 100% = 60%। নতুন দক্ষতা η₂ = 60% + 20% = 80% = 0.8। এখন 0.8 = 1 - 240 / T₁′ ⇒ 240 / T₁′ = 0.2 ⇒ T₁′ = 1200 K। সুতরাং উৎসের তাপমাত্রা (1200 - 600) = 600 K বৃদ্ধি করতে হবে।',
      en: 'Initial η₁ = 60%. Target η₂ = 80% = 0.8 ⇒ 1 - 240/T₁′ = 0.8 ⇒ T₁′ = 1200 K. Source temperature must be increased by 600 K.',
    },
  },
  {
    id: 'cq-chem2-1',
    subjectKey: 'chemistry2',
    chapter: { bn: 'অধ্যায় ৩: পরিমাণগত রসায়ন', en: 'Ch 3: Quantitative Chemistry' },
    boardTag: { bn: 'রাজশাহী ও চট্টগ্রাম বোর্ড সৃজনশীল', en: 'Rajshahi & Chattogram Board' },
    stem: {
      bn: 'পাত্র-A তে 50 mL 0.1 M FeSO₄ এর অম্লীয় দ্রবণ রয়েছে। পাত্র-B তে 0.02 M KMnO₄ দ্রবণ নিয়ে পাত্র-A এর দ্রবণকে টাইট্রেশন করা হলো।',
      en: 'Vessel-A contains 50 mL of acidified 0.1 M FeSO₄ solution. It is titrated against 0.02 M KMnO₄ from Vessel-B.',
    },
    qA: { bn: 'প্রাইমারি স্ট্যান্ডার্ড পদার্থ কাকে বলে?', en: 'What is a primary standard substance?' },
    qB: { bn: 'K₂Cr₂O₇ প্রাইমারি স্ট্যান্ডার্ড হলেও KMnO₄ সেকেন্ডারি স্ট্যান্ডার্ড কেন?', en: 'Why is K₂Cr₂O₇ a primary standard while KMnO₄ is a secondary standard?' },
    qC: { bn: 'পাত্র-A এর দ্রবণকে পূর্ণ প্রশমিত করতে পাত্র-B এর কত আয়তন KMnO₄ প্রয়োজন?', en: 'Calculate the volume of KMnO₄ required to completely oxidize Vessel-A.' },
    qD: { bn: 'যদি উদ্দীপকের নমুনায় 0.35 g ভেজালযুক্ত লোহার তার ব্যবহৃত হতো, তবে লোহার বিশুদ্ধতার শতকরা হার কীভাবে নির্ণয় করা যেত? সমীকরণসহ বিশ্লেষণ করো।', en: 'If the FeSO₄ came from dissolving a 0.35 g impure iron wire, analyze the purity percentage of iron.' },
    ansA: {
      bn: 'যেসব রাসায়নিক পদার্থ প্রকৃতিতে বিশুদ্ধ ও শুষ্ক অবস্থায় পাওয়া যায়, বায়ুর উপাদানে অপরিবর্তিত থাকে এবং ওজন করে সরাসরি প্রমাণ দ্রবণ তৈরি করা যায়, তাদের প্রাইমারি স্ট্যান্ডার্ড পদার্থ বলে।',
      en: 'Substances available in pure, stable, non-hygroscopic crystalline form whose standard solution concentration remains unchanged over time.',
    },
    ansB: {
      bn: 'KMnO₄ আলো ও জৈব পদার্থের উপস্থিতিতে ধীরে ধীরে বিয়োজিত হয়ে MnO₂ উৎপন্ন করে ফলে এর ঘনমাত্রা পরিবর্তিত হয়; কিন্তু K₂Cr₂O₇ বায়ুতে সম্পূর্ণ স্থিতিশীল।',
      en: 'KMnO₄ slowly decomposes in sunlight/organic traces into MnO₂, altering its molarity, whereas K₂Cr₂O₇ remains stable.',
    },
    ansC: {
      bn: 'বিক্রিয়া: 5Fe²⁺ + MnO₄⁻ + 8H⁺ → 5Fe³⁺ + Mn²⁺ + 4H₂O। সূত্র: V_Fe × M_Fe / 5 = V_KMnO₄ × M_KMnO₄ / 1 ⇒ (50 × 0.1) / 5 = V_KMnO₄ × 0.02 ⇒ 1 = 0.02 × V_KMnO₄ ⇒ V_KMnO₄ = 50 mL।',
      en: 'From 5Fe²⁺ : 1MnO₄⁻ stoichiometry: (50 × 0.1)/5 = V × 0.02 ⇒ V = 50 mL of KMnO₄.',
    },
    ansD: {
      bn: 'মোল সংখ্যা n(Fe²⁺) = 0.05 L × 0.1 M = 0.005 mol। বিশুদ্ধ লোহার ভর m = 0.005 × 55.85 g = 0.27925 g। বিশুদ্ধতার হার = (0.27925 / 0.35) × 100% = 79.79%।',
      en: 'Moles of Fe = 0.05 × 0.1 = 0.005 mol ⇒ pure Fe mass = 0.005 × 55.85 = 0.27925 g. Purity = (0.27925 / 0.35) × 100% = 79.79%.',
    },
  },
  {
    id: 'cq-math2-1',
    subjectKey: 'math2',
    chapter: { bn: 'অধ্যায় ৬: কণিক (পরাবৃত্ত ও উপবৃত্ত)', en: 'Ch 6: Conics (Parabola & Ellipse)' },
    boardTag: { bn: 'ঢাকা ও দিনাজপুর বোর্ড সৃজনশীল', en: 'Dhaka & Dinajpur Board Standard' },
    stem: {
      bn: 'একটি পরাবৃত্তের সমীকরণ y² - 4y - 8x + 20 = 0 এবং একটি উপবৃত্তের সমীকরণ 9x² + 16y² = 144।',
      en: 'Consider the parabola y² - 4y - 8x + 20 = 0 and the ellipse 9x² + 16y² = 144.',
    },
    qA: { bn: 'উৎকেন্দ্রিকতা (Eccentricity) কাকে বলে?', en: 'Define eccentricity of a conic.' },
    qB: { bn: 'e = 0, e = 1 এবং 0 < e < 1 হলে কণিকের প্রকৃতি কী হয়?', en: 'Identify the conic sections when e = 0, e = 1, and 0 < e < 1.' },
    qC: { bn: 'উদ্দীপকের পরাবৃত্তটির শীর্ষবিন্দু, উপকেন্দ্র ও নিয়ামক রেখার সমীকরণ নির্ণয় করো।', en: 'Find the vertex, focus, and directrix equation of the parabola.' },
    qD: { bn: 'উপবৃত্তটির উৎকেন্দ্রিকতা এবং উপকেন্দ্রদ্বয়ের মধ্যবর্তী দূরত্ব নির্ণয় করো।', en: 'Determine the eccentricity and distance between the two foci of the ellipse.' },
    ansA: {
      bn: 'কণিকের ওপর যেকোনো বিন্দু হতে উপকেন্দ্রের দূরত্ব (SP) এবং নিয়ামক রেখার লম্ব দূরত্বের (PM) ধ্রুব অনুপাতকে (SP/PM = e) উৎকেন্দ্রিকতা বলে।',
      en: 'The constant ratio e = SP / PM of distance from focus S to perpendicular distance from directrix M.',
    },
    ansB: {
      bn: 'e = 0 হলে বৃত্ত (Circle), e = 1 হলে পরাবৃত্ত (Parabola), এবং 0 < e < 1 হলে উপবৃত্ত (Ellipse) নির্দেশ করে।',
      en: 'e = 0 gives a Circle, e = 1 gives a Parabola, and 0 < e < 1 gives an Ellipse.',
    },
    ansC: {
      bn: '(y - 2)² = 8x - 16 = 8(x - 2) = 4·2·(x - 2)। এখানে a = 2। শীর্ষবিন্দু (2, 2), উপকেন্দ্র (2 + a, 2) = (4, 2) এবং নিয়ামক রেখা x - 2 = -2 ⇒ x = 0 (Y-অক্ষ)।',
      en: 'Rewriting as (y - 2)² = 4·2(x - 2) gives a = 2: Vertex (2, 2), Focus (4, 2), and Directrix x = 0.',
    },
    ansD: {
      bn: 'x²/16 + y²/9 = 1 ⇒ a = 4, b = 3। উৎকেন্দ্রিকতা e = √(1 - 9/16) = √7 / 4। উপকেন্দ্রদ্বয়ের দূরত্ব = 2ae = 2 × 4 × (√7 / 4) = 2√7 একক।',
      en: 'x²/16 + y²/9 = 1 gives a = 4, b = 3, e = √(1 - 9/16) = √7/4, and inter-focal distance 2ae = 2√7 units.',
    },
  },
  {
    id: 'cq-bio1-2',
    subjectKey: 'biology1',
    chapter: { bn: 'অধ্যায় ৯: উদ্ভিদ শারীরতত্ত্ব', en: 'Ch 9: Plant Physiology' },
    boardTag: { bn: 'যশোর ও রাজশাহী বোর্ড সৃজনশীল', en: 'Jashore & Rajshahi Board Standard' },
    stem: {
      bn: 'ধান ও আম উদ্ভিদে সালোকসংশ্লেষণের অন্ধকার পর্যায়ে প্রথম স্থায়ী যৌগ ৩-কার্বন বিশিষ্ট হলেও ভুট্টা ও আখ উদ্ভিদে তা ৪-কার্বন বিশিষ্ট এবং এদের পাতায় বিশেষ ক্রাঞ্জ অ্যানাটমি (Kranz anatomy) বিদ্যমান।',
      en: 'In rice and mango plants the first stable dark-phase product is a 3-carbon compound, whereas in maize and sugarcane it is a 4-carbon compound accompanied by Kranz leaf anatomy.',
    },
    qA: { bn: 'ফটোফসফোরাইলেশন কী?', en: 'What is photophosphorylation?' },
    qB: { bn: 'সালোকসংশ্লেষণে পানির সালোক-বিভাজন (Photolysis) কেন অপরিহার্য?', en: 'Why is photolysis of water essential in photosynthesis?' },
    qC: { bn: 'উদ্দীপকের প্রথম শ্রেণির উদ্ভিদের কার্বন বিজারণ চক্রের সংক্ষিপ্ত ছক উপস্থাপন করো।', en: 'Outline the carbon fixation cycle of the first group of plants (C₃).' },
    qD: { bn: 'উচ্চ তাপমাত্রা ও তীব্র আলোতে উদ্দীপকের দ্বিতীয় শ্রেণির উদ্ভিদ কেন অধিক উৎপাদনশীল? বিশ্লেষণ করো।', en: 'Analyze why the second group of plants (C₄) is more productive under high temperature and intense light.' },
    ansA: {
      bn: 'সালোকসংশ্লেষণের আলোক পর্যায়ে সূর্যালোকের উপস্থিতিতে ADP-এর সাথে অজৈব ফসফেট (Pi) যুক্ত হয়ে ATP তৈরির প্রক্রিয়াকে ফটোফসফোরাইলেশন বলে।',
      en: 'Synthesis of ATP from ADP and inorganic phosphate (Pi) using light energy in chloroplasts.',
    },
    ansB: {
      bn: 'পানির ফটোলাইসিস (2H₂O → 4H⁺ + 4e⁻ + O₂) PS-II এর ঘাটতি ইলেকট্রন পূরণ করে, NADPH + H⁺ তৈরিতে প্রোটন দেয় এবং উপজাত হিসেবে পরিবেশে O₂ মুক্ত করে।',
      en: 'Photolysis supplies electrons to PS-II, protons for NADPH reduction, and releases O₂.',
    },
    ansC: {
      bn: 'ক্যালভিন (C₃) চক্রে স্ট্রোমায় ৫-কার্বন RuBP রুবিস্কো এনজাইমের সহায়তায় CO₂ গ্রহণ করে ২ অণু ৩-PGA তৈরি করে, যা ATP ও NADPH ব্যবহৃত হয়ে G3P ও শর্করা গঠন করে এবং RuBP পুনরুৎপাদিত হয়।',
      en: 'In the Calvin cycle, RuBP fixes CO₂ via RuBisCO into two molecules of 3-PGA, reduced to G3P using ATP & NADPH before regenerating RuBP.',
    },
    ansD: {
      bn: 'C₄ উদ্ভিদে ক্রাঞ্জ অ্যানাটমির মেসোফিল কোষে PEP কার্বক্সিলেজ অত্যন্ত কম CO₂ ঘনত্বেও কাজ করে এবং বান্ডল সিথ কোষে আলোক-শ্বসন (Photorespiration) ঘটে না। ফলে ৩০°–৪৫°C তাপমাত্রায় C₄ উদ্ভিদের উৎপাদনশীলতা C₃ অপেক্ষা অনেক বেশি।',
      en: 'PEP carboxylase in mesophyll cells lacks oxygenase activity, eliminating wasteful photorespiration inside bundle-sheath cells at 30°–45°C.',
    },
  },
  {
    id: 'cq-ict-2',
    subjectKey: 'ict',
    chapter: { bn: 'অধ্যায় ৫: প্রোগ্রামিং ভাষা (C ও ফ্লোচার্ট)', en: 'Ch 5: C Programming & Algorithms' },
    boardTag: { bn: 'সকল বোর্ড সৃজনশীল (অধ্যায় ৫)', en: 'All Boards Standard (Ch 5)' },
    stem: {
      bn: 'একাদশ শ্রেণির শিক্ষার্থী আরিফ একটি ধারা লিখল: 2 + 4 + 6 + ... + N। শিক্ষক তাকে ধারাটির যোগফল নির্ণয়ের অ্যালগরিদম ও C প্রোগ্রাম তৈরি করতে বললেন।',
      en: 'Class 11 student Arif wrote the series 2 + 4 + 6 + ... + N. His instructor asked him to design an algorithm and a C program to compute the sum.',
    },
    qA: { bn: 'কম্পাইলার কী?', en: 'What is a compiler?' },
    qB: { bn: 'প্রোগ্রামিংয়ে চলক (Variable) ও ধ্রুবকের (Constant) মধ্যে পার্থক্য লেখো।', en: 'Differentiate between a variable and a constant in C.' },
    qC: { bn: 'উদ্দীপকের ধারাটির যোগফল নির্ণয়ের অ্যালগরিদম লেখো।', en: 'Write the step-by-step algorithm to calculate the sum of the series.' },
    qD: { bn: 'for লুপের পরিবর্তে while লুপ ব্যবহার করে উদ্দীপকের ধারাটির পূর্ণাঙ্গ C প্রোগ্রাম রচনা করো।', en: 'Implement the complete C program for the series using a while loop.' },
    ansA: {
      bn: 'যে অনুবাদক প্রোগ্রাম উচ্চস্তরের ভাষার সম্পূর্ণ উৎস প্রোগ্রামকে একসাথে পড়ে বস্তু প্রোগ্রামে (Machine code) রূপান্তর করে এবং সব ভুল একসাথে প্রদর্শন করে, তাকে কম্পাইলার বলে।',
      en: 'A translator program that converts an entire high-level source program into machine code at once.',
    },
    ansB: {
      bn: 'প্রোগ্রাম নির্বাহের সময় চলকের মান পরিবর্তন করা যায় (যেমন int sum = 0;), কিন্তু ধ্রুবকের মান পুরো প্রোগ্রামে অপরিবর্তিত থাকে (যেমন const float PI = 3.1416;)।',
      en: 'A variable’s value can change at runtime, whereas a constant remains fixed throughout execution.',
    },
    ansC: {
      bn: 'ধাপ ১: শুরু করি। ধাপ ২: N-এর মান গ্রহণ করি। ধাপ ৩: sum = 0 এবং i = 2 ধরি। ধাপ ৪: যদি i <= N হয় তবে sum = sum + i এবং i = i + 2 করে ধাপ ৪-এ ফিরে যাই; অন্যথায় ধাপ ৫-এ যাই। ধাপ ৫: sum প্রিন্ট করি ও শেষ করি।',
      en: '1. Start. 2. Input N. 3. Set sum = 0, i = 2. 4. While i <= N: sum += i, i += 2. 5. Print sum and Stop.',
    },
    ansD: {
      bn: '#include <stdio.h>\nint main() {\n  int n, i = 2, sum = 0;\n  scanf("%d", &n);\n  while (i <= n) { sum = sum + i; i = i + 2; }\n  printf("Sum = %d", sum);\n  return 0;\n}',
      en: '#include <stdio.h>\nint main() {\n  int n, i = 2, sum = 0;\n  scanf("%d", &n);\n  while (i <= n) { sum += i; i += 2; }\n  printf("Sum = %d", sum);\n  return 0;\n}',
    },
  },

  {
    id: 'cq-chem2-2',
    subjectKey: 'chemistry2',
    chapter: { bn: 'অধ্যায় : তড়িৎ রসায়ন', en: 'Ch: Electrochemistry' },
    boardTag: { bn: 'ঢাকা ও রাজশাহী বোর্ড আদর্শ সৃজনশীল', en: 'Dhaka & Rajshahi Board Standard' },
    stem: {
      bn: '0.1 M কপার সালফেট দ্রবণে 2 A তড়িৎ প্রবাহ 30 মিনিট ধরে চালানো হলো। বিক্রিয়া: Cu²⁺ + 2e⁻ → Cu (Cu = 63.5, F = 96500 C/mol)।',
      en: 'A current of 2 A is passed through 0.1 M copper sulphate solution for 30 minutes. Reaction: Cu²⁺ + 2e⁻ → Cu (Cu = 63.5, F = 96500 C/mol).',
    },
    qA: { bn: 'তড়িৎ বিশ্লেষণ কাকে বলে?', en: 'Define electrolysis.' },
    qB: { bn: 'এই কোষে অ্যানোডে কোন প্রক্রিয়া ঘটে? ব্যাখ্যা করো।', en: 'What happens at the anode in this cell? Explain.' },
    qC: { bn: 'প্রবাহিত মোট চার্জের পরিমাণ নির্ণয় করো।', en: 'Calculate the total charge passed.' },
    qD: { bn: 'ক্যাথোডে জমা তামার ভর নির্ণয় করো।', en: 'Calculate the mass of copper deposited at the cathode.' },
    ansA: {
      bn: 'তড়িৎ প্রবাহের মাধ্যমে কোনো তড়িৎ বিশ্লেষ্যের গলিত বা জলীয় দ্রবণে রাসায়নিক বিক্রিয়া ঘটিয়ে নতুন পদার্থ উৎপন্ন করার প্রক্রিয়াকে তড়িৎ বিশ্লেষণ বলে।',
      en: 'Electrolysis is the chemical change produced in a molten or aqueous electrolyte by passing an electric current through it.',
    },
    ansB: {
      bn: 'অ্যানোডে জারণ ঘটে — দ্রবণের পানির OH⁻ আয়ন ইলেকট্রন ছেড়ে O₂ গ্যাস ও H⁺ উৎপন্ন করে: 4OH⁻ → O₂ + 2H₂O + 4e⁻। (নিষ্ক্রিয় অ্যানোড ব্যবহারে)।',
      en: 'Oxidation occurs at the anode: hydroxide ions from water give up electrons to release O₂ — 4OH⁻ → O₂ + 2H₂O + 4e⁻ (with an inert anode).',
    },
    ansC: {
      bn: 'Q = It = 2 A × (30 × 60) s = 3600 C।',
      en: 'Q = It = 2 A × 1800 s = 3600 C.',
    },
    ansD: {
      bn: 'মোল ইলেকট্রন = 3600 / 96500 = 0.0373 mol। Cu²⁺ + 2e⁻ → Cu অনুযায়ী ২টি ইলেকট্রনে ১টি Cu, তাই Cu-এর মোল = 0.0373 / 2 = 0.01865 mol। ভর = 0.01865 × 63.5 ≈ 1.18 g।',
      en: 'Moles of electrons = 3600/96500 = 0.0373 mol. Since 2 e⁻ deposit 1 Cu, moles of Cu = 0.01865 mol and mass = 0.01865 × 63.5 ≈ 1.18 g.',
    },
  },
  {
    id: 'cq-math2-2',
    subjectKey: 'math2',
    chapter: { bn: 'অধ্যায় : সম্ভাবনা ও কলনবিদ্যা', en: 'Ch: Probability & Calculus' },
    boardTag: { bn: 'চট্টগ্রাম ও বরিশাল বোর্ড আদর্শ সৃজনশীল', en: 'Chattogram & Barishal Board Standard' },
    stem: {
      bn: 'দুটি ন্যায্য ছক্কা একসাথে নিক্ষেপ করা হলো। অন্যদিকে f(x) = x² − 4x একটি ফাংশন।',
      en: 'Two fair dice are thrown together. Separately, f(x) = x² − 4x is a function.',
    },
    qA: { bn: 'নমুনা ক্ষেত্র (Sample space) কাকে বলে?', en: 'Define sample space.' },
    qB: { bn: 'দুই ছক্কায় মোট ৭ না আসার সম্ভাবনা নির্ণয় করো।', en: 'Find the probability that the total is not 7.' },
    qC: { bn: 'দুই ছক্কায় সংখ্যা দুটির গুণফল জোড় হওয়ার সম্ভাবনা নির্ণয় করো।', en: 'Find the probability that the product of the two numbers is even.' },
    qD: { bn: 'f(x) = x² − 4x-এর সর্বনিম্ন মান এবং কোন x-এ তা ঘটে নির্ণয় করো।', en: 'Find the minimum value of f(x) = x² − 4x and the x where it occurs.' },
    ansA: {
      bn: 'কোনো পরীক্ষার সম্ভাব্য সকল ফলাফলের সেটকে নমুনা ক্ষেত্র বলে। দুই ছক্কার ক্ষেত্রে n(S) = 6 × 6 = 36।',
      en: 'The set of all possible outcomes of an experiment is the sample space; for two dice n(S) = 36.',
    },
    ansB: {
      bn: 'মোট ৭ আসার অনুকূল ফল ৬টি — (1,6),(2,5),(3,4),(4,3),(5,2),(6,1)। তাই P(৭) = 6/36 = 1/6, এবং না আসার সম্ভাবনা = 1 − 1/6 = 5/6।',
      en: 'Six outcomes give a total of 7, so P(7) = 1/6 and P(not 7) = 5/6.',
    },
    ansC: {
      bn: 'গুণফল বিজোড় হয় কেবল দুটোই বিজোড় হলে — ৩ × ৩ = ৯টি ফল। তাই জোড় হওয়ার সম্ভাবনা = (36 − 9)/36 = 27/36 = 3/4।',
      en: 'The product is odd only when both are odd (3 × 3 = 9 outcomes), so P(even) = 27/36 = 3/4.',
    },
    ansD: {
      bn: 'f′(x) = 2x − 4 = 0 ⇒ x = 2। f″(x) = 2 > 0, তাই এটি সর্বনিম্ন বিন্দু। f(2) = 4 − 8 = −4।',
      en: 'f′(x) = 2x − 4 = 0 gives x = 2; f″(x) = 2 > 0 so it is a minimum, and f(2) = −4.',
    },
  },
  {
    id: 'cq-bio2-1',
    subjectKey: 'biology2',
    chapter: { bn: 'অধ্যায় : রক্ত ও সঞ্চালন', en: 'Ch: Blood & Circulation' },
    boardTag: { bn: 'ঢাকা ও সিলেট বোর্ড আদর্শ সৃজনশীল', en: 'Dhaka & Sylhet Board Standard' },
    stem: {
      bn: 'একজন শিক্ষার্থীর রক্তচাপ 120/80 mmHg, হৃৎস্পন্দন প্রতি মিনিটে 72 এবং হিমোগ্লোবিন 9 g/dL পাওয়া গেল।',
      en: 'A student has blood pressure 120/80 mmHg, a pulse of 72 beats per minute and haemoglobin of 9 g/dL.',
    },
    qA: { bn: 'হৃৎস্পন্দন (Heart beat) কাকে বলে?', en: 'Define a heartbeat.' },
    qB: { bn: 'সিস্টোল ও ডায়াস্টোল কাকে বলে?', en: 'What are systole and diastole?' },
    qC: { bn: '120/80 mmHg বলতে কী বোঝায়?', en: 'What does 120/80 mmHg mean?' },
    qD: { bn: 'হিমোগ্লোবিন 9 g/dL হলে শরীরে কী প্রভাব পড়তে পারে? ব্যাখ্যা করো।', en: 'What effect can haemoglobin of 9 g/dL have on the body? Explain.' },
    ansA: {
      bn: 'হৃৎপিণ্ডের একবার সংকোচন ও প্রসারণের ফলে রক্ত সঞ্চালনের যে চক্র সম্পন্ন হয়, তাকে একবার হৃৎস্পন্দন বলে।',
      en: 'One complete cycle of contraction and relaxation of the heart that circulates blood is one heartbeat.',
    },
    ansB: {
      bn: 'হৃৎপিণ্ডের সংকোচনকে সিস্টোল (প্রায় ০.৩ সেকেন্ড) এবং প্রসারণকে ডায়াস্টোল (প্রায় ০.৫ সেকেন্ড) বলে।',
      en: 'Contraction of the heart is systole (~0.3 s) and relaxation is diastole (~0.5 s).',
    },
    ansC: {
      bn: 'প্রথম সংখ্যা 120 mmHg হলো সিস্টোলিক চাপ (সংকোচনের সময় ধমনিতে চাপ) এবং 80 mmHg ডায়াস্টোলিক চাপ (প্রসারণের সময়)। পার্থক্য 40 mmHg হলো পালস প্রেসার। এটি স্বাভাবিক সীমার মধ্যেই।',
      en: '120 mmHg is systolic (during contraction) and 80 mmHg diastolic (during relaxation); the difference, 40 mmHg, is the pulse pressure. Both are within the normal range.',
    },
    ansD: {
      bn: 'হিমোগ্লোবিন অক্সিজেন বহন করে; 9 g/dL (স্বাভাবিক ১৩–১৭ g/dL) হলে রক্তাল্পতা হয় — দুর্বলতা, সহজে ক্লান্তি, শ্বাসকষ্ট ও পড়াশোনায় মনোযোগ কমতে পারে। আয়রনসমৃদ্ধ খাবার ও চিকিৎসকের পরামর্শ দরকার।',
      en: 'Haemoglobin carries oxygen; 9 g/dL is below normal (13–17 g/dL) and causes anaemia — fatigue, breathlessness and poor concentration. Iron-rich food and medical advice are needed.',
    },
  },
  {
    id: 'cq-ict-3',
    subjectKey: 'ict',
    chapter: { bn: 'অধ্যায় : সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস', en: 'Ch: Number Systems & Digital Devices' },
    boardTag: { bn: 'সকল বোর্ড আদর্শ সৃজনশীল', en: 'All Boards Standard' },
    stem: {
      bn: 'A = (1101)₂ এবং B = (1011)₂ দুইটি বাইনারি সংখ্যা।',
      en: 'A = (1101)₂ and B = (1011)₂ are two binary numbers.',
    },
    qA: { bn: 'বিট ও বাইটের সম্পর্ক লেখো।', en: 'State the relationship between a bit and a byte.' },
    qB: { bn: 'কম্পিউটারে ঋণাত্মক সংখ্যা প্রকাশে ২-এর পরিপূরক পদ্ধতি কেন বেশি ব্যবহৃত হয়?', en: 'Why is the 2’s complement method preferred for negative numbers?' },
    qC: { bn: 'A + B এর মান বাইনারিতে নির্ণয় করো।', en: 'Find A + B in binary.' },
    qD: { bn: 'A − B এর মান ২-এর পরিপূরক পদ্ধতিতে নির্ণয় করো।', en: 'Find A − B using the 2’s complement method.' },
    ansA: {
      bn: '৮টি বিট = ১ বাইট। বিট হলো বাইনারি অঙ্ক (0 বা 1), আর বাইট হলো কম্পিউটারের মৌলিক স্মৃতিকোষের একক।',
      en: '8 bits make 1 byte; a bit is a binary digit and a byte is the basic unit of memory.',
    },
    ansB: {
      bn: '২-এর পরিপূরকে যোগ ও বিয়োগ একই যোগ-সার্কিট দিয়ে করা যায়, আলাদা বিয়োগ যন্ত্র লাগে না; শূন্যের দুই রূপ ( +0 ও −0) থাকে না এবং গাণিতিক ত্রুটি কম হয়।',
      en: 'Two’s complement lets one adder circuit handle both addition and subtraction, has a single zero and avoids sign errors.',
    },
    ansC: {
      bn: '(1101)₂ = ১৩ এবং (1011)₂ = ১১; যোগফল ২৪ = (11000)₂।',
      en: '(1101)₂ = 13 and (1011)₂ = 11; the sum is 24 = (11000)₂.',
    },
    ansD: {
      bn: 'B-এর ২-এর পরিপূরক: (1011)₂ → ১-এর পরিপূরক 0100 → +1 = 0101। এখন A + 0101 = 1101 + 0101 = (10010)₂; ৪-বিট রেজিস্টারে অতিরিক্ত ক্যারি বাদ দিলে (0010)₂ = ২, যা ১৩ − ১১ = ২-এর সমান।',
      en: '2’s complement of B: 1011 → 0100 + 1 = 0101. Then 1101 + 0101 = 10010; dropping the carry in a 4-bit register gives 0010 = 2, which matches 13 − 11.',
    },
  },
  {
    id: 'cq-ban-1',
    subjectKey: 'bangla',
    chapter: { bn: 'ব্যাকরণ: সন্ধি, কারক ও উপসর্গ', en: 'Grammar: Sandhi, Karok & Prefixes' },
    boardTag: { bn: 'সকল বোর্ড আদর্শ সৃজনশীল', en: 'All Boards Standard' },
    stem: {
      bn: 'বিদ্যালয়ের ছাত্ররা মাঠে খেলছে। অনুগ্রহ করে তুমি একটু বসো।',
      en: 'The students of the school are playing in the field. Please sit down for a moment.',
    },
    qA: { bn: 'সন্ধি কাকে বলে?', en: 'Define sandhi.' },
    qB: { bn: '‘বিদ্যালয়’ শব্দের সন্ধি-বিচ্ছেদ করে সন্ধির প্রকার লেখো।', en: 'Split "বিদ্যালয়" and name the type of sandhi.' },
    qC: { bn: '‘মাঠে’ কোন কারক ও কোন বিভক্তি?', en: 'Which karok and case ending is "মাঠে"?' },
    qD: { bn: '‘অনুগ্রহ’ শব্দের উপসর্গ এবং ‘খেলছে’ ক্রিয়ার কাল নির্ণয় করো।', en: 'Identify the prefix in "অনুগ্রহ" and the tense of "খেলছে".' },
    ansA: {
      bn: 'পাশাপাশি দুটি বর্ণ বা ধ্বনির মিলিত হওয়ার ফলে যে পরিবর্তন ঘটে, তাকে সন্ধি বলে (বাংলা ও সংস্কৃত উভয় ক্ষেত্রেই)।',
      en: 'Sandhi is the change that occurs when two adjacent sounds meet.',
    },
    ansB: {
      bn: 'বিদ্যা + আলয় = বিদ্যালয়। অ-কারের পর আ-কার এলে উভয় মিলে আ-কার হয় — এটি স্বরসন্ধি (দীর্ঘস্বর সন্ধি)।',
      en: 'বিদ্যা + আলয় = বিদ্যালয়: অ + আ becomes আ, a vowel (swara) sandhi.',
    },
    ansC: {
      bn: '‘মাঠে’ অধিকরণ কারকে ৭মী (এ) বিভক্তি — ক্রিয়া সংঘটনের স্থান বোঝাচ্ছে।',
      en: '"মাঠে" is in the locative (অধিকরণ) case with the 7th (এ) ending.',
    },
    ansD: {
      bn: '‘অনুগ্রহ’ = অনু (সংস্কৃত/তৎসম উপসর্গ) + গ্রহ। ‘খেলছে’ বর্তমান কালের ঘটমান (চলমান) রূপ।',
      en: '"অনুগ্রহ" uses the Sanskrit prefix অনু; "খেলছে" is present continuous.',
    },
  },
  {
    id: 'cq-phy2-3',
    subjectKey: 'physics2',
    chapter: { bn: 'অধ্যায় : তড়িৎ প্রবাহের ক্রিয়া', en: 'Ch: Effects of Electric Current' },
    boardTag: { bn: 'যশোর ও দিনাজপুর বোর্ড আদর্শ সৃজনশীল', en: 'Jashore & Dinajpur Board Standard' },
    stem: {
      bn: '12 V বিভবের একটি ব্যাটারির সাথে 10 Ω ও 20 Ω রোধ দুইটি প্রথমে শ্রেণিতে, পরে সমান্তরালে সংযুক্ত করা হলো।',
      en: 'Two resistors of 10 Ω and 20 Ω are connected first in series and then in parallel across a 12 V battery.',
    },
    qA: { bn: 'ওহমের সূত্রটি লেখো।', en: 'State Ohm’s law.' },
    qB: { bn: 'শ্রেণি সংযোগে প্রতিটি রোধে তড়িৎ প্রবাহ সমান হয় কেন?', en: 'Why is the current the same through each resistor in series?' },
    qC: { bn: 'শ্রেণি সংযোগে প্রবাহ ও প্রতিটি রোধের দুই প্রান্তের বিভব পার্থক্য নির্ণয় করো।', en: 'In series, find the current and the voltage across each resistor.' },
    qD: { bn: 'সমান্তরাল সংযোগে মোট প্রবাহ নির্ণয় করে শ্রেণি সংযোগের সাথে তুলনা করো।', en: 'Find the total current in parallel and compare it with the series case.' },
    ansA: {
      bn: 'স্থির তাপমাত্রায় কোনো পরিবাহীর মধ্য দিয়ে প্রবাহিত তড়িৎ প্রবাহ তার দুই প্রান্তের বিভব পার্থক্যের সমানুপাতিক: I ∝ V, অর্থাৎ V = IR।',
      en: 'At constant temperature the current through a conductor is proportional to the potential difference across it: V = IR.',
    },
    ansB: {
      bn: 'শ্রেণি সংযোগে ইলেকট্রন চলার একটিই পথ থাকে; কোনো শাখা না থাকায় একই চার্জ প্রতি সেকেন্ডে প্রতিটি রোধের মধ্য দিয়ে যায়। তাই প্রবাহ অপরিবর্তিত থাকে।',
      en: 'A series circuit offers a single path, so the same charge per second passes every resistor and the current is unchanged.',
    },
    ansC: {
      bn: 'মোট রোধ R = 10 + 20 = 30 Ω। প্রবাহ I = V/R = 12/30 = 0.4 A। 10 Ω-এ V₁ = 0.4 × 10 = 4 V এবং 20 Ω-এ V₂ = 0.4 × 20 = 8 V (মোট 12 V)।',
      en: 'Total resistance 30 Ω, so I = 0.4 A; the 10 Ω resistor drops 4 V and the 20 Ω drops 8 V.',
    },
    ansD: {
      bn: 'সমান্তরালে R_p = (10 × 20)/(10 + 20) = 6.67 Ω। মোট প্রবাহ I = 12/6.67 ≈ 1.8 A — শ্রেণির 0.4 A-এর প্রায় ৪.৫ গুণ, কারণ সমান্তরালে প্রতিটি রোধে পূর্ণ 12 V পাওয়া যায়।',
      en: 'In parallel R_p ≈ 6.67 Ω and total current ≈ 1.8 A — about 4.5× the series current, because each resistor sees the full 12 V.',
    },
  },
];
