import { Lang } from '../types';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function formatNum(value: number | string, lang: Lang): string {
  const str = String(value);
  if (lang === 'en') return str;
  return str.replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

export const EDUCATION_BOARDS: { id: string; bn: string; en: string }[] = [
  { id: 'Jashore', bn: 'যশোর বোর্ড', en: 'Jashore Board' },
  { id: 'Dhaka', bn: 'ঢাকা বোর্ড', en: 'Dhaka Board' },
  { id: 'Rajshahi', bn: 'রাজশাহী বোর্ড', en: 'Rajshahi Board' },
  { id: 'Chattogram', bn: 'চট্টগ্রাম বোর্ড', en: 'Chattogram Board' },
  { id: 'Cumilla', bn: 'কুমিল্লা বোর্ড', en: 'Cumilla Board' },
  { id: 'Barishal', bn: 'বরিশাল বোর্ড', en: 'Barishal Board' },
  { id: 'Sylhet', bn: 'সিলেট বোর্ড', en: 'Sylhet Board' },
  { id: 'Dinajpur', bn: 'দিনাজপুর বোর্ড', en: 'Dinajpur Board' },
  { id: 'Mymensingh', bn: 'ময়মনসিংহ বোর্ড', en: 'Mymensingh Board' },
];

export function getBoardLabel(boardId: string, lang: Lang): string {
  const found = EDUCATION_BOARDS.find(
    (b) => b.id.toLowerCase() === boardId.toLowerCase()
  );
  if (!found) return boardId;
  return lang === 'bn' ? found.bn : found.en;
}

export const TARGET_GOALS: { id: string; bn: string; en: string }[] = [
  { id: 'BUET / Engineering', bn: 'বুয়েট / ইঞ্জিনিয়ারিং (BUET/CKRUET)', en: 'BUET / Engineering' },
  { id: 'DMC / Medical', bn: 'ঢাকা মেডিকেল / মেডিকেল ভর্তি', en: 'DMC / Medical Admission' },
  { id: 'DU Ka Unit / Varsity', bn: 'ঢাকা বিশ্ববিদ্যালয় (ক ইউনিট)', en: 'Dhaka University (A Unit)' },
  { id: 'HSC Golden A+', bn: 'এইচএসসি গোল্ডেন এ+ (GPA 5.00)', en: 'HSC Golden A+ (GPA 5.00)' },
];
