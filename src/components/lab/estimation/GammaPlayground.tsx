"use client";

import { useState, useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Latex from "react-latex-next";
import { Settings2 } from "lucide-react";

// Gamma PDF: f(x) = (x^(k-1) * e^(-x/theta)) / (theta^k * Gamma(k))
// Approximation for Gamma(k) for integer k is (k-1)!
function gammaPDF(x: number, shape: number, scale: number) {
  if (x < 0) return 0;
  // Factorial approximation for non-integer (Lanczos) is heavy, 
  // so we restrict shape to reasonable steps or use a simple approximation if needed.
  // For this viz, we can implement a simple factorial for integers or Stirling's for floats.
  // Let's use a simplified version since shape will be small.

  const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);
  const gammaFn = (n: number) => factorial(n - 1); // Valid for integer n

  return (Math.pow(x, shape - 1) * Math.exp(-x / scale)) / (Math.pow(scale, shape) * gammaFn(shape));
}

export default function GammaPlayground() {
  const [shape, setShape] = useState(2); // Alpha
  const [scale, setScale] = useState(4); // Lambda (Theta)

  // Debounce logic: store display value locally, commit to calculation state after delay
  // Actually, simplest fix for excessive Recharts updates:
  // Use `onMouseUp` or `onTouchEnd` to commit the "expensive" state, 
  // while using a cheaper `display` state for the slider UI.

  const [displayShape, setDisplayShape] = useState(2);
  const [displayScale, setDisplayScale] = useState(4);

  const data = useMemo(() => {
    const pts = [];
    // Smart range calculation based on mean (k*theta) and std (sqrt(k)*theta)
    const maxVal = (shape * scale) + 4 * (Math.sqrt(shape) * scale);

    // Optimization: Reduce resolution slightly
    for (let x = 0; x <= maxVal; x += 0.25) {
      pts.push({ x: x.toFixed(1), y: gammaPDF(x, shape, scale) });
    }
    return pts;
  }, [shape, scale]);

  return (
    <div className="bg-card border border-ink/10 rounded-xl p-8 shadow-sm relative">
      <div className="absolute top-6 right-6 text-right">
        <span className="text-xs font-mono text-ink/40 uppercase tracking-widest block mb-1">True Mean</span>
        <span className="text-3xl font-mono font-bold text-accent">{(shape * scale).toFixed(1)}</span>
      </div>

      <div className="h-[300px] w-full mb-8">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dim)" />
            <XAxis dataKey="x" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-ink)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--color-ink)' }}
              formatter={(val: number) => val.toFixed(4)}
            />
            <Line type="monotone" dataKey="y" stroke="var(--color-ink)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="flex justify-between text-xs font-mono mb-2 text-ink/60">
            <span>Shape (<Latex>$\alpha$</Latex>)</span>
            <span>{displayShape}</span>
          </label>
          <input
            type="range" min="1" max="10" step="1"
            value={displayShape}
            onChange={(e) => setDisplayShape(Number(e.target.value))}
            onMouseUp={() => setShape(displayShape)}
            onTouchEnd={() => setShape(displayShape)}
            className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>
        <div>
          <label className="flex justify-between text-xs font-mono mb-2 text-ink/60">
            <span>Scale (<Latex>$\lambda$</Latex>)</span>
            <span>{displayScale}</span>
          </label>
          <input
            type="range" min="1" max="10" step="0.5"
            value={displayScale}
            onChange={(e) => setDisplayScale(Number(e.target.value))}
            onMouseUp={() => setScale(displayScale)}
            onTouchEnd={() => setScale(displayScale)}
            className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>
      </div>
    </div>
  );
}