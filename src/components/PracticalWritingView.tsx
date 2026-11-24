import React, { useState } from 'react';
import {
  Microscope,
  PenTool,
  CheckCircle2,
  HelpCircle,
  Printer,
  Copy,
  Check,
  Sparkles,
  FileText,
} from 'lucide-react';
import { Lang, SubjectKey, Theme } from '../types';
import { getSubjectByKey } from '../data/syllabusData';
import { formatNum } from '../lib/i18n';
import { SectorStats } from './SectorStats';

interface PracticalWritingViewProps {
  lang: Lang;
  theme: Theme;
  completedPracticals: string[];
  onTogglePractical: (id: string) => void;
}

interface PracticalItem {
  id: string;
  subjectKey: SubjectKey;
  expNo: string;
  title: { bn: string; en: string };
  theoryFormula: string;
  procedure: { bn: string; en: string };
  precautions: { bn: string; en: string };
  vivaQ: { bn: string; en: string };
  vivaA: { bn: string; en: string };
}

interface WritingTemplateItem {
  id: string;
  subjectKey: 'bangla' | 'english';
  marks: number;
  category: { bn: string; en: string };
  title: { bn: string; en: string };
  structureTip: { bn: string; en: string };
  modelText: string;
}

const PRACTICAL_EXPERIMENTS: PracticalItem[] = [
  {
    id: 'prac-phy1-1',
    subjectKey: 'physics1',
    expNo: 'Exp-01',
    title: {
      bn: 'স্ফেরোমিটারের সাহায্যে গলীয় তলের বক্রতার ব্যাসার্ধ (R) নির্ণয়',
      en: 'Radius of Curvature (R) of a Spherical Surface using a Spherometer',
    },
    theoryFormula: 'R = d² / (6h) + h / 2   |   Least Count (LC) = Pitch / N = 0.01 mm',
    procedure: {
      bn: '১) সমতল কাঁচপাত্রে স্ফেরোমিটার বসিয়ে লঘিষ্ঠ গণন (LC) ও যান্ত্রিক ত্রুটি নির্ণয় করো। ২) উত্তল লেন্সের ওপর বসিয়ে উচ্চতা h এবং তিনটি পায়ের গড় দূরত্ব d মেপে সূত্রে বসাও।',
      en: '1) Place spherometer on plane glass plate to find zero reading. 2) Measure sagitta h on convex surface and mean leg separation d.',
    },
    precautions: {
      bn: 'স্ক্রু ঘোরানোর সময় পেছন দিকে ঘুরিয়ে (Backlash error বা পিছট ত্রুটি এড়াতে) পাঠ নিতে হবে।',
      en: 'Rotate the micrometer screw in one direction only to avoid backlash error.',
    },
    vivaQ: { bn: 'পিছট ত্রুটি (Backlash error) কী?', en: 'What is backlash error?' },
    vivaA: {
      bn: 'নাট ও স্ক্রু ক্ষয়প্রাপ্ত হয়ে ঢিলা হয়ে গেলে স্ক্রুকে উভয় দিকে ঘোরালে রৈখিক সরণ সমান হয় না—একেই পিছট ত্রুটি বলে।',
      en: 'Slippage between worn nut-and-screw threads when reversing rotation direction.',
    },
  },
  {
    id: 'prac-phy1-2',
    subjectKey: 'physics1',
    expNo: 'Exp-02',
    title: {
      bn: 'সরল দোলকের সাহায্যে স্থানীয় অভিকর্ষজ ত্বরণ (g)-এর মান নির্ণয়',
      en: 'Determination of Acceleration due to Gravity (g) by Simple Pendulum',
    },
    theoryFormula: 'g = 4π² (L / T²),   কার্যকরী দৈর্ঘ্য L = l + r',
    procedure: {
      bn: 'বিভিন্ন কার্যকরী দৈর্ঘ্য L (৬০–১০০ সেমি) নিয়ে ২০টি পূর্ণ দোলনের সময় মেপে দোলনকাল T বের করো। L বনাম T² লেখচিত্রের ঢাল হতে g নির্ণয় করো।',
      en: 'Measure time for 20 oscillations across L = 60–100 cm, keeping angular amplitude ≤ 4°, and compute L/T².',
    },
    precautions: {
      bn: 'কৌণিক বিস্তার অবশ্যই ৪° এর কম রাখতে হবে এবং ববের ব্যাসার্ধ r সুতার দৈর্ঘ্যের সাথে যোগ করতে হবে।',
      en: 'Keep angular amplitude strictly within 4° so sinθ ≈ θ holds.',
    },
    vivaQ: { bn: 'সেকেন্ড দোলক কাকে বলে?', en: 'What is a seconds pendulum?' },
    vivaA: {
      bn: 'যে সরল দোলকের দোলনকাল ২ সেকেন্ড (অর্ধ-দোলন ১ সেকেন্ড; কার্যকরী দৈর্ঘ্য প্রায় ০.৯৯৩ মিটার), তাকে সেকেন্ড দোলক বলে।',
      en: 'A pendulum whose time period is exactly 2 seconds (L ≈ 0.993 m on Earth).',
    },
  },
  {
    id: 'prac-chem1-1',
    subjectKey: 'chemistry1',
    expNo: 'Exp-03',
    title: {
      bn: 'অজানা অজৈব লবণে ক্ষারীয় (Cu²⁺, Fe³⁺, NH₄⁺) ও অম্লীয় (Cl⁻, SO₄²⁻) মূলক শনাক্তকরণ',
      en: 'Qualitative Salt Analysis: Basic (Cu²⁺, Fe³⁺, NH₄⁺) & Acidic (Cl⁻, SO₄²⁻) Radicals',
    },
    theoryFormula: 'NH₄⁺ + K₂[HgI₄] + KOH → NH₂-Hg-O-Hg-I↓ (বাদামি অধঃক্ষেপ)',
    procedure: {
      bn: 'মূল দ্রবণে নেসলার বিকারক দিলে বাদামি অধঃক্ষেপ (NH₄⁺); K₄[Fe(CN)₆] দিলে লালচে-বাদামি অধঃক্ষেপ (Cu²⁺) বা গাঢ় নীল প্রুশিয়ান ব্লু (Fe³⁺)। Cl⁻ মূলকে AgNO₃ দিলে সাদা অধঃক্ষেপ যা NH₄OH-এ দ্রবণীয়।',
      en: 'Nessler’s reagent gives brown precipitate for NH₄⁺; Ba(NO₃)₂ gives HCl-insoluble white BaSO₄ for SO₄²⁻.',
    },
    precautions: {
      bn: 'নেসলার বিকারক পরীক্ষার সময় অবশ্যই ক্ষারীয় মাধ্যম (NaOH/KOH) নিশ্চিত করতে হবে।',
      en: 'Always wear safety goggles and add dilute HNO₃ before AgNO₃ halide test.',
    },
    vivaQ: { bn: 'নেসলার বিকারক কী?', en: 'What is Nessler’s reagent?' },
    vivaA: {
      bn: 'ক্ষারীয় পটাসিয়াম টেট্রাআয়োডোমারকিউরেট(II) দ্রবণ অর্থাৎ KOH/NaOH মিশ্রিত K₂[HgI₄] দ্রবণকে নেসলার বিকারক বলে।',
      en: 'Alkaline solution of potassium tetraiodomercurate(II), K₂[HgI₄] + KOH.',
    },
  },
  {
    id: 'prac-bio1-1',
    subjectKey: 'biology1',
    expNo: 'Exp-04',
    title: {
      bn: 'মালভেসি গোত্র শনাক্তকরণ (জবা ফুল: Hibiscus rosa-sinensis) ও পুষ্পসংকেত লিখন',
      en: 'Dissection & Floral Formula of Malvaceae (China Rose: Hibiscus rosa-sinensis)',
    },
    theoryFormula: 'পুষ্পসংকেত: ⊕ ⚥ উক৫ ক(৫) দল৫ পুং(∞) গ(৫)  (অমরাবিন্যাস: অক্ষীয় / Axile)',
    procedure: {
      bn: 'জবা ফুলের উপবৃতি, যুক্ত বৃতি, পাকানো (Twisted) দলমণ্ডল, একগুচ্ছক পুংস্তবক, বৃক্কাকার পরাগধানী এবং গর্ভাশয়ের প্রস্থচ্ছেদে ৫-প্রকোষ্ঠবিশিষ্ট অক্ষীয় অমরাবিন্যাস পর্যবেক্ষণ করো।',
      en: 'Observe epicalyx, monadelphous stamen tube, reniform anthers, mucilage, and 5-chambered axile placentation.',
    },
    precautions: {
      bn: 'গর্ভাশয়ের প্রস্থচ্ছেদ অত্যন্ত পাতলা ও সুষমভাবে ব্লেড দিয়ে কেটে গ্লিসারিনে স্থাপন করতে হবে।',
      en: 'Cut ultra-thin transverse sections of the ovary and keep moist on slide.',
    },
    vivaQ: { bn: 'মালভেসি গোত্রের ৩টি প্রধান শনাক্তকারী বৈশিষ্ট্য বলো।', en: 'State 3 diagnostic traits of Malvaceae.' },
    vivaA: {
      bn: '১) কচি অংশে পিচ্ছিল মিউসিলেজ থাকে, ২) পুংকেশর একগুচ্ছক ও পরাগধানী একপ্রকোষ্ঠী বৃক্কাকার, ৩) অমরাবিন্যাস অক্ষীয় (Axile)।',
      en: '1) Mucilaginous sap, 2) Monadelphous stamens with reniform anthers, 3) Axile placentation.',
    },
  },
  {
    id: 'prac-ict-1',
    subjectKey: 'ict',
    expNo: 'Exp-05',
    title: {
      bn: 'HTML টেবিল/হাইপারলিংক ওয়েবপেজ তৈরি এবং C ভাষায় ত্রিভুজের ক্ষেত্রফল নির্ণয়',
      en: 'HTML Webpage Creation & C Program for Area of Triangle (Heron’s Formula)',
    },
    theoryFormula: 's = (a + b + c) / 2.0;   area = sqrt(s * (s - a) * (s - b) * (s - c));',
    procedure: {
      bn: 'নোটপ্যাডে .html এক্সটেনশনে কোড সেভ করে ব্রাউজারে আউটপুট নাও এবং Code::Blocks-এ <math.h> যুক্ত করে ত্রিভুজের ক্ষেত্রফল নির্ণয়ের C কোড কম্পাইল ও রান করো।',
      en: 'Save HTML file with UTF-8 encoding and compile C program including <stdio.h> and <math.h>.',
    },
    precautions: {
      bn: 'ত্রিভুজ গঠনের শর্ত (a + b > c && b + c > a && c + a > b) অবশ্যই if স্টেটমেন্ট দিয়ে যাচাই করতে হবে।',
      en: 'Validate triangle inequality before calling sqrt() to prevent NaN domain error.',
    },
    vivaQ: { bn: 'C প্রোগ্রামে getch() বা return 0; কেন লেখা হয়?', en: 'Why do we write return 0; at the end of main()?' },
    vivaA: {
      bn: 'অপারেটিং সিস্টেমকে জানানো যে main() ফাংশনটি কোনো ত্রুটি ছাড়াই সফলভাবে নির্বাহ (Execute) সম্পন্ন করেছে।',
      en: 'It signals exit code 0 (successful execution without runtime errors) back to the OS.',
    },
  },
  {
    id: 'prac-phy2-1',
    subjectKey: 'physics2',
    expNo: 'Exp-06',
    title: {
      bn: 'মিটার ব্রিজের সাহায্যে কোনো তারের আপেক্ষিক রোধ (Specific Resistance) নির্ণয়',
      en: 'Specific Resistance (ρ) of a Wire using a Meter Bridge',
    },
    theoryFormula: 'X = R · (100 − l) / l   |   ρ = (π · r² · X) / L   (Ω·m)',
    procedure: {
      bn: '১) বাম ফাঁকে রোধ বাক্স R এবং ডান ফাঁকে পরীক্ষামূলক তার X যুক্ত করে জকি স্পর্শ করিয়ে নিস্পন্দ বিন্দু l নির্ণয় করো। ২) স্ক্রু গজে তারের ব্যাস মেপে ব্যাসার্ধ r এবং দৈর্ঘ্য L বসিয়ে ρ বের করো।',
      en: '1) Balance known resistance R against wire X to find null length l on the 100 cm wire. 2) Measure wire radius r with a screw gauge and length L to compute ρ.',
    },
    precautions: {
      bn: 'জকি কখনোই তারের ওপর ঘষে টানা যাবে না (প্রস্থচ্ছেদ অসম হয়ে যায়); নিস্পন্দ বিন্দু ৩০–৭০ সেমি-এর মধ্যে রাখতে R নির্বাচন করো।',
      en: 'Tap the jockey gently instead of sliding it along the manganin wire, and keep null length between 30–70 cm.',
    },
    vivaQ: { bn: 'মিটার ব্রিজ কোন নীতির ওপর ভিত্তি করে কাজ করে?', en: 'On which principle does a meter bridge operate?' },
    vivaA: {
      bn: 'হুইটস্টোন ব্রিজের সাম্যাবস্থা নীতির (P / Q = R / S) ওপর ভিত্তি করে মিটার ব্রিজ কাজ করে।',
      en: 'It works on the balanced Wheatstone bridge principle (P / Q = R / S).',
    },
  },
  {
    id: 'prac-chem2-1',
    subjectKey: 'chemistry2',
    expNo: 'Exp-07',
    title: {
      bn: 'প্রমাণ Na₂CO₃ দ্রবণের সাহায্যে অজানা HCl দ্রবণের মোলার ঘনমাত্রা নির্ণয় (টাইট্রেশন)',
      en: 'Standardization of HCl Solution against Standard 0.1 M Na₂CO₃ (Acid-Base Titration)',
    },
    theoryFormula: 'Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂   |   V₁S₁ / 2 = V₂S₂ / 1',
    procedure: {
      bn: 'পিপেটে ১০ mL ০.১ M Na₂CO₃ কনিক্যাল ফ্লাস্কে নিয়ে ১–২ ফোঁটা মিথাইল অরেঞ্জ নির্দেশক যোগ করো। ব্যুরেট হতে ফোঁটায় ফোঁটায় HCl যোগ করে হলুদ বর্ণ হালকা গোলাপি হওয়া পর্যন্ত টাইট্রেশন করো।',
      en: 'Pipette 10 mL of 0.1 M Na₂CO₃ with 1–2 drops of methyl orange and titrate dropwise with HCl from yellow to faint orange-pink.',
    },
    precautions: {
      bn: 'ব্যুরেটের নিচের সরু অংশে যেন কোনো বায়ু বুদবুদ না থাকে এবং পাঠ নেওয়ার সময় নিম্ন মেনিস্কাস সমান্তরালভাবে দেখতে হবে।',
      en: 'Remove air bubbles from the burette nozzle and read the lower meniscus at eye level to avoid parallax error.',
    },
    vivaQ: { bn: 'তীব্র অম্ল ও মৃদু ক্ষারের টাইট্রেশনে মিথাইল অরেঞ্জ কেন ব্যবহৃত হয়?', en: 'Why is methyl orange used for HCl vs Na₂CO₃ titration?' },
    vivaA: {
      bn: 'তুল্যতা বিন্দুতে দ্রবণের pH অম্লীয় অঞ্চলে (৩.১–৪.৪) দ্রুত পরিবর্তিত হয়, যা মিথাইল অরেঞ্জের বর্ণ পরিবর্তনের কার্যকর পরিসরের সাথে মিলে যায়।',
      en: 'Its pH transition range (3.1–4.4) matches the acidic pH jump at the equivalence point of a strong acid and weak base.',
    },
  },
  {
    id: 'prac-bio2-1',
    subjectKey: 'biology2',
    expNo: 'Exp-08',
    title: {
      bn: 'রুই মাছের (Labeo rohita) রক্ত সংবহনতন্ত্র (অন্তর্বাহী ও বহির্বাহী ফুলকা ধমনি) পর্যবেক্ষণ',
      en: 'Observation of Afferent & Efferent Branchial Arteries of Rohu Fish (Labeo rohita)',
    },
    theoryFormula: 'ভেন্ট্রাল অ্যাওর্টা → ৪ জোড়া অন্তর্বাহী ফুলকা ধমনি (CO₂ যুক্ত রক্ত) → ফুলকা → ডর্সাল অ্যাওর্টা',
    procedure: {
      bn: 'তাজা রুই মাছকে ডিসেকশন ট্রেতে রেখে কানকো (Operculum) ও হৃৎপিণ্ড উন্মুক্ত করো। ভেন্ট্রাল অ্যাওর্টা থেকে চার জোড়া ফুলকায় বিস্তৃত অন্তর্বাহী ধমনি পরিষ্কার করে চিহ্নিত চিত্র অঙ্কন করো।',
      en: 'Carefully remove the operculum, expose the bulbous arteriosus and ventral aorta, and trace the 4 pairs of afferent branchial arteries.',
    },
    precautions: {
      bn: 'ফুলকা অত্যন্ত নরম ও রক্তনালিসমৃদ্ধ হওয়ায় কাঁচি চালানোর সময় যেন ফুলকা সূত্রক কেটে রক্তপাত না ঘটে সেদিকে লক্ষ্য রাখতে হবে।',
      en: 'Dissect gently around the gill arches so fine branchial capillaries do not rupture and obscure the field.',
    },
    vivaQ: { bn: 'রুই মাছের হৃৎপিণ্ডকে কেন ভেনাস হার্ট (Venous Heart) বলা হয়?', en: 'Why is the heart of Labeo rohita called a venous heart?' },
    vivaA: {
      bn: 'রুই মাছের দুই প্রকোষ্ঠবিশিষ্ট হৃৎপিণ্ডের মধ্য দিয়ে কেবল কার্বন ডাই-অক্সাইড সমৃদ্ধ (অক্সিজেনবিহীন) রক্ত একমুখীভাবে প্রবাহিত হয় বলে একে ভেনাস হার্ট বলে।',
      en: 'Because only deoxygenated (CO₂-rich) blood flows unidirectionally through its two-chambered heart toward the gills.',
    },
  },
  {
    id: 'prac-math1-1',
    subjectKey: 'math1',
    expNo: 'Exp-09',
    title: {
      bn: 'ছক কাগজে ফাংশনের লেখচিত্র অঙ্কন এবং এক-এক ও সার্বিক (Bijective) প্রকৃতি যাচাই',
      en: 'Plotting Function Graphs & Horizontal-Line Test for One-to-One / Onto Nature',
    },
    theoryFormula: 'f(x) = 2x − 3  (রৈখিক এক-এক)   বনাম   g(x) = x² − 4  (বহু-এক প্যারাবোলা)',
    procedure: {
      bn: 'x-এর বিভিন্ন মান (−৩ হতে +৩) নিয়ে ছক তৈরি করো এবং গ্রাফ পেপারে বিন্দু বসিয়ে লেখচিত্র আঁকো। X-অক্ষের সমান্তরাল রেখা টেনে এক-এক (Horizontal Line Test) যাচাই করো।',
      en: 'Tabulate ordered pairs (x, y) over [-3, 3], plot on millimeter graph paper with explicit scale, and apply the horizontal-line test.',
    },
    precautions: {
      bn: 'ছক কাগজের ডান কোণায় অবশ্যই ক্ষুদ্রতম বর্গের বাহুর স্কেল উল্লেখ করতে হবে এবং পেন্সিল তীক্ষ্ণ রাখতে হবে।',
      en: 'Always write the X and Y axis scale factor in the top-right corner of the graph sheet using a sharp HB/2B pencil.',
    },
    vivaQ: { bn: 'কোনো লেখচিত্র দেখে কীভাবে বুঝবে এটি ফাংশন কি না?', en: 'How do you visually test if a curve represents a function?' },
    vivaA: {
      bn: 'Y-অক্ষের সমান্তরাল যেকোনো উল্লম্ব রেখা (Vertical Line Test) লেখচিত্রকে কেবল একটি বিন্দুতে ছেদ করলে সেটি ফাংশন।',
      en: 'By the Vertical Line Test: every vertical line must intersect the graph at most once.',
    },
  },
  {
    id: 'prac-math2-1',
    subjectKey: 'math2',
    expNo: 'Exp-10',
    title: {
      bn: 'উপবৃত্ত ও পরাবৃত্তের প্রমিত সমীকরণ হতে উপকেন্দ্র, নিয়ামক ও লেখচিত্র অঙ্কন',
      en: 'Graphing Conics (Parabola & Ellipse) with Focus, Directrix & Latus Rectum',
    },
    theoryFormula: 'x² / a² + y² / b² = 1,   উৎকেন্দ্রিকতা e = √(1 − b² / a²),   উপকেন্দ্র (±ae, 0)',
    procedure: {
      bn: 'প্রদত্ত সমীকরণ x²/25 + y²/16 = 1 হতে a = 5, b = 4 এবং e = 3/5 বের করো। ছক কাগজে কেন্দ্র, শীর্ষবিন্দু (±5, 0), উপকেন্দ্র (±3, 0) ও উপকেন্দ্রিক লম্ব চিহ্নিত করে সুষম বক্ররেখা আঁকো।',
      en: 'Compute semi-axes a = 5, b = 4, eccentricity e = 3/5, plot vertices (±5, 0) and foci (±3, 0), and sketch a smooth symmetric ellipse.',
    },
    precautions: {
      bn: 'কনিকের শীর্ষবিন্দুগুলোতে স্কেল দিয়ে কোণ তৈরি না করে মুক্তহস্তে মসৃণ ও প্রতিসম বক্ররেখা আঁকতে হবে।',
      en: 'Draw smooth freehand curves through the plotted points—never connect conic vertices with straight ruler segments.',
    },
    vivaQ: { bn: 'উপবৃত্ত ও অধিবৃত্তের উৎকেন্দ্রিকতার (e) মান কত থাকে?', en: 'What is the range of eccentricity e for an ellipse vs a hyperbola?' },
    vivaA: {
      bn: 'উপবৃত্তের ক্ষেত্রে 0 < e < 1, পরাবৃত্তের ক্ষেত্রে e = 1 এবং অধিবৃত্তের ক্ষেত্রে e > 1 হয়।',
      en: 'For an ellipse 0 < e < 1, for a parabola e = 1, and for a hyperbola e > 1.',
    },
  },
];

const WRITING_TEMPLATES: WritingTemplateItem[] = [
  {
    id: 'wrt-eng-1',
    subjectKey: 'english',
    marks: 15,
    category: {
      bn: 'English 1st Paper • Graph & Chart Description',
      en: 'English 1st Paper • Graph & Chart Description',
    },
    title: {
      bn: 'যেকোনো Bar Graph / Pie Chart বর্ণনায় ১৫-তে ১৪ পাওয়ার স্ট্রাকচার',
      en: 'Universal High-Scoring Graph/Chart Analytical Framework',
    },
    structureTip: {
      bn: '৩টি অনুচ্ছেদে লিখবে: ১) Overview (গ্রাফটি কী নির্দেশ করে), ২) Key Comparisons (সর্বোচ্চ, সর্বনিম্ন ও বৃদ্ধির হার), ৩) Concluding Insight (নিজস্ব মতামত দেওয়া যাবে না, শুধু ডেটার সারাংশ)।',
      en: 'Use 3 paragraphs: Overview → Trend & Peak/Lowest Comparison → Analytical Conclusion (avoid personal opinions).',
    },
    modelText: `The given bar chart illustrates the changing trend of [Topic, e.g., internet users / literacy rate in Bangladesh] over the period from [Start Year] to [End Year]. Overall, the data reveals a steady upward trajectory across the observed timeframe.\n\nAt the beginning of the period in [Year 1], the figure stood at [X%], which was the lowest point on the chart. Subsequently, it experienced a gradual rise to [Y%] in [Year 2], followed by a sharp surge reaching its peak at [Z%] in [Final Year]. Comparing the categories, [Category A] consistently outnumbered [Category B] by a notable margin.\n\nIn conclusion, the chart clearly demonstrates remarkable progress in [Topic] within a span of [N] years, reflecting sustained technological and educational advancement.`,
  },
  {
    id: 'wrt-eng-2',
    subjectKey: 'english',
    marks: 10,
    category: {
      bn: 'English 2nd Paper • Formal Application / E-mail',
      en: 'English 2nd Paper • Formal Application to Principal',
    },
    title: {
      bn: 'কলেজে Multimedia Classroom / Science Club / Computer Lab বৃদ্ধির আবেদনপত্র',
      en: 'Application to the Principal for Multimedia / Science Lab Facilities',
    },
    structureTip: {
      bn: 'বাম মার্জিন বরাবর (Block style) তারিখ, পদবি, কলেজের নাম ও স্পষ্ট Subject লাইন লিখতে হবে; পুরো আবেদনটি এক পৃষ্ঠার মধ্যে রাখলে পূর্ণ নম্বর পাওয়া যায়।',
      en: 'Keep strict left-aligned block format on a single clean page with a concise Subject line.',
    },
    modelText: `29 October 2026\nThe Principal\n[Your College Name], Bangladesh\n\nSubject: Prayer for enhancing multimedia and digital science lab facilities.\n\nSir,\nWe, the students of Class XI (HSC Batch 2028, Science Group) of your esteemed college, beg most respectfully to state that modern HSC Physics, Chemistry, and ICT syllabi require interactive visualization and hands-on coding practice. Although our teachers conduct classes sincerely, the shortage of multimedia projectors and updated lab computers limits practical demonstration.\n\nWe, therefore, pray and hope that you would be kind enough to upgrade our science and ICT laboratories so that we can prepare effectively for the HSC 2028 examination.\n\nYours obediently,\nThe Science Students of HSC Batch 2028`,
  },
  {
    id: 'wrt-ban-1',
    subjectKey: 'bangla',
    marks: 10,
    category: {
      bn: 'বাংলা ২য় পত্র • সংবাদপত্র প্রতিবেদন (Report Writing)',
      en: 'Bangla 2nd Paper • Newspaper Report Format',
    },
    title: {
      bn: 'সংবাদপত্র প্রতিবেদনের আদর্শ কাঠামো (দ্রব্যমূল্য বৃদ্ধি / বৃক্ষরোপণ / বিজ্ঞান মেলা)',
      en: 'Standard Newspaper Report Format for HSC Bangla 2nd Paper',
    },
    structureTip: {
      bn: 'আকর্ষণীয় শিরোনাম + নিজস্ব প্রতিবেদক, স্থান ও তারিখ দিয়ে শুরু করবে। অনুচ্ছেদগুলোতে সমস্যার চিত্র, পরিসংখ্যান, স্থানীয়দের বক্তব্য ও সমাধানের সুপারিশ যুক্ত করবে।',
      en: 'Include a bold headline, dateline (Reporter, Place, Date), factual body, and constructive recommendation.',
    },
    modelText: `শিরোনাম: তরুণ প্রজন্মের উদ্ভাবনী মেধায় মুখরিত আন্তঃকলেজ বিজ্ঞান ও প্রযুক্তি মেলা\n\nনিজস্ব প্রতিবেদক, খুলনা, ২৯ অক্টোবর ২০২৬: বিজ্ঞানমনস্ক প্রজন্ম গড়ে তোলার প্রত্যয়ে আজ সকালে স্থানীয় কলেজ প্রাঙ্গণে দুই দিনব্যাপী ‘আন্তঃকলেজ বিজ্ঞান ও প্রযুক্তি মেলা-২০২৬’ উদ্বোধন করা হয়েছে। একাদশ ও দ্বাদশ শ্রেণির শিক্ষার্থীদের স্বতঃস্ফূর্ত অংশগ্রহণে মেলায় মোট ৩৫টি উদ্ভাবনী প্রজেক্ট প্রদর্শিত হচ্ছে।\n\nসরেজমিনে দেখা যায়, সৌরবিদ্যুৎ চালিত সেচ পাম্প, স্বয়ংক্রিয় অগ্নিনির্বাপক রোবট এবং বর্জ্য থেকে বায়োগ্যাস উৎপাদনের মডেল দর্শনার্থীদের বিশেষ নজর কেড়েছে। অংশগ্রহণকারী একাদশ শ্রেণির শিক্ষার্থীরা জানায়, পাঠ্যবইয়ের তাত্ত্বিক জ্ঞানকে বাস্তবে প্রয়োগ করার সুযোগ তাদের গবেষণায় অনুপ্রাণিত করছে।\n\nবিশেষজ্ঞদের মতে, প্রতিটি শিক্ষাপ্রতিষ্ঠানে নিয়মিত এ ধরনের বিজ্ঞান মেলার আয়োজন করলে শিক্ষার্থীদের সৃজনশীলতা ও সমস্যা সমাধানের দক্ষতা বহুগুণ বৃদ্ধি পাবে।`,
  },
  {
    id: 'wrt-ban-2',
    subjectKey: 'bangla',
    marks: 10,
    category: {
      bn: 'বাংলা ২য় পত্র • বৈদ্যুতিক চিঠি (ই-মেইল) ও সংলাপ কৌশল',
      en: 'Bangla 2nd Paper • Formal E-mail & Dialogue Rules',
    },
    title: {
      bn: 'ই-মেইল লেখার নিখুঁত ছক (১০-এ ৯–১০ পাওয়ার নিয়ম)',
      en: 'High-Scoring Bangla E-mail Layout',
    },
    structureTip: {
      bn: 'ই-মেইলে প্রাপক (To), অনুলিপি (Cc), বিষয় (Subject) ইংরেজিতে ছোট হাতের অক্ষরে ই-মেইল ঠিকানাসহ ছকে লিখে মূল বার্তা প্রমিত বাংলায় সংক্ষিপ্ত ও মার্জিতভাবে লিখবে।',
      en: 'Write email headers cleanly (To, Cc, Subject) and keep the Bangla body crisp and formal.',
    },
    modelText: `প্রাপক (To): principal_college@edu.bd\nঅনুলিপি (Cc): science_club@edu.bd\nবিষয় (Subject): কলেজের গ্রন্থাগারে নতুন বিজ্ঞান ও রেফারেন্স বই সংযোজনের আবেদন।\n\nজনাব,\nসবিনয় নিবেদন এই যে, আমরা আপনার কলেজের একাদশ শ্রেণির (HSC ২০২৮ ব্যাচ) বিজ্ঞান বিভাগের শিক্ষার্থী। আমাদের নতুন পাঠ্যক্রম ও সৃজনশীল অনুশীলনের জন্য গ্রন্থাগারে পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত ও আইসিটি বিষয়ের সাম্প্রতিক সংস্করণের রেফারেন্স বই থাকা অত্যন্ত প্রয়োজন।\n\nঅতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, কলেজ গ্রন্থাগারে প্রয়োজনীয় বিজ্ঞানভিত্তিক বই সংযোজন করে আমাদের অধ্যয়নের পথ সুগম করতে আপনার সদয় মর্জি হয়।\n\nবিনীত,\nএকাদশ শ্রেণির বিজ্ঞান বিভাগের শিক্ষার্থীবৃন্দ`,
  },
  {
    id: 'wrt-eng-3',
    subjectKey: 'english',
    marks: 10,
    category: {
      bn: 'English 1st Paper • Passage Summary Writing',
      en: 'English 1st Paper • Passage Summary Writing',
    },
    title: {
      bn: 'Summary লেখার গোল্ডেন রুল (এক অনুচ্ছেদ, এক-তৃতীয়াংশ দৈর্ঘ্য, ৫০–৬৫ শব্দ)',
      en: 'Single-Paragraph Summary Blueprint (1/3 Length • 50–65 Words)',
    },
    structureTip: {
      bn: 'Summary অবশ্যই একটি মাত্র অনুচ্ছেদে নিজের ভাষায় লিখবে। মূল প্যাসেজ থেকে হুবহু বাক্য কপি করা, উদাহরণ দেওয়া বা “In my opinion” লেখা নিষিদ্ধ।',
      en: 'Write strictly in ONE paragraph using your own words (~50–65 words). Omit examples, quotes, statistics, and personal opinions.',
    },
    modelText: `The passage highlights the transformative role of [central theme, e.g., scientific inquiry and digital literacy] in shaping resilient modern societies. Rather than relying on rote memorization, learners progress fastest when they connect fundamental concepts with practical experimentation and ethical responsibility. Despite challenges such as resource gaps and rapid technological shifts, disciplined curiosity empowers young minds to solve real-world problems sustainably.`,
  },
  {
    id: 'wrt-eng-4',
    subjectKey: 'english',
    marks: 15,
    category: {
      bn: 'English 2nd Paper • Cause & Effect / Compare-Contrast Paragraph',
      en: 'English 2nd Paper • Cause & Effect Analytical Paragraph',
    },
    title: {
      bn: '১৫ নম্বরের Cause-and-Effect Paragraph কাঠামো (Climate Change / Deforestation / Cyber Safety)',
      en: '15-Mark Cause & Effect Paragraph Structure (Topic Sentence → Causes → Impacts → Remedy)',
    },
    structureTip: {
      bn: 'শুরুতে স্পষ্ট Topic Sentence, মাঝখানে ২–৩টি মূল কারণ (Consequently, Moreover ব্যবহার করে), এরপর প্রভাব এবং শেষে ১ বাক্যে বাস্তবসম্মত সমাধান লিখবে (১৬০–১৯০ শব্দ)।',
      en: 'Open with a clear Topic Sentence, link 3 causes and effects with cohesive transitions (Consequently, Furthermore), and close with a concise remedy.',
    },
    modelText: `[Topic, e.g., Climate change] has emerged as one of the most pressing challenges confronting Bangladesh and the wider world today. Primarily, rapid industrialization, unchecked fossil-fuel combustion, and widespread deforestation have accelerated greenhouse gas accumulation in the atmosphere. Furthermore, unplanned urbanization continues to shrink natural wetlands and green buffers. Consequently, erratic monsoon patterns, coastal salinity intrusion, and frequent heatwaves are disrupting agriculture, biodiversity, and public health across low-lying deltaic regions. If these underlying drivers remain unaddressed, food security and sustainable development will face severe setbacks. Therefore, transitioning to renewable energy, enforcing strict environmental regulations, and expanding community afforestation are essential to safeguard a livable future.`,
  },
  {
    id: 'wrt-ban-3',
    subjectKey: 'bangla',
    marks: 10,
    category: {
      bn: 'বাংলা ২য় পত্র • ভাবসম্প্রসারণ (Amplification of Idea)',
      en: 'Bangla 2nd Paper • Idea Amplification (ভাবসম্প্রসারণ)',
    },
    title: {
      bn: 'ভাবসম্প্রসারণে ১০-এ ৯ পাওয়ার ৩-স্তর কাঠামো (মূলভাব • সম্প্রসারিত ভাব • মন্তব্য)',
      en: '3-Stage Bangla Amplification Format (Core Theme • Expanded Analysis • Conclusion)',
    },
    structureTip: {
      bn: 'উপশিরোনাম না দিয়েও ৩টি স্পষ্ট অনুচ্ছেদে (১. মূলভাব, ২. সম্প্রসারিত ভাব ও যুক্তি, ৩. উপসংহার) লেখা যায়; কবি/লেখকের নাম বা হুবহু উদ্ধৃতি উল্লেখ না করাই উত্তম।',
      en: 'Structure cleanly into 3 paragraphs: concise core thesis, reasoned real-life/historical elaboration, and a crisp concluding synthesis.',
    },
    modelText: `প্রদত্ত পঙ্ক্তিটির মূল বক্তব্য হলো—মানবজীবনের প্রকৃত সার্থকতা নিছক দীর্ঘ পরমায়ুতে নয়, বরং মানবকল্যাণমুখী মহৎ কর্ম ও সৃজনশীল অবদানের মধ্যেই নিহিত।\n\nপ্রকৃতির নিয়মে প্রতিটি মানুষের জীবনকাল সীমিত। কেউ কেবল আত্মকেন্দ্রিক ভোগ-বিলাসে দীর্ঘ জীবন অতিবাহিত করলে মৃত্যুর সাথে সাথেই কালের গর্ভে হারিয়ে যায়। বিপরীতে যাঁরা জ্ঞানসাধনা, বিজ্ঞানচর্চা, দেশপ্রেম ও আর্তমানবতার সেবায় নিজেদের উৎসর্গ করেন, সংক্ষিপ্ত জীবনকালেও তাঁরা সভ্যতাকে বহুদূর এগিয়ে নিয়ে যান। আলোকবর্তিকা যেমন নিজেকে দগ্ধ করে চারপাশের অন্ধকার দূর করে, কর্মবীর মানুষের নিঃস্বার্থ ত্যাগও তেমনি প্রজন্ম থেকে প্রজন্মান্তরে প্রেরণা জোগায়।\n\nসুতরাং বয়সের দৈর্ঘ্য দিয়ে নয়, বরং সমাজ ও মানবতার কল্যাণে রেখে যাওয়া অমলিন কীর্তির মাধ্যমেই মানুষের প্রকৃত অমরত্ব অর্জিত হয়।`,
  },
  {
    id: 'wrt-ban-4',
    subjectKey: 'bangla',
    marks: 10,
    category: {
      bn: 'বাংলা ২য় পত্র • সংলাপ রচনা (Dialogue Writing)',
      en: 'Bangla 2nd Paper • Constructive Dialogue Writing',
    },
    title: {
      bn: 'প্রমিত সংলাপ কাঠামো: সময়ের সদ্ব্যবহার ও বিজ্ঞানমনস্ক অধ্যয়ন পদ্ধতি নিয়ে দুই বন্ধুর সংলাপ',
      en: 'Balanced 6-Pair Academic Dialogue Format (Time Management & Concept-Based Study)',
    },
    structureTip: {
      bn: 'উভয় চরিত্রের বক্তব্য যেন সুষম ও তথ্যপূর্ণ হয় (কমপক্ষে ৬ জোড়া আদান-প্রদান); একপক্ষ শুধু ‘হ্যাঁ/আচ্ছা’ বলবে না—প্রাসঙ্গিক প্রশ্ন ও যুক্তি তুলে ধরবে।',
      en: 'Include a brief setting line and at least 6 balanced exchanges where both speakers contribute meaningful questions and insights.',
    },
    modelText: `[কলেজ প্রাঙ্গণে একাদশ শ্রেণির দুই বন্ধু অর্ণব ও রাইসার মধ্যে সময়ের সদ্ব্যবহার ও অধ্যয়ন কৌশল নিয়ে সংলাপ]\n\nঅর্ণব: শুভ সকাল, রাইসা! কেমন আছ? সামনে তো আমাদের প্রথম বর্ষের চূড়ান্ত পরীক্ষা—তোমার প্রস্তুতি কেমন চলছে?\nরাইসা: শুভ সকাল, অর্ণব! ভালো আছি। রুটিন করে প্রতিদিন মূল বই পড়ছি, তবে পদার্থবিজ্ঞান ও উচ্চতর গণিতের সব অধ্যায় সমানভাবে গুছিয়ে নেওয়া বেশ চ্যালেঞ্জিং মনে হচ্ছে।\nঅর্ণব: ঠিক বলেছ। আমি লক্ষ্য করেছি, না বুঝে মুখস্থ করার চেয়ে প্রতিদিন নির্দিষ্ট সময়ে ছোট ছোট লক্ষ্য ধরে অনুশীলন করলে পড়া অনেক দীর্ঘস্থায়ী হয়।\nরাইসা: একদম তাই! আমিও এখন প্রতিটি অধ্যায় শেষে নিজের ভুলগুলো আলাদা খাতায় লিখে রাখছি, যাতে রিভিশনের সময় দুর্বল জায়গাগুলো দ্রুত ধরা পড়ে।\nঅর্ণব: দারুণ কৌশল! পাশাপাশি মোবাইল ফোনের অপ্রয়োজনীয় নোটিফিকেশন বন্ধ রেখে মনোযোগ ধরে রাখাও সময়ের সদ্ব্যবহারের বড় অংশ।\nরাইসা: নিঃসন্দেহে। নিয়মিত অধ্যবসায় আর সময়ের সঠিক মূল্যায়নই আমাদের বোর্ড ও ভর্তি প্রস্তুতিকে শক্ত ভিত্তি দেবে। চলো, এবার ক্লাসে যাওয়া যাক!\nঅর্ণব: হ্যাঁ, চলো। তোমার জন্য অনেক শুভকামনা!`,
  },
];

export const PracticalWritingView: React.FC<PracticalWritingViewProps> = ({
  lang,
  theme,
  completedPracticals,
  onTogglePractical,
}) => {
  const isDark = theme === 'dark';
  const [section, setSection] = useState<'practical' | 'writing'>('practical');
  const [practicalFilter, setPracticalFilter] = useState<string>('all');
  const [writingTarget, setWritingTarget] = useState<'summary' | 'graph' | 'paragraph'>('summary');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<string>('');

  const wordCount = draftText.trim()
    ? draftText.trim().split(/\s+/).length
    : 0;
  const sentenceCount = draftText.trim()
    ? draftText
        .trim()
        .split(/[.!?।]+/)
        .filter((s) => s.trim().length > 0).length
    : 0;

  const targetRanges: Record<'summary' | 'graph' | 'paragraph', { min: number; max: number; labelBn: string; labelEn: string }> = {
    summary: { min: 50, max: 65, labelBn: 'Summary (৫০–৬৫ শব্দ)', labelEn: 'Summary (50–65 words)' },
    graph: { min: 140, max: 170, labelBn: 'Graph / প্রতিবেদন (১৪০–১৭০ শব্দ)', labelEn: 'Graph / Report (140–170 words)' },
    paragraph: { min: 160, max: 200, labelBn: 'Paragraph / ভাবসম্প্রসারণ (১৬০–২০০ শব্দ)', labelEn: 'Paragraph / Amplification (160–200 words)' },
  };
  const activeRange = targetRanges[writingTarget];
  const filteredPracticals =
    practicalFilter === 'all'
      ? PRACTICAL_EXPERIMENTS
      : PRACTICAL_EXPERIMENTS.filter((exp) => exp.subjectKey.startsWith(practicalFilter));

  const cardClass = `p-5 sm:p-6 rounded-2xl border transition-all ${
    isDark
      ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
      : 'bg-white/95 border-slate-200/80 card-soft-light'
  }`;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/80'
        }`}
      >
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            {lang === 'bn'
              ? 'ব্যবহারিক ২৫ নম্বর ও নির্মিতি ভল্ট • HSC 2028'
              : '25-MARK PRACTICAL & WRITING VAULT • HSC 2028'}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 mt-0.5">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>
              {lang === 'bn'
                ? 'সায়েন্স প্র্যাকটিক্যাল খাতা ও বাংলা-ইংরেজি রাইটিং ভল্ট'
                : 'Science Practical Guide & Bangla-English Writing Vault'}
            </span>
          </h1>
          <p
            className={`text-xs sm:text-sm mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {lang === 'bn'
              ? 'বিজ্ঞান বিষয়ের ২৫ নম্বরের ব্যবহারিক + মৌখিক (Viva) প্রস্তুতি এবং বাংলা ২য় ও ইংরেজি রাইটিং পার্টে সর্বোচ্চ নম্বর পাওয়ার ফরম্যাট।'
              : 'Master all 25-mark HSC Science practicals + Viva questions alongside board-standard Bangla & English writing templates.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <div
            className={`inline-flex p-1 rounded-xl border ${
              isDark
                ? 'bg-slate-800/70 border-slate-700/70'
                : 'bg-white border-slate-200/85 shadow-2xs'
            }`}
          >
            <button
              onClick={() => setSection('practical')}
              aria-pressed={section === 'practical'}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                section === 'practical'
                  ? isDark
                    ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
                    : 'bg-indigo-600 text-white shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Microscope className="w-3.5 h-3.5" />
              <span>
                {lang === 'bn'
                  ? 'সায়েন্স প্র্যাকটিক্যাল (২৫ নম্বর)'
                  : 'Practicals (25 Marks)'}
              </span>
            </button>

            <button
              onClick={() => setSection('writing')}
              aria-pressed={section === 'writing'}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                section === 'writing'
                  ? isDark
                    ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
                    : 'bg-indigo-600 text-white shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>
                {lang === 'bn'
                  ? 'বাংলা ও English রাইটিং'
                  : 'Bangla & English Writing'}
              </span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
              isDark
                ? 'bg-slate-800/70 border-slate-700 text-slate-200'
                : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'প্রিন্ট / PDF' : 'Print'}</span>
          </button>
        </div>
      </div>

      <SectorStats label={lang === 'bn' ? 'ব্যবহারিক ও লেখার সারসংক্ষেপ' : 'Practical and writing overview'} items={[
        { label: lang === 'bn' ? 'পরীক্ষণ' : 'Experiments', value: formatNum(PRACTICAL_EXPERIMENTS.length, lang), hint: lang === 'bn' ? 'ব্যবহারিক গাইডে' : 'In your practical guide', icon: <Microscope size={19} />, tone: 'purple' },
        { label: lang === 'bn' ? 'সম্পন্ন' : 'Completed', value: formatNum(PRACTICAL_EXPERIMENTS.filter(exp => completedPracticals.includes(exp.id)).length, lang), hint: lang === 'bn' ? 'তোমার অগ্রগতি' : 'Your progress', icon: <CheckCircle2 size={19} />, tone: 'mint' },
        { label: lang === 'bn' ? 'লেখার নমুনা' : 'Writing templates', value: formatNum(WRITING_TEMPLATES.length, lang), hint: lang === 'bn' ? 'বাংলা ও ইংরেজি' : 'Bangla & English', icon: <PenTool size={19} />, tone: 'peach' },
        { label: lang === 'bn' ? 'খসড়ায় শব্দ' : 'Draft words', value: formatNum(wordCount, lang), hint: lang === 'bn' ? 'বর্তমান খসড়া' : 'In your current draft', icon: <FileText size={19} />, tone: 'blue' },
      ]} />

      {/* SECTION 1: 25-MARK SCIENCE & ICT PRACTICALS */}
      {section === 'practical' && (
        <div className="space-y-5">
          {/* Mark Distribution Info Strip */}
          <div
            className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
              isDark
                ? 'bg-teal-500/10 border-teal-400/25 text-teal-100'
                : 'bg-teal-50/80 border-teal-200 text-teal-950'
            }`}
          >
            <div className="text-xs sm:text-sm font-bold">
              {lang === 'bn'
                ? 'NCTB ব্যবহারিক নম্বর বণ্টন (প্রতি পত্রে ২৫ নম্বর): পরীক্ষণ ও গণনা ১৫ + ব্যবহারিক খাতা ৫ + মৌখিক (Viva) ৫ = ২৫'
                : 'NCTB 25-Mark Practical Breakdown: Experiment & Calculation (15) + Lab Notebook (5) + Viva Voce (5) = 25'}
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-teal-600 text-white">
              {lang === 'bn'
                ? `সম্পন্ন খাতা: ${formatNum(
                    completedPracticals.length,
                    lang
                  )} / ${formatNum(PRACTICAL_EXPERIMENTS.length, lang)}`
                : `Completed: ${completedPracticals.length} / ${PRACTICAL_EXPERIMENTS.length}`}
            </span>
          </div>

          <div
            role="group"
            aria-label={lang === 'bn' ? 'ব্যবহারিক বিষয় ফিল্টার' : 'Filter practicals by subject'}
            className="flex flex-wrap gap-2 no-print"
          >
            {[
              { key: 'all', bn: 'সকল বিষয় (১০)', en: 'All Subjects (10)' },
              { key: 'physics', bn: 'পদার্থবিজ্ঞান', en: 'Physics' },
              { key: 'chemistry', bn: 'রসায়ন', en: 'Chemistry' },
              { key: 'biology', bn: 'জীববিজ্ঞান', en: 'Biology' },
              { key: 'math', bn: 'উচ্চতর গণিত', en: 'Higher Math' },
              { key: 'ict', bn: 'ICT', en: 'ICT' },
            ].map((item) => {
              const active = practicalFilter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPracticalFilter(item.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                    active
                      ? isDark
                        ? 'bg-indigo-500/25 border-indigo-400/40 text-indigo-100'
                        : 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                      : isDark
                      ? 'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-slate-500'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                  }`}
                >
                  {lang === 'bn' ? item.bn : item.en}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPracticals.map((exp) => {
              const s = getSubjectByKey(exp.subjectKey);
              const isDone = completedPracticals.includes(exp.id);
              return (
                <div key={exp.id} className={`${cardClass} space-y-3.5`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                          isDark ? s.bgDark : s.bgLight
                        }`}
                      >
                        {s.shortName[lang]}
                      </span>
                      <span className="text-[11px] font-mono opacity-60">
                        {exp.expNo}
                      </span>
                    </div>

                    <button
                      onClick={() => onTogglePractical(exp.id)}
                      className={`no-print inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                        isDone
                          ? isDark
                            ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                            : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-400/40'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {isDone
                          ? lang === 'bn'
                            ? 'খাতায় লেখা সম্পন্ন'
                            : 'Notebook Done'
                          : lang === 'bn'
                          ? 'খাতায় সম্পন্ন (+১৫ XP)'
                          : 'Mark Done (+15 XP)'}
                      </span>
                    </button>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base leading-snug">
                    {exp.title[lang]}
                  </h3>

                  <div
                    className={`p-3 rounded-xl border font-formula text-xs sm:text-sm font-bold ${
                      isDark
                        ? 'bg-slate-900/75 border-slate-700 text-indigo-200'
                        : 'bg-indigo-50/60 border-indigo-100 text-indigo-950'
                    }`}
                  >
                    {exp.theoryFormula}
                  </div>

                  <p className="text-xs leading-relaxed opacity-85">
                    <span className="font-bold text-indigo-600 dark:text-indigo-300">
                      {lang === 'bn' ? 'পদ্ধতি: ' : 'Method: '}
                    </span>
                    {exp.procedure[lang]}
                  </p>

                  <p className="text-xs leading-relaxed opacity-85">
                    <span className="font-bold text-amber-600 dark:text-amber-300">
                      {lang === 'bn' ? 'সতর্কতা: ' : 'Precaution: '}
                    </span>
                    {exp.precautions[lang]}
                  </p>

                  <div
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      isDark
                        ? 'bg-teal-500/10 border-teal-400/25'
                        : 'bg-teal-50/70 border-teal-200'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-teal-700 dark:text-teal-300">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Viva: {exp.vivaQ[lang]}</span>
                    </div>
                    <p className="opacity-90 leading-relaxed">{exp.vivaA[lang]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: BANGLA & ENGLISH WRITING VAULT + WORD COUNT STUDIO */}
      {section === 'writing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {WRITING_TEMPLATES.map((tpl) => (
              <div key={tpl.id} className={`${cardClass} space-y-3`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-300">
                    {tpl.category[lang]}
                  </span>
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                      isDark
                        ? 'bg-amber-500/15 border-amber-400/30 text-amber-200'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    {formatNum(tpl.marks, lang)} {lang === 'bn' ? 'নম্বর' : 'Marks'}
                  </span>
                </div>

                <h3 className="font-extrabold text-base">{tpl.title[lang]}</h3>

                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    isDark
                      ? 'bg-indigo-500/10 border-indigo-400/25 text-indigo-100'
                      : 'bg-indigo-50/70 border-indigo-100 text-indigo-950'
                  }`}
                >
                  <span className="font-bold">
                    {lang === 'bn' ? 'বোর্ড কৌশল: ' : 'Scoring Tip: '}
                  </span>
                  {tpl.structureTip[lang]}
                </div>

                <pre
                  className={`p-3.5 rounded-xl border text-xs whitespace-pre-wrap font-sans leading-relaxed ${
                    isDark
                      ? 'bg-slate-900/75 border-slate-700 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {tpl.modelText}
                </pre>

                <div className="flex justify-end no-print">
                  <button
                    onClick={() => handleCopy(tpl.id, tpl.modelText)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-indigo-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 shadow-2xs'
                    }`}
                  >
                    {copiedId === tpl.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{lang === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>
                          {lang === 'bn' ? 'নমুনা কপি করুন' : 'Copy Template'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Word-Count Writing Practice Pad */}
          <div className={`${cardClass} space-y-3 no-print`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-base flex items-center gap-2">
                <PenTool className="w-4 h-4 text-teal-500" />
                <span>
                  {lang === 'bn'
                    ? 'নিজে লিখে অনুশীলন প্যাড (লাইভ শব্দ ও বাক্য গণনাসহ)'
                    : 'Live Word-Count Writing Practice Pad'}
                </span>
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                    wordCount >= activeRange.min && wordCount <= activeRange.max
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : wordCount > activeRange.max
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                  }`}
                >
                  {lang === 'bn'
                    ? `শব্দ: ${formatNum(wordCount, lang)} • বাক্য: ${formatNum(sentenceCount, lang)}`
                    : `Words: ${wordCount} • Sentences: ${sentenceCount}`}
                </span>
                {draftText && (
                  <button
                    type="button"
                    onClick={() => setDraftText('')}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer ${
                      isDark
                        ? 'border-slate-700 text-slate-300 hover:border-slate-500'
                        : 'border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {lang === 'bn' ? 'মুছে ফেলুন' : 'Clear Draft'}
                  </button>
                )}
              </div>
            </div>

            <div
              role="group"
              aria-label={lang === 'bn' ? 'লেখার লক্ষ্যমাত্রা মোড' : 'Writing target mode'}
              className="flex flex-wrap gap-2"
            >
              {(
                [
                  { id: 'summary' },
                  { id: 'graph' },
                  { id: 'paragraph' },
                ] as const
              ).map((m) => {
                const info = targetRanges[m.id];
                const active = writingTarget === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setWritingTarget(m.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      active
                        ? isDark
                          ? 'bg-teal-500/20 border-teal-400/40 text-teal-200'
                          : 'bg-teal-600 border-teal-600 text-white'
                        : isDark
                        ? 'bg-slate-900/60 border-slate-700 text-slate-400'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {lang === 'bn' ? info.labelBn : info.labelEn}
                  </button>
                );
              })}
            </div>

            <textarea
              rows={5}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'এখানে তোমার Summary, Graph Description বা বাংলা প্রতিবেদন লিখে শব্দ সংখ্যা ও গঠন অনুশীলন করো...'
                  : 'Draft your English Summary, Graph analysis, or Bangla Report here to check word count...'
              }
              className={`w-full p-3.5 rounded-xl border text-sm outline-none ${
                isDark
                  ? 'bg-slate-900/70 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
