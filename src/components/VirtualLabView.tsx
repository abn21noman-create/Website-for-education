import React, { useState } from 'react';
import {
  Cpu,
  Binary,
  Compass,
  FlaskConical,
  Sparkles,
  Code2,
  Sigma,
} from 'lucide-react';
import { Lang, Theme } from '../types';
import { LAB_ELEMENTS, PeriodicElementItem } from '../data/hsc28EcosystemData';
import { formatNum } from '../lib/i18n';

interface VirtualLabViewProps {
  lang: Lang;
  theme: Theme;
}

type LabTab = 'number' | 'logic' | 'coding' | 'math' | 'physics' | 'chemistry';
type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

function evalGate(gate: GateType, a: number, b: number): number {
  switch (gate) {
    case 'AND':
      return a & b;
    case 'OR':
      return a | b;
    case 'NOT':
      return a === 0 ? 1 : 0;
    case 'NAND':
      return (a & b) === 1 ? 0 : 1;
    case 'NOR':
      return (a | b) === 1 ? 0 : 1;
    case 'XOR':
      return a ^ b;
    case 'XNOR':
      return (a ^ b) === 1 ? 0 : 1;
  }
}

const GATE_FORMULAS: Record<GateType, string> = {
  AND: 'Y = A · B',
  OR: 'Y = A + B',
  NOT: "Y = A'",
  NAND: "Y = (A · B)'",
  NOR: "Y = (A + B)'",
  XOR: "Y = A ⊕ B = A'B + AB'",
  XNOR: "Y = (A ⊕ B)' = AB + A'B'",
};

export const VirtualLabView: React.FC<VirtualLabViewProps> = ({
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [activeLab, setActiveLab] = useState<LabTab>('number');

  // 1. ICT Number System State
  const [decValue, setDecValue] = useState<number>(45);
  const [compInput, setCompInput] = useState<number>(-25);

  // 2. ICT Logic Gate State
  const [gate, setGate] = useState<GateType>('NAND');
  const [inA, setInA] = useState<0 | 1>(1);
  const [inB, setInB] = useState<0 | 1>(0);

  // 3. Physics Vector & Projectile State
  const [vecP, setVecP] = useState<number>(10);
  const [vecQ, setVecQ] = useState<number>(8);
  const [vecAlpha, setVecAlpha] = useState<number>(60);
  const [projV0, setProjV0] = useState<number>(30);
  const [projAngle, setProjAngle] = useState<number>(45);

  // 4. Chemistry Periodic & Buffer State
  const [selectedEl, setSelectedEl] = useState<PeriodicElementItem>(
    LAB_ELEMENTS.find((e) => e.z === 24) || LAB_ELEMENTS[0]
  );
  const [pKa, setPKa] = useState<number>(4.74);
  const [saltConc, setSaltConc] = useState<number>(0.15);
  const [acidConc, setAcidConc] = useState<number>(0.1);

  // 5. ICT Ch 4 HTML & Ch 5 C-Programming State
  const [htmlCode, setHtmlCode] = useState<string>(
    `<h3 style="color:#4f46e5;font-family:sans-serif;">HSC 2028 Science Result</h3>\n<table border="1" cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;width:100%;">\n  <tr style="background:#eef2ff;">\n    <th rowspan="2">Roll</th>\n    <th colspan="2">Marks</th>\n  </tr>\n  <tr style="background:#f8fafc;">\n    <th>Physics</th>\n    <th>ICT</th>\n  </tr>\n  <tr>\n    <td align="center">101</td>\n    <td align="center">94</td>\n    <td align="center">96</td>\n  </tr>\n</table>`
  );
  const [cAlgo, setCAlgo] = useState<'series' | 'factorial' | 'gcd'>('series');
  const [cInputA, setCInputA] = useState<number>(6);
  const [cInputB, setCInputB] = useState<number>(18);

  // 6. Higher Math 3x3 Determinant & Function Plotter State
  const [mat, setMat] = useState<number[][]>([
    [2, 1, 3],
    [0, 4, -1],
    [1, 2, 5],
  ]);
  const [graphType, setGraphType] = useState<'parabola' | 'sine' | 'circle'>('parabola');
  const [graphParamA, setGraphParamA] = useState<number>(1);
  const [graphParamB, setGraphParamB] = useState<number>(2);

  // Computed 3x3 Determinant
  const det3x3 =
    mat[0][0] * (mat[1][1] * mat[2][2] - mat[1][2] * mat[2][1]) -
    mat[0][1] * (mat[1][0] * mat[2][2] - mat[1][2] * mat[2][0]) +
    mat[0][2] * (mat[1][0] * mat[2][1] - mat[1][1] * mat[2][0]);

  const det2x2 = mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0];

  // Computed ICT Number values
  const safeDec = Math.max(0, Math.min(65535, Math.floor(Math.abs(decValue) || 0)));
  const binStr = safeDec.toString(2);
  const octStr = safeDec.toString(8);
  const hexStr = safeDec.toString(16).toUpperCase();

  // 8-bit 2's complement calculation (-128 to +127)
  const clampedComp = Math.max(-128, Math.min(127, Math.trunc(compInput || 0)));
  // NOTE: cap is 128, not 127. |-128| = 128 = 10000000 fits in 8 bits, and the
  // old `Math.min(127, ...)` clamp silently rewrote it to 01111111 — so the
  // solver taught -128 as 10000001 (which is -127) while showing the right
  // final byte.
  const absVal = Math.min(128, Math.abs(clampedComp));
  const pos8Bit = absVal.toString(2).padStart(8, '0');
  const onesComp = pos8Bit
    .split('')
    .map((b) => (b === '0' ? '1' : '0'))
    .join('');
  const twosCompNum = clampedComp >= 0 ? clampedComp : 256 + clampedComp;
  const twosComp8Bit = twosCompNum.toString(2).padStart(8, '0');

  // Computed Physics Vector values
  const radAlpha = (vecAlpha * Math.PI) / 180;
  const resultantR = Math.sqrt(
    vecP * vecP + vecQ * vecQ + 2 * vecP * vecQ * Math.cos(radAlpha)
  );
  const thetaRad = Math.atan2(
    vecQ * Math.sin(radAlpha),
    vecP + vecQ * Math.cos(radAlpha)
  );
  const thetaDeg = (thetaRad * 180) / Math.PI;

  // Computed Physics Projectile values (g = 9.8 m/s^2)
  const g = 9.8;
  const radProj = (projAngle * Math.PI) / 180;
  const maxH = (projV0 * projV0 * Math.pow(Math.sin(radProj), 2)) / (2 * g);
  const flightT = (2 * projV0 * Math.sin(radProj)) / g;
  const rangeR = (projV0 * projV0 * Math.sin(2 * radProj)) / g;

  // Computed Chemistry Buffer pH
  const safeAcid = Math.max(0.001, acidConc);
  const safeSalt = Math.max(0.001, saltConc);
  const bufferPh = pKa + Math.log10(safeSalt / safeAcid);

  const cardClass = `p-5 sm:p-6 rounded-2xl border transition-all ${
    isDark
      ? 'bg-slate-800/65 border-slate-700/65 card-soft-dark'
      : 'bg-white/95 border-slate-200/80 card-soft-light'
  }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/80'
        }`}
      >
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            {lang === 'bn'
              ? 'ইন্টারেক্টিভ সায়েন্স ও ICT ল্যাব • HSC 2028'
              : 'INTERACTIVE SCIENCE & ICT SIMULATORS • HSC 2028'}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 mt-0.5">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>
              {lang === 'bn'
                ? 'ভার্চুয়াল সায়েন্স ও ICT ল্যাবরেটরি'
                : 'Virtual Science & ICT Laboratory'}
            </span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'bn'
              ? 'সংখ্যা পদ্ধতি, লজিক গেট, ভেক্টর-প্রাসের গতিপথ এবং পর্যায় সারণি ও বাফার দ্রবণ হাতে-কলমে পরীক্ষা করে কনসেপ্ট পরিষ্কার করুন।'
              : 'Hands-on simulators for ICT Number Systems, Logic Gates, Physics Vectors/Projectiles, and Chemistry Periodic & Buffer calculations.'}
          </p>
        </div>
      </div>

      {/* Lab Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
        {[
          {
            id: 'number' as LabTab,
            icon: <Binary className="w-4 h-4" />,
            bn: 'ICT সংখ্যা ও ২-এর পরিপূরক',
            en: "ICT Base & 2's Complement",
          },
          {
            id: 'logic' as LabTab,
            icon: <Cpu className="w-4 h-4" />,
            bn: 'ICT লজিক গেট সিমুলেটর',
            en: 'Logic Gate & Truth Table',
          },
          {
            id: 'coding' as LabTab,
            icon: <Code2 className="w-4 h-4" />,
            bn: 'ICT: HTML ও C প্রোগ্রামিং ল্যাব',
            en: 'ICT: HTML & C Coding Lab',
          },
          {
            id: 'math' as LabTab,
            icon: <Sigma className="w-4 h-4" />,
            bn: 'উচ্চতর গণিত: ম্যাট্রিক্স ও গ্রাফ',
            en: 'Higher Math: Matrix & Graph',
          },
          {
            id: 'physics' as LabTab,
            icon: <Compass className="w-4 h-4" />,
            bn: 'পদার্থ: ভেক্টর ও প্রাস ল্যাব',
            en: 'Physics: Vector & Projectile',
          },
          {
            id: 'chemistry' as LabTab,
            icon: <FlaskConical className="w-4 h-4" />,
            bn: 'রসায়ন: মৌল ও বাফার pH',
            en: 'Chem: Periodic & Buffer Lab',
          },
        ].map((tab) => {
          const active = activeLab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveLab(tab.id)}
              className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-bold flex items-center gap-2.5 cursor-pointer transition-all ${
                active
                  ? isDark
                    ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40 shadow-xs'
                    : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : isDark
                  ? 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:border-slate-500'
                  : 'bg-white border-slate-200/85 text-slate-700 hover:border-indigo-300 shadow-2xs'
              }`}
            >
              {tab.icon}
              <span className="truncate">{lang === 'bn' ? tab.bn : tab.en}</span>
            </button>
          );
        })}
      </div>

      {/* LAB 1: ICT NUMBER SYSTEM & 2'S COMPLEMENT */}
      {activeLab === 'number' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${cardClass} space-y-4`}>
            <h2 className="font-bold text-base">
              {lang === 'bn'
                ? 'সংখ্যা পদ্ধতি রূপান্তরকারী (অধ্যায় ৩.১)'
                : 'Instant Base Converter (ICT Ch 3.1)'}
            </h2>
            <p className="text-xs opacity-65">
              {lang === 'bn'
                ? 'যেকোনো দশমিক (Decimal), বাইনারি, অক্টাল বা হেক্সাডেসিমাল মান লিখলে অন্য সব ভিত্তির মান তাৎক্ষণিক দেখা যাবে।'
                : 'Edit any base input below to convert instantaneously across all 4 number systems.'}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono font-bold mb-1 text-indigo-600 dark:text-indigo-300">
                  DECIMAL (Base 10)
                </label>
                <input
                  type="number"
                  min={0}
                  max={65535}
                  value={safeDec}
                  onChange={(e) => setDecValue(Number(e.target.value))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm font-bold outline-none ${
                    isDark
                      ? 'bg-slate-900/75 border-slate-700 text-slate-100 focus:border-indigo-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold mb-1 text-teal-600 dark:text-teal-300">
                  BINARY (Base 2)
                </label>
                <input
                  type="text"
                  value={binStr}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^01]/g, '');
                    setDecValue(clean ? parseInt(clean, 2) : 0);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm font-bold outline-none ${
                    isDark
                      ? 'bg-slate-900/75 border-slate-700 text-teal-200 focus:border-teal-400'
                      : 'bg-teal-50/40 border-teal-200/80 text-teal-900 focus:border-teal-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold mb-1 opacity-75">
                    OCTAL (Base 8)
                  </label>
                  <input
                    type="text"
                    value={octStr}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-7]/g, '');
                      setDecValue(clean ? parseInt(clean, 8) : 0);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm font-bold outline-none ${
                      isDark
                        ? 'bg-slate-900/75 border-slate-700 text-slate-100'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold mb-1 opacity-75">
                    HEXADECIMAL (Base 16)
                  </label>
                  <input
                    type="text"
                    value={hexStr}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9a-fA-F]/g, '');
                      setDecValue(clean ? parseInt(clean, 16) : 0);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm font-bold outline-none ${
                      isDark
                        ? 'bg-slate-900/75 border-slate-700 text-amber-200'
                        : 'bg-amber-50/40 border-amber-200/80 text-amber-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardClass} space-y-4`}>
            <h2 className="font-bold text-base">
              {lang === 'bn'
                ? '৮-বিট রেজিস্টারে ২-এর পরিপূরক (2’s Complement Solver)'
                : "8-Bit Register 1's & 2's Complement Step-by-Step"}
            </h2>
            <p className="text-xs opacity-65">
              {lang === 'bn'
                ? '-১২৮ থেকে +১২৭ এর মধ্যে যেকোনো পূর্ণসংখ্যা লিখুন (যেমন: -25):'
                : 'Enter a signed integer between -128 and +127 (e.g., -25):'}
            </p>

            <input
              type="number"
              min={-128}
              max={127}
              value={compInput}
              onChange={(e) => setCompInput(Number(e.target.value))}
              className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm font-bold outline-none ${
                isDark
                  ? 'bg-slate-900/75 border-slate-700 text-slate-100 focus:border-indigo-400'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400'
              }`}
            />

            <div className="space-y-2.5 text-xs font-mono">
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span>+{absVal} (8-bit Magnitude):</span>
                <span className="font-bold tracking-widest">{pos8Bit}</span>
              </div>

              {clampedComp < 0 && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span>1&apos;s Complement (Bit Invert):</span>
                  <span className="font-bold tracking-widest text-amber-600 dark:text-amber-300">
                    {onesComp}
                  </span>
                </div>
              )}

              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isDark
                    ? 'bg-emerald-500/12 border-emerald-400/30 text-emerald-200'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="font-bold">
                  Final 8-bit ({clampedComp >= 0 ? 'Direct' : "2's Comp = 1's + 1"}):
                </span>
                <span className="font-extrabold text-sm tracking-widest">
                  {twosComp8Bit}
                </span>
              </div>

              <p className="text-[11px] font-sans opacity-70 pt-1">
                {lang === 'bn'
                  ? `চিহ্ন বিট (বাম পাশের ৮ম বিট) = ${twosComp8Bit[0]} (${
                      twosComp8Bit[0] === '1' ? 'ঋণাত্মক সংখ্যা' : 'ধনাত্মক সংখ্যা'
                    })। বোর্ড সৃজনশীলে এই ৩টি ধাপ পরপর দেখালেই পূর্ণ নম্বর পাওয়া যায়।`
                  : `Sign bit (MSB) = ${twosComp8Bit[0]} (${
                      twosComp8Bit[0] === '1' ? 'Negative' : 'Positive'
                    }).`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LAB 2: ICT LOGIC GATE SIMULATOR */}
      {activeLab === 'logic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`lg:col-span-7 ${cardClass} space-y-5`}>
            <div className="flex flex-wrap gap-1.5">
              {(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'] as GateType[]).map(
                (gName) => (
                  <button
                    key={gName}
                    onClick={() => setGate(gName)}
                    className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold border cursor-pointer transition-all ${
                      gate === gName
                        ? isDark
                          ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40'
                          : 'bg-indigo-600 text-white border-indigo-600'
                        : isDark
                        ? 'bg-slate-900/50 border-slate-700 text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {gName}
                  </button>
                )
              )}
            </div>

            {/* Interactive Circuit Stage */}
            <div
              className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-around gap-6 ${
                isDark ? 'bg-slate-900/65 border-slate-700' : 'bg-slate-50/90 border-slate-200/80'
              }`}
            >
              {/* Input Switches */}
              <div className="space-y-3">
                <button
                  onClick={() => setInA(inA === 0 ? 1 : 0)}
                  className={`w-36 py-2.5 px-4 rounded-xl border font-mono text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                    inA === 1
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-400'
                      : 'bg-white border-slate-300 text-slate-600'
                  }`}
                >
                  <span>INPUT A</span>
                  <span className="text-base font-extrabold">{inA}</span>
                </button>

                {gate !== 'NOT' && (
                  <button
                    onClick={() => setInB(inB === 0 ? 1 : 0)}
                    className={`w-36 py-2.5 px-4 rounded-xl border font-mono text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                      inB === 1
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-400'
                        : 'bg-white border-slate-300 text-slate-600'
                    }`}
                  >
                    <span>INPUT B</span>
                    <span className="text-base font-extrabold">{inB}</span>
                  </button>
                )}
              </div>

              {/* Gate Box */}
              <div
                className={`px-6 py-5 rounded-2xl border-2 text-center font-mono ${
                  isDark
                    ? 'bg-slate-800 border-indigo-400/50 text-indigo-200'
                    : 'bg-white border-indigo-300 text-indigo-900 shadow-xs'
                }`}
              >
                <div className="text-lg font-extrabold">{gate} GATE</div>
                <div className="text-xs opacity-75 mt-1">{GATE_FORMULAS[gate]}</div>
              </div>

              {/* Output LED */}
              {(() => {
                const outY = evalGate(gate, inA, inB);
                return (
                  <div
                    className={`w-36 py-4 px-4 rounded-2xl border text-center font-mono transition-all ${
                      outY === 1
                        ? isDark
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-lg'
                          : 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-md'
                        : isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-400'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-wider font-bold">
                      OUTPUT Y
                    </div>
                    <div className="text-3xl font-extrabold mt-1">{outY}</div>
                    <div className="text-[10px] mt-0.5">
                      {outY === 1 ? 'HIGH (ON)' : 'LOW (OFF)'}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Live Highlighted Truth Table */}
          <div className={`lg:col-span-5 ${cardClass} space-y-3`}>
            <h3 className="font-bold text-base">
              {lang === 'bn'
                ? `${gate} গেটের সত্যক সারণি (Truth Table)`
                : `${gate} Gate Live Truth Table`}
            </h3>
            <table className="w-full text-center font-mono text-xs sm:text-sm border-collapse">
              <thead>
                <tr
                  className={
                    isDark ? 'border-b border-slate-700 text-slate-400' : 'border-b border-slate-200 text-slate-500'
                  }
                >
                  <th className="py-2">A</th>
                  {gate !== 'NOT' && <th className="py-2">B</th>}
                  <th className="py-2">Output Y</th>
                </tr>
              </thead>
              <tbody>
                {(gate === 'NOT'
                  ? [[0, 0], [1, 0]]
                  : [
                      [0, 0],
                      [0, 1],
                      [1, 0],
                      [1, 1],
                    ]
                ).map(([a, b], idx) => {
                  const y = evalGate(gate, a, b);
                  const isActiveRow =
                    gate === 'NOT' ? a === inA : a === inA && b === inB;
                  return (
                    <tr
                      key={idx}
                      className={`border-b last:border-b-0 transition-colors ${
                        isActiveRow
                          ? isDark
                            ? 'bg-indigo-500/20 text-indigo-200 font-extrabold'
                            : 'bg-indigo-50 text-indigo-900 font-extrabold'
                          : isDark
                          ? 'border-slate-700/50'
                          : 'border-slate-100'
                      }`}
                    >
                      <td className="py-2.5">{a}</td>
                      {gate !== 'NOT' && <td className="py-2.5">{b}</td>}
                      <td className="py-2.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        {y}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LAB 3: PHYSICS VECTOR & PROJECTILE */}
      {activeLab === 'physics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vector Parallelogram */}
          <div className={`${cardClass} space-y-4`}>
            <h2 className="font-bold text-base">
              {lang === 'bn'
                ? 'ভেক্টর সামান্তরিক সূত্র ভিজ্যুয়ালাইজার (পদার্থ ১ম • অধ্যায় ২)'
                : 'Vector Resultant Simulator (Physics 1st • Ch 2)'}
            </h2>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-mono font-bold block mb-1">
                  P = {formatNum(vecP, lang)} N
                </label>
                <input
                  type="range"
                  min={2}
                  max={20}
                  value={vecP}
                  onChange={(e) => setVecP(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
              <div>
                <label className="font-mono font-bold block mb-1">
                  Q = {formatNum(vecQ, lang)} N
                </label>
                <input
                  type="range"
                  min={2}
                  max={20}
                  value={vecQ}
                  onChange={(e) => setVecQ(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>
              <div>
                <label className="font-mono font-bold block mb-1">
                  α = {formatNum(vecAlpha, lang)}°
                </label>
                <input
                  type="range"
                  min={0}
                  max={180}
                  value={vecAlpha}
                  onChange={(e) => setVecAlpha(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            <div
              className={`rounded-xl border p-3 flex justify-center ${
                isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              {(() => {
                const scale = 4.2;
                const ox = 95;
                const oy = 135;
                const px = ox + vecP * scale;
                const py = oy;
                const qx = ox + vecQ * scale * Math.cos(radAlpha);
                const qy = oy - vecQ * scale * Math.sin(radAlpha);
                const rx = px + vecQ * scale * Math.cos(radAlpha);
                const ry = py - vecQ * scale * Math.sin(radAlpha);
                return (
                  <svg viewBox="0 0 280 165" className="w-full max-w-xs h-40">
                    <line x1={px} y1={py} x2={rx} y2={ry} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.2" />
                    <line x1={qx} y1={qy} x2={rx} y2={ry} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.2" />
                    <line x1={ox} y1={oy} x2={px} y2={py} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
                    <line x1={ox} y1={oy} x2={qx} y2={qy} stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
                    <line x1={ox} y1={oy} x2={rx} y2={ry} stroke="#d97706" strokeWidth="3.2" strokeLinecap="round" />
                    <circle cx={ox} cy={oy} r="3.5" fill="#64748b" />
                    <text x={px - 8} y={py + 15} fontSize="10" fill="#4f46e5" fontWeight="bold">P</text>
                    <text x={qx - 10} y={qy - 5} fontSize="10" fill="#0d9488" fontWeight="bold">Q</text>
                    <text x={rx + 4} y={ry} fontSize="11" fill="#d97706" fontWeight="bold">R</text>
                  </svg>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div
                className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-amber-50/60 border-amber-200/80'
                }`}
              >
                <span className="opacity-65 block">
                  {lang === 'bn' ? 'লব্ধি ভেক্টরের মান (R)' : 'Resultant Magnitude (R)'}
                </span>
                <span className="text-base font-extrabold">
                  {formatNum(resultantR.toFixed(2), lang)} N
                </span>
              </div>
              <div
                className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-indigo-50/60 border-indigo-200/80'
                }`}
              >
                <span className="opacity-65 block">
                  {lang === 'bn' ? 'P-এর সাথে লব্ধির কোণ (θ)' : 'Direction Angle (θ)'}
                </span>
                <span className="text-base font-extrabold">
                  {formatNum(thetaDeg.toFixed(1), lang)}°
                </span>
              </div>
            </div>
          </div>

          {/* Projectile Motion Visualizer */}
          <div className={`${cardClass} space-y-4`}>
            <h2 className="font-bold text-base">
              {lang === 'bn'
                ? 'প্রাসের গতিপথ সিমুলেটর (পদার্থ ১ম • অধ্যায় ৩)'
                : 'Projectile Motion Simulator (Physics 1st • Ch 3)'}
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-mono font-bold block mb-1">
                  v₀ = {formatNum(projV0, lang)} m/s
                </label>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={projV0}
                  onChange={(e) => setProjV0(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
              <div>
                <label className="font-mono font-bold block mb-1">
                  θ₀ = {formatNum(projAngle, lang)}°
                </label>
                <input
                  type="range"
                  min={15}
                  max={80}
                  value={projAngle}
                  onChange={(e) => setProjAngle(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            <div
              className={`rounded-xl border p-3 flex justify-center ${
                isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              {(() => {
                const maxPossibleR = (50 * 50) / 9.8;
                const scaleX = 240 / maxPossibleR;
                const points: string[] = [];
                for (let i = 0; i <= 30; i++) {
                  const t = (flightT * i) / 30;
                  const x = projV0 * Math.cos(radProj) * t;
                  const y = projV0 * Math.sin(radProj) * t - 0.5 * g * t * t;
                  const svgX = 20 + x * scaleX;
                  const svgY = 145 - Math.max(0, y) * scaleX * 1.4;
                  points.push(`${svgX.toFixed(1)},${svgY.toFixed(1)}`);
                }
                return (
                  <svg viewBox="0 0 280 165" className="w-full max-w-xs h-40">
                    <line x1="15" y1="145" x2="268" y2="145" stroke="#94a3b8" strokeWidth="1.5" />
                    <polyline
                      fill="none"
                      stroke="#059669"
                      strokeWidth="3"
                      strokeLinecap="round"
                      points={points.join(' ')}
                    />
                    <circle cx="20" cy="145" r="4" fill="#4f46e5" />
                  </svg>
                );
              })()}
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
              <div
                className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-emerald-50/60 border-emerald-200'
                }`}
              >
                <span className="opacity-65 block text-[10px]">H_max</span>
                <span className="font-extrabold">
                  {formatNum(maxH.toFixed(1), lang)}m
                </span>
              </div>
              <div
                className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-indigo-50/60 border-indigo-200'
                }`}
              >
                <span className="opacity-65 block text-[10px]">Time (T)</span>
                <span className="font-extrabold">
                  {formatNum(flightT.toFixed(2), lang)}s
                </span>
              </div>
              <div
                className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-amber-50/60 border-amber-200'
                }`}
              >
                <span className="opacity-65 block text-[10px]">Range (R)</span>
                <span className="font-extrabold">
                  {formatNum(rangeR.toFixed(1), lang)}m
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAB 4: CHEMISTRY PERIODIC EXPLORER & BUFFER PH */}
      {activeLab === 'chemistry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive High-Yield Periodic Elements */}
          <div className={`lg:col-span-7 ${cardClass} space-y-4`}>
            <h2 className="font-bold text-base">
              {lang === 'bn'
                ? 'HSC গুরুত্বপূর্ণ মৌল ও ইলেকট্রন বিন্যাস এক্সপ্লোরার'
                : 'HSC High-Yield Elements & Electron Configuration Explorer'}
            </h2>

            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
              {LAB_ELEMENTS.map((el) => {
                const active = selectedEl.z === el.z;
                return (
                  <button
                    key={el.z}
                    onClick={() => setSelectedEl(el)}
                    className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                      active
                        ? isDark
                          ? 'bg-teal-500/25 border-teal-400 text-teal-100 font-bold scale-105'
                          : 'bg-teal-600 border-teal-600 text-white font-bold scale-105 shadow-xs'
                        : isDark
                        ? 'bg-slate-900/60 border-slate-700 text-slate-200 hover:border-teal-400/40'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-teal-300'
                    }`}
                  >
                    <div className="text-[9px] font-mono opacity-70">{el.z}</div>
                    <div className="text-sm font-extrabold">{el.symbol}</div>
                  </button>
                );
              })}
            </div>

            {/* Selected Element Detail Card */}
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                isDark
                  ? 'bg-slate-900/65 border-slate-700'
                  : 'bg-teal-50/45 border-teal-200/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-lg font-extrabold">
                    {selectedEl.z}. {lang === 'bn' ? selectedEl.nameBn : selectedEl.nameEn} (
                    {selectedEl.symbol})
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-400/25">
                  {selectedEl.block}-block • Period {selectedEl.period} • Group{' '}
                  {selectedEl.group}
                </span>
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-teal-700 dark:text-teal-300">
                Config: {selectedEl.config} • Mass: {selectedEl.mass}
              </div>
              <p className="text-xs leading-relaxed opacity-85">
                {lang === 'bn' ? selectedEl.noteBn : selectedEl.noteEn}
              </p>
            </div>
          </div>

          {/* Acidic Buffer Henderson-Hasselbalch Simulator */}
          <div className={`lg:col-span-5 ${cardClass} space-y-4`}>
            <h2 className="font-bold text-base">
              {lang === 'bn'
                ? 'বাফার দ্রবণের pH সিমুলেটর (হেন্ডারসন সমীকরণ)'
                : 'Buffer Solution pH Simulator (Chem 1st • Ch 4)'}
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-mono font-bold mb-1">
                  pKa (যেমন CH₃COOH = 4.74)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pKa}
                  onChange={(e) => setPKa(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded-xl border font-mono font-bold outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono font-bold mb-1">
                    [Salt] (M)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.001"
                    value={saltConc}
                    onChange={(e) => setSaltConc(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono font-bold outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold mb-1">
                    [Acid] (M)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.001"
                    value={acidConc}
                    onChange={(e) => setAcidConc(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono font-bold outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border text-center space-y-1 ${
                isDark
                  ? 'bg-emerald-500/12 border-emerald-400/30'
                  : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <div className="text-[11px] font-mono uppercase opacity-70">
                pH = pKa + log₁₀([Salt] / [Acid])
              </div>
              <div className="text-3xl font-extrabold font-formula text-emerald-700 dark:text-emerald-300">
                pH = {formatNum(bufferPh.toFixed(2), lang)}
              </div>
              <div className="text-[11px] font-mono opacity-70">
                pOH = {formatNum((14 - bufferPh).toFixed(2), lang)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAB 5: ICT CH 4 HTML LIVE SANDBOX & CH 5 C DRY-RUN */}
      {activeLab === 'coding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HTML Ch 4 Sandbox */}
          <div className={`${cardClass} space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono uppercase text-indigo-500 font-bold">
                  ICT CHAPTER 4 • HTML SANDBOX
                </span>
                <h2 className="text-base font-bold mt-0.5">
                  {lang === 'bn'
                    ? 'লাইভ HTML টেবিল ও ট্যাগ এডিটর'
                    : 'Live HTML Table & Tag Sandbox'}
                </h2>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setHtmlCode(
                      `<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;font-family:sans-serif;">\n  <tr><th rowspan="2">Group</th><th colspan="2">HSC 2028</th></tr>\n  <tr><th>Compulsory</th><th>Optional</th></tr>\n  <tr><td>Science</td><td>Physics, Chem</td><td>Higher Math</td></tr>\n</table>`
                    )
                  }
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-indigo-300'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  }`}
                >
                  rowspan/colspan
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setHtmlCode(
                      `<h4 style="font-family:sans-serif;color:#0f766e;">Science Subjects:</h4>\n<ol type="A" style="font-family:sans-serif;">\n  <li>Physics 1st Paper</li>\n  <li>Chemistry 1st Paper\n    <ul type="square">\n      <li>Qualitative Chem</li>\n      <li>Periodic Properties</li>\n    </ul>\n  </li>\n  <li>Higher Mathematics</li>\n</ol>`
                    )
                  }
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-teal-300'
                      : 'bg-teal-50 border-teal-200 text-teal-700'
                  }`}
                >
                  Nested List
                </button>
              </div>
            </div>

            <textarea
              rows={7}
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              spellCheck={false}
              className={`w-full p-3 rounded-xl border font-mono text-xs outline-none ${
                isDark
                  ? 'bg-slate-900/80 border-slate-700 text-emerald-200'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />

            <div>
              <div className="text-[11px] font-mono uppercase opacity-65 mb-1.5">
                {lang === 'bn' ? 'লাইভ আউটপুট প্রিভিউ:' : 'Live Browser Output:'}
              </div>
              <iframe
                title="ICT HTML Output"
                sandbox=""
                srcDoc={`<!doctype html><html><body style="margin:10px;background:#ffffff;color:#1e293b;">${htmlCode}</body></html>`}
                className="w-full h-40 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>

          {/* C Programming Ch 5 Dry-Run Simulator */}
          <div className={`${cardClass} space-y-4`}>
            <div>
              <span className="text-[11px] font-mono uppercase text-teal-600 dark:text-teal-400 font-bold">
                ICT CHAPTER 5 • C PROGRAMMING DRY-RUN
              </span>
              <h2 className="text-base font-bold mt-0.5">
                {lang === 'bn'
                  ? 'C প্রোগ্রামিং ও লুপ ট্রেস সিমুলেটর'
                  : 'C Algorithm & Loop Dry-Run Simulator'}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'series' as const, bn: 'ধারা যোগফল (1²+..+N²)', en: 'Series 1²+..+N²' },
                { id: 'factorial' as const, bn: 'ফ্যাক্টরিয়াল (N!)', en: 'Factorial (N!)' },
                { id: 'gcd' as const, bn: 'গ.সা.গু ও ল.সা.গু', en: 'GCD & LCM' },
              ].map((alg) => (
                <button
                  key={alg.id}
                  type="button"
                  onClick={() => setCAlgo(alg.id)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    cAlgo === alg.id
                      ? isDark
                        ? 'bg-teal-500/20 text-teal-200 border-teal-400/40'
                        : 'bg-teal-50 text-teal-800 border-teal-300'
                      : isDark
                      ? 'bg-slate-900/50 border-slate-700 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {lang === 'bn' ? alg.bn : alg.en}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-75">
                  {cAlgo === 'gcd' ? 'Input A (1–200)' : 'Input N (1–12)'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={cAlgo === 'gcd' ? 200 : 12}
                  value={cInputA}
                  onChange={(e) =>
                    setCInputA(
                      Math.max(
                        1,
                        Math.min(cAlgo === 'gcd' ? 200 : 12, Number(e.target.value) || 1)
                      )
                    )
                  }
                  className={`w-full px-3 py-2 rounded-xl border font-mono font-bold outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              {cAlgo === 'gcd' && (
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-75">
                    Input B (1–200)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={cInputB}
                    onChange={(e) =>
                      setCInputB(Math.max(1, Math.min(200, Number(e.target.value) || 1)))
                    }
                    className={`w-full px-3 py-2 rounded-xl border font-mono font-bold outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              )}
            </div>

            {(() => {
              const n = Math.min(12, Math.max(1, Math.trunc(cInputA)));
              if (cAlgo === 'series') {
                const steps: string[] = [];
                let sum = 0;
                for (let i = 1; i <= n; i++) {
                  sum += i * i;
                  steps.push(`i=${i} → sum=${sum}`);
                }
                return (
                  <div className="space-y-3">
                    <pre
                      className={`p-3 rounded-xl border text-[11px] font-mono overflow-x-auto ${
                        isDark
                          ? 'bg-slate-900/90 border-slate-700 text-indigo-200'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >{`#include <stdio.h>\nint main() {\n  int i, sum = 0, n = ${n};\n  for(i = 1; i <= n; i++) {\n    sum = sum + (i * i);\n  }\n  printf("Sum = %d", sum);\n  return 0;\n}`}</pre>
                    <div
                      className={`p-3 rounded-xl border font-mono text-xs ${
                        isDark
                          ? 'bg-emerald-500/12 border-emerald-400/30 text-emerald-200'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      }`}
                    >
                      <div className="font-bold">Output: Sum = {sum}</div>
                      <div className="text-[11px] opacity-80 mt-1">
                        Trace: {steps.join(' | ')}
                      </div>
                    </div>
                  </div>
                );
              }
              if (cAlgo === 'factorial') {
                let fact = 1;
                const steps: string[] = [];
                for (let i = 1; i <= n; i++) {
                  fact *= i;
                  steps.push(`${i}!=${fact}`);
                }
                return (
                  <div className="space-y-3">
                    <pre
                      className={`p-3 rounded-xl border text-[11px] font-mono overflow-x-auto ${
                        isDark
                          ? 'bg-slate-900/90 border-slate-700 text-indigo-200'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >{`#include <stdio.h>\nint main() {\n  long fact = 1; int i, n = ${n};\n  for(i = 1; i <= n; i++) fact = fact * i;\n  printf("%d! = %ld", n, fact);\n  return 0;\n}`}</pre>
                    <div
                      className={`p-3 rounded-xl border font-mono text-xs ${
                        isDark
                          ? 'bg-emerald-500/12 border-emerald-400/30 text-emerald-200'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      }`}
                    >
                      <div className="font-bold">
                        Output: {n}! = {fact}
                      </div>
                      <div className="text-[11px] opacity-80 mt-1">
                        Trace: {steps.join(' → ')}
                      </div>
                    </div>
                  </div>
                );
              }
              let a = Math.max(1, Math.trunc(cInputA));
              let b = Math.max(1, Math.trunc(cInputB));
              const origA = a;
              const origB = b;
              const steps: string[] = [];
              while (b !== 0) {
                const rem = a % b;
                steps.push(`${a}%${b}=${rem}`);
                a = b;
                b = rem;
              }
              const gcd = a;
              const lcm = (origA * origB) / gcd;
              return (
                <div className="space-y-3">
                  <pre
                    className={`p-3 rounded-xl border text-[11px] font-mono overflow-x-auto ${
                      isDark
                        ? 'bg-slate-900/90 border-slate-700 text-indigo-200'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >{`while (b != 0) {\n  rem = a % b;\n  a = b;\n  b = rem;\n}\ngcd = a; lcm = (x * y) / gcd;`}</pre>
                  <div
                    className={`p-3 rounded-xl border font-mono text-xs ${
                      isDark
                        ? 'bg-emerald-500/12 border-emerald-400/30 text-emerald-200'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="font-bold">
                      GCD (গ.সা.গু) = {gcd} &nbsp;|&nbsp; LCM (ল.সা.গু) = {lcm}
                    </div>
                    <div className="text-[11px] opacity-80 mt-1">
                      Euclidean Steps: {steps.join(' → ')}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* LAB 6: HIGHER MATH MATRIX DETERMINANT & CONIC/FUNCTION GRAPHER */}
      {activeLab === 'math' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 3x3 Determinant & 2x2 Inverse Solver */}
          <div className={`${cardClass} space-y-4`}>
            <div>
              <span className="text-[11px] font-mono uppercase text-indigo-500 font-bold">
                HIGHER MATH 1ST • CH 1 MATRICES
              </span>
              <h2 className="text-base font-bold mt-0.5">
                {lang === 'bn'
                  ? '৩×৩ নির্ণায়ক |A| ও ২×২ বিপরীত ম্যাট্রিক্স সমাধানকারী'
                  : '3×3 Determinant |A| & 2×2 Inverse Matrix Solver'}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              {mat.map((row, rIdx) =>
                row.map((val, cIdx) => (
                  <input
                    key={`${rIdx}-${cIdx}`}
                    type="number"
                    value={val}
                    onChange={(e) => {
                      const next = mat.map((r) => [...r]);
                      next[rIdx][cIdx] = Number(e.target.value) || 0;
                      setMat(next);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-mono font-bold text-sm outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-400'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400'
                    }`}
                  />
                ))
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div
                className={`p-3.5 rounded-xl border ${
                  isDark
                    ? 'bg-indigo-500/12 border-indigo-400/30 text-indigo-200'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                }`}
              >
                <div className="text-[11px] uppercase opacity-70">
                  3×3 Determinant |A|
                </div>
                <div className="text-2xl font-extrabold mt-1">|A| = {det3x3}</div>
                <div className="text-[11px] opacity-80 mt-1">
                  {det3x3 === 0
                    ? lang === 'bn'
                      ? 'ব্যতিক্রমী ম্যাট্রিক্স (Singular: A⁻¹ নেই)'
                      : 'Singular Matrix (No Inverse)'
                    : lang === 'bn'
                    ? 'অব্যতিক্রমী ম্যাট্রিক্স (A⁻¹ বিদ্যমান)'
                    : 'Non-Singular (Invertible)'}
                </div>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isDark
                    ? 'bg-teal-500/12 border-teal-400/30 text-teal-200'
                    : 'bg-teal-50 border-teal-200 text-teal-900'
                }`}
              >
                <div className="text-[11px] uppercase opacity-70">
                  Top-Left 2×2 Inverse
                </div>
                {det2x2 === 0 ? (
                  <div className="font-bold mt-2">ad - bc = 0 (Singular)</div>
                ) : (
                  <div className="mt-1 space-y-0.5">
                    <div className="font-bold">1 / ({det2x2}) ×</div>
                    <div>
                      [{mat[1][1]}, {-mat[0][1]}]
                    </div>
                    <div>
                      [{-mat[1][0]}, {mat[0][0]}]
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Conics & Trig SVG Plotter */}
          <div className={`${cardClass} space-y-4`}>
            <div>
              <span className="text-[11px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">
                CONICS, CIRCLE & TRIGONOMETRY PLOTTER
              </span>
              <h2 className="text-base font-bold mt-0.5">
                {lang === 'bn'
                  ? 'পরাবৃত্ত, বৃত্ত ও ত্রিকোণমিতিক লেখচিত্র'
                  : 'Interactive Parabola, Circle & Trig Grapher'}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'parabola' as const, label: 'y = a·x² - b' },
                { id: 'sine' as const, label: 'y = a·sin(b·x)' },
                { id: 'circle' as const, label: 'x² + y² = r²' },
              ].map((gItem) => (
                <button
                  key={gItem.id}
                  type="button"
                  onClick={() => setGraphType(gItem.id)}
                  className={`py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer ${
                    graphType === gItem.id
                      ? isDark
                        ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                      : isDark
                      ? 'bg-slate-900/50 border-slate-700 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {gItem.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono opacity-75 mb-1">
                  {graphType === 'circle' ? `Radius r = ${graphParamB}` : `a = ${graphParamA}`}
                </label>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.5}
                  value={graphType === 'circle' ? graphParamB : graphParamA}
                  onChange={(e) =>
                    graphType === 'circle'
                      ? setGraphParamB(Number(e.target.value))
                      : setGraphParamA(Number(e.target.value))
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
              {graphType !== 'circle' && (
                <div>
                  <label className="block font-mono opacity-75 mb-1">
                    b = {graphParamB}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={4}
                    step={0.5}
                    value={graphParamB}
                    onChange={(e) => setGraphParamB(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>
              )}
            </div>

            <div
              className={`rounded-xl border p-3 flex justify-center ${
                isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {(() => {
                const cx = 130;
                const cy = 85;
                const scale = 16;
                const pts: string[] = [];
                if (graphType === 'parabola' || graphType === 'sine') {
                  for (let px = -6; px <= 6; px += 0.2) {
                    const py =
                      graphType === 'parabola'
                        ? graphParamA * px * px * 0.25 - graphParamB
                        : graphParamA * Math.sin(graphParamB * px);
                    const sx = cx + px * scale;
                    const sy = cy - py * scale;
                    if (sy >= 5 && sy <= 165) {
                      pts.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
                    }
                  }
                }
                return (
                  <svg viewBox="0 0 260 170" className="w-full max-w-xs h-40">
                    <line x1="10" y1={cy} x2="250" y2={cy} stroke="#94a3b8" strokeWidth="1" />
                    <line x1={cx} y1="10" x2={cx} y2="160" stroke="#94a3b8" strokeWidth="1" />
                    {graphType === 'circle' ? (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={graphParamB * scale}
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="2.5"
                      />
                    ) : (
                      <polyline
                        fill="none"
                        stroke="#0d9488"
                        strokeWidth="2.5"
                        points={pts.join(' ')}
                      />
                    )}
                  </svg>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
