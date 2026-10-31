import { FormulaCard } from '../types';

export const FORMULAS: FormulaCard[] = [
  // Physics 1st Paper
  {
    id: 'f-phy1-1',
    subjectKey: 'physics1',
    chapterTitle: { bn: 'অধ্যায় ২: ভেক্টর', en: 'Ch 2: Vectors' },
    title: { bn: 'ভেক্টর লব্ধির মান ও দিক (সামান্তরিক সূত্র)', en: 'Resultant Vector Magnitude & Direction' },
    formula: 'R = √(P² + Q² + 2PQ cosα),   tanθ = (Q sinα) / (P + Q cosα)',
    explanation: {
      bn: 'α হলো P ও Q ভেক্টরের মধ্যবর্তী কোণ এবং θ হলো P ভেক্টরের সাথে লব্ধি R-এর উৎপন্ন কোণ। R_max = P + Q (যখন α = 0°) এবং R_min = |P - Q| (যখন α = 180°)।',
      en: 'α is the angle between vectors P and Q, and θ is the angle R makes with P. R_max = P + Q (at α = 0°) and R_min = |P - Q| (at α = 180°).',
    },
    examTip: {
      bn: 'নদী পারাপারে ন্যূনতম সময়ে পার হতে α = 90° (t_min = d/v) এবং ন্যূনতম দূরত্বে পার হতে cosα = -u/v ব্যবহৃত হয়!',
      en: 'For river crossing: shortest time uses α = 90° (t_min = d/v); shortest path uses cosα = -u/v!',
    },
    boardTag: 'সকল বোর্ড / BUET',
  },
  {
    id: 'f-phy1-2',
    subjectKey: 'physics1',
    chapterTitle: { bn: 'অধ্যায় ৩: গতিবিদ্যা', en: 'Ch 3: Dynamics' },
    title: { bn: 'প্রাসের গতি (সর্বোচ্চ উচ্চতা, বিচরণকাল ও অনুভূমিক পাল্লা)', en: 'Projectile Motion (Max Height, Flight Time & Range)' },
    formula: 'H = (v₀² sin²θ₀) / 2g,   T = (2v₀ sinθ₀) / g,   R = (v₀² sin2θ₀) / g',
    explanation: {
      bn: 'θ₀ নিক্ষেপণ কোণ ও v₀ আদিবেগ হলে অনুভূমিক পাল্লা সর্বোচ্চ হয় যখন θ₀ = 45° (তখন R_max = v₀²/g এবং H = R_max / 4)। এছাড়া tanθ₀ = 4H / R শর্টকাটটি MCQ-তে দারুণ কার্যকর!',
      en: 'Range is maximum at θ₀ = 45° where R_max = v₀²/g. Shortcut relation tanθ₀ = 4H / R solves board MCQs in 5 seconds!',
    },
    examTip: {
      bn: 'θ এবং (90° - θ) উভয় কোণের জন্য অনুভূমিক পাল্লা R সমান থাকে!',
      en: 'Complementary launch angles θ and (90° - θ) yield the exact same horizontal range R!',
    },
    boardTag: 'যশোর, ঢাকা ও রাজশাহী বোর্ড',
  },
  {
    id: 'f-phy1-3',
    subjectKey: 'physics1',
    chapterTitle: { bn: 'অধ্যায় ৪: নিউটনিয়ান বলবিদ্যা', en: 'Ch 4: Newtonian Mechanics' },
    title: { bn: 'রাস্তার ব্যাংকিং কোণ ও নিরাপদ বেগ', en: 'Banking of Roads & Safe Turning Speed' },
    formula: 'tanθ = v² / rg = h / w',
    explanation: {
      bn: 'বাঁকের ব্যাসার্ধ r, ব্যাংকিং কোণ θ, রাস্তার প্রস্থ w এবং বাইরের প্রান্তের উচ্চতা h (যখন θ খুব ক্ষুদ্র, sinθ ≈ tanθ = h/w)।',
      en: 'r = radius of curvature, θ = banking angle, w = width of road, h = elevation of outer edge (for small θ, sinθ ≈ tanθ = h/w).',
    },
    examTip: {
      bn: 'অঙ্কে বেগ km/h এককে দেওয়া থাকলে অবশ্যই 3.6 দিয়ে ভাগ করে m/s এ নিয়ে নেবে!',
      en: 'Always convert velocity from km/h to m/s (divide by 3.6) before substituting!',
    },
    boardTag: 'সকল বোর্ড CQ',
  },
  {
    id: 'f-phy1-4',
    subjectKey: 'physics1',
    chapterTitle: { bn: 'অধ্যায় ৫: কাজ, শক্তি ও ক্ষমতা', en: 'Ch 5: Work, Energy & Power' },
    title: { bn: 'কুয়া বা চৌবাচ্চা হতে পানি উত্তোলনে গড় গভীরতা ও ক্ষমতা', en: 'Pumping Water from Well/Tank & Efficiency' },
    formula: 'P_out = (m · g · h_avg) / t,    η = (P_out / P_in) × 100%',
    explanation: {
      bn: 'পূর্ণ কুয়া সম্পূর্ণ খালি করতে h_avg = L/2; অর্ধপূর্ণ কুয়া খালি করতে উপর হতে খালি অংশ l₀ + বাকি অংশের অর্ধেক (h_avg = L/2 + L/4 = 3L/4)।',
      en: 'For emptying a full well of depth L: h_avg = L/2. For a half-filled well: h_avg = 3L/4.',
    },
    examTip: {
      bn: '১ অশ্বক্ষমতা (1 HP) = 746 Watt। পানির ঘনত্ব ρ = 1000 kg/m³ হলে m = πr²Lρ।',
      en: '1 Horsepower (HP) = 746 W. Mass of water in cylindrical well: m = πr²L × 1000 kg.',
    },
    boardTag: 'ঢাকা ও যশোর বোর্ড CQ হট টপিক',
  },
  {
    id: 'f-phy1-5',
    subjectKey: 'physics1',
    chapterTitle: { bn: 'অধ্যায় ৮: পর্যাবৃত্ত গতি', en: 'Ch 8: Periodic Motion' },
    title: { bn: 'সরল দোলকের দোলনকাল ও পাহাড়ের উচ্চতা নির্ণয়', en: 'Simple Pendulum Period & Mountain Height' },
    formula: 'T = 2π √(L / g),    h = (T₂ / T₁ - 1) · R',
    explanation: {
      bn: 'ভূপৃষ্ঠে দোলনকাল T₁ এবং পাহাড়ের চূড়ায় T₂ হলে পৃথিবীর ব্যাসার্ধ R = 6400 km ব্যবহার করে সহজেই উচ্চতা h বের করা যায়। সেকেন্ড দোলকের দোলনকাল T = 2s (কার্যকরী দৈর্ঘ্য ≈ 0.993 m)।',
      en: 'Using surface period T₁ and peak period T₂ with Earth radius R = 6400 km gives mountain height h. For a seconds pendulum, T = 2s.',
    },
    examTip: {
      bn: 'খনিগর্ভে অভিকর্ষজ ত্বরণ g′ = g(1 - d/R), তাই খনিতেও ঘড়ি ধীরে চলে!',
      en: 'Inside a mine of depth d, g′ = g(1 - d/R), so a pendulum clock runs slower both on mountains and in mines!',
    },
    boardTag: 'সকল বোর্ড',
  },
  {
    id: 'f-phy1-6',
    subjectKey: 'physics1',
    chapterTitle: { bn: 'অধ্যায় ১০: আদর্শ গ্যাস', en: 'Ch 10: Ideal Gas' },
    title: { bn: 'গ্যাস অণুর মূল গড় বর্গবেগ (RMS Velocity) ও গতিশক্তি', en: 'RMS Velocity & Kinetic Energy of Gas' },
    formula: 'C_rms = √(3RT / M) = √(3PV / m) = √(3P / ρ),    E_k = (f / 2) nRT',
    explanation: {
      bn: 'এখানে M অবশ্যই kg/mol এককে বসাতে হবে (যেমন O₂ এর জন্য M = 0.032 kg/mol)! একপরমাণুক গ্যাসে f = 3, দ্বিপরমাণুক গ্যাসে f = 5, বহুপরমাণুক গ্যাসে f = 6।',
      en: 'Molar mass M MUST be in kg/mol (e.g. O₂ = 0.032 kg/mol)! Degrees of freedom f = 3 (monatomic), 5 (diatomic), 6 (polyatomic).',
    },
    examTip: {
      bn: 'তাপমাত্রা কেলভিন (K = °C + 273) এককে রূপান্তর করতে কখনো ভুলবে না!',
      en: 'Never forget to convert temperature to Kelvin (T = °C + 273) and M to kg/mol!',
    },
    boardTag: 'মেডিকেল ও ইঞ্জিনিয়ারিং',
  },

  // Physics 2nd Paper
  {
    id: 'f-phy2-1',
    subjectKey: 'physics2',
    chapterTitle: { bn: 'অধ্যায় ১: তাপগতিবিদ্যা', en: 'Ch 1: Thermodynamics' },
    title: { bn: 'কার্নো ইঞ্জিনের কর্মদক্ষতা ও এনট্রপির পরিবর্তন', en: 'Carnot Engine Efficiency & Entropy Change' },
    formula: 'η = (1 - T₂ / T₁) × 100% = (1 - Q₂ / Q₁) × 100%,    dS = dQ / T',
    explanation: {
      bn: 'T₁ = তাপ উৎসের তাপমাত্রা (K) এবং T₂ = তাপ গ্রাহকের তাপমাত্রা (K)। তাপমাত্রা পরিবর্তনের ক্ষেত্রে dS = m·s·ln(T₂/T₁)।',
      en: 'T₁ = source temp (K), T₂ = sink temp (K). When temperature changes during heating, ΔS = m·s·ln(T₂/T₁).',
    },
    examTip: {
      bn: 'কর্মদক্ষতা বাড়াতে উৎস T₁ যতটুকু বাড়ানো হয়, গ্রাহক T₂ সমপরিমাণ কমালে কর্মদক্ষতা বেশি বৃদ্ধি পায়!',
      en: 'Lowering sink temperature T₂ by ΔT increases efficiency MORE than raising source T₁ by the same ΔT!',
    },
    boardTag: 'যশোর ও ঢাকা বোর্ড',
  },
  {
    id: 'f-phy2-2',
    subjectKey: 'physics2',
    chapterTitle: { bn: 'অধ্যায় ৩: চল তড়িৎ', en: 'Ch 3: Current Electricity' },
    title: { bn: 'শান্টের রোধ ও হুইটস্টোন ব্রিজের সাম্যাবস্থা', en: 'Shunt Resistance & Wheatstone Bridge Balance' },
    formula: 'S = G / (n - 1),    P / Q = R / S',
    explanation: {
      bn: 'গ্যালভানোমিটারের রোধ G এবং পাল্লা n গুণ বাড়াতে সমান্তরালে যুক্ত ক্ষুদ্র রোধ S = G/(n-1)। মূল প্রবাহ I হলে গ্যালভানোমিটার প্রবাহ I_g = S·I / (G + S)।',
      en: 'To increase ammeter range n times, connect parallel shunt S = G/(n-1). At bridge balance, P/Q = R/S.',
    },
    examTip: {
      bn: 'চতুর্থ বাহুতে অতিরিক্ত কত রোধ কীভাবে যুক্ত করতে হবে তা বের করতে আগে প্রয়োজনীয় তুল্য রোধ X বের করে নাও!',
      en: 'First find required 4th-arm resistance X = (Q/P)·R; if X < existing R₄ connect parallel, if X > R₄ connect series!',
    },
    boardTag: 'সকল বোর্ড CQ',
  },
  {
    id: 'f-phy2-3',
    subjectKey: 'physics2',
    chapterTitle: { bn: 'অধ্যায় ৮ ও ৯: আধুনিক ও নিউক্লিয়ার পদার্থবিজ্ঞান', en: 'Ch 8 & 9: Modern & Nuclear Physics' },
    title: { bn: 'আইনস্টাইনের ফটোতড়িৎ সমীকরণ ও তেজস্ক্রিয় অর্ধায়ু', en: 'Photoelectric Equation & Radioactive Half-Life' },
    formula: 'hf = W₀ + K_max = hf₀ + eV_s,    T₁/₂ = 0.693 / λ,    N = N₀ e^(-λt)',
    explanation: {
      bn: 'সূচন কম্পাঙ্ক f₀, নিবৃত্তি বিভব V_s, ক্ষয় ধ্রুবক λ এবং গড় আয়ু τ = 1/λ। তাই T₁/₂ = 0.693 τ।',
      en: 'f₀ = threshold frequency, V_s = stopping potential, λ = decay constant, mean life τ = 1/λ.',
    },
    examTip: {
      bn: 'n সংখ্যক অর্ধায়ু পর অক্ষত পরমাণু থাকে N = N₀ / (2ⁿ)!',
      en: 'Shortcut: After n half-lives, remaining undecayed nuclei N = N₀ / (2ⁿ)!',
    },
    boardTag: 'BUET / বোর্ড MCQ',
  },

  // Chemistry 1st Paper
  {
    id: 'f-chem1-1',
    subjectKey: 'chemistry1',
    chapterTitle: { bn: 'অধ্যায় ২: গুণগত রসায়ন', en: 'Ch 2: Qualitative Chemistry' },
    title: { bn: 'হাইড্রোজেন বর্ণালির রিডবার্গ সমীকরণ ও সিরিজসমূহ', en: 'Rydberg Formula & Hydrogen Spectral Series' },
    formula: '1 / λ = R_H · Z² · (1 / n₁² - 1 / n₂²),   R_H = 1.09678 × 10⁷ m⁻¹',
    explanation: {
      bn: 'n₁ = 1 (লাইম্যান - UV), n₁ = 2 (বামার - দৃশ্যমান আলো), n₁ = 3 (প্যাশ্চেন - IR), n₁ = 4 (ব্র্যাকেট), n₁ = 5 (ফুন্ড), n₁ = 6 (হামফ্রিস)।',
      en: 'n₁ = 1 (Lyman - UV), n₁ = 2 (Balmer - Visible), n₁ = 3 (Paschen - IR), n₁ = 4 (Brackett), n₁ = 5 (Pfund).',
    },
    examTip: {
      bn: 'জাল টাকা ও পাসপোর্ট শনাক্তকরণে UV রশ্মি এবং MRI যন্ত্রে রেডিও ওয়েভ ব্যবহৃত হয়!',
      en: 'UV rays detect forged banknotes; MRI uses radio waves without ionizing radiation!',
    },
    boardTag: 'মেডিকেল ও সকল বোর্ড',
  },
  {
    id: 'f-chem1-2',
    subjectKey: 'chemistry1',
    chapterTitle: { bn: 'অধ্যায় ৩: রাসায়নিক বন্ধন', en: 'Ch 3: Chemical Bonding' },
    title: { bn: 'সংকরায়ন (Hybridization) নির্ণয়ের জাদুকরী সূত্র', en: 'Instant Hybridization Formula' },
    formula: 'H = ½ × [V + X - C + A]',
    explanation: {
      bn: 'V = কেন্দ্রীয় পরমাণুর যোজ্যতা ইলেকট্রন, X = একযোজী পরমাণুর সংখ্যা (H, F, Cl, Br, I), C = ক্যাটায়নের চার্জ, A = অ্যানায়নের চার্জ। H = 2 (sp), 3 (sp²), 4 (sp³), 5 (sp³d), 6 (sp³d²)।',
      en: 'V = valence electrons of central atom, X = monovalent atoms attached, C = cationic charge, A = anionic charge.',
    },
    examTip: {
      bn: 'CH₄ (sp³, 109.5°), NH₃ (sp³, 107° — ১টি মুক্তজোড়), H₂O (sp³, 104.5° — ২টি মুক্তজোড়)!',
      en: 'Lone pairs compress bond angles: CH₄ (109.5°) > NH₃ (107°) > H₂O (104.5°)!',
    },
    boardTag: 'সকল বোর্ড + ভর্তি পরীক্ষা',
  },
  {
    id: 'f-chem1-3',
    subjectKey: 'chemistry1',
    chapterTitle: { bn: 'অধ্যায় ৪: রাসায়নিক পরিবর্তন', en: 'Ch 4: Chemical Changes' },
    title: { bn: 'Kp ও Kc সম্পর্ক এবং হ্যান্ডারসন-হ্যাসেলবাক বাফার সমীকরণ', en: 'Kp-Kc Relation & Henderson-Hasselbalch Equation' },
    formula: 'K_p = K_c (RT)^Δn,    pH = pK_a + log([লবণ / Salt] / [অম্ল / Acid])',
    explanation: {
      bn: 'Δn = (গ্যাসীয় উৎপাদের মোল সংখ্যা - গ্যাসীয় বিক্রিয়কের মোল সংখ্যা)। ক্ষারীয় বাফারের ক্ষেত্রে: pOH = pK_b + log([লবণ]/[ক্ষার]) এবং pH = 14 - pOH।',
      en: 'Δn = moles of gaseous products minus gaseous reactants. For basic buffers: pOH = pK_b + log([Salt]/[Base]).',
    },
    examTip: {
      bn: 'মানব রক্তের pH ৭.৩৫ – ৭.৪৫ (বাইকার্বোনেট বাফার H₂CO₃ / HCO₃⁻ দ্বারা নিয়ন্ত্রিত)।',
      en: 'Human blood pH is strictly maintained between 7.35 and 7.45 primarily by bicarbonate buffer!',
    },
    boardTag: 'যশোর, রাজশাহী ও ঢাকা বোর্ড',
  },

  // Chemistry 2nd Paper
  {
    id: 'f-chem2-1',
    subjectKey: 'chemistry2',
    chapterTitle: { bn: 'অধ্যায় ২: জৈব রসায়ন', en: 'Ch 2: Organic Chemistry' },
    title: { bn: 'অ্যালডিহাইড ও কিটোন পার্থক্যকরণ (টলেন ও ফেহলিং বিকারক)', en: 'Aldehyde vs Ketone (Tollens & Fehlings Test)' },
    formula: 'R-CHO + 2[Ag(NH₃)₂]OH  →  R-COONH₄ + 2Ag↓ (সিলভার দর্পণ) + 3NH₃ + H₂O',
    explanation: {
      bn: 'অ্যালডিহাইড (-CHO) টলেন বিকারকের সাথে সিলভার দর্পণ এবং ফেহলিং দ্রবণের সাথে Cu₂O-এর লালচে অধঃক্ষেপ দেয়, কিন্তু কিটোন (-CO-) দেয় না। উভয়েই 2,4-DNPH এর সাথে হলুদ/কমলা অধঃক্ষেপ দেয়।',
      en: 'Aldehydes give a silver mirror with Tollens reagent and brick-red Cu₂O ppt with Fehlings solution; ketones do not.',
    },
    examTip: {
      bn: 'CH₃-CO- মূলকযুক্ত যৌগ (যেমন ইথান্যাল, প্রোপানোন, ইথানল) আয়োডোফর্ম বিক্রিয়ায় হলুদ CHI₃ অধঃক্ষেপ দেয়!',
      en: 'Compounds with CH₃-CO- or CH₃-CH(OH)- give yellow CHI₃ precipitate in the Haloform/Iodoform test!',
    },
    boardTag: 'সকল বোর্ড জৈব রসায়ন CQ',
  },
  {
    id: 'f-chem2-2',
    subjectKey: 'chemistry2',
    chapterTitle: { bn: 'অধ্যায় ৩ ও ৪: পরিমাণগত ও তড়িৎ রসায়ন', en: 'Ch 3 & 4: Quantitative & Electrochemistry' },
    title: { bn: 'মোলারিটি, ফ্যারাডের ১ম সূত্র ও নার্নস্ট সমীকরণ', en: 'Molarity, Faradays Law & Nernst Equation' },
    formula: 'S = (1000 · w) / (M · V_mL),   W = ZIt = (M · I · t) / (e · F),   E_cell = E°_cell - (RT/nF) ln Q',
    explanation: {
      bn: '1 Faraday (F) = 96500 C/mol। ২৫°C তাপমাত্রায় E_cell = E°_cell - (0.0592 / n) log Q। শতকরা ঘনমাত্রা x% থেকে মোলারিটি S = (10x) / M!',
      en: '1 F = 96500 C/mol. Shortcut from w/v percentage x% to Molarity: S = (10x) / M!',
    },
    examTip: {
      bn: 'E°_cell ধনাত্মক (+) হলে কোষ বিক্রিয়া স্বতঃস্ফূর্তভাবে ঘটবে, ঋণাত্মক (-) হলে পাত্রে দ্রবণ রাখা নিরাপদ!',
      en: 'If E°_cell > 0, reaction is spontaneous (container corrodes!); if E°_cell < 0, storing solution in that metal pot is safe!',
    },
    boardTag: 'সকল বোর্ড',
  },

  // Higher Math 1st & 2nd Paper
  {
    id: 'f-math1-1',
    subjectKey: 'math1',
    chapterTitle: { bn: 'অধ্যায় ৩ ও ৪: সরলরেখা ও বৃত্ত', en: 'Ch 3 & 4: Straight Lines & Circles' },
    title: { bn: 'লম্ব দূরত্ব ও বৃত্তের সাধারণ সমীকরণ এবং স্পর্শক শর্ত', en: 'Perpendicular Distance & Circle Equations' },
    formula: 'd = |ax₁ + by₁ + c| / √(a² + b²),    x² + y² + 2gx + 2fy + c = 0',
    explanation: {
      bn: 'বৃত্তের কেন্দ্র (-g, -f), ব্যাসার্ধ r = √(g² + f² - c)। x-অক্ষের খণ্ডিতাংশ = 2√(g² - c) এবং y-অক্ষের খণ্ডিতাংশ = 2√(f² - c)। কোনো রেখা বৃত্তকে স্পর্শ করবে যদি কেন্দ্র হতে লম্ব দূরত্ব = ব্যাসার্ধ r হয়!',
      en: 'Circle center (-g, -f), radius r = √(g² + f² - c). x-intercept = 2√(g² - c). Line touches circle iff center-to-line distance equals r.',
    },
    examTip: {
      bn: 'বৃত্ত x-অক্ষকে স্পর্শ করলে g² = c এবং y-অক্ষকে স্পর্শ করলে f² = c!',
      en: 'If circle touches x-axis: g² = c (r = |f|); if it touches y-axis: f² = c (r = |g|)!',
    },
    boardTag: 'সকল বোর্ড + BUET',
  },
  {
    id: 'f-math1-2',
    subjectKey: 'math1',
    chapterTitle: { bn: 'অধ্যায় ৯ ও ১০: অন্তরীকরণ ও যোগজীকরণ', en: 'Ch 9 & 10: Calculus (Diff & Integration)' },
    title: { bn: 'গোল্ডেন ক্যালকুলাস সূত্রসমূহ ও L’Hospital Rule', en: 'Golden Calculus Identities & By-Parts Rule' },
    formula: 'd/dx (u·v) = u dv/dx + v du/dx,    ∫ u v dx = u ∫v dx - ∫ [du/dx · ∫v dx] dx',
    explanation: {
      bn: 'যোগজীকরণে u নির্বাচনে LIATE নিয়ম মেনে চলো (Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential)। গুরুমানের জন্য d²y/dx² < 0 এবং লঘুমানের জন্য d²y/dx² > 0।',
      en: 'Choose u in integration by parts using LIATE priority. At stationary point dy/dx = 0: d²y/dx² < 0 gives local maximum.',
    },
    examTip: {
      bn: 'MCQ শর্টকাট: ∫ eˣ [f(x) + f′(x)] dx = eˣ f(x) + c — প্রায় প্রতি বছর বোর্ডে আসে!',
      en: 'Board MCQ classic shortcut: ∫ eˣ [f(x) + f′(x)] dx = eˣ f(x) + c!',
    },
    boardTag: '১০০% কমন টপিক',
  },
  {
    id: 'f-math2-1',
    subjectKey: 'math2',
    chapterTitle: { bn: 'অধ্যায় ৩ ও ৬: জটিল সংখ্যা ও কণিক', en: 'Ch 3 & 6: Complex Numbers & Conics' },
    title: { bn: 'এককের ঘনমূল (ω) এবং কণিকের উৎকেন্দ্রিকতা (e)', en: 'Cube Roots of Unity & Conic Eccentricity' },
    formula: '1 + ω + ω² = 0,  ω³ = 1  |  e_উপবৃত্ত = √(1 - b²/a²),  e_অধিবৃত্ত = √(1 + b²/a²)',
    explanation: {
      bn: 'পরাবৃত্তের জন্য e = 1 (y² = 4ax এর উপকেন্দ্র (a,0), উপকেন্দ্রিক লম্বের দৈর্ঘ্য 4a)। উপবৃত্তে 0 < e < 1 (উপকেন্দ্রিক লম্ব = 2b²/a) এবং অধিবৃত্তে e > 1।',
      en: 'Parabola: e = 1; Circle: e = 0; Ellipse: 0 < e < 1 (latus rectum 2b²/a); Hyperbola: e > 1.',
    },
    examTip: {
      bn: 'i⁴ⁿ = 1, i⁴ⁿ⁺¹ = i, i⁴ⁿ⁺² = -1, i⁴ⁿ⁺³ = -i — চারটি ক্রমিক ঘাতের যোগফল সর্বদা শূন্য (0)!',
      en: 'Sum of any 4 consecutive integer powers of i (iⁿ + iⁿ⁺¹ + iⁿ⁺² + iⁿ⁺³) is always 0!',
    },
    boardTag: 'যশোর, ঢাকা ও চট্টগ্রাম বোর্ড',
  },

  // Biology 1st & 2nd Paper
  {
    id: 'f-bio1-1',
    subjectKey: 'biology1',
    chapterTitle: { bn: 'অধ্যায় ৭ ও ৯: আবৃতবীজী ও উদ্ভিদ শারীরতত্ত্ব', en: 'Ch 7 & 9: Angiosperms & Plant Physiology' },
    title: { bn: 'Poaceae বনাম Malvaceae এবং C3 বনাম C4 উদ্ভিদ', en: 'Poaceae vs Malvaceae & C3 vs C4 Plants' },
    formula: 'C₃ প্রথম স্থায়ী পদার্থ: 3-PGA (3C)  |  C₄ প্রথম স্থায়ী পদার্থ: অক্সালো অ্যাসিটিক এসিড (4C)',
    explanation: {
      bn: 'Poaceae (ধান, গম, ভুট্টা, আখ): পুষ্পবিন্যাস স্পাইকলেট, পরাগধানী সর্বমুখ, ফল ক্যারিওপসিস। Malvaceae (জবা, ঢেঁড়স, কার্পাস): উপবৃতি যুক্ত, পুংকেশর একগুচ্ছক, পরাগধানী বৃক্কাকার ও কণ্টকিত পরাগরেণু, অমরাবিন্যাস অক্ষীয়।',
      en: 'C4 plants (maize, sugarcane, amaranth) show Kranz anatomy in leaves and thrive in high light & 30°–45°C.',
    },
    examTip: {
      bn: 'সালোকসংশ্লেষণে নির্গত O₂ আসে পানি (H₂O) থেকে, CO₂ থেকে নয় (রুবেন ও কামেনের তেজস্ক্রিয় পরীক্ষা)!',
      en: 'All O₂ released during photosynthesis comes from photolysis of H₂O, NOT from CO₂!',
    },
    boardTag: 'মেডিকেল + বোর্ড',
  },
  {
    id: 'f-bio2-1',
    subjectKey: 'biology2',
    chapterTitle: { bn: 'অধ্যায় ৩, ৪ ও ১১: মানব শারীরতত্ত্ব ও জিনতত্ত্ব', en: 'Ch 3, 4 & 11: Physiology & Genetics' },
    title: { bn: 'দাঁতের সংকেত, কার্ডিয়াক চক্র (0.8s) ও মেন্ডেলের ব্যতিক্রম অনুপাত', en: 'Dental Formula, Cardiac Cycle & Genetic Ratios' },
    formula: 'পূর্ণবয়স্ক দন্ত সংকেত: I₂C₁P₂M₃ / I₂C₁P₂M₃ = ৩২  |  BMI = ওজন (kg) / [উচ্চতা (m)]²',
    explanation: {
      bn: 'মেন্ডেলের ১ম সূত্র (3:1) এর ব্যতিক্রম: অসম্পূর্ণ প্রকটতা ও সমপ্রকটতা (1:2:1), মারণ জিন (2:1)। ২য় সূত্র (9:3:3:1) এর ব্যতিক্রম: পরিপূরক জিন (9:7), প্রকট এপিস্ট্যাসিস (13:3), দ্বৈত প্রচ্ছন্ন এপিস্ট্যাসিস (9:7)।',
      en: 'Atrial systole = 0.1s, diastole = 0.7s; Ventricular systole = 0.3s, diastole = 0.5s (at 75 bpm).',
    },
    examTip: {
      bn: 'দুধ দাঁতে অগ্রপেষণ (Premolar) থাকে না — দুধ দাঁতের সংকেত I₂C₁P₀M₂ (মোট ২০টি)!',
      en: 'Milk teeth have ZERO premolars (I₂C₁P₀M₂ × 2 = 20 teeth total) — classic Medical & HSC MCQ trap!',
    },
    boardTag: 'মেডিকেল হট টপিক',
  },

  // ICT
  {
    id: 'f-ict-1',
    subjectKey: 'ict',
    chapterTitle: { bn: 'অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস', en: 'Ch 3: Number Systems & Logic Gates' },
    title: { bn: 'ডি-মরগ্যানের উপপাদ্য ও সার্বজনীন গেইট (NAND / NOR)', en: 'De Morgans Theorems & Universal Gates' },
    formula: '(A + B)′ = A′ · B′,    (A · B)′ = A′ + B′,    A ⊕ B = A′B + AB′',
    explanation: {
      bn: '২-এর পরিপূরক (2’s Complement) = ১-এর পরিপূরক (সব বিট উল্টিয়ে) + 1। হাফ অ্যাডারে Sum S = A ⊕ B এবং Carry C = A · B। দুটি হাফ অ্যাডার ও ১টি OR গেইট দিয়ে ফুল অ্যাডার তৈরি হয়।',
      en: '2s Complement = 1s Complement + 1. Half Adder: S = A ⊕ B, C = AB. Full Adder = 2 Half Adders + 1 OR gate.',
    },
    examTip: {
      bn: 'NAND দিয়ে NOT করতে ১টি, AND করতে ২টি, OR করতে ৩টি এবং XOR করতে ৪টি NAND গেইট লাগে!',
      en: 'Minimum NAND gates needed: NOT = 1, AND = 2, OR = 3, XOR = 4!',
    },
    boardTag: 'ICT ১০০% নিশ্চিত CQ/MCQ',
  },
  {
    id: 'f-ict-2',
    subjectKey: 'ict',
    chapterTitle: { bn: 'অধ্যায় ৪ ও ৫: HTML এবং C প্রোগ্রামিং', en: 'Ch 4 & 5: HTML & C Programming' },
    title: { bn: 'HTML টেবিল/লিংক ট্যাগ এবং C ফরম্যাট স্পেসিফায়ার', en: 'HTML Core Syntax & C Format Specifiers' },
    formula: '<a href="url">Text</a>  |  %d (int), %f (float), %lf (double), %c (char), %s (string)',
    explanation: {
      bn: 'HTML-এ ফাঁকা (Empty) ট্যাগ: <br>, <hr>, <img>, <input>, <meta>। টেবিলে পাশাপাশি ঘর জোড়া দিতে colspan এবং উপর-নিচ ঘর জোড়া দিতে rowspan ব্যবহৃত হয়।',
      en: 'Empty HTML tags (no closing tag): <br>, <hr>, <img>, <input>. In C, do-while loop executes at least ONCE even if condition is false!',
    },
    examTip: {
      bn: 'C ভাষায় ভ্যারিয়েবলের নাম কখনো অঙ্ক (digit) দিয়ে শুরু হতে পারে না এবং স্পেস থাকতে পারে না!',
      en: 'C identifiers can only contain letters, digits & underscore (_), and MUST NOT start with a digit!',
    },
    boardTag: 'সকল বোর্ড',
  },

  // Bangla & English
  {
    id: 'f-ban-1',
    subjectKey: 'bangla',
    chapterTitle: { bn: 'বাংলা ২য় পত্র: প্রমিত বাংলা বানানের নিয়ম', en: 'Bangla 2nd Paper: Standard Spelling Rules' },
    title: { bn: 'ণত্ব-ষত্ব বিধান ও তৎসম-অতৎসম শব্দের ই-কার/ঈ-কার নিয়ম', en: 'Bangla Academy Core Spelling Rules' },
    formula: 'অতৎসম (তদ্ভব, দেশি, বিদেশি) শব্দে সর্বদা ই-কার (ি) ও উ-কার (ু) এবং দন্ত্য-ন / দন্ত্য-স হয়',
    explanation: {
      bn: 'যেমন: বাড়ি, গাড়ি, পাখি, চুন, ফটোস্ট্যাট, স্টোর (বিদেশি শব্দে ষ হয় না!)। ‘অঞ্জলি’ বা ‘আবলি’ প্রত্যয়ান্ত শব্দে হ্রস্ব ই-কার হয়: গীতাঞ্জলি, শ্রদ্ধাঞ্জলি, তথ্যাবলি, কার্যাবলি।',
      en: 'Foreign words never take ষ or ণ (e.g., ফটোস্ট্যাট, স্টেশন, কর্নেল). Words ending in -অঞ্জলি/-আবলি always take হ্রস্ব ই-কার.',
    },
    examTip: {
      bn: 'দূরত্ব বোঝালে ‘দূর’ (দীর্ঘ ঊ-কার: দূরবীক্ষণ, দূরপাল্লা), কিন্তু খারাপ/কষ্ট বোঝালে ‘দুর’ (হ্রস্ব উ-কার: দুরবস্থা, দুরন্ত, দুর্নীতি)!',
      en: 'Distance = দূর (দূরত্ব, দূরদৃষ্টি); Bad/Hardship = দুর (দুরবস্থা, দুরাকাঙ্ক্ষা — NOT দুরাবস্থা)!',
    },
    boardTag: 'বাংলা ২য় পত্র আবশ্যিক',
  },
  {
    id: 'f-eng-1',
    subjectKey: 'english',
    chapterTitle: { bn: 'English 2nd Paper: Right Form of Verbs & Completing', en: 'English 2nd Paper: High-Yield Grammar Rules' },
    title: { bn: 'Conditionals, Lest, As if / As though & Would you mind', en: 'Golden HSC Grammar Structures' },
    formula: '3rd Cond: If + Past Perfect → would/could/might have + V₃  |  Lest + Sub + should/might + V₁',
    explanation: {
      bn: '১) With a view to / look forward to / get used to / would you mind + (V + ing)। ২) Present Indefinite + as if / as though + Past Indefinite (be verb হলে were); আর Past Indefinite + as if + Past Perfect।',
      en: '1) "With a view to / look forward to / cannot help" take Gerund (V+ing). 2) "It is high time + Subject + V₂ (Past Simple)".',
    },
    examTip: {
      bn: 'No sooner had ... than + V₂ | Scarcely had ... when + V₂ | Hardly had ... when/before + V₂!',
      en: 'Watch pair connectors carefully: No sooner had ... THAN (not when!), Hardly/Scarcely had ... WHEN!',
    },
    boardTag: 'HSC English ১০০% কমন',
  },
  // EXPANDED HSC 2028 SCIENCE FORMULA & REVISION DECK
  {
    id: 'f-phy1-7',
    subjectKey: 'physics1',
    chapterTitle: { bn: 'অধ্যায় ৬: মহাকর্ষ ও অভিকর্ষ', en: 'Ch 6: Gravitation & Gravity' },
    title: { bn: 'মুক্তিবেগ ও কৃত্রিম উপগ্রহের কক্ষীয় বেগ', en: 'Escape Velocity & Orbital Speed of Satellite' },
    formula: 'v_e = √(2gR) = √(2GM / R) ≈ 11.2 km/s,   v_o = √[GM / (R + h)]',
    explanation: {
      bn: 'ভূপৃষ্ঠের সন্নিকটে (h ≈ 0) v_e = √2 · v_o! অর্থাৎ কৃত্রিম উপগ্রহের বেগ √2 গুণ বা প্রায় 41.4% বাড়ালেই তা মহাশূন্যে মুক্তি পায়।',
      en: 'Near Earth’s surface v_e = √2 · v_o. Increasing orbital speed by ~41.4% allows escape from Earth’s gravity.',
    },
    examTip: {
      bn: 'মুক্তিবেগ বস্তুর ভরের (m) ওপর নির্ভর করে না — একটি পাথর ও রকেটের মুক্তিবেগ সমান!',
      en: 'Escape velocity is independent of the projectile’s mass m!',
    },
    boardTag: 'সকল বোর্ড / BUET',
  },
  {
    id: 'f-phy2-4',
    subjectKey: 'physics2',
    chapterTitle: { bn: 'অধ্যায় ৮: আধুনিক পদার্থবিজ্ঞানের সূচনা', en: 'Ch 8: Modern Physics' },
    title: { bn: 'আইনস্টাইনের আলোক-তড়িৎ সমীকরণ ও আপেক্ষিকতা', en: 'Photoelectric Equation & Relativistic Dilation' },
    formula: 'hf = hf₀ + K_max = W₀ + eV_s,    t = t₀ / √(1 - v²/c²)',
    explanation: {
      bn: 'f₀ হলো সূচনা কম্পাঙ্ক (Threshold frequency) এবং V_s নিবৃত্তি বিভব। গতিশীল কাঠামোতে ঘড়ি ধীরে চলে (Time dilation) এবং দৈর্ঘ্য সংকুচিত হয় L = L₀√(1 - v²/c²)।',
      en: 'hf₀ is work function W₀ and V_s is stopping potential. Moving clocks run slower and lengths contract.',
    },
    examTip: {
      bn: 'নিবৃত্তি বিভব V_s আপতিত আলোর কম্পাঙ্কের ওপর নির্ভর করে, তীব্রতার (Intensity) ওপর নয়!',
      en: 'Stopping potential depends on light frequency, NOT intensity!',
    },
    boardTag: 'BUET ও ঢাবি ক',
  },
  {
    id: 'f-chem2-3',
    subjectKey: 'chemistry2',
    chapterTitle: { bn: 'অধ্যায় ২: জৈব রসায়ন', en: 'Ch 2: Organic Chemistry' },
    title: { bn: 'মার্কনিকভ নিয়ম, ওজোনীকরণ ও হফম্যান ক্ষুদ্রাংশকরণ', en: 'Markovnikov, Ozonolysis & Hofmann Degradation' },
    formula: 'R-CONH₂ + Br₂ + 4KOH → R-NH₂ + K₂CO₃ + 2KBr + 2H₂O',
    explanation: {
      bn: 'হফম্যান বিক্রিয়ায় অ্যামাইড থেকে ১ কার্বন কম বিশিষ্ট ১° অ্যামিন তৈরি হয়। পার-অক্সাইডের উপস্থিতিতে HBr সংযোজনে বিপরীত মার্কনিকভ নিয়ম কার্যকর হয় (শুধুমাত্র HBr-এ!)।',
      en: 'Hofmann bromamide reaction steps down carbon chain by 1 to yield primary amine; peroxide effect applies ONLY to HBr.',
    },
    examTip: {
      bn: 'অ্যালকিনের ওজোনীকরণে দ্বিবন্ধন ভেঙে দুই পাশে =O বসিয়ে দিলেই উৎপাদ অ্যালডিহাইড/কিটোন পাওয়া যায়!',
      en: 'Shortcut for alkene ozonolysis: cleave C=C and cap both carbons with =O!',
    },
    boardTag: 'সকল বোর্ড CQ ১০০% কমন',
  },
  {
    id: 'f-chem2-4',
    subjectKey: 'chemistry2',
    chapterTitle: { bn: 'অধ্যায় ৪: তড়িৎ রসায়ন', en: 'Ch 4: Electrochemistry' },
    title: { bn: 'ফ্যারাডের ১ম সূত্র ও নার্নস্ট সমীকরণ (Nernst Equation)', en: 'Faraday’s Electrolysis Law & Nernst Equation' },
    formula: 'W = (M · I · t) / (n · F),    E_cell = E°_cell - (0.0592 / n) log Q  (at 25°C)',
    explanation: {
      bn: 'এখানে F = 96500 C/mol, M = পারমাণবিক ভর, n = স্থানান্তরিত ইলেকট্রন সংখ্যা এবং E°_cell = E°_cathode(red) - E°_anode(red)।',
      en: 'F = 96500 C/mol; a galvanic cell reaction is spontaneous only if E_cell > 0 (ΔG < 0).',
    },
    examTip: {
      bn: 'পাত্রের ধাতুটি যদি তড়িৎ রাসায়নিক সারিতে দ্রবণের আয়নের উপরে থাকে (অধিক সক্রিয় অ্যানোড), তবে ওই পাত্রে দ্রবণ রাখা যাবে না!',
      en: 'Never store a salt solution in a vessel made of a metal with lower reduction potential (more reactive anode)!',
    },
    boardTag: 'যশোর, ঢাকা ও BUET',
  },
  {
    id: 'f-math1-4',
    subjectKey: 'math1',
    chapterTitle: { bn: 'অধ্যায় ১০: যোগজীকরণ (Integration)', en: 'Ch 10: Integration' },
    title: { bn: 'খণ্ডশঃ যোগজীকরণ (LIATE) ও বিশেষ এক্সপোনেনশিয়াল সূত্র', en: 'Integration by Parts & e^x Shortcut' },
    formula: '∫ u v dx = u ∫v dx - ∫ [ (du/dx) ∫v dx ] dx,    ∫ e^x [f(x) + f′(x)] dx = e^x f(x) + c',
    explanation: {
      bn: 'u নির্বাচনের ক্রম হলো LIATE (Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential)। e^x [f(x)+f′(x)] ফর্মটি ভর্তি পরীক্ষায় ৩ সেকেন্ডে উত্তর দেয়!',
      en: 'Pick u using LIATE priority; recognize e^x[f(x) + f′(x)] to solve board & admission integrals instantly.',
    },
    examTip: {
      bn: 'উদাহরণ: ∫ e^x (tan x + sec²x) dx = e^x tan x + c!',
      en: 'Example: ∫ e^x (1/x - 1/x²) dx = e^x / x + c!',
    },
    boardTag: 'ঢাবি ক ও সকল বোর্ড',
  },
  {
    id: 'f-math2-3',
    subjectKey: 'math2',
    chapterTitle: { bn: 'অধ্যায় ৬: কণিক', en: 'Ch 6: Conics' },
    title: { bn: 'উপবৃত্ত ও অধিবৃত্তের উৎকেন্দ্রিকতা ও উপকেন্দ্রিক লম্ব', en: 'Ellipse & Hyperbola Core Formulas' },
    formula: 'Ellipse: e = √(1 - b²/a²),   Hyperbola: e = √(1 + b²/a²),   Latus Rectum = 2b² / a',
    explanation: {
      bn: 'যখন a > b, উপবৃত্তের বৃহৎ অক্ষ 2a, উপকেন্দ্র (±ae, 0) এবং নিয়ামক রেখা x = ± a/e। অধিবৃত্তে অসীমতট রেখা y = ±(b/a)x।',
      en: 'For a > b, foci are at (±ae, 0) and directrices at x = ±a/e; hyperbola asymptotes are y = ±(b/a)x.',
    },
    examTip: {
      bn: 'যদি b > a হয় (x²/a² + y²/b² = 1), তবে সূত্রগুলোতে a এবং b পরস্পর স্থান বিনিময় করবে!',
      en: 'Always check whether a > b or b > a before applying eccentricity and latus rectum formulas!',
    },
    boardTag: 'সকল বোর্ড CQ ও MCQ',
  },
  {
    id: 'f-bio2-2',
    subjectKey: 'biology2',
    chapterTitle: { bn: 'অধ্যায় ১১: জিনতত্ত্ব ও বিবর্তন', en: 'Ch 11: Genetics & Evolution' },
    title: { bn: 'মেন্ডেলের সূত্রের ব্যতিক্রম অনুপাতসমূহ (এক নজরে)', en: 'Mendelian Exception Phenotypic Ratios' },
    formula: 'অসম্পূর্ণ প্রকটতা = 1:2:1 | মারণ জিন = 2:1 | পরিপূরক জিন = 9:7 | প্রকট এপিস্ট্যাসিস = 13:3',
    explanation: {
      bn: '১ম সূত্রের স্বাভাবিক অনুপাত ৩:১ (ব্যতিক্রম ১:২:১ ও ২:১)। ২য় সূত্রের স্বাভাবিক অনুপাত ৯:৩:৩:১ (ব্যতিক্রম ৯:৭, ১৩:৩ ও দ্বৈত প্রচ্ছন্ন বা মূক বধিরতা ৯:৭)।',
      en: 'Memorize modified F₂ ratios: Incomplete dominance/Codominance 1:2:1, Lethal gene 2:1, Complementary 9:7, Dominant epistasis 13:3.',
    },
    examTip: {
      bn: 'মেডিকেল ও বোর্ড MCQ-তে অনুপাত ও উদাহরণ (স্ন্যাপড্রাগন ১:২:১, মিষ্টি মটর ৯:৭, সাদা লেগহর্ন ১৩:৩) প্রতি বছর আসে!',
      en: 'Pair each ratio with its organism: Mirabilis jalapa (1:2:1), Lathyrus odoratus (9:7), White Leghorn (13:3).',
    },
    boardTag: 'মেডিকেল ও সকল বোর্ড ১০০% কমন',
  },
];
