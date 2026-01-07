"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Latex from "react-latex-next";
import { useLanguage } from "@/contexts/LanguageContext";
import LabPartner from "../LabPartner";

// Box-Muller for Normal Distribution
function randomNormal(mean = 0, std = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

const getZScore = (confidence: number) => {
  if (confidence === 0.90) return 1.645;
  if (confidence === 0.95) return 1.96;
  if (confidence === 0.99) return 2.576;
  return 1.96;
};

type Interval = {
  id: number;
  mean: number;
  lower: number;
  upper: number;
  hit: boolean;
};

export default function ConfidenceIntervals() {
  const { t, dir } = useLanguage();
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const [sampleSize, setSampleSize] = useState(30);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);

  const TRUE_MEAN = 0;
  const TRUE_STD = 15;

  const runSimulation = () => {
    setIsRunning(true);
    const z = getZScore(confidenceLevel);
    const newIntervals: Interval[] = [];

    for (let i = 0; i < 50; i++) { // Reduced to 50 for cleaner animation
      const sample = Array.from({ length: sampleSize }, () => randomNormal(TRUE_MEAN, TRUE_STD));
      const sampleMean = sample.reduce((a, b) => a + b, 0) / sampleSize;
      const stdErr = TRUE_STD / Math.sqrt(sampleSize);
      const marginOfError = z * stdErr;
      newIntervals.push({
        id: i,
        mean: sampleMean,
        lower: sampleMean - marginOfError,
        upper: sampleMean + marginOfError,
        hit: (sampleMean - marginOfError) <= TRUE_MEAN && (sampleMean + marginOfError) >= TRUE_MEAN
      });
    }

    setIntervals([]);
    // Small delay to allow reset before animation starts
    setTimeout(() => {
      setIntervals(newIntervals);
      setRunCount(prev => prev + 50);
      setIsRunning(false);
    }, 100);
  };

  const totalHits = intervals.filter(i => i.hit).length;
  const successRate = intervals.length > 0 ? (totalHits / intervals.length) * 100 : 0;

  return (
    <div className="bg-paper border border-ink/10 rounded-xl p-4 md:p-8 shadow-sm relative" dir={dir}>

      {/* HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 md:gap-12 mb-6 md:mb-8">

        <div className="lg:w-1/3 space-y-6 md:space-y-8">
          <div>
            <h3 className="font-serif text-xl md:text-2xl text-ink mb-2">{t('inf.ci.title') || "Coverage Simulation"}</h3>
            <p className="text-sm md:text-lg text-ink/70 leading-relaxed font-serif">
              {t('inf.ci.desc') || "A 95% Confidence Interval does not mean \"There is a 95% chance the parameter is here.\" It means: \"If we dropped 100 intervals, 95 of them would catch the line.\""}
            </p>
          </div>

          {/* Controls */}
          <div className="bg-ink/5 p-4 md:p-6 rounded-lg border border-ink/5 space-y-4 md:space-y-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-ink/50 mb-3">{t('inf.ci.confidence') || "Confidence Level"}</label>
              <div className="flex gap-2">
                {[0.90, 0.95, 0.99].map((val) => (
                  <button
                    key={val}
                    onClick={() => setConfidenceLevel(val)}
                    className={`flex-1 py-2 text-xs font-mono border transition-all ${confidenceLevel === val
                      ? "bg-accent border-accent text-white"
                      : "bg-transparent border-ink/20 text-ink/60 hover:border-ink"
                      }`}
                  >
                    {val * 100}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-2 uppercase tracking-widest text-ink/50">
                <span>{t('inf.dist.sample') || "Sample Size"} (n)</span>
                <span>{sampleSize}</span>
              </div>
              <input
                type="range" min="10" max="100" step="10"
                value={sampleSize}
                onChange={(e) => setSampleSize(Number(e.target.value))}
                className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-ink"
              />
            </div>

            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="w-full py-3 md:py-4 bg-ink text-paper font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors border border-ink disabled:opacity-50"
            >
              {isRunning ? (t('common.running') || "Running...") : (t('common.start') || "Start")}
            </button>
          </div>
        </div>

        {/* VISUALIZATION (Raining Bars) */}
        <div className="lg:w-2/3 relative h-[400px] md:h-[500px] bg-ink/5 border border-ink/10 rounded-lg overflow-hidden" dir="ltr">

          {/* True Mean Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-ink/80 z-10 border-r border-dashed border-ink/20"></div>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-ink text-paper px-2 py-1 text-[9px] md:text-[10px] font-mono z-20">
            <Latex>$\mu$</Latex> {t('inf.ci.true_mean') || "(True Mean)"}
          </div>

          <div className="absolute inset-0 p-6 flex flex-col justify-evenly">
            {intervals.map((interval, i) => {
              const scale = (val: number) => 50 + (val / 50) * 50;
              const left = scale(interval.lower);
              const width = scale(interval.upper) - left;

              return (
                <motion.div
                  key={interval.id}
                  // ANIMATION: Fall from top (-50px) to position (0)
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.02, // Stagger effect
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }}
                  className="relative h-[4px] w-full"
                >
                  {/* The Bar */}
                  <div
                    className={`absolute h-full rounded-sm transition-colors duration-500 ${interval.hit ? "bg-ink/40" : "bg-red-600"
                      }`}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                    }}
                  />
                  {/* The Mean Dot */}
                  <div
                    className={`absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 top-1/2 border border-paper ${interval.hit ? "bg-ink" : "bg-red-600"
                      }`}
                    style={{ left: `${scale(interval.mean)}%` }}
                  />
                </motion.div>
              )
            })}

            {intervals.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-ink/20 font-serif text-lg md:text-2xl italic px-4 text-center">
                {t('inf.ci.waiting') || "Awaiting Data Stream..."}
              </div>
            )}
          </div>

          {/* Stats Overlay */}
          <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-paper border border-ink/10 p-2 md:p-4 rounded shadow-sm text-right">
            <div className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-ink/40 mb-1">
              {t('inf.ci.rate') || "Capture Rate"}
            </div>
            <div className={`text-2xl md:text-4xl font-mono font-bold ${Math.abs(successRate - confidenceLevel * 100) < 5 ? "text-emerald-700" : "text-red-700"
              }`} dir="ltr">
              {successRate.toFixed(0)}%
            </div>
            <div className="text-[9px] md:text-[10px] text-ink/30 font-mono mt-1 md:mt-2">
              {t('inf.ci.total') || "Total Samples"}: {runCount}
            </div>
          </div>

        </div>
      </div>

      <LabPartner
        title="Coverage Analysis"
        context={{
          simulation: "Confidence Intervals Coverage",
          targetConfidence: confidenceLevel,
          actualCoverageRate: successRate / 100,
          sampleSize: sampleSize,
          totalTrials: runCount,
          interpretation: Math.abs(successRate - (confidenceLevel * 100)) < 5
            ? "Calibrated (Coverage matches confidence)"
            : "Variance (Small sample run variance)"
        }}
        defaultPrompt="We ran a simulation of confidence intervals. Explain why the 'Capture Rate' (percentage of intervals that hit the mean) tends to converge to the 'Confidence Level' over the long run."
      />
    </div>
  );
}