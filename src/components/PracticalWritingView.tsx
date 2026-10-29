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
} from 'lucide-react';
import { Lang, SubjectKey, Theme } from '../types';
import { getSubjectByKey } from '../data/syllabusData';
import { formatNum } from '../lib/i18n';

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
];

export const PracticalWritingView: React.FC<PracticalWritingViewProps> = ({
  lang,
  theme,
  completedPracticals,
  onTogglePractical,
}) => {
  const isDark = theme === 'dark';
  const [section, setSection] = useState<'practical' | 'writing'>('practical');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<string>('');

  const wordCount = draftText.trim()
    ? draftText.trim().split(/\s+/).length
    : 0;

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {PRACTICAL_EXPERIMENTS.map((exp) => {
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
                    ? 'নিজে লিখে অনুশীলন প্যাড (লাইভ শব্দ গণনাসহ — Summary / Graph / প্রতিবেদন)'
                    : 'Live Word-Count Writing Practice Pad (Summary / Graph / Report)'}
                </span>
              </h3>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
                {lang === 'bn'
                  ? `শব্দ সংখ্যা: ${formatNum(wordCount, lang)} (Summary আদর্শ মান: ৫০–৬৫ শব্দ)`
                  : `Words: ${wordCount} (Summary target: 50–65 words)`}
              </span>
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
