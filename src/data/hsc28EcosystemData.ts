import { BilingualText, SubjectKey } from '../types';

export interface PrerequisiteChain {
  id: string;
  subjectKey: SubjectKey;
  stream: BilingualText;
  steps: BilingualText[];
  advice: BilingualText;
}

export const PREREQUISITE_CHAINS: PrerequisiteChain[] = [
  {
    id: 'pre-phy-mech',
    subjectKey: 'physics1',
    stream: {
      bn: 'পদার্থবিজ্ঞান বলবিদ্যা চেইন (Mechanics Flow)',
      en: 'Physics Mechanics Sequence',
    },
    steps: [
      { bn: 'ভেক্টর (১ম অধ্যায় ২)', en: 'Vectors (1st P. Ch 2)' },
      { bn: 'গতিবিদ্যা (১ম অধ্যায় ৩)', en: 'Dynamics (1st P. Ch 3)' },
      { bn: 'নিউটনীয় বলবিদ্যা (অধ্যায় ৪)', en: 'Newtonian Mechanics (Ch 4)' },
      { bn: 'কাজ, শক্তি ও ক্ষমতা (অধ্যায় ৫)', en: 'Work, Energy & Power (Ch 5)' },
      { bn: 'মহাকর্ষ ও পর্যাবৃত্ত গতি (অধ্যায় ৬, ৮)', en: 'Gravitation & SHM (Ch 6, 8)' },
    ],
    advice: {
      bn: 'ভেক্টর বিভাজন ও ডট/ক্রস গুণন ১০০% পরিষ্কার না করে নিউটনীয় বলবিদ্যা বা স্থির তড়িৎ শুরু করবেন না।',
      en: 'Master vector resolution and dot/cross products before tackling Newtonian Mechanics or Electrostatics.',
    },
  },
  {
    id: 'pre-math-calc',
    subjectKey: 'math1',
    stream: {
      bn: 'উচ্চতর গণিত ক্যালকুলাস চেইন (Calculus Mastery)',
      en: 'Higher Math Calculus Pathway',
    },
    steps: [
      { bn: 'ত্রিকোণমিতিক অনুপাত (১ম অধ্যায় ৭)', en: 'Trigonometry (1st P. Ch 7)' },
      { bn: 'ফাংশন ও লেখচিত্র (১ম অধ্যায় ৮)', en: 'Functions (1st P. Ch 8)' },
      { bn: 'অন্তরীকরণ (১ম অধ্যায় ৯)', en: 'Differentiation (1st P. Ch 9)' },
      { bn: 'যোগজীকরণ (১ম অধ্যায় ১০)', en: 'Integration (1st P. Ch 10)' },
      { bn: 'বিপরীত ত্রিকোণমিতি (২য় অধ্যায় ৭)', en: 'Inverse Trig (2nd P. Ch 7)' },
    ],
    advice: {
      bn: 'ত্রিকোণমিতির সূত্র মুখস্থ থাকলে অন্তরীকরণ ও যোগজীকরণের ৭০% অংক অর্ধেক সময়ে সমাধান করা যায়।',
      en: '70% of Calculus speed comes directly from instant recall of trigonometric identities.',
    },
  },
  {
    id: 'pre-chem-org',
    subjectKey: 'chemistry2',
    stream: {
      bn: 'রসায়ন ভিত্তি থেকে জৈব রসায়ন (Chemistry Core)',
      en: 'Chemistry Core to Organic',
    },
    steps: [
      { bn: 'গুণগত রসায়ন (১ম অধ্যায় ২)', en: 'Qualitative Chem (1st P. Ch 2)' },
      { bn: 'মৌলের পর্যায়বৃত্ত ধর্ম ও বন্ধন (১ম অধ্যায় ৩)', en: 'Periodic & Bonding (1st P. Ch 3)' },
      { bn: 'রাসায়নিক পরিবর্তন (১ম অধ্যায় ৪)', en: 'Chemical Change (1st P. Ch 4)' },
      { bn: 'জৈব রসায়ন (২য় অধ্যায় ২)', en: 'Organic Chemistry (2nd P. Ch 2)' },
    ],
    advice: {
      bn: 'সংকরায়ন (sp, sp2, sp3), তড়িৎ ঋণাত্মকতা ও সিগমা-পাই বন্ধন না শিখে জৈব রসায়নে হাত দেবেন না।',
      en: 'Learn hybridization (sp, sp2, sp3) and bond polarity first before starting Organic Chemistry.',
    },
  },
  {
    id: 'pre-bio-cell',
    subjectKey: 'biology1',
    stream: {
      bn: 'জীববিজ্ঞান কোষ থেকে জিনতত্ত্ব (Biology Core)',
      en: 'Biology Cell to Genetics',
    },
    steps: [
      { bn: 'কোষ ও এর গঠন (১ম অধ্যায় ১)', en: 'Cell Structure (1st P. Ch 1)' },
      { bn: 'কোষ বিভাজন (১ম অধ্যায় ২)', en: 'Cell Division (1st P. Ch 2)' },
      { bn: 'কোষ রসায়ন (১ম অধ্যায় ৩)', en: 'Cell Chemistry (1st P. Ch 3)' },
      { bn: 'জীবপ্রযুক্তি ও জিনতত্ত্ব (১ম চ. ১১ / ২য় চ. ১১)', en: 'Biotech & Genetics' },
    ],
    advice: {
      bn: 'DNA রেপ্লিকেশন ও ট্রান্সক্রিপশন ভালোভাবে আয়ত্ত করলে জীবপ্রযুক্তি ও জিনতত্ত্ব খুব সহজ হয়ে যায়।',
      en: 'Understanding DNA replication & transcription unlocks both Biotechnology and Genetics effortlessly.',
    },
  },
  {
    id: 'pre-ict-prog',
    subjectKey: 'ict',
    stream: {
      bn: 'ICT ডিজিটাল লজিক ও প্রোগ্রামিং চেইন',
      en: 'ICT Logic to Programming',
    },
    steps: [
      { bn: 'সংখ্যা পদ্ধতি (অধ্যায় ৩.১)', en: 'Number Systems (Ch 3.1)' },
      { bn: 'ডিজিটাল ডিভাইস ও লজিক গেট (অধ্যায় ৩.২)', en: 'Logic Gates (Ch 3.2)' },
      { bn: 'অ্যালগরিদম ও ফ্লোচার্ট (অধ্যায় ৫.১)', en: 'Flowcharts (Ch 5.1)' },
      { bn: 'C প্রোগ্রামিং ও DBMS (অধ্যায় ৫.২ ও ৬)', en: 'C Programming & SQL (Ch 5.2, 6)' },
    ],
    advice: {
      bn: 'একাদশ শ্রেণিতেই সংখ্যা পদ্ধতি, লজিক গেট ও HTML শেষ করে রাখলে ২য় বর্ষে শুধু C প্রোগ্রামিং প্র্যাকটিস করলেই A+ নিশ্চিত।',
      en: 'Finish Number Systems, Logic Gates & HTML in Year 1 so Year 2 is purely C programming practice.',
    },
  },
];

export interface ExceptionCheatCard {
  id: string;
  subjectKey: SubjectKey;
  title: BilingualText;
  rule: BilingualText;
  exception: BilingualText;
  reason: BilingualText;
  targetTag: string;
}

export const EXCEPTION_SHEETS: ExceptionCheatCard[] = [
  {
    id: 'ex-chem-1',
    subjectKey: 'chemistry1',
    title: {
      bn: 'ইলেকট্রন আসক্তির ক্রম (হ্যালোজেন গ্রুপ)',
      en: 'Electron Affinity Order (Halogens)',
    },
    rule: {
      bn: 'সাধারণ নিয়ম: গ্রুপে ওপর থেকে নিচে ইলেকট্রন আসক্তি কমে (F > Cl > Br > I হওয়ার কথা ছিল)।',
      en: 'General Rule: Electron affinity decreases down a group (expected F > Cl > Br > I).',
    },
    exception: {
      bn: 'প্রকৃত ক্রম: Cl > F > Br > I (ক্লোরিনের ইলেকট্রন আসক্তি ফ্লোরিন অপেক্ষা বেশি!)।',
      en: 'Actual Order: Cl > F > Br > I (Chlorine has higher electron affinity than Fluorine!).',
    },
    reason: {
      bn: 'F এর আকার অত্যন্ত ছোট (2p কক্ষপথ) হওয়ায় ইলেকট্রন মেঘের ঘনত্ব বেশি থাকে, ফলে আগত ইলেকট্রন বিকর্ষিত হয়।',
      en: 'Compact 2p shell of Fluorine causes strong inter-electronic repulsion against incoming electrons.',
    },
    targetTag: 'Board MCQ + Medical + BUET',
  },
  {
    id: 'ex-chem-2',
    subjectKey: 'chemistry1',
    title: {
      bn: 'প্রথম আয়নীকরণ শক্তির ব্যতিক্রম (পর্যায় ২)',
      en: '1st Ionization Energy Exceptions (Period 2)',
    },
    rule: {
      bn: 'সাধারণ নিয়ম: বাম থেকে ডানে আয়নীকরণ শক্তি বাড়ে (Be < B এবং N < O হওয়ার কথা)।',
      en: 'General Rule: Ionization energy increases across a period (expected Be < B and N < O).',
    },
    exception: {
      bn: 'প্রকৃত ক্রম: Be > B এবং N > O (নাইট্রোজেনের আয়নীকরণ শক্তি অক্সিজেনের চেয়ে বেশি)।',
      en: 'Actual Order: Be > B and N > O (Nitrogen > Oxygen; Beryllium > Boron).',
    },
    reason: {
      bn: 'Be-এর পূর্ণ 2s² এবং N-এর অর্ধপূর্ণ 2p³ ইলেকট্রন বিন্যাস অধিক স্থিতিশীল হওয়ায় ইলেকট্রন সরাতে বেশি শক্তি লাগে।',
      en: 'Full 2s² in Be and half-filled 2p³ symmetry in N provide extra quantum stability.',
    },
    targetTag: 'All Boards CQ (খ) + MCQ',
  },
  {
    id: 'ex-chem-3',
    subjectKey: 'chemistry1',
    title: {
      bn: 'আউফবাউ নীতির ব্যতিক্রম: Cr(24) ও Cu(29)',
      en: 'Aufbau Exceptions: Cr(24) & Cu(29)',
    },
    rule: {
      bn: 'সাধারণ নিয়মে 4s পূর্ণ হয়ে 3d-তে যাওয়ার কথা: Cr = [Ar] 3d⁴ 4s², Cu = [Ar] 3d⁹ 4s²।',
      en: 'Expected by (n+l) rule: Cr = [Ar] 3d⁴ 4s², Cu = [Ar] 3d⁹ 4s².',
    },
    exception: {
      bn: 'সঠিক বিন্যাস: Cr(24) = [Ar] 3d⁵ 4s¹ এবং Cu(29) = [Ar] 3d¹⁰ 4s¹।',
      en: 'Actual Configuration: Cr(24) = [Ar] 3d⁵ 4s¹ and Cu(29) = [Ar] 3d¹⁰ 4s¹.',
    },
    reason: {
      bn: 'অর্ধপূর্ণ (d⁵) ও পূর্ণ (d¹⁰) ডি-অরবিটালের বিনিময় শক্তি (Exchange Energy) বেশি হওয়ায় এরা সুস্থিত।',
      en: 'Half-filled (d⁵) and fully-filled (d¹⁰) subshells maximize exchange energy and stability.',
    },
    targetTag: 'Must-Know Class 11',
  },
  {
    id: 'ex-bio-1',
    subjectKey: 'biology1',
    title: {
      bn: 'জাইলেম ও ফ্লোয়েম কোষের নিউক্লিয়াস ব্যতিক্রম',
      en: 'Plant Vascular Tissue Exceptions',
    },
    rule: {
      bn: 'সাধারণত ফ্লোয়েমের সিভনলে পরিণত অবস্থায় নিউক্লিয়াস থাকে না এবং জাইলেম ভেসেল আবৃতবীজীর বৈশিষ্ট্য।',
      en: 'Mature sieve tubes lack nuclei; vessels are normally absent in gymnosperms.',
    },
    exception: {
      bn: 'নগ্নবীজী উদ্ভিদে ‘নিটাম (Gnetum)’-এ জাইলেম ভেসেল থাকে এবং নগ্নবীজীর ফ্লোয়েমে সঙ্গীকোষ থাকে না।',
      en: 'Gymnosperm Gnetum possesses xylem vessels, and gymnosperms lack companion cells in phloem.',
    },
    reason: {
      bn: 'Gnetum নগ্নবীজী ও আবৃতবীজী উদ্ভিদের মধ্যবর্তী সংযোগকারী উন্নত প্রজাতি।',
      en: 'Gnetum represents an evolutionary bridge towards angiosperms.',
    },
    targetTag: 'Medical + Board MCQ',
  },
  {
    id: 'ex-bio-2',
    subjectKey: 'biology2',
    title: {
      bn: 'স্তন্যপায়ী প্রাণীর লোহিত কণিকা (RBC) ও রক্তনালি ব্যতিক্রম',
      en: 'Human Blood & Circulation Exceptions',
    },
    rule: {
      bn: 'সকল ধমনী অক্সিজেনযুক্ত রক্ত এবং সকল শিরা কার্বন-ডাই-অক্সাইডযুক্ত রক্ত বহন করে; পরিণত RBC নিউক্লিয়াসবিহীন।',
      en: 'Arteries carry oxygenated blood, veins carry deoxygenated blood; mature mammalian RBCs are anucleate.',
    },
    exception: {
      bn: 'ব্যতিক্রম: পালমোনারি ধমনী CO₂ যুক্ত রক্ত ও পালমোনারি শিরা O₂ যুক্ত রক্ত বহন করে; উট ও লামার RBC-তে নিউক্লিয়াস থাকে।',
      en: 'Pulmonary artery carries CO₂ blood & pulmonary vein carries O₂ blood; Camel & Llama RBCs retain nuclei.',
    },
    reason: {
      bn: 'হৃৎপিণ্ড থেকে ফুসফুসে গ্যাসীয় বিনিময়ের জন্য পালমোনারি সংবহন বিপরীতমুখী কাজ করে।',
      en: 'Pulmonary circuit reverses oxygenation roles to oxygenate blood in lungs.',
    },
    targetTag: 'Medical Admission Star',
  },
  {
    id: 'ex-phy-1',
    subjectKey: 'physics1',
    title: {
      bn: 'কেন্দ্রমুখী বল দ্বারা কৃতকাজ শূন্য হওয়ার ব্যতিক্রমী ধাঁধা',
      en: 'Work Done by Centripetal Force',
    },
    rule: {
      bn: 'বলের প্রয়োগে সরণ ঘটলে সাধারণত কাজ সম্পন্ন হয় (W = Fs cosθ)।',
      en: 'Force acting on a moving body typically performs mechanical work (W = Fs cosθ).',
    },
    exception: {
      bn: 'বৃত্তাকার পথে ঘূর্ণায়মান বস্তুর ওপর প্রবল কেন্দ্রমুখী বল ক্রিয়া করলেও কৃতকাজ সর্বদা শূন্য (W = 0 J)!',
      en: 'Work done by centripetal force in circular motion is ALWAYS strictly zero (W = 0 J)!',
    },
    reason: {
      bn: 'কেন্দ্রমুখী বল ব্যাসার্ধ বরাবর কেন্দ্রমুখী এবং তাৎক্ষণিক সরণ স্পর্শক বরাবর—অর্থাৎ মধ্যবর্তী কোণ θ = 90° এবং cos90° = 0।',
      en: 'Force is radial while instantaneous displacement is tangential (θ = 90°, cos 90° = 0).',
    },
    targetTag: 'Physics CQ (খ) + BUET',
  },
];

export interface PeriodicElementItem {
  z: number;
  symbol: string;
  nameBn: string;
  nameEn: string;
  mass: string;
  block: 's' | 'p' | 'd';
  config: string;
  group: number;
  period: number;
  noteBn: string;
  noteEn: string;
}

export const LAB_ELEMENTS: PeriodicElementItem[] = [
  { z: 1, symbol: 'H', nameBn: 'হাইড্রোজেন', nameEn: 'Hydrogen', mass: '1.008', block: 's', config: '1s¹', group: 1, period: 1, noteBn: 'দুষ্ট মৌল (Rogue Element); গ্রুপ ১ ও ১৭ উভয়ের সাথে সাদৃশ্যপূর্ণ।', noteEn: 'Rogue element sharing traits with Group 1 & 17.' },
  { z: 2, symbol: 'He', nameBn: 'হিলিয়াম', nameEn: 'Helium', mass: '4.0026', block: 's', config: '1s²', group: 18, period: 1, noteBn: 's-ব্লক মৌল হওয়া সত্ত্বেও নিষ্ক্রিয় গ্যাস হওয়ায় গ্রুপ ১৮-তে অবস্থিত।', noteEn: 's-block configuration (1s²) placed in Group 18 noble gases.' },
  { z: 6, symbol: 'C', nameBn: 'কার্বন', nameEn: 'Carbon', mass: '12.011', block: 'p', config: '1s² 2s² 2p²', group: 14, period: 2, noteBn: 'ক্যাটেনেশন ধর্ম ও sp, sp², sp³ সংকরায়নের মাধ্যমে লক্ষ লক্ষ জৈব যৌগ গঠন করে।', noteEn: 'Exhibits catenation & sp, sp², sp³ hybridization.' },
  { z: 7, symbol: 'N', nameBn: 'নাইট্রোজেন', nameEn: 'Nitrogen', mass: '14.007', block: 'p', config: '1s² 2s² 2p³', group: 15, period: 2, noteBn: 'অর্ধপূর্ণ 2p³ বিন্যাসের জন্য অক্সিজেনের চেয়ে ১ম আয়নীকরণ শক্তি বেশি; NCl₅ গঠন করে না।', noteEn: 'Half-filled 2p³ gives higher IE₁ than O; cannot form NCl₅ (no 2d orbital).' },
  { z: 8, symbol: 'O', nameBn: 'অক্সিজেন', nameEn: 'Oxygen', mass: '15.999', block: 'p', config: '1s² 2s² 2p⁴', group: 16, period: 2, noteBn: 'চ্যালকোজেন; আণবিক O₂ প্যারাম্যাগনেটিক (MOT অনুযায়ী অযুগ্ম ইলেকট্রন থাকে)।', noteEn: 'Chalcogen; molecular O₂ is paramagnetic due to unpaired π* electrons.' },
  { z: 9, symbol: 'F', nameBn: 'ফ্লোরিন', nameEn: 'Fluorine', mass: '18.998', block: 'p', config: '1s² 2s² 2p⁵', group: 17, period: 2, noteBn: 'সর্বাধিক তড়িৎ ঋণাত্মক মৌল (4.0), কিন্তু ইলেকট্রন আসক্তি ক্লোরিনের চেয়ে কম।', noteEn: 'Most electronegative element (4.0), yet lower EA than Chlorine.' },
  { z: 11, symbol: 'Na', nameBn: 'সোডিয়াম', nameEn: 'Sodium', mass: '22.990', block: 's', config: '[Ne] 3s¹', group: 1, period: 3, noteBn: 'ক্ষার ধাতু; শিখা পরীক্ষায় সোনালি হলুদ (Golden Yellow, 589 nm) বর্ণ দেয়।', noteEn: 'Alkali metal; imparts Golden Yellow (589 nm) in flame test.' },
  { z: 12, symbol: 'Mg', nameBn: 'ম্যাগনেসিয়াম', nameEn: 'Magnesium', mass: '24.305', block: 's', config: '[Ne] 3s²', group: 2, period: 3, noteBn: 'মৃৎক্ষার ধাতু; ক্লোরোফিল অণুর কেন্দ্রীয় ধাতব পরমাণু।', noteEn: 'Alkaline earth metal; central atom in plant chlorophyll.' },
  { z: 13, symbol: 'Al', nameBn: 'অ্যালুমিনিয়াম', nameEn: 'Aluminium', mass: '26.982', block: 'p', config: '[Ne] 3s² 3p¹', group: 13, period: 3, noteBn: 'Al₂O₃ উভধর্মী অক্সাইড; AlCl₃ ডাইমার (Al₂Cl₆) গঠন করে।', noteEn: 'Al₂O₃ is amphoteric; anhydrous AlCl₃ dimerizes to Al₂Cl₆.' },
  { z: 15, symbol: 'P', nameBn: 'ফসফরাস', nameEn: 'Phosphorus', mass: '30.974', block: 'p', config: '[Ne] 3s² 3p³', group: 15, period: 3, noteBn: 'ফাঁকা 3d অরবিটাল থাকায় PCl₃ ও PCl₅ উভয়ই গঠন করতে পারে।', noteEn: 'Vacant 3d orbitals allow variable valency (PCl₃ and PCl₅).' },
  { z: 17, symbol: 'Cl', nameBn: 'ক্লোরিন', nameEn: 'Chlorine', mass: '35.45', block: 'p', config: '[Ne] 3s² 3p⁵', group: 17, period: 3, noteBn: 'পর্যায় সারণিতে সর্বোচ্চ ইলেকট্রন আসক্তিবিশিষ্ট মৌল (-349 kJ/mol)।', noteEn: 'Highest electron affinity in the entire periodic table (-349 kJ/mol).' },
  { z: 19, symbol: 'K', nameBn: 'পটাশিয়াম', nameEn: 'Potassium', mass: '39.098', block: 's', config: '[Ar] 4s¹', group: 1, period: 4, noteBn: 'শিখা পরীক্ষায় বেগুনি (Lilac/Violet) বর্ণ প্রদর্শন করে।', noteEn: 'Produces characteristic Lilac/Violet flame in qualitative analysis.' },
  { z: 20, symbol: 'Ca', nameBn: 'ক্যালসিয়াম', nameEn: 'Calcium', mass: '40.078', block: 's', config: '[Ar] 4s²', group: 2, period: 4, noteBn: 'শিখা পরীক্ষায় ইটের মতো লাল (Brick Red) বর্ণ দেয়।', noteEn: 'Gives Brick Red color in non-luminous Bunsen flame.' },
  { z: 24, symbol: 'Cr', nameBn: 'ক্রোমিয়াম', nameEn: 'Chromium', mass: '51.996', block: 'd', config: '[Ar] 3d⁵ 4s¹', group: 6, period: 4, noteBn: 'আউফবাউ ব্যতিক্রম (অর্ধপূর্ণ 3d⁵); প্যারাম্যাগনেটিক ও রঙিন যৌগ গঠন করে।', noteEn: 'Aufbau exception ([Ar] 3d⁵ 4s¹); strongly paramagnetic transition metal.' },
  { z: 26, symbol: 'Fe', nameBn: 'আয়রন (লোহা)', nameEn: 'Iron', mass: '55.845', block: 'd', config: '[Ar] 3d⁶ 4s²', group: 8, period: 4, noteBn: 'অবস্থান্তর ধাতু; হিমোগ্লোবিনের কেন্দ্রীয় আয়ন (Fe²⁺) ও জটিল আয়ন গঠনকারী।', noteEn: 'Transition metal; Fe²⁺ sits in hemoglobin heme ring; forms complex ions.' },
  { z: 29, symbol: 'Cu', nameBn: 'কপার (তামা)', nameEn: 'Copper', mass: '63.546', block: 'd', config: '[Ar] 3d¹⁰ 4s¹', group: 11, period: 4, noteBn: 'আউফবাউ ব্যতিক্রম (পূর্ণ 3d¹⁰); শিখা পরীক্ষায় নীলাভ সবুজ বর্ণ দেয়।', noteEn: 'Aufbau exception ([Ar] 3d¹⁰ 4s¹); Bluish-green in flame test.' },
  { z: 30, symbol: 'Zn', nameBn: 'জিংক (দস্তা)', nameEn: 'Zinc', mass: '65.38', block: 'd', config: '[Ar] 3d¹⁰ 4s²', group: 12, period: 4, noteBn: 'd-ব্লক মৌল কিন্তু অবস্থান্তর মৌল নয় (Zn²⁺ আয়নে 3d¹⁰ পূর্ণ থাকে)।', noteEn: 'd-block element, NOT a transition element (stable Zn²⁺ has full 3d¹⁰).' },
];

export interface AcademicMilestone {
  id: string;
  phase: BilingualText;
  timeframe: BilingualText;
  status: 'current' | 'upcoming';
  goals: BilingualText;
}

export const HSC28_ROADMAP: AcademicMilestone[] = [
  {
    id: 'm1',
    phase: {
      bn: 'ধাপ ১: একাদশ শ্রেণি ফাউন্ডেশন ও ১ম পত্র সমাপ্তি',
      en: 'Phase 1: Class 11 Foundation & 1st Paper Mastery',
    },
    timeframe: {
      bn: 'অক্টোবর ২০২৬ – জুন ২০২৭ (বর্তমান ধাপ)',
      en: 'Oct 2026 – Jun 2027 (Active Phase)',
    },
    status: 'current',
    goals: {
      bn: 'পদার্থ ১ম, রসায়ন ১ম, উচ্চতর গণিত ১ম, জীববিজ্ঞান ১ম এবং ICT-এর অধ্যায় ১–৪ মূল বইসহ শেষ করা।',
      en: 'Complete Physics 1st, Chem 1st, Math 1st, Bio 1st textbooks + ICT Ch 1–4 before Year-1 Finals.',
    },
  },
  {
    id: 'm2',
    phase: {
      bn: 'ধাপ ২: দ্বাদশ শ্রেণি ও ২য় পত্র দ্রুত কভারেজ',
      en: 'Phase 2: Class 12 & 2nd Paper Acceleration',
    },
    timeframe: {
      bn: 'জুলাই ২০২৭ – ডিসেম্বর ২০২৭',
      en: 'Jul 2027 – Dec 2027',
    },
    status: 'upcoming',
    goals: {
      bn: 'জৈব রসায়ন, স্থির ও চল তড়িৎ, কনিকস, প্রাণিবিজ্ঞান ও C প্রোগ্রামিং ডিসেম্বরের মধ্যে সম্পূর্ণ করা।',
      en: 'Finish Organic Chemistry, Electricity, Conics, Human Physiology & C Programming by December 2027.',
    },
  },
  {
    id: 'm3',
    phase: {
      bn: 'ধাপ ৩: প্রি-টেস্ট, টেস্ট পরীক্ষা ও বোর্ড প্রশ্নব্যাংক রিভিশন',
      en: 'Phase 3: Test Exams & Full Board Archive Solve',
    },
    timeframe: {
      bn: 'জানুয়ারি ২০২৮ – এপ্রিল ২০২৮',
      en: 'Jan 2028 – Apr 2028',
    },
    status: 'upcoming',
    goals: {
      bn: 'বিগত ১০ বছরের সকল বোর্ডের CQ/MCQ সমাধান, Mistake Bank শূন্যে নামানো এবং ফর্ম ফিলাপ সম্পন্ন করা।',
      en: 'Solve 10 years of board papers, clear Mistake Bank, and complete HSC 2028 form fill-up.',
    },
  },
  {
    id: 'm4',
    phase: {
      bn: 'ধাপ ৪: এইচএসসি ২০২৮ চূড়ান্ত বোর্ড পরীক্ষা ও ভর্তি যুদ্ধ',
      en: 'Phase 4: HSC 2028 Final Exam & Admission Season',
    },
    timeframe: {
      bn: 'মে ২০২৮ – অক্টোবর ২০২৮',
      en: 'May 2028 – Oct 2028',
    },
    status: 'upcoming',
    goals: {
      bn: 'HSC 2028-এ গোল্ডেন A+ নিশ্চিত করে সরাসরি BUET / Medical / ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষায় অংশগ্রহণ।',
      en: 'Secure HSC Golden A+ and transition directly into BUET, Medical & DU A-Unit admission tests.',
    },
  },
];

export interface StudentNoticeItem {
  id: string;
  category: BilingualText;
  date: BilingualText;
  title: BilingualText;
  summary: BilingualText;
}

export const HSC28_NOTICES: StudentNoticeItem[] = [
  {
    id: 'n1',
    category: { bn: 'একাদশ শ্রেণি নির্দেশনা', en: 'Class 11 Advisory' },
    date: { bn: 'অক্টোবর ২০২৬', en: 'October 2026' },
    title: {
      bn: 'HSC 2028 ব্যাচের জন্য NCTB পূর্ণাঙ্গ সিলেবাস অনুসরণ নির্দেশিকা',
      en: 'NCTB Full Curriculum Guideline for HSC Batch 2028',
    },
    summary: {
      bn: 'HSC ২০২৮ বিজ্ঞান বিভাগের পরীক্ষা পূর্ণাঙ্গ পাঠ্যক্রম (১০০ নম্বর: তত্ত্বীয় ৫০ CQ + ২৫ MCQ + ব্যবহারিক ২৫) অনুযায়ী অনুষ্ঠিত হবে। শুরু থেকেই মূল বই পড়ার অভ্যাস গড়ে তুলুন।',
      en: 'HSC 2028 Science follows the full 100-mark structure (50 CQ + 25 MCQ + 25 Practical). Prioritize textbook concepts from Year 1.',
    },
  },
  {
    id: 'n2',
    category: { bn: 'ব্যবহারিক খাতা টিপস', en: 'Practical Lab Guide' },
    date: { bn: 'নভেম্বর ২০২৬', en: 'November 2026' },
    title: {
      bn: 'কলেজ ব্যবহারিক (Practical) ক্লাস ও ল্যাব নোটবুক নিয়মিতকরণের পরামর্শ',
      en: 'Keep Year-1 Physics, Chemistry & Biology Practical Notebooks Updated',
    },
    summary: {
      bn: 'দ্বাদশ শ্রেণির টেস্ট পরীক্ষার সময় একসাথে সব ব্যবহারিক খাতা আঁকার চাপ এড়াতে একাদশ শ্রেণিতেই কলেজের প্রতি সপ্তাহের পরীক্ষণগুলো স্বাক্ষর করিয়ে রাখুন।',
      en: 'Sign off Practical Notebook experiments progressively during Class 11 to save crucial revision weeks before Test exams.',
    },
  },
  {
    id: 'n3',
    category: { bn: 'ভর্তি প্রস্তুতি কৌশল', en: 'Admission Strategy' },
    date: { bn: 'HSC ’28 রোডম্যাপ', en: 'HSC ’28 Strategy' },
    title: {
      bn: 'বুয়েট ও মেডিকেল প্রত্যাশীদের জন্য ১ম বর্ষের লক্ষ্যমাত্রা (PCM ৮৫%+ ও জীববিজ্ঞান)',
      en: 'Year-1 Benchmarks for BUET & Medical Aspirants',
    },
    summary: {
      bn: 'বুয়েটে আবেদনের জন্য পদার্থ, রসায়ন ও উচ্চতর গণিতে পৃথকভাবে উচ্চ নম্বর (সাধারণত ৮৫%+) প্রয়োজন হয় এবং মেডিকেলের জন্য মূল বইয়ের প্রতিটি লাইন ও ছক নির্ভুলভাবে আত্মস্থ করা অপরিহার্য।',
      en: 'BUET requires top marks in Physics, Chemistry & Math individually, while Medical demands line-by-line mastery of Biology & Chemistry textbooks.',
    },
  },
];

export interface ConceptHelperEntry {
  id: string;
  keywords: string[];
  subjectKey: SubjectKey;
  question: BilingualText;
  answer: BilingualText;
  formula?: string;
}

export const CONCEPT_QA_CARDS: ConceptHelperEntry[] = [
  {
    id: 'cqa-1',
    keywords: ['নদী', 'নৌকা', 'river', 'boat', 'ভেক্টর', 'ন্যূনতম', 'vector'],
    subjectKey: 'physics1',
    question: {
      bn: 'নদী-নৌকার অংকে ন্যূনতম সময় বনাম ন্যূনতম দূরত্বের পার্থক্য কী?',
      en: 'Difference between Minimum Time and Minimum Distance in River-Boat problems?',
    },
    formula: 't_min = d / v (α = 90°)  |  α = cos⁻¹(-u / v) for straight crossing',
    answer: {
      bn: '১) ন্যূনতম সময়ে নদী পার হতে স্রোতের বেগ (u) যাই হোক, নৌকাকে স্রোতের সাথে লম্বভাবে (α = 90°) চালাতে হয়। তখন সময় t_min = d / v।\n২) ন্যূনতম দূরত্বে (সোজাসুজি অপর পাড়ে) পৌঁছাতে নৌকাকে স্রোতের বিপরীত দিকে হেলিয়ে α = cos⁻¹(-u/v) কোণে চালাতে হয় (শর্ত: নৌকার বেগ v > স্রোতের বেগ u)। তখন সময় t = d / √(v² - u²)।',
      en: '1) Minimum Time: Row perpendicular to current (α = 90°), giving t_min = d / v.\n2) Minimum Distance (straight across): Row upstream at α = cos⁻¹(-u/v) provided v > u, giving t = d / √(v² - u²).',
    },
  },
  {
    id: 'cqa-2',
    keywords: ['সংকরায়ন', 'hybridization', 'sp3', 'sp2', 'আকৃতি', 'বন্ধন কোণ', 'nh3', 'h2o', 'ch4'],
    subjectKey: 'chemistry1',
    question: {
      bn: 'যেকোনো যৌগের সংকরায়ন (Hybridization) ও বন্ধন কোণ ৩ সেকেন্ডে বের করার সূত্র কী?',
      en: 'How to find Hybridization and Bond Angle of any molecule in 3 seconds?',
    },
    formula: 'H = ½ × [ V + X - C + A ]  (H=4 → sp³, H=3 → sp², H=2 → sp)',
    answer: {
      bn: 'কেন্দ্রীয় পরমাণুর যোজ্যতা ইলেকট্রন (V) + একযোজী পরমাণুর সংখ্যা (X) - ক্যাটায়ন চার্জ (C) + অ্যানায়ন চার্জ (A) কে ২ দিয়ে ভাগ করুন।\n• CH₄: H = ½(4+4) = 4 (sp³, নিঃসঙ্গ জোড় 0 → ১০৯.৫°)\n• NH₃: H = ½(5+3) = 4 (sp³, ১টি নিঃসঙ্গ জোড় → ১০৭°)\n• H₂O: H = ½(6+2) = 4 (sp³, ২টি নিঃসঙ্গ জোড় → ১০৪.৫°)',
      en: 'Compute H = ½(V + X - C + A). H=4 gives sp³, H=3 gives sp², H=2 gives sp. Each lone pair compresses the tetrahedral angle: CH₄ (0 LP, 109.5°) > NH₃ (1 LP, 107°) > H₂O (2 LP, 104.5°).',
    },
  },
  {
    id: 'cqa-3',
    keywords: ['বাফার', 'buffer', 'ph', 'হেন্ডারসন', 'henderson', 'অম্লীয়'],
    subjectKey: 'chemistry1',
    question: {
      bn: 'বাফার দ্রবণের pH নির্ণয়ের হেন্ডারসন-হ্যাসেলবালখ সমীকরণ কখন ও কীভাবে প্রয়োগ করব?',
      en: 'How to apply Henderson-Hasselbalch equation for Acidic & Basic Buffers?',
    },
    formula: 'pH = pKa + log₁₀([Salt] / [Acid])',
    answer: {
      bn: 'মৃদু অম্ল (যেমন CH₃COOH) ও তার অনুবন্ধী ক্ষারকের লবণ (CH₃COONa) মিশ্রিত থাকলে এটি অম্লীয় বাফার। যদি লবণ ও অম্লের ঘনমাত্রা ভিন্ন আয়তনে মিশ্রিত করা হয়, তবে মিশ্রণের পর পরিবর্তিত মোলার ঘনমাত্রা বা সরাসরি মোল অনুপাত (n_salt / n_acid) বসালেই সঠিক pH পাওয়া যায়।',
      en: 'For weak acid + conjugate salt buffers, use pH = pKa + log([Salt]/[Acid]). When mixing two solutions, you can plug in the mole ratio (V_salt·S_salt)/(V_acid·S_acid) directly!',
    },
  },
  {
    id: 'cqa-4',
    keywords: ['অন্তরীকরণ', 'যোগজীকরণ', 'ক্যালকুলাস', 'calculus', 'uv', 'integration', 'liate'],
    subjectKey: 'math1',
    question: {
      bn: 'যোগজীকরণে ∫ u v dx করার সময় কোনটিকে u এবং কোনটিকে v ধরতে হয়?',
      en: 'How to choose u and v in Integration by Parts (∫ u v dx)?',
    },
    formula: 'LIATE Rule: Logarithmic → Inverse Trig → Algebraic → Trig → Exponential',
    answer: {
      bn: 'LIATE ক্রম অনুসরণ করুন: বাম দিকের ফাংশনটিকে সর্বদা u (যাকে অন্তরীকরণ করা সহজ) এবং ডান দিকের ফাংশনটিকে v ধরুন।\nউদাহরণ: ∫ x ln(x) dx-এ ln(x) হলো Logarithmic (L) এবং x হলো Algebraic (A), তাই u = ln(x) এবং v = x ধরতে হবে!',
      en: 'Follow LIATE order (Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential). Pick whichever comes FIRST as u. Example: in ∫ x ln(x) dx, u = ln(x) and dv = x dx.',
    },
  },
  {
    id: 'cqa-5',
    keywords: ['মাইটোসিস', 'মিয়োসিস', 'কোষ বিভাজন', 'mitosis', 'meiosis', 'ক্রসিং ওভার'],
    subjectKey: 'biology1',
    question: {
      bn: 'মাইটোসিস ও মিয়োসিস কোষ বিভাজনের কোন ধাপে ক্রসিং ওভার ও সেন্ট্রোমিয়ার বিভাজন ঘটে?',
      en: 'In which exact stages do Crossing Over and Centromere Splitting occur?',
    },
    formula: 'Pachytene → Crossing Over | Diplotene → Chiasmata | Anaphase → V, L, J, I shapes',
    answer: {
      bn: '• ক্রসিং ওভার ঘটে: মিয়োসিস-১ এর প্রোফেজ-১ এর প্যাকাইটিন (Pachytene) উপ-পর্যায়ে।\n• মেটাকাইনেসিস (নিরক্ষীয় অঞ্চলে বিন্যাস): মেটাফেজ ধাপে।\n• সেন্ট্রোমিয়ার বিভাজন ও ক্রোমোসোমের (V, L, J, I আকৃতি) মেরুমুখী চলন ঘটে: মাইটোসিসের অ্যানাফেজ এবং মিয়োসিসের অ্যানাফেজ-২ ধাপে (অ্যানাফেজ-১ এ সেন্ট্রোমিয়ার বিভক্ত হয় না!)।',
      en: 'Crossing over occurs in Pachytene (Prophase-I). Centromeres split in Mitotic Anaphase and Anaphase-II of Meiosis (never in Anaphase-I!). Chromosome shapes V, L, J, I appear in Anaphase.',
    },
  },
  {
    id: 'cqa-6',
    keywords: ['nand', 'nor', 'সর্বজনীন', 'গেট', 'universal', 'logic', 'xor'],
    subjectKey: 'ict',
    question: {
      bn: 'NAND ও NOR গেট দিয়ে কীভাবে মৌলিক গেট (NOT, AND, OR) বাস্তবায়ন করা যায়?',
      en: 'How to implement NOT, AND, OR using Universal Gates (NAND / NOR)?',
    },
    formula: 'NOT(A) = (A·A)\'  |  AND(A,B) = ((A·B)\')\'  |  OR(A,B) = (A\'·B\')\'',
    answer: {
      bn: 'NAND গেট দিয়ে:\n১) NOT: একটি NAND গেটের দুটি ইনপুট একসাথে যুক্ত করে A দিলে আউটপুট A\' পাওয়া যায়।\n২) AND: একটি NAND গেটের আউটপুটে আরেকটি এক-ইনপুট NAND লাগালে AB পাওয়া যায় (মোট ২টি NAND)।\n৩) OR: ডি-মরগ্যানের উপপাদ্য A+B = (A\'·B\')\' অনুযায়ী ৩টি NAND গেট যুক্ত করলে OR গেট পাওয়া যায়।',
      en: 'Using NAND: 1 NAND tying inputs gives NOT; 2 NANDs in series give AND; 3 NANDs via De Morgan\'s law (A\'·B\')\' give OR.',
    },
  },
];
