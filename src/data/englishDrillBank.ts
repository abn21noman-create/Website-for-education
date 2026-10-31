import type { BilingualText } from '../types';

/**
 * English drill bank.
 *
 * English is the one paper where MCQs are decided by rules rather than recall:
 * tense forms, prepositions, vocabulary in context and fixed idioms. The HSC
 * paper and the medical test both draw from the same four groups, so the bank is
 * organised by rule family instead of by chapter.
 */

export type EnglishDrillCategory = 'tense' | 'preposition' | 'vocabulary' | 'idiom';

export interface EnglishDrillQuestion {
  id: string;
  category: EnglishDrillCategory;
  question: BilingualText;
  options: BilingualText[];
  correctIndex: number;
  explanation: BilingualText;
}

export const ENGLISH_DRILL_CATEGORIES: { key: EnglishDrillCategory; bn: string; en: string }[] = [
  { key: 'tense', bn: 'Tense ও Verb', en: 'Tense & Verb' },
  { key: 'preposition', bn: 'Preposition', en: 'Preposition' },
  { key: 'vocabulary', bn: 'Vocabulary', en: 'Vocabulary' },
  { key: 'idiom', bn: 'Idioms', en: 'Idioms' },
];

const q = (
  id: string,
  category: EnglishDrillCategory,
  questionBn: string,
  questionEn: string,
  options: [string, string][],
  correctIndex: number,
  explanationBn: string,
  explanationEn: string
): EnglishDrillQuestion => ({
  id,
  category,
  question: { bn: questionBn, en: questionEn },
  options: options.map(([bn, en]) => ({ bn, en })),
  correctIndex,
  explanation: { bn: explanationBn, en: explanationEn },
});

export const ENGLISH_DRILL_QUESTIONS: EnglishDrillQuestion[] = [
  // ── Tense & Verb ────────────────────────────────────────────────────────
  q(
    'ed-1',
    'tense',
    'She ___ in this school since 2019.',
    'She ___ in this school since 2019.',
    [['works', 'works'], ['has been working', 'has been working'], ['worked', 'worked'], ['is working', 'is working']],
    1,
    'since + নির্দিষ্ট সময় বোঝালে present perfect continuous হয় — কাজটি অতীতে শুরু হয়ে এখনো চলছে।',
    'With since plus a point in time we use the present perfect continuous: the action started then and still continues.'
  ),
  q(
    'ed-2',
    'tense',
    'By the time we arrived, the film ___.',
    'By the time we arrived, the film ___.',
    [['starts', 'starts'], ['has started', 'has started'], ['had started', 'had started'], ['was starting', 'was starting']],
    2,
    'অতীতে দুটি ঘটনার মধ্যে আগেরটি past perfect (had + V3) হয়।',
    'Of two past events, the earlier one takes the past perfect: had + V3.'
  ),
  q(
    'ed-3',
    'tense',
    'Look! It ___ heavily.',
    'Look! It ___ heavily.',
    [['rains', 'rains'], ['is raining', 'is raining'], ['rained', 'rained'], ['has rained', 'has rained']],
    1,
    '“Look!” দিয়ে এই মুহূর্তে চলমান কাজ বোঝায়, তাই present continuous।',
    '“Look!” signals an action happening right now, so the present continuous is right.'
  ),
  q(
    'ed-4',
    'tense',
    'I ___ him at the library yesterday.',
    'I ___ him at the library yesterday.',
    [['have met', 'have met'], ['met', 'met'], ['had met', 'had met'], ['meet', 'meet']],
    1,
    'yesterday-এর মতো নির্দিষ্ট অতীত সময় থাকলে present perfect নয়, simple past বসে।',
    'A definite past time like yesterday takes the simple past, not the present perfect.'
  ),
  q(
    'ed-5',
    'tense',
    'If it rains tomorrow, we ___ the match.',
    'If it rains tomorrow, we ___ the match.',
    [['cancel', 'cancel'], ['would cancel', 'would cancel'], ['will cancel', 'will cancel'], ['cancelled', 'cancelled']],
    2,
    'প্রথম conditional: if + present simple, তারপর will + verb-এর base form।',
    'First conditional: if + present simple, then will + base verb.'
  ),
  q(
    'ed-6',
    'tense',
    'The train ___ before we reached the station.',
    'The train ___ before we reached the station.',
    [['left', 'left'], ['had left', 'had left'], ['has left', 'has left'], ['leaves', 'leaves']],
    1,
    'স্টেশনে পৌঁছানোর আগেই ট্রেন ছেড়ে গিয়েছিল — আগের কাজ, তাই past perfect।',
    'The train left before we arrived, so the earlier action takes the past perfect.'
  ),
  q(
    'ed-7',
    'tense',
    'He ___ to school on foot every day.',
    'He ___ to school on foot every day.',
    [['go', 'go'], ['goes', 'goes'], ['is going', 'is going'], ['went', 'went']],
    1,
    'every day বোঝায় অভ্যাস; তৃতীয় পুরুষ একবচনে verb-এর সাথে -s যোগ হয়।',
    '“Every day” marks a habit, and third-person singular takes -s: goes.'
  ),
  q(
    'ed-8',
    'tense',
    'He ___ here for five years and still enjoys the city.',
    'He ___ here for five years and still enjoys the city.',
    [['lives', 'lives'], ['is living', 'is living'], ['has been living', 'has been living'], ['lived', 'lived']],
    2,
    'for + সময়ের ব্যাপ্তি এবং কাজ এখনো চলছে — present perfect continuous।',
    'For plus a duration with the action still continuing needs the present perfect continuous.'
  ),

  // ── Preposition ─────────────────────────────────────────────────────────
  q(
    'ed-9',
    'preposition',
    'She is good ___ mathematics.',
    'She is good ___ mathematics.',
    [['in', 'in'], ['at', 'at'], ['on', 'on'], ['with', 'with']],
    1,
    '“Good at” হলো নির্দিষ্ট শব্দবন্ধ — দক্ষতা বোঝাতে at ব্যবহৃত হয়।',
    '“Good at” is a fixed collocation used for skills.'
  ),
  q(
    'ed-10',
    'preposition',
    'The child is afraid ___ darkness.',
    'The child is afraid ___ darkness.',
    [['from', 'from'], ['of', 'of'], ['with', 'with'], ['to', 'to']],
    1,
    '“Afraid of” — ভয় বোঝানোর নির্দিষ্ট preposition।',
    '“Afraid of” is the fixed collocation for fear.'
  ),
  q(
    'ed-11',
    'preposition',
    'He insisted ___ paying the bill himself.',
    'He insisted ___ paying the bill himself.',
    [['to', 'to'], ['for', 'for'], ['on', 'on'], ['about', 'about']],
    2,
    'insist-এর পরে সর্বদা on বসে, আর তারপর verb + ing: insisted on paying।',
    'Insist always takes on, followed by a gerund: insisted on paying.'
  ),
  q(
    'ed-12',
    'preposition',
    'We arrived ___ the airport just in time.',
    'We arrived ___ the airport just in time.',
    [['to', 'to'], ['in', 'in'], ['at', 'at'], ['on', 'on']],
    2,
    'নির্দিষ্ট বিন্দু (airport, station, bus stop) বোঝাতে at; বড় শহরে in।',
    'Arrive at a specific point such as an airport; arrive in a city or country.'
  ),
  q(
    'ed-13',
    'preposition',
    'I am looking forward ___ hearing from you.',
    'I am looking forward ___ hearing from you.',
    [['for', 'for'], ['to', 'to'], ['at', 'at'], ['with', 'with']],
    1,
    'look forward to — এখানে to হলো preposition, তাই পরে gerund (hearing) আসে।',
    'Look forward to takes a preposition, so a gerund follows: hearing.'
  ),
  q(
    'ed-14',
    'preposition',
    'She is married ___ my cousin.',
    'She is married ___ my cousin.',
    [['with', 'with'], ['to', 'to'], ['by', 'by'], ['of', 'of']],
    1,
    '“Married to” — ইংরেজিতে বিয়েকে with দিয়ে বলা হয় না।',
    'English uses “married to”, never “married with”.'
  ),
  q(
    'ed-15',
    'preposition',
    'The book is ___ the table.',
    'The book is ___ the table.',
    [['in', 'in'], ['at', 'at'], ['on', 'on'], ['under', 'under']],
    2,
    'পৃষ্ঠের উপরে রাখা বোঝাতে on; ভিতরে হলে in।',
    'Something resting on a surface takes on; inside would need in.'
  ),
  q(
    'ed-16',
    'preposition',
    'He is an expert ___ repairing old radios.',
    'He is an expert ___ repairing old radios.',
    [['at', 'at'], ['for', 'for'], ['of', 'of'], ['with', 'with']],
    0,
    '“Expert at/in” দুটোই চলে, তবে দক্ষতা বোঝাতে at বেশি স্বাভাবিক।',
    'Both “expert at” and “expert in” exist; at is the usual choice for a skill.'
  ),

  // ── Vocabulary ──────────────────────────────────────────────────────────
  q(
    'ed-17',
    'vocabulary',
    'Choose the synonym of “brave”.',
    'Choose the synonym of “brave”.',
    [['timid', 'timid'], ['courageous', 'courageous'], ['careless', 'careless'], ['lazy', 'lazy']],
    1,
    'brave = সাহসী; courageous একই অর্থ, timid বিপরীতার্থক।',
    'Brave means courageous; timid is its opposite.'
  ),
  q(
    'ed-18',
    'vocabulary',
    'Choose the antonym of “generous”.',
    'Choose the antonym of “generous”.',
    [['kind', 'kind'], ['miserly', 'miserly'], ['wealthy', 'wealthy'], ['helpful', 'helpful']],
    1,
    'generous = দানশীল; miserly = কৃপণ — বিপরীত অর্থ।',
    'Generous means giving freely; miserly means stingy — the antonym.'
  ),
  q(
    'ed-19',
    'vocabulary',
    'The word “obsolete” means —',
    'The word “obsolete” means —',
    [['brand new', 'brand new'], ['out of date', 'out of date'], ['very costly', 'very costly'], ['hard to find', 'hard to find']],
    1,
    'obsolete = অচল, পুরোনো হয়ে যাওয়া; যেমন obsolete technology।',
    'Obsolete means no longer in use, like obsolete technology.'
  ),
  q(
    'ed-20',
    'vocabulary',
    'Choose the synonym of “diligent”.',
    'Choose the synonym of “diligent”.',
    [['careless', 'careless'], ['hardworking', 'hardworking'], ['dull', 'dull'], ['proud', 'proud']],
    1,
    'diligent = পরিশ্রমী, অধ্যবসায়ী; hardworking সমার্থক।',
    'Diligent means showing steady effort; hardworking is its synonym.'
  ),
  q(
    'ed-21',
    'vocabulary',
    'Choose the antonym of “transparent”.',
    'Choose the antonym of “transparent”.',
    [['clear', 'clear'], ['opaque', 'opaque'], ['thin', 'thin'], ['shiny', 'shiny']],
    1,
    'transparent = স্বচ্ছ; opaque = আলো ঢোকার পথ বন্ধ, অনচ্ছ।',
    'Transparent lets light through; opaque blocks it.'
  ),
  q(
    'ed-22',
    'vocabulary',
    'Water is becoming ___ in many parts of the country.',
    'Water is becoming ___ in many parts of the country.',
    [['abundant', 'abundant'], ['scarce', 'scarce'], ['plentiful', 'plentiful'], ['common', 'common']],
    1,
    'বাক্যের অর্থ দাঁড়ায় পানির অভাব বোঝাতে, তাই scarce (দুষ্প্রাপ্য)।',
    'The sentence needs the sense of shortage, so scarce fits.'
  ),
  q(
    'ed-23',
    'vocabulary',
    'Choose the synonym of “rapid”.',
    'Choose the synonym of “rapid”.',
    [['slow', 'slow'], ['swift', 'swift'], ['steady', 'steady'], ['silent', 'silent']],
    1,
    'rapid = দ্রুত; swift সমার্থক, slow বিপরীত।',
    'Rapid means fast; swift is the synonym, slow the antonym.'
  ),
  q(
    'ed-24',
    'vocabulary',
    'Choose the antonym of “humble”.',
    'Choose the antonym of “humble”.',
    [['modest', 'modest'], ['arrogant', 'arrogant'], ['polite', 'polite'], ['simple', 'simple']],
    1,
    'humble = বিনয়ী; arrogant = অহংকারী — বিপরীত।',
    'Humble means modest; arrogant is the opposite.'
  ),

  // ── Idioms ──────────────────────────────────────────────────────────────
  q(
    'ed-25',
    'idiom',
    '“To beat about the bush” means —',
    '“To beat about the bush” means —',
    [['to speak directly', 'to speak directly'], ['to avoid the main point', 'to avoid the main point'], ['to work hard', 'to work hard'], ['to tell a lie', 'to tell a lie']],
    1,
    'বাগধারাটির অর্থ আসল কথায় না এসে অপ্রাসঙ্গিক কথা বলা।',
    'The idiom means circling around instead of coming to the point.'
  ),
  q(
    'ed-26',
    'idiom',
    '“A piece of cake” means —',
    '“A piece of cake” means —',
    [['a tasty food', 'a tasty food'], ['a very easy task', 'a very easy task'], ['a small gift', 'a small gift'], ['a hard problem', 'a hard problem']],
    1,
    'কোনো কাজ খুব সহজ হলে বলা হয় it is a piece of cake।',
    'Something very easy is described as a piece of cake.'
  ),
  q(
    'ed-27',
    'idiom',
    '“Once in a blue moon” means —',
    '“Once in a blue moon” means —',
    [['very often', 'very often'], ['very rarely', 'very rarely'], ['every night', 'every night'], ['at midnight', 'at midnight']],
    1,
    'খুব কম সময়ে ঘটে এমন কিছু বোঝায় — once in a blue moon।',
    'It describes something that happens very rarely.'
  ),
  q(
    'ed-28',
    'idiom',
    '“To call it a day” means —',
    '“To call it a day” means —',
    [['to start working', 'to start working'], ['to stop working for the day', 'to stop working for the day'], ['to name a day', 'to name a day'], ['to celebrate', 'to celebrate']],
    1,
    'দিনের কাজ শেষ করে বিশ্রাম নেওয়া বোঝাতে ব্যবহৃত হয়।',
    'It means to stop working and rest for the rest of the day.'
  ),
  q(
    'ed-29',
    'idiom',
    '“In black and white” means —',
    '“In black and white” means —',
    [['in colour', 'in colour'], ['in writing', 'in writing'], ['in secret', 'in secret'], ['in doubt', 'in doubt']],
    1,
    'লিখিতভাবে, স্পষ্ট প্রমাণসহ — এই অর্থে ব্যবহৃত হয়।',
    'It means in writing, with clear proof.'
  ),
  q(
    'ed-30',
    'idiom',
    '“To make both ends meet” means —',
    '“To make both ends meet” means —',
    [['to earn a lot', 'to earn a lot'], ['to live within one’s means', 'to live within one’s means'], ['to borrow money', 'to borrow money'], ['to travel far', 'to travel far']],
    1,
    'আয় দিয়ে সংসার চালানো, অর্থাৎ সামর্থ্যের ভেতরে থাকা।',
    'It means to manage with the money you have.'
  ),
  q(
    'ed-31',
    'idiom',
    '“A white elephant” means —',
    '“A white elephant” means —',
    [['a rare animal', 'a rare animal'], ['a costly but useless possession', 'a costly but useless possession'], ['a lucky charm', 'a lucky charm'], ['a big gift', 'a big gift']],
    1,
    'খরচ বেশি কিন্তু কাজে আসে না — এমন সম্পদ বা প্রকল্প।',
    'It is a costly possession or project that is of little use.'
  ),
  q(
    'ed-32',
    'idiom',
    '“To give up” means —',
    '“To give up” means —',
    [['to continue', 'to continue'], ['to abandon', 'to abandon'], ['to hand over', 'to hand over'], ['to wake up', 'to wake up']],
    1,
    'কোনো কাজ বা অভ্যাস ছেড়ে দেওয়া — to abandon।',
    'It means to stop doing something: to abandon it.'
  ),
];

export const ENGLISH_DRILL_ROUND_SIZE = 10;

/** Deterministic-ish shuffle so a round never repeats the same order. */
export function pickEnglishRound(
  category: EnglishDrillCategory | 'all',
  size = ENGLISH_DRILL_ROUND_SIZE,
  pool: EnglishDrillQuestion[] = ENGLISH_DRILL_QUESTIONS
): EnglishDrillQuestion[] {
  const filtered = category === 'all' ? pool : pool.filter((item) => item.category === category);
  const shuffled = [...filtered];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(size, shuffled.length));
}
