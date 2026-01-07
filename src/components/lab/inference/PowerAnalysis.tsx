// PowerAnalysis.tsx

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Latex from "react-latex-next";
import { ShieldAlert } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LabPartner from "../LabPartner";

const pdf = (x: number, mean: number, std: number) =>
  (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));

function cdf(x: number, mean: number, std: number) {
  const z = (x - mean) / std;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - prob : prob;
}

export default function PowerAnalysis() {
  const { t, dir } = useLanguage();
  const [criticalValue, setCriticalValue] = useState(1.65);
  const [effectSize, setEffectSize] = useState(3);
  const stdErr = 1;

  // --- FIXED SCALING CONSTANTS ---
  // FIX 1: Reverting to fixed scaling to prevent compression
  const FIXED_SCALE_X = 60; // Pixels per Standard Deviation unit
  const PLOT_PADDING_UNITS = 4; // Space for H0 tail

  const height = 280;

  // Calculate DYNAMIC WIDTH needed based on EFFECT SIZE and fixed scale
  // Max X-value is roughly effectSize + 4 * stdErr
  // Min X-value is roughly -4 * stdErr
  const maxUnits = Math.max(effectSize + PLOT_PADDING_UNITS, PLOT_PADDING_UNITS);
  const minUnits = -PLOT_PADDING_UNITS;
  const totalUnits = maxUnits - minUnits;

  // FIX 2: The required SVG width is now calculated based on the content scale
  const calculatedSvgWidth = totalUnits * FIXED_SCALE_X;

  // The pixel position of X=0 (H0 mean) is 4 units from the left edge
  const h0_zero_px = PLOT_PADDING_UNITS * FIXED_SCALE_X;
  const baseY = height - 30;

  // Mapping function uses the fixed scale
  const mapX = (val: number) => h0_zero_px + val * FIXED_SCALE_X;
  // ------------------------------

  const alpha = 1 - cdf(criticalValue, 0, stdErr);
  const beta = cdf(criticalValue, effectSize, stdErr);
  const power = 1 - beta;

  const generatePath = (mean: number, std: number, fillLeft: boolean, limit: number) => {
    let d = `M ${mapX(mean - 4 * std)} ${baseY}`;
    for (let x = mean - 4 * std; x <= mean + 4 * std; x += 0.05) {
      if (fillLeft && x > limit) continue;
      if (!fillLeft && x < limit) continue;
      const px = mapX(x);
      const py = baseY - pdf(x, mean, std) * 100;
      d += ` L ${px} ${py}`;
    }
    d += ` L ${fillLeft ? mapX(limit) : mapX(mean + 4 * std)} ${baseY} Z`;
    return d;
  };

  const getFullCurve = (mean: number) => {
    let points = [];
    for (let x = mean - 4 * stdErr; x <= mean + 4 * stdErr; x += 0.05) {
      points.push(`${mapX(x)},${baseY - pdf(x, mean, stdErr) * 100}`);
    }
    return `M ${mapX(mean - 4 * stdErr)} ${baseY} L ${points.join(" L ")}`;
  };

  return (
    <div className="bg-paper border border-ink/10 rounded-xl p-4 md:p-8 shadow-sm" dir={dir}>

      {/* HEADER SECTION - Adjusted gap for mobile */}
      <div className="flex flex-col md:flex-row justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h3 className="font-serif text-xl md:text-2xl text-ink flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 text-accent" /> {t('inf.power.title') || "Power Analysis"}
          </h3>
          <p className="text-xs md:text-sm text-ink/60 mt-2 font-serif">
            {t('inf.power.desc') || "Move the threshold (c) to balance α vs. β."}
          </p>
        </div>

        {/* STATS BADGE - Adjusted padding/gap for mobile density */}
        <div className="flex gap-4 md:gap-6 bg-ink/5 p-3 md:p-4 rounded-xl border border-ink/5 w-full md:w-auto justify-between">
          <div className="text-center">
            <div className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-ink/40 mb-1">{t('inf.alpha.t1') || "Type I Risk"} (α)</div>
            <div className="text-lg md:text-xl font-bold font-mono text-red-600" dir="ltr">{alpha.toFixed(3)}</div>
          </div>
          <div className="w-[1px] bg-ink/10"></div>
          <div className="text-center">
            <div className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-ink/40 mb-1">{t('inf.alpha.t2') || "Type II Risk"} (β)</div>
            <div className="text-lg md:text-xl font-bold font-mono text-blue-600" dir="ltr">{beta.toFixed(3)}</div>
          </div>
          <div className="w-[1px] bg-ink/10"></div>
          <div className="text-center">
            <div className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-ink/40 mb-1">{t('inf.power.power') || "Power"}</div>
            <div className="text-lg md:text-xl font-bold font-mono text-emerald-600" dir="ltr">{power.toFixed(3)}</div>
          </div>
        </div>
      </div>

      {/* SVG CANVAS - FIXED SCALING WITH HORIZONTAL SCROLL */}
      {/* FIX 3: Container now allows horizontal scroll (overflow-x-auto) on small screens */}
      <div className="relative h-[200px] md:h-[280px] w-full border-b border-ink/10 mb-6 md:mb-8 overflow-y-hidden overflow-x-auto select-none" dir="ltr">
        {/* FIX 4: Use calculatedSvgWidth based on content size */}
        <svg width={calculatedSvgWidth} height={height} className="overflow-visible">

          {/* X-axis Line (Draw a visible axis line at the bottom) */}
          <line x1={0} y1={baseY} x2={calculatedSvgWidth} y2={baseY} stroke="currentColor" strokeWidth="1" className="text-ink/20" />

          {/* H0 Curve */}
          <path d={getFullCurve(0)} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-600/50" />
          <text x={mapX(0)} y="30" textAnchor="middle" className="fill-ink/40 font-serif text-xs font-bold">H₀</text>

          {/* H1 Curve */}
          <path d={getFullCurve(effectSize)} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-600/50" />
          <text x={mapX(effectSize)} y="30" textAnchor="middle" className="fill-ink/40 font-serif text-xs font-bold">H₁</text>

          {/* Type I (Alpha) - H0 tail area beyond critical value */}
          <motion.path d={generatePath(0, stdErr, false, criticalValue)} fill="rgba(220, 38, 38, 0.15)" stroke="rgba(220, 38, 38, 0.4)" />

          {/* Type II (Beta) - H1 area below critical value */}
          <motion.path d={generatePath(effectSize, stdErr, true, criticalValue)} fill="rgba(37, 99, 235, 0.15)" stroke="rgba(37, 99, 235, 0.4)" />

          {/* Critical Value Line */}
          <line x1={mapX(criticalValue)} y1={20} x2={mapX(criticalValue)} y2={height} stroke="var(--color-ink)" strokeWidth="1.5" strokeDasharray="4,4" />
          <text x={mapX(criticalValue)} y="15" textAnchor="middle" className="fill-ink font-mono text-xs font-bold">c</text>
        </svg>
      </div>

      {/* INPUT CONTROLS - Uses responsive gap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div>
          <div className="flex justify-between text-xs font-mono mb-2 text-ink/60">
            <span>{t('inf.power.crit') || "Critical Value"}</span>
            <span dir="ltr">{criticalValue.toFixed(2)}</span>
          </div>
          <input type="range" min="0" max="6" step="0.05" value={criticalValue} onChange={(e) => setCriticalValue(parseFloat(e.target.value))} className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-ink" />
        </div>
        <div>
          <div className="flex justify-between text-xs font-mono mb-2 text-ink/60">
            <span>{t('inf.power.effect') || "Effect Size"} (<Latex>$\theta$</Latex>)</span>
            <span dir="ltr">{effectSize.toFixed(1)}</span>
          </div>
          <input type="range" min="0.5" max="6" step="0.1" value={effectSize} onChange={(e) => setEffectSize(parseFloat(e.target.value))} className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-accent" />
        </div>
      </div>

      <LabPartner
        title="Power Analysis Insights"
        context={{
          simulation: "Statistical Power Analysis",
          alpha: alpha,
          beta: beta,
          power: power,
          effectSize: effectSize,
          criticalValue: criticalValue,
          interpretation: power > 0.8
            ? "High Power (Good chance of detecting effect)"
            : "Low Power (High risk of Type II error)"
        }}
        defaultPrompt="Analyze the current trade-off between Type I and Type II errors. How does the Effect Size impact the Power in this configuration?"
      />
    </div>
  );
}