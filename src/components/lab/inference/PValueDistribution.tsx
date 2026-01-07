"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { Play, RotateCcw } from "lucide-react";
import Latex from "react-latex-next";
import { useLanguage } from "@/contexts/LanguageContext";
import LabPartner from "../LabPartner";

function runSimulations(n: number, effectSize: number, simulations: number) {
  const pValues = [];
  for (let i = 0; i < simulations; i++) {
    const sample1 = Array.from({ length: n }, () => boxMullerRandom());
    const sample2 = Array.from({ length: n }, () => boxMullerRandom() + effectSize);
    pValues.push(tTest(sample1, sample2));
  }
  return pValues;
}

function boxMullerRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function tTest(sample1: number[], sample2: number[]) {
  const n = sample1.length;
  const mean1 = sample1.reduce((a, b) => a + b, 0) / n;
  const mean2 = sample2.reduce((a, b) => a + b, 0) / n;
  const var1 = sample1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0) / (n - 1);
  const var2 = sample2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0) / (n - 1);
  const pooledSE = Math.sqrt((var1 + var2) / n);
  return (1 - erf(Math.abs((mean2 - mean1) / pooledSE) / Math.sqrt(2)));
}

function erf(x: number) {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1.0 / (1.0 + p * x);
  return sign * (1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x));
}

export default function PValueDistribution() {
  const { t, dir } = useLanguage();
  const [effectSize, setEffectSize] = useState(0);
  const [data, setData] = useState<{ bin: string; count: number; pRange: number }[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const run = () => {
    setIsRunning(true);
    setTimeout(() => {
      const pValues = runSimulations(30, effectSize, 2000);
      const bins = Array(20).fill(0);
      pValues.forEach(p => { const binIdx = Math.min(19, Math.floor(p * 20)); bins[binIdx]++; });
      setData(bins.map((count, i) => ({ bin: (i * 0.05).toFixed(2), count, pRange: i * 0.05 })));
      setIsRunning(false);
    }, 100);
  };

  return (
    <div className="bg-card border border-ink/10 rounded-xl p-4 md:p-8 shadow-sm" dir={dir}>
      <div className="flex flex-col lg:flex-row justify-between mb-6 md:mb-8 gap-6 md:gap-12">
        <div className="w-full lg:w-1/3 space-y-6 md:space-y-8">
          <div>
            <h3 className="font-serif text-xl md:text-2xl text-ink mb-2">{t('inf.dist.title') || "The Long Run"}</h3>
            <p className="font-serif text-xs md:text-sm text-ink/70 leading-relaxed">
              {t('inf.dist.desc') || "What happens if we repeat the experiment 2,000 times?"}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-2 text-ink/60">
              <span>{t('inf.dist.effect') || "Effect Size"} (<Latex>$\delta$</Latex>)</span>
              <span dir="ltr">{effectSize}</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.1" value={effectSize}
              onChange={(e) => setEffectSize(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <p className="text-[10px] text-ink/40 mt-1">
              {effectSize === 0 ? (t('inf.dist.null_true') || "H0 is True (No Effect)") : (t('inf.dist.null_false') || "H1 is True (Real Effect)")}
            </p>
          </div>

          <button
            onClick={run} disabled={isRunning}
            className="w-full py-3 bg-ink text-paper rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRunning ? <RotateCcw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 rtl:rotate-180" />}
            {t('inf.dist.run') || "Run 2,000 Trials"}
          </button>
        </div>

        <div className="w-full lg:w-2/3 h-[250px] md:h-[300px] bg-ink/5 rounded-xl border border-ink/5 p-2 md:p-4 relative" dir="ltr">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="bin" tick={{ fontSize: 9, fill: 'var(--color-ink)', fontFamily: 'var(--font-mono)' }} interval={data.length > 10 ? 2 : 1} />
                <YAxis hide />
                <Bar dataKey="count">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pRange < 0.05 ? "var(--color-accent)" : "var(--color-ink)"} opacity={entry.pRange < 0.05 ? 0.9 : 0.2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-ink/30 font-mono text-xs uppercase">
              {t('inf.dist.waiting') || "Waiting for simulation..."}
            </div>
          )}
        </div>
      </div>

      <LabPartner
        title="Analysis"
        context={{
          simulation: "P-Value Distribution",
          effectSize: effectSize,
          numberOfSimulations: 2000,
          hypothesis: effectSize === 0 ? "Null Hypothesis True" : "Alternative Hypothesis True",
          observation: data.length > 0 ? "Data was generated" : "No data yet",
          // Adding a summary of the distribution shape for the AI
          distributionSummary: data.length > 0 ? (
            data[0].count > data[19].count ? "Right Skewed (High density at low p-values)" : "Uniform-ish or unsure"
          ) : "None"
        }}
        defaultPrompt="Analyze the distribution of P-Values. If H0 is true, what shape should we see? If H1 is true, what does the skew mean for statistical power?"
      />
    </div>
  );
}