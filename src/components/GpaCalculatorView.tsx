import React, { useState } from 'react';
import { Calculator, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { Lang, Theme } from '../types';
import { formatNum } from '../lib/i18n';

interface GpaCalculatorViewProps {
  lang: Lang;
  theme: Theme;
}

interface SubjectMarkRow {
  id: string;
  nameBn: string;
  nameEn: string;
  marks: number;
  canBeOptional: boolean;
}

const INITIAL_ROWS: SubjectMarkRow[] = [
  { id: 'bangla', nameBn: 'বাংলা (১ম ও ২য় পত্র গড়)', nameEn: 'Bangla (1st & 2nd Avg)', marks: 82, canBeOptional: false },
  { id: 'english', nameBn: 'ইংরেজি (১ম ও ২য় পত্র গড়)', nameEn: 'English (1st & 2nd Avg)', marks: 84, canBeOptional: false },
  { id: 'ict', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', nameEn: 'ICT', marks: 88, canBeOptional: false },
  { id: 'physics', nameBn: 'পদার্থবিজ্ঞান (১ম ও ২য় পত্র গড়)', nameEn: 'Physics (1st & 2nd Avg)', marks: 86, canBeOptional: false },
  { id: 'chemistry', nameBn: 'রসায়ন (১ম ও ২য় পত্র গড়)', nameEn: 'Chemistry (1st & 2nd Avg)', marks: 85, canBeOptional: false },
  { id: 'math', nameBn: 'উচ্চতর গণিত (১ম ও ২য় পত্র গড়)', nameEn: 'Higher Math (1st & 2nd Avg)', marks: 87, canBeOptional: true },
  { id: 'biology', nameBn: 'জীববিজ্ঞান (১ম ও ২য় পত্র গড়)', nameEn: 'Biology (1st & 2nd Avg)', marks: 83, canBeOptional: true },
];

function getGradeFromMarks(m: number): { letter: string; gp: number } {
  if (m >= 80) return { letter: 'A+', gp: 5.0 };
  if (m >= 70) return { letter: 'A', gp: 4.0 };
  if (m >= 60) return { letter: 'A-', gp: 3.5 };
  if (m >= 50) return { letter: 'B', gp: 3.0 };
  if (m >= 40) return { letter: 'C', gp: 2.0 };
  if (m >= 33) return { letter: 'D', gp: 1.0 };
  return { letter: 'F', gp: 0.0 };
}

export const GpaCalculatorView: React.FC<GpaCalculatorViewProps> = ({
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [rows, setRows] = useState<SubjectMarkRow[]>(INITIAL_ROWS);
  const [fourthSubjectId, setFourthSubjectId] = useState<'biology' | 'math'>('biology');

  const updateMarks = (id: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, marks: clamped } : r))
    );
  };

  let compulsoryFail = false;
  let compulsoryGpSum = 0;
  let optionalGp = 0;
  let allSubjectsAPlus = true;

  rows.forEach((r) => {
    const { gp } = getGradeFromMarks(r.marks);
    if (gp < 5.0) allSubjectsAPlus = false;
    if (r.id === fourthSubjectId) {
      optionalGp = gp;
    } else {
      if (gp === 0) compulsoryFail = true;
      compulsoryGpSum += gp;
    }
  });

  const gpaWithoutFourth = compulsoryFail
    ? 0
    : Number((compulsoryGpSum / 6).toFixed(2));
  const fourthBonus = Math.max(0, optionalGp - 2.0);
  const finalGpa = compulsoryFail
    ? 0
    : Number(Math.min(5.0, (compulsoryGpSum + fourthBonus) / 6).toFixed(2));

  const phyMarks = rows.find((r) => r.id === 'physics')?.marks ?? 0;
  const chemMarks = rows.find((r) => r.id === 'chemistry')?.marks ?? 0;
  const mathMarks = rows.find((r) => r.id === 'math')?.marks ?? 0;
  const bioMarks = rows.find((r) => r.id === 'biology')?.marks ?? 0;

  const buetEligible =
    !compulsoryFail &&
    finalGpa === 5.0 &&
    phyMarks >= 85 &&
    chemMarks >= 85 &&
    mathMarks >= 85;
  const medicalEligible =
    !compulsoryFail &&
    finalGpa >= 4.5 &&
    getGradeFromMarks(bioMarks).gp >= 4.0;
  const duKaEligible = !compulsoryFail && finalGpa >= 4.0;

  return (
    <div className="space-y-6">
      <div
        className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/80'
        }`}
      >
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            {lang === 'bn'
              ? 'NCTB গ্রেডিং সিমুলেটর • ৪র্থ বিষয় বোনাসসহ'
              : 'NCTB GRADING SIMULATOR • WITH 4TH SUBJECT BONUS'}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 mt-0.5">
            <Calculator className="w-5 h-5 text-indigo-500" />
            <span>
              {lang === 'bn'
                ? 'HSC বিজ্ঞান GPA ও ভর্তি যোগ্যতা ক্যালকুলেটর'
                : 'HSC Science GPA & Admission Eligibility Calculator'}
            </span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'bn'
              ? 'কলেজ পরীক্ষা বা সম্ভাব্য বোর্ড পরীক্ষার নম্বর বসিয়ে প্রকৃত HSC GPA এবং বুয়েট/মেডিকেল/ঢাবি আবেদনের যোগ্যতা যাচাই করুন।'
              : 'Simulate your HSC GPA using official Bangladesh Education Board 4th-subject bonus rules and check admission benchmarks.'}
          </p>
        </div>

        <button
          onClick={() => setRows(INITIAL_ROWS)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer self-start sm:self-auto transition-colors ${
            isDark
              ? 'bg-slate-800/70 border-slate-700 hover:border-slate-500 text-slate-300'
              : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700 shadow-2xs'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'রিসেট করুন' : 'Reset Marks'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Marks Input Table */}
        <div
          className={`lg:col-span-7 p-5 sm:p-6 rounded-2xl border space-y-5 ${
            isDark
              ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
              : 'bg-white/95 border-slate-200/80 card-soft-light'
          }`}
        >
          {/* 4th Subject Selector */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b ${
              isDark ? 'border-slate-700/60' : 'border-slate-100'
            }`}
          >
            <span className="text-xs font-bold">
              {lang === 'bn'
                ? 'আপনার ৪র্থ (ঐচ্ছিক) বিষয় নির্বাচন করুন:'
                : 'Select Your 4th (Optional) Subject:'}
            </span>
            <div className="inline-flex gap-1.5">
              {(
                [
                  { id: 'biology', bn: 'জীববিজ্ঞান (4th)', en: 'Biology (4th)' },
                  { id: 'math', bn: 'উচ্চতর গণিত (4th)', en: 'Higher Math (4th)' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFourthSubjectId(opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                    fourthSubjectId === opt.id
                      ? isDark
                        ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/35'
                        : 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : isDark
                      ? 'bg-slate-900/50 border-slate-700 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {lang === 'bn' ? opt.bn : opt.en}
                </button>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div
            className={`divide-y ${
              isDark ? 'divide-slate-700/50' : 'divide-slate-100'
            }`}
          >
            {rows.map((r) => {
              const { letter, gp } = getGradeFromMarks(r.marks);
              const isFourth = r.id === fourthSubjectId;
              return (
                <div
                  key={r.id}
                  className="py-3 first:pt-0 last:pb-0 grid grid-cols-12 items-center gap-3"
                >
                  <div className="col-span-6 sm:col-span-7 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold truncate flex items-center gap-2">
                      <span>{lang === 'bn' ? r.nameBn : r.nameEn}</span>
                      {isFourth && (
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                            isDark
                              ? 'border-amber-400/30 bg-amber-500/12 text-amber-300'
                              : 'border-amber-200 bg-amber-50 text-amber-700'
                          }`}
                        >
                          4TH
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-3 sm:col-span-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={r.marks}
                      onChange={(e) => updateMarks(r.id, Number(e.target.value))}
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-center font-mono text-xs sm:text-sm font-bold tabular-nums outline-none transition-colors ${
                        isDark
                          ? 'bg-slate-900/70 border-slate-700 text-slate-100 focus:border-indigo-400'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400'
                      }`}
                    />
                  </div>

                  <div className="col-span-3 text-right font-mono tabular-nums">
                    <span
                      className={`inline-block min-w-[38px] text-center px-2 py-0.5 rounded-md text-xs font-extrabold border ${
                        letter === 'F'
                          ? isDark
                            ? 'bg-rose-500/15 text-rose-300 border-rose-400/30'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                          : letter === 'A+'
                          ? isDark
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/35'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isDark
                          ? 'bg-slate-700/70 text-slate-200 border-slate-600'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs opacity-60 ml-2 hidden sm:inline">
                      {formatNum(gp.toFixed(1), lang)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GPA Output & University Benchmarks */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`p-6 rounded-2xl border text-center space-y-4 ${
              isDark
                ? 'bg-gradient-to-br from-slate-800/85 to-indigo-950/35 border-slate-700/70 card-soft-dark'
                : 'bg-gradient-to-br from-white via-indigo-50/35 to-emerald-50/35 border-slate-200/85 card-soft-light'
            }`}
          >
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
              {lang === 'bn' ? 'চূড়ান্ত HSC GPA (৫.০০ এর মধ্যে)' : 'CALCULATED HSC GPA'}
            </div>

            <div
              className={`text-5xl font-extrabold font-formula tabular-nums tracking-tight ${
                compulsoryFail
                  ? 'text-rose-500'
                  : 'text-indigo-950 dark:text-indigo-100'
              }`}
            >
              {formatNum(finalGpa.toFixed(2), lang)}
            </div>

            <div className="flex items-center justify-center gap-2">
              <span
                className={`px-3.5 py-1 rounded-full text-xs font-mono font-bold border ${
                  compulsoryFail
                    ? isDark
                      ? 'bg-rose-500/15 text-rose-300 border-rose-400/30'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                    : allSubjectsAPlus
                    ? isDark
                      ? 'bg-amber-500/18 text-amber-200 border-amber-400/35'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                    : isDark
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {compulsoryFail
                  ? lang === 'bn'
                    ? 'অকৃতকার্য (আবশ্যিক বিষয়ে F)'
                    : 'FAILED IN COMPULSORY'
                  : allSubjectsAPlus
                  ? lang === 'bn'
                    ? 'গোল্ডেন A+ (সকল বিষয়ে ৮০+)'
                    : 'GOLDEN A+ (ALL SUBJECTS A+)'
                  : finalGpa === 5.0
                  ? 'GPA 5.00 (A+)'
                  : `GPA ${finalGpa.toFixed(2)}`}
              </span>
            </div>

            <div
              className={`grid grid-cols-2 gap-3 pt-3 border-t text-xs ${
                isDark ? 'border-slate-700/60' : 'border-slate-200/70'
              }`}
            >
              <div
                className={`p-3 rounded-xl border ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-700/80'
                    : 'bg-white/90 border-slate-200/80'
                }`}
              >
                <div className="opacity-60">
                  {lang === 'bn' ? '৪র্থ বিষয় ছাড়া GPA' : 'Without 4th Subject'}
                </div>
                <div className="text-base font-extrabold font-mono tabular-nums mt-0.5">
                  {formatNum(gpaWithoutFourth.toFixed(2), lang)}
                </div>
              </div>
              <div
                className={`p-3 rounded-xl border ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-700/80'
                    : 'bg-white/90 border-slate-200/80'
                }`}
              >
                <div className="opacity-60">
                  {lang === 'bn' ? '৪র্থ বিষয় বোনাস পয়েন্ট' : '4th Subject Bonus'}
                </div>
                <div className="text-base font-extrabold font-mono tabular-nums mt-0.5 text-teal-600 dark:text-teal-300">
                  +{formatNum(fourthBonus.toFixed(2), lang)}
                </div>
              </div>
            </div>
          </div>

          {/* Admission Eligibility Benchmarks */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isDark
                ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
                : 'bg-white/95 border-slate-200/80 card-soft-light'
            }`}
          >
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold opacity-70">
              {lang === 'bn'
                ? 'সম্ভাব্য ভর্তি পরীক্ষা যোগ্যতা বিশ্লেষণ'
                : 'ADMISSION BENCHMARK CHECK'}
            </h3>

            {[
              {
                ok: buetEligible,
                titleBn: 'বুয়েট ও ইঞ্জিনিয়ারিং (PCM ৮৫%+ ও GPA 5.00)',
                titleEn: 'BUET / Engineering Tier (PCM 85%+ & GPA 5.00)',
              },
              {
                ok: medicalEligible,
                titleBn: 'সরকারি মেডিকেল ভর্তি পরীক্ষা (জীববিজ্ঞান A ও GPA 4.5+)',
                titleEn: 'Medical Admission (Biology GP 4.0+ & GPA 4.5+)',
              },
              {
                ok: duKaEligible,
                titleBn: 'ঢাকা বিশ্ববিদ্যালয় ‘ক’ ইউনিট (বিজ্ঞান)',
                titleEn: 'Dhaka University A-Unit (Science)',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold ${
                  item.ok
                    ? isDark
                      ? 'bg-emerald-500/12 border-emerald-400/25 text-emerald-200'
                      : 'bg-emerald-50/80 border-emerald-200/90 text-emerald-900'
                    : isDark
                    ? 'bg-slate-900/40 border-dashed border-slate-700 text-slate-400'
                    : 'bg-slate-50/70 border-dashed border-slate-200 text-slate-500'
                }`}
              >
                <span>{lang === 'bn' ? item.titleBn : item.titleEn}</span>
                {item.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 opacity-60" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
