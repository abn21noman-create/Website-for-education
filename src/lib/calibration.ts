/**
 * Metacognition: how well the student's confidence matches reality.
 *
 * Two measurements, both cheap for the student and both well studied:
 *
 *  1. A prediction before the paper ("how much do you think you will score?").
 *     Absolute calibration — the gap between predicted and actual — is the
 *     classic measure of metacognitive accuracy, and low-performers reliably
 *     over-predict (Hacker et al.; Miller & Geraci; Bol & Hacker).
 *
 *  2. A confidence tag on each wrong answer. Errors made with high confidence
 *     are the dangerous ones — and, counter-intuitively, they are also the ones
 *     feedback corrects best (Butterfield & Metcalfe 2001, "hypercorrection").
 *     So these become a drill of their own instead of being lost in the mistake
 *     bank.
 *
 * Everything is stored on the device, like the rest of the app.
 */

export type ConfidenceTag = 'sure' | 'guess';

export interface ConfidenceEntry {
  tag: ConfidenceTag;
  correct: boolean;
  at: string;
}

export const CONFIDENCE_KEY = 'hsc28_confidence_v1';
export const PREDICTION_KEY = 'hsc28_prediction_v1';

export interface PredictionEntry {
  predicted: number;
  actual: number;
  at: string;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode — the session still works */
  }
}

export function loadConfidence(): Record<string, ConfidenceEntry> {
  const parsed = readJson<Record<string, ConfidenceEntry>>(CONFIDENCE_KEY, {});
  const out: Record<string, ConfidenceEntry> = {};
  for (const [id, entry] of Object.entries(parsed || {})) {
    if (!entry || (entry.tag !== 'sure' && entry.tag !== 'guess')) continue;
    out[id] = {
      tag: entry.tag,
      correct: Boolean(entry.correct),
      at: typeof entry.at === 'string' ? entry.at : new Date().toISOString(),
    };
  }
  return out;
}

/** Tag one answer; tagging the same answer again with the same tag clears it. */
export function saveConfidence(
  questionId: string,
  tag: ConfidenceTag | null,
  correct: boolean
): Record<string, ConfidenceEntry> {
  const all = loadConfidence();
  if (!tag) delete all[questionId];
  else all[questionId] = { tag, correct, at: new Date().toISOString() };
  writeJson(CONFIDENCE_KEY, all);
  return all;
}

export interface CalibrationSummary {
  /** Answers the student was sure about — and got right. The solid part. */
  solid: number;
  /** Sure and wrong: a misconception wearing a confident face. */
  blindSpots: number;
  /** Guessed right: knowledge that is not reliable yet. */
  fragile: number;
  /** Guessed and wrong: an honest gap, already in the mistake bank. */
  knownGaps: number;
  total: number;
  /** Percent of confident answers that were actually correct. */
  confidentAccuracy: number;
  /** Share of answers marked confident, 0–100. */
  confidenceRate: number;
  verdict: 'overconfident' | 'calibrated' | 'underconfident' | 'unknown';
  messageBn: string;
  messageEn: string;
  blindSpotIds: string[];
}

export function confidenceSummary(
  entries: Record<string, ConfidenceEntry>
): CalibrationSummary {
  let solid = 0;
  let blindSpots = 0;
  let fragile = 0;
  let knownGaps = 0;
  const blindSpotIds: string[] = [];

  for (const [id, entry] of Object.entries(entries)) {
    if (entry.tag === 'sure' && entry.correct) solid += 1;
    else if (entry.tag === 'sure' && !entry.correct) {
      blindSpots += 1;
      blindSpotIds.push(id);
    } else if (entry.tag === 'guess' && entry.correct) fragile += 1;
    else knownGaps += 1;
  }

  const total = solid + blindSpots + fragile + knownGaps;
  const confident = solid + blindSpots;
  const answered = solid + blindSpots + fragile + knownGaps;
  const correctTotal = solid + fragile;
  const confidentAccuracy = confident === 0 ? 0 : Math.round((solid / confident) * 100);
  const confidenceRate = total === 0 ? 0 : Math.round((confident / total) * 100);

  let verdict: CalibrationSummary['verdict'] = 'unknown';
  if (total >= 6) {
    const accuracy = answered === 0 ? 0 : (correctTotal / answered) * 100;
    const bias = confidenceRate - accuracy;
    verdict = bias >= 12 ? 'overconfident' : bias <= -12 ? 'underconfident' : 'calibrated';
  }

  const messages: Record<CalibrationSummary['verdict'], { bn: string; en: string }> = {
    overconfident: {
      bn: `যতটা নিশ্চিত দেখাচ্ছে, ততটা ঠিক হচ্ছে না — ${blindSpots}টি ভুলে তুমি পুরোপুরি নিশ্চিত ছিলে। এগুলোই সবচেয়ে বিপজ্জনক, আর ঠিক এগুলোই সহজে ঠিক হয়।`,
      en: `You are more confident than accurate — ${blindSpots} wrong answers felt certain. Those are the dangerous ones, and also the ones feedback fixes best.`,
    },
    calibrated: {
      bn: 'তোমার নিশ্চয়তা আর সত্যিকারের ফল মিলছে — এই ভারসাম্যটাই ধরে রাখো।',
      en: 'Your confidence and your results line up — keep that balance.',
    },
    underconfident: {
      bn: 'তুমি নিজের চেয়ে ভালো করছ — যে প্রশ্নগুলো “অনুমান” বলে ঠিক করেছ, সেগুলো আসলে জানা।',
      en: 'You are doing better than you think — the ones you called guesses turned out right.',
    },
    unknown: {
      bn: 'এখনো যথেষ্ট তথ্য নেই — কয়েকটা পরীক্ষার পরে ভুলের নিচে “নিশ্চিত/অনুমান” ট্যাগ দিলে ছবিটা তৈরি হবে।',
      en: 'Not enough data yet — tag a few wrong answers as confident or guessed and the picture forms.',
    },
  };

  return {
    solid,
    blindSpots,
    fragile,
    knownGaps,
    total,
    confidentAccuracy,
    confidenceRate,
    verdict,
    messageBn: messages[verdict].bn,
    messageEn: messages[verdict].en,
    blindSpotIds,
  };
}

export function loadPredictions(): PredictionEntry[] {
  const parsed = readJson<PredictionEntry[]>(PREDICTION_KEY, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (entry) =>
      entry &&
      typeof entry.predicted === 'number' &&
      typeof entry.actual === 'number' &&
      typeof entry.at === 'string'
  );
}

/** Keeps the last 40 predictions — enough for a trend, small enough to stay tidy. */
export function recordPrediction(predicted: number, actual: number): PredictionEntry[] {
  const safePredicted = Math.max(0, Math.min(100, Math.round(predicted)));
  const safeActual = Math.max(0, Math.min(100, Math.round(actual)));
  const next = [
    ...loadPredictions(),
    { predicted: safePredicted, actual: safeActual, at: new Date().toISOString() },
  ].slice(-40);
  writeJson(PREDICTION_KEY, next);
  return next;
}

export interface PredictionSummary {
  attempts: number;
  last: PredictionEntry | null;
  averagePredicted: number;
  averageActual: number;
  /** Positive means the student expects more than they deliver. */
  bias: number;
  verdict: 'overconfident' | 'calibrated' | 'underconfident' | 'unknown';
  messageBn: string;
  messageEn: string;
}

export function predictionSummary(history: PredictionEntry[]): PredictionSummary {
  const attempts = history.length;
  if (attempts === 0) {
    return {
      attempts: 0,
      last: null,
      averagePredicted: 0,
      averageActual: 0,
      bias: 0,
      verdict: 'unknown',
      messageBn: 'পরীক্ষার আগে নিজের স্কোর অনুমান করলে এখানে বাস্তবের সাথে মিলিয়ে দেখানো হবে।',
      messageEn: 'Predict your score before a paper and this compares it with what actually happened.',
    };
  }
  const averagePredicted = Math.round(
    history.reduce((sum, entry) => sum + entry.predicted, 0) / attempts
  );
  const averageActual = Math.round(
    history.reduce((sum, entry) => sum + entry.actual, 0) / attempts
  );
  const bias = averagePredicted - averageActual;
  const verdict =
    attempts < 2 ? 'unknown' : bias >= 8 ? 'overconfident' : bias <= -8 ? 'underconfident' : 'calibrated';

  const messages: Record<PredictionSummary['verdict'], { bn: string; en: string }> = {
    overconfident: {
      bn: `গড়ে ${bias}% বেশি আশা করছ — অনুমান কমানো নয়, প্রস্তুতির ফাঁকগুলো দেখা দরকার। ভুলের কারণ আর নিশ্চিত-ভুল ড্রিলে সময় দাও।`,
      en: `You expect about ${bias} points more than you score — the fix is not lowering the target but closing the gaps: use the mistake reasons and the blind-spot drill.`,
    },
    calibrated: {
      bn: 'তোমার অনুমান আর ফল প্রায় মিলে যাচ্ছে — নিজের প্রস্তুতির হিসাব তোমার কাছে পরিষ্কার।',
      en: 'Your predictions match your results — you have an accurate read on your preparation.',
    },
    underconfident: {
      bn: `গড়ে ${Math.abs(bias)}% কম আশা করছ — তুমি ভাববার চেয়ে ভালো করছ। আত্মবিশ্বাসটা একটু বাড়াও।`,
      en: `You expect about ${Math.abs(bias)} points less than you score — you are doing better than you believe.`,
    },
    unknown: {
      bn: 'আরও কয়েকটা মক দাও — তখন অনুমান-বাস্তবের প্যাটার্ন পরিষ্কার হবে।',
      en: 'Give a couple more mocks — the pattern between prediction and reality needs a little more data.',
    },
  };

  return {
    attempts,
    last: history[history.length - 1],
    averagePredicted,
    averageActual,
    bias,
    verdict,
    messageBn: messages[verdict].bn,
    messageEn: messages[verdict].en,
  };
}
