"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceLine, Tooltip } from "recharts";
import { RefreshCw } from "lucide-react";
import Latex from "react-latex-next";

// Generate random Gamma(shape, scale)
const randomGamma = (shape: number, scale: number) => {
  let sum = 0;
  for(let i=0; i<shape; i++) {
    sum += -Math.log(Math.random()) * scale;
  }
  return sum;
};

export default function ConsistencySimulator() {
  const [data, setData] = useState<{ n: number; estimate: number }[]>([]);
  const TRUE_LAMBDA = 4;
  const SHAPE = 2;

  const runSimulation = () => {
    const points = [];
    let cumulativeSum = 0;
    
    // Simulate increasing sample size from 1 to 500
    for (let n = 1; n <= 500; n++) {
      const x = randomGamma(SHAPE, TRUE_LAMBDA);
      cumulativeSum += x;
      
      // MLE for Lambda (when alpha is known) = Mean / Alpha
      const estimate = (cumulativeSum / n) / SHAPE;
      
      points.push({ n, estimate });
    }
    setData(points);
  };

  useEffect(() => { runSimulation(); }, []);

  return (
    <div className="bg-paper border border-ink/10 rounded-xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h3 className="font-serif text-2xl text-ink">Consistency Visualizer</h3>
           {/* FIX: Wrapped LaTeX in backticks and braces to prevent JSX errors */}
           <p className="text-sm text-ink/60 font-serif mt-1">
             Watch the estimator <Latex>{`$\\hat{\\lambda}_{MLE}$`}</Latex> converge to the true value as <Latex>{`$n \\to \\infty$`}</Latex>.
           </p>
        </div>
        <button 
          onClick={runSimulation}
          className="p-3 border border-ink/10 rounded-lg hover:bg-ink/5 transition-colors text-ink/60"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="h-[300px] w-full relative">
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="n" type="number" hide />
            <YAxis domain={[2, 6]} hide />
            <Tooltip 
              labelFormatter={(n) => `Sample Size: ${n}`}
              formatter={(val: number) => [val.toFixed(3), "Estimate"]}
              contentStyle={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-ink)' }}
            />
            <ReferenceLine y={TRUE_LAMBDA} stroke="var(--color-accent)" strokeDasharray="5 5" label={{ value: 'True λ=4', position: 'insideTopRight', fill: 'var(--color-accent)', fontSize: 10 }} />
            <Line 
              type="monotone" 
              dataKey="estimate" 
              stroke="var(--color-ink)" 
              strokeWidth={1.5} 
              dot={false} 
              animationDuration={1500} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}