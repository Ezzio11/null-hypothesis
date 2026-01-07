"use client";

import { useState, useRef, useEffect } from "react";
import { Play, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import Latex from "react-latex-next";

const randomGamma = (shape: number, scale: number) => {
  let sum = 0;
  for (let i = 0; i < shape; i++) sum += -Math.log(Math.random()) * scale;
  return sum;
};

export default function MSERace() {
  const [n, setN] = useState(50);
  const [simMSE, setSimMSE] = useState(0);
  const [running, setRunning] = useState(false);

  const TRUE_LAMBDA = 4;
  const SHAPE = 2;

  // Derived Theoretical Variance for Gamma Scale Estimator:
  // Var(X) = alpha * lambda^2.  Mean = alpha * lambda.
  // MLE = Mean / alpha.
  // Var(MLE) = Var(Mean) / alpha^2 = (Var(X)/n) / alpha^2
  // = (alpha * lambda^2 / n) / alpha^2 = lambda^2 / (n * alpha)
  const theoryMSE = (Math.pow(TRUE_LAMBDA, 2)) / (n * SHAPE);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const runMonteCarlo = () => {
    setRunning(true);
    setTimeout(() => {
      if (!isMounted.current) return;

      let squaredErrors = 0;
      const TRIALS = 2000;

      for (let i = 0; i < TRIALS; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) sum += randomGamma(SHAPE, TRUE_LAMBDA);
        const estimate = (sum / n) / SHAPE;
        squaredErrors += Math.pow(estimate - TRUE_LAMBDA, 2);
      }

      if (isMounted.current) {
        setSimMSE(squaredErrors / TRIALS);
        setRunning(false);
      }
    }, 100);
  };

  return (
    <div className="bg-card border border-ink/10 rounded-xl p-8 shadow-sm">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="font-serif text-2xl text-ink">The MSE Race</h3>
          <p className="text-sm text-ink/60 font-serif mt-1">Theoretical Limit vs. Simulation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">

        {/* Bars */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-xs font-mono uppercase tracking-widest text-ink/40 mb-2">
              <span>Theoretical MSE</span>
              <span>{theoryMSE.toFixed(4)}</span>
            </div>
            <div className="h-4 bg-ink/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                className="h-full bg-ink/40"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono uppercase tracking-widest text-ink/40 mb-2">
              <span>Simulated MSE</span>
              <span>{simMSE > 0 ? simMSE.toFixed(4) : "---"}</span>
            </div>
            <div className="h-4 bg-ink/10 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: simMSE > 0 ? `${(simMSE / theoryMSE) * 100}%` : 0 }}
                className={`h-full transition-all duration-1000 ${Math.abs(simMSE - theoryMSE) < 0.05 ? "bg-green-500" : "bg-accent"
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-ink/5 p-6 rounded-xl border border-ink/5">
          <div className="mb-6">
            <div className="flex justify-between text-xs font-mono mb-2 text-ink/60">
              <span>Sample Size (n)</span>
              <span>{n}</span>
            </div>
            <input
              type="range" min="10" max="200" step="10"
              value={n} onChange={(e) => setN(Number(e.target.value))}
              className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-ink"
            />
          </div>

          <button
            onClick={runMonteCarlo}
            disabled={running}
            className="w-full py-3 bg-ink text-paper font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {running ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            Run 2000 Trials
          </button>
        </div>

      </div>
    </div>
  );
}