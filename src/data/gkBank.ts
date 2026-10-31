import type { BilingualText } from '../types';

/**
 * General-knowledge bank for the medical admission test.
 *
 * The MBBS paper carries 10 GK marks and the HSC syllabus has no such paper, so
 * this bank lives outside `SubjectKey` on purpose: it is an admission section,
 * not one of the 11 HSC papers. Every fact below is one that does not change
 * with the news cycle — dates, founders, places, constants — so the bank cannot
 * silently go stale the way current-affairs questions do.
 */

export type GkCategory = 'bangladesh' | 'international' | 'science' | 'sports';

export interface GkQuestion {
  id: string;
  category: GkCategory;
  question: BilingualText;
  options: BilingualText[];
  correctIndex: number;
  explanation: BilingualText;
}

export const GK_CATEGORIES: { key: GkCategory; bn: string; en: string }[] = [
  { key: 'bangladesh', bn: 'বাংলাদেশ', en: 'Bangladesh' },
  { key: 'international', bn: 'আন্তর্জাতিক', en: 'International' },
  { key: 'science', bn: 'বিজ্ঞান', en: 'Science' },
  { key: 'sports', bn: 'ক্রীড়া', en: 'Sports' },
];

const q = (
  id: string,
  category: GkCategory,
  questionBn: string,
  questionEn: string,
  options: [string, string][],
  correctIndex: number,
  explanationBn: string,
  explanationEn: string
): GkQuestion => ({
  id,
  category,
  question: { bn: questionBn, en: questionEn },
  options: options.map(([bn, en]) => ({ bn, en })),
  correctIndex,
  explanation: { bn: explanationBn, en: explanationEn },
});

export const GK_QUESTIONS: GkQuestion[] = [
  // ── বাংলাদেশ ────────────────────────────────────────────────────────────
  q(
    'gk-1',
    'bangladesh',
    'মুক্তিযুদ্ধ শুরু হয় কোন তারিখে?',
    'On which date did the Liberation War begin?',
    [['২৬ মার্চ ১৯৭১', '26 March 1971'], ['১৬ ডিসেম্বর ১৯৭১', '16 December 1971'], ['৭ মার্চ ১৯৭১', '7 March 1971'], ['১৪ এপ্রিল ১৯৭১', '14 April 1971']],
    0,
    '২৫ মার্চ রাতের গণহত্যার পর ২৬ মার্চ প্রথম প্রহরে বঙ্গবন্ধু শেখ মুজিবুর রহমানের স্বাধীনতার ঘোষণা দিয়ে মুক্তিযুদ্ধ শুরু হয়।',
    'After the 25 March crackdown, independence was declared in the early hours of 26 March 1971.'
  ),
  q(
    'gk-2',
    'bangladesh',
    'বাংলাদেশের সংবিধান কবে কার্যকর হয়?',
    'When did the Constitution of Bangladesh come into force?',
    [['৪ নভেম্বর ১৯৭২', '4 November 1972'], ['১৬ ডিসেম্বর ১৯৭২', '16 December 1972'], ['২৬ মার্চ ১৯৭২', '26 March 1972'], ['১ জানুয়ারি ১৯৭৩', '1 January 1973']],
    1,
    'সংবিধান গৃহীত হয় ৪ নভেম্বর ১৯৭২ এবং কার্যকর হয় ১৬ ডিসেম্বর ১৯৭২ — প্রথম সাধারণ নির্বাচনের দিন।',
    'It was adopted on 4 November 1972 and took effect on 16 December 1972.'
  ),
  q(
    'gk-3',
    'bangladesh',
    'মুক্তিযুদ্ধে মোট কতটি সেক্টর ছিল?',
    'How many sectors did the Liberation War have?',
    [['৯', '9'], ['১১', '11'], ['১৪', '14'], ['১৬', '16']],
    1,
    'সেক্টর ছিল ১১টি; এছাড়া ছিল ৩টি ব্রিগেড ফোর্স (কে, এস, জেড) ও ১৩টি উপসেক্টর।',
    'There were 11 sectors, plus three brigade forces (K, S, Z) and 13 sub-sectors.'
  ),
  q(
    'gk-4',
    'bangladesh',
    'জাতীয় স্মৃতিসৌধের স্থপতি কে?',
    'Who designed the National Martyrs’ Memorial?',
    [['লুই আই কান', 'Louis I. Kahn'], ['সৈয়দ মঈনুল হোসেন', 'Syed Mainul Hossain'], ['হামিদুর রহমান', 'Hamidur Rahman'], ['নিতুন কুণ্ডু', 'Nitun Kundu']],
    1,
    'সাভারে জাতীয় স্মৃতিসৌধের নকশা করেন স্থপতি সৈয়দ মঈনুল হোসেন; লুই আই কান সংসদ ভবনের স্থপতি।',
    'Syed Mainul Hossain designed the memorial at Savar; Louis Kahn designed the Parliament building.'
  ),
  q(
    'gk-5',
    'bangladesh',
    'জাতীয় সংসদ ভবনের স্থপতি কে?',
    'Who is the architect of the National Parliament building?',
    [['সৈয়দ মঈনুল হোসেন', 'Syed Mainul Hossain'], ['মাজহারুল ইসলাম', 'Mazharul Islam'], ['লুই আই কান', 'Louis I. Kahn'], ['ফজলুর রহমান', 'Fazlur Rahman']],
    2,
    'আমেরিকান স্থপতি লুই আই কানের নকশায় জাতীয় সংসদ ভবন নির্মিত; এর অবস্থান শেরে-বাংলা নগরে।',
    'The Jatiya Sangsad Bhaban in Sher-e-Bangla Nagar was designed by the American architect Louis I. Kahn.'
  ),
  q(
    'gk-6',
    'bangladesh',
    'বাংলাদেশের আয়তন কত?',
    'What is the area of Bangladesh?',
    [['১,৪৭,৫৭০ বর্গকিমি', '1,47,570 sq km'], ['১,৪৪,০০০ বর্গকিমি', '1,44,000 sq km'], ['১,৫৫,৬২০ বর্গকিমি', '1,55,620 sq km'], ['১,৬৩,৬১০ বর্গকিমি', '1,63,610 sq km']],
    0,
    'বাংলাদেশের আয়তন ১,৪৭,৫৭০ বর্গকিলোমিটার, যা বিশ্বের ৯২তম বৃহৎ দেশ।',
    'Bangladesh covers 1,47,570 square kilometres.'
  ),
  q(
    'gk-7',
    'bangladesh',
    'ঢাকা বিশ্ববিদ্যালয় প্রতিষ্ঠিত হয় কোন সালে?',
    'In which year was the University of Dhaka established?',
    [['১৯১৭', '1917'], ['১৯২১', '1921'], ['১৯২৫', '1925'], ['১৯৩৫', '1935']],
    1,
    'ঢাকা বিশ্ববিদ্যালয় ১৯২১ সালে প্রতিষ্ঠিত হয়; ১৯৭১ সালে এটিই ছিল মুক্তিযুদ্ধের অন্যতম চালিকাশক্তি।',
    'The University of Dhaka was founded in 1921.'
  ),
  q(
    'gk-8',
    'bangladesh',
    'বাংলা একাডেমি প্রতিষ্ঠিত হয় কোন সালে?',
    'When was the Bangla Academy established?',
    [['১৯৪৮', '1948'], ['১৯৫২', '1952'], ['১৯৫৫', '1955'], ['১৯৬২', '1962']],
    2,
    'বাংলা একাডেমি প্রতিষ্ঠিত হয় ১৯৫৫ সালে; একুশে বইমেলার আয়োজকও এটি।',
    'Bangla Academy was established in 1955 and organises the Ekushey Book Fair.'
  ),
  q(
    'gk-9',
    'bangladesh',
    'পদ্মা সেতুর মূল দৈর্ঘ্য কত?',
    'What is the main span length of the Padma Bridge?',
    [['৪.৮ কিমি', '4.8 km'], ['৫.৬ কিমি', '5.6 km'], ['৬.১৫ কিমি', '6.15 km'], ['৯.৮৩ কিমি', '9.83 km']],
    2,
    'পদ্মা সেতুর মূল দৈর্ঘ্য ৬.১৫ কিমি; সংযোগ সড়কসহ মোট ৯.৮৩ কিমি। এটি দ্বিতল, রেলপথসহ।',
    'The bridge itself is 6.15 km; with approach roads it totals 9.83 km, and it carries a rail line on the lower deck.'
  ),
  q(
    'gk-10',
    'bangladesh',
    '৭ মার্চ ১৯৭১-এ বঙ্গবন্ধুর ঐতিহাসিক ভাষণ কোথায় দেওয়া হয়?',
    'Where was Bangabandhu’s 7 March 1971 speech delivered?',
    [['কার্জন হল', 'Curzon Hall'], ['রেসকোর্স ময়দান', 'Race Course Maidan'], ['পল্টন ময়দান', 'Paltan Maidan'], ['মানিক মিয়া এভিনিউ', 'Manik Mia Avenue']],
    1,
    'ভাষণটি দেওয়া হয় তৎকালীন রেসকোর্স ময়দানে, বর্তমানে সোহরাওয়ার্দী উদ্যান। ২০১৭ সালে এটি বিশ্ব ঐতিহ্যের তালিকায় (Memory of the World) অন্তর্ভুক্ত হয়।',
    'The speech was given at the Race Course Maidan, today Suhrawardy Udyan; UNESCO listed it in 2017.'
  ),

  // ── আন্তর্জাতিক ─────────────────────────────────────────────────────────
  q(
    'gk-11',
    'international',
    'জাতিসংঘ প্রতিষ্ঠিত হয় কোন সালে?',
    'In which year was the United Nations founded?',
    [['১৯১৯', '1919'], ['১৯৪৫', '1945'], ['১৯৪৭', '1947'], ['১৯৫০', '1950']],
    1,
    'জাতিসংঘ প্রতিষ্ঠিত হয় ২৪ অক্টোবর ১৯৪৫; সনদ স্বাক্ষরিত হয় সান ফ্রান্সিসকো সম্মেলনে, ৫০টি দেশের অংশগ্রহণে।',
    'The UN was founded on 24 October 1945 by 50 countries in San Francisco.'
  ),
  q(
    'gk-12',
    'international',
    'জাতিসংঘের সদর দপ্তর কোথায়?',
    'Where is the UN headquarters?',
    [['জেনেভা', 'Geneva'], ['প্যারিস', 'Paris'], ['নিউইয়র্ক', 'New York'], ['ভিয়েনা', 'Vienna']],
    2,
    'জাতিসংঘের প্রধান কার্যালয় নিউইয়র্কে; জেনেভা, ভিয়েনা ও নাইরোবিতে রয়েছে আঞ্চলিক কার্যালয়।',
    'The main UN headquarters is in New York, with offices in Geneva, Vienna and Nairobi.'
  ),
  q(
    'gk-13',
    'international',
    'UNESCO-এর সদর দপ্তর কোথায়?',
    'Where is UNESCO headquartered?',
    [['প্যারিস', 'Paris'], ['লন্ডন', 'London'], ['রোম', 'Rome'], ['জেনেভা', 'Geneva']],
    0,
    'UNESCO-এর সদর দপ্তর ফ্রান্সের প্যারিসে; এটি ১৯৪৫ সালে প্রতিষ্ঠিত হয়।',
    'UNESCO is headquartered in Paris and was founded in 1945.'
  ),
  q(
    'gk-14',
    'international',
    'বিশ্ব স্বাস্থ্য সংস্থার (WHO) সদর দপ্তর কোথায়?',
    'Where is the World Health Organization headquartered?',
    [['নিউইয়র্ক', 'New York'], ['জেনেভা', 'Geneva'], ['ব্রাসেলস', 'Brussels'], ['টোকিও', 'Tokyo']],
    1,
    'WHO-এর সদর দপ্তর সুইজারল্যান্ডের জেনেভায়; প্রতিষ্ঠা ৭ এপ্রিল ১৯৪৮ — এই দিনটিই বিশ্ব স্বাস্থ্য দিবস।',
    'WHO is headquartered in Geneva and was founded on 7 April 1948, now World Health Day.'
  ),
  q(
    'gk-15',
    'international',
    'নোবেল পুরস্কার প্রথম দেওয়া হয় কোন সালে?',
    'In which year were the Nobel Prizes first awarded?',
    [['১৮৯৫', '1895'], ['১৮৯৯', '1899'], ['১৯০১', '1901'], ['১৯১৩', '1913']],
    2,
    'আলফ্রেড নোবেলের উইল অনুযায়ী ১৯০১ সালে প্রথম নোবেল পুরস্কার দেওয়া হয়; ১৯৬৯ সাল থেকে অর্থনীতির পুরস্কার যোগ হয়।',
    'The first Nobel Prizes were awarded in 1901; the economics prize was added in 1969.'
  ),
  q(
    'gk-16',
    'international',
    'প্রথম বাঙালি হিসেবে নোবেল পুরস্কার পান কে?',
    'Who was the first Bengali to win a Nobel Prize?',
    [['অমর্ত্য সেন', 'Amartya Sen'], ['রবীন্দ্রনাথ ঠাকুর', 'Rabindranath Tagore'], ['মুহম্মদ ইউনূস', 'Muhammad Yunus'], ['সত্যেন্দ্রনাথ বসু', 'Satyendra Nath Bose']],
    1,
    'রবীন্দ্রনাথ ঠাকুর ১৯১৩ সালে সাহিত্যে নোবেল পান — গীতাঞ্জলির ইংরেজি অনুবাদের জন্য; তিনিই প্রথম এশীয় নোবেলজয়ী।',
    'Tagore won the 1913 Literature Nobel for the English Gitanjali — the first Asian laureate.'
  ),
  q(
    'gk-17',
    'international',
    'অমর্ত্য সেন কোন সালে নোবেল পুরস্কার পান?',
    'In which year did Amartya Sen receive the Nobel Prize?',
    [['১৯৮৮', '1988'], ['১৯৯২', '1992'], ['১৯৯৮', '1998'], ['২০০৬', '2006']],
    2,
    'অমর্ত্য সেন ১৯৯৮ সালে অর্থনীতিতে নোবেল পান কল্যাণ অর্থনীতিতে অবদানের জন্য; মুহম্মদ ইউনূস ২০০৬ সালে শান্তিতে।',
    'Amartya Sen won the 1998 Economics Nobel; Muhammad Yunus won the 2006 Peace Prize.'
  ),
  q(
    'gk-18',
    'international',
    'সার্ক (SAARC) প্রতিষ্ঠিত হয় কোন সালে?',
    'In which year was SAARC founded?',
    [['১৯৮৩', '1983'], ['১৯৮৫', '1985'], ['১৯৮৭', '1987'], ['১৯৯০', '1990']],
    1,
    'সার্ক প্রতিষ্ঠিত হয় ৮ ডিসেম্বর ১৯৮৫, ঢাকায়; সদর দপ্তর কাঠমান্ডুতে।',
    'SAARC was founded in Dhaka on 8 December 1985; its secretariat is in Kathmandu.'
  ),
  q(
    'gk-19',
    'international',
    'জাতিসংঘ নিরাপত্তা পরিষদের স্থায়ী সদস্য কতটি?',
    'How many permanent members does the UN Security Council have?',
    [['৫', '5'], ['১০', '10'], ['১৫', '15'], ['৭', '7']],
    0,
    'স্থায়ী সদস্য ৫টি — যুক্তরাষ্ট্র, যুক্তরাজ্য, ফ্রান্স, রাশিয়া ও চীন (ভেটো ক্ষমতাসহ); অস্থায়ী সদস্য ১০টি।',
    'There are five permanent members with veto power and ten elected members.'
  ),
  q(
    'gk-20',
    'international',
    'বিশ্ব মানবাধিকার দিবস কবে?',
    'When is Human Rights Day observed?',
    [['১০ ডিসেম্বর', '10 December'], ['২৪ অক্টোবর', '24 October'], ['১ মে', '1 May'], ['৮ মার্চ', '8 March']],
    0,
    '১০ ডিসেম্বর — ১৯৪৮ সালে এই দিনেই জাতিসংঘ সাধারণ পরিষদে মানবাধিকার সার্বজনীন ঘোষণাপত্র গৃহীত হয়।',
    '10 December marks the 1948 adoption of the Universal Declaration of Human Rights.'
  ),

  // ── বিজ্ঞান ─────────────────────────────────────────────────────────────
  q(
    'gk-21',
    'science',
    'মানুষের দেহকোষে ক্রোমোজোম সংখ্যা কত?',
    'How many chromosomes are in a human somatic cell?',
    [['২৩', '23'], ['৪৪', '44'], ['৪৬', '46'], ['৪৮', '48']],
    2,
    'দেহকোষে ৪৬টি (২৩ জোড়া) ক্রোমোজোম; জননকোষে (গ্যামেট) অর্ধেক — ২৩টি।',
    'Somatic cells have 46 (23 pairs); gametes have 23.'
  ),
  q(
    'gk-22',
    'science',
    'শূন্যস্থানে আলোর বেগ কত?',
    'What is the speed of light in vacuum?',
    [['৩ × ১০⁶ m/s', '3 × 10⁶ m/s'], ['৩ × ১০⁸ m/s', '3 × 10⁸ m/s'], ['৩ × ১০¹⁰ m/s', '3 × 10¹⁰ m/s'], ['৩ × ১০⁵ m/s', '3 × 10⁵ m/s']],
    1,
    'শূন্যস্থানে আলোর বেগ প্রায় ৩ × ১০⁸ m/s (২,৯৯,৭৯২,৪৫৮ m/s); বায়ুতে প্রায় একই ধরা হয়।',
    'Light travels at about 3 × 10⁸ m/s in vacuum.'
  ),
  q(
    'gk-23',
    'science',
    'মানুষের রক্তের স্বাভাবিক pH কত?',
    'What is the normal pH of human blood?',
    [['৭.০', '7.0'], ['৭.৪', '7.4'], ['৭.৮', '7.8'], ['৬.৮', '6.8']],
    1,
    'রক্তের স্বাভাবিক pH ৭.৩৫–৭.৪৫; এই সীমা অতিক্রম করলে অ্যাসিডোসিস বা অ্যালকালোসিস হয়।',
    'Normal blood pH is 7.35–7.45; outside that range causes acidosis or alkalosis.'
  ),
  q(
    'gk-24',
    'science',
    'সূর্যের নিকটতম নক্ষত্র (সূর্য ছাড়া) কোনটি?',
    'Which is the nearest star to the Sun?',
    [['সিরিয়াস', 'Sirius'], ['প্রক্সিমা সেন্টারি', 'Proxima Centauri'], ['আলফা সেন্টারি A', 'Alpha Centauri A'], ['বেটেলজিউস', 'Betelgeuse']],
    1,
    'প্রক্সিমা সেন্টারি সূর্য থেকে প্রায় ৪.২৪ আলোকবর্ষ দূরে — নিকটতম নক্ষত্র।',
    'Proxima Centauri is about 4.24 light-years away — the closest star.'
  ),
  q(
    'gk-25',
    'science',
    'সৌরজগতের বৃহত্তম গ্রহ কোনটি?',
    'Which is the largest planet in the solar system?',
    [['শনি', 'Saturn'], ['নেপচুন', 'Neptune'], ['বৃহস্পতি', 'Jupiter'], ['ইউরেনাস', 'Uranus']],
    2,
    'বৃহস্পতি আয়তন ও ভরে সবচেয়ে বড়; শনি দ্বিতীয়, তবে ঘনত্বে সবচেয়ে কম।',
    'Jupiter is the largest by mass and size; Saturn is second.'
  ),
  q(
    'gk-26',
    'science',
    'পানির ঘনত্ব সর্বোচ্চ হয় কোন তাপমাত্রায়?',
    'At what temperature is water densest?',
    [['০°C', '0°C'], ['৪°C', '4°C'], ['১০০°C', '100°C'], ['২৫°C', '25°C']],
    1,
    'পানির ঘনত্ব ৪°C-এ সর্বোচ্চ (১ g/cm³); এই কারণেই বরফ পানিতে ভেসে থাকে এবং হ্রদের পানি ওপর থেকে জমে।',
    'Water is densest at 4°C, which is why ice floats and lakes freeze from the top.'
  ),
  q(
    'gk-27',
    'science',
    'DNA-এর দ্বৈত হেলিক্স মডেল কারা দেন?',
    'Who proposed the DNA double-helix model?',
    [['মেন্ডেল ও মর্গান', 'Mendel and Morgan'], ['ওয়াটসন ও ক্রিক', 'Watson and Crick'], ['পাস্তুর ও কোচ', 'Pasteur and Koch'], ['ডারউইন ও ল্যামার্ক', 'Darwin and Lamarck']],
    1,
    '১৯৫৩ সালে জেমস ওয়াটসন ও ফ্রান্সিস ক্রিক DNA-এর দ্বৈত হেলিক্স মডেল প্রস্তাব করেন।',
    'Watson and Crick proposed the double helix in 1953.'
  ),
  q(
    'gk-28',
    'science',
    'মানুষের রক্তের গ্রুপ (ABO) আবিষ্কার করেন কে?',
    'Who discovered the human ABO blood groups?',
    [['উইলিয়াম হার্ভে', 'William Harvey'], ['কার্ল ল্যান্ডস্টাইনার', 'Karl Landsteiner'], ['রোনাল্ড রস', 'Ronald Ross'], ['আলেকজান্ডার ফ্লেমিং', 'Alexander Fleming']],
    1,
    'কার্ল ল্যান্ডস্টাইনার ১৯০১ সালে ABO রক্তের গ্রুপ আবিষ্কার করেন; এ জন্য ১৯৩০ সালে নোবেল পান।',
    'Karl Landsteiner discovered the ABO groups in 1901 and won the 1930 Nobel.'
  ),

  // ── ক্রীড়া ──────────────────────────────────────────────────────────────
  q(
    'gk-29',
    'sports',
    'ফুটবল বিশ্বকাপ কত বছর পর পর অনুষ্ঠিত হয়?',
    'How often is the FIFA World Cup held?',
    [['২ বছর', 'Every 2 years'], ['৩ বছর', 'Every 3 years'], ['৪ বছর', 'Every 4 years'], ['৫ বছর', 'Every 5 years']],
    2,
    '১৯৩০ সাল থেকে প্রতি ৪ বছরে একবার (দ্বিতীয় বিশ্বযুদ্ধের সময় দুবার বাদে)। ২০২২ সালের বিজয়ী আর্জেন্টিনা।',
    'Held every four years since 1930; Argentina won in 2022.'
  ),
  q(
    'gk-30',
    'sports',
    'ক্রিকেটে একটি ওভারে সর্বোচ্চ কতটি বৈধ বল হয়?',
    'How many legal balls are bowled in a cricket over?',
    [['৪', '4'], ['৫', '5'], ['৬', '6'], ['৮', '8']],
    2,
    'এক ওভারে ৬টি বৈধ বল; ওয়াইড ও নো-বল বৈধ হিসেবে গণনা হয় না, তাই ওভার লম্বা হতে পারে।',
    'Six legal deliveries per over; wides and no-balls do not count.'
  ),
];

export const GK_RAPID_ROUND_SIZE = 10;

/** Deterministic shuffle so the same seed gives the same round (testable). */
export function pickGkRound(
  category: GkCategory | 'all',
  size = GK_RAPID_ROUND_SIZE,
  pool: GkQuestion[] = GK_QUESTIONS
): GkQuestion[] {
  const filtered = category === 'all' ? pool : pool.filter((item) => item.category === category);
  const shuffled = [...filtered];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(size, shuffled.length));
}
