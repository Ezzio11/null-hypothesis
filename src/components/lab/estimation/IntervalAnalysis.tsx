"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, ErrorBar, Tooltip, ReferenceLine } from "recharts";
import { RefreshCw, Ruler, ArrowRightFromLine } from "lucide-react"; // Added Icon
import Latex from "react-latex-next";

// Inverse Chi-Square Approximation (Wilson-Hilferty)
function chiSqInv(p: number, df: number) {
  const z = 4.91 * (Math.pow(p, 0.14) - Math.pow(1 - p, 0.14)); 
  return df * Math.pow(1 - 2/(9*df) + z * Math.sqrt(2/(9*df)), 3);
}

// Generate Gamma Sample Sum
const randomGammaSum = (n: number, shape: number, scale: number) => {
  let sum = 0;
  const k = n * shape;
  for(let i=0; i<k; i++) sum += -Math.log(Math.random());
  return sum * scale;
};

export default function IntervalAnalysis() {
  const [data, setData] = useState<any[]>([]);
  const [running, setRunning] = useState(false);

  const TRUE_LAMBDA = 4;
  const SHAPE = 2;
  const SIZES = [10, 25, 50, 100, 250, 500]; 

  const runSimulation = () => {
    setRunning(true);
    const results = [];

    for (const n of SIZES) {
      const sumX = randomGammaSum(n, SHAPE, TRUE_LAMBDA);
      const df = 2 * n * SHAPE;
      
      const chiLow = df - 1.96 * Math.sqrt(2 * df); 
      const chiHigh = df + 1.96 * Math.sqrt(2 * df); 
      
      const lower = (2 * sumX) / chiHigh;
      const upper = (2 * sumX) / chiLow;
      
      const estimate = (lower + upper) / 2; 
      
      results.push({
        n,
        estimate,
        error: [lower, upper], 
        length: upper - lower,
        hit: lower <= TRUE_LAMBDA && upper >= TRUE_LAMBDA
      });
    }

    setData(results);
    setRunning(false);
  };

  useEffect(() => { runSimulation(); }, []);
  
  // NEW: Calculate Average Width for the largest sample size to show the "Result"
  const latestRun = data[data.length - 1];
  const currentWidth = latestRun ? latestRun.length.toFixed(2) : "---";

  return (
    <div className="bg-card border border-ink/10 rounded-xl p-8 shadow-sm relative overflow-hidden">
      
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6 relative z-10">
         <div>
           <h3 className="font-serif text-2xl text-ink flex items-center gap-2">
              <Ruler className="w-5 h-5 text-accent"/> Precision vs. Sample Size
           </h3>
           <p className="text-sm text-ink/60 font-serif mt-1 max-w-md">
             As <Latex>$n$</Latex> increases, our uncertainty collapses.
             <br/>The interval tightens around the true parameter.
           </p>
         </div>
         
         <div className="flex items-center gap-4">
            {/* NEW METRIC: Average Width */}
            <div className="text-right hidden md:block">
               <span className="text-[10px] font-mono uppercase tracking-widest text-ink/40 block mb-1">Interval Width (n=500)</span>
               <span className="text-2xl font-mono font-bold text-ink flex items-center justify-end gap-2">
                 <ArrowRightFromLine className="w-4 h-4 text-ink/30" /> {currentWidth}
               </span>
            </div>

            <button 
              onClick={runSimulation}
              disabled={running}
              className="px-4 py-3 bg-ink text-paper font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${running ? "animate-spin" : ""}`}/> Simulate
            </button>
         </div>
      </div>

      <div className="h-[350px] w-full relative z-10">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <XAxis 
               dataKey="n" 
               label={{ value: 'Sample Size (n)', position: 'insideBottom', offset: -10, fill: 'var(--color-ink)', fontSize: 10, fontFamily: 'var(--font-mono)' }} 
               tick={{ fill: 'var(--color-ink)', fontFamily: 'var(--font-mono)' }}
            />
            <YAxis 
               domain={[0, 10]} 
               label={{ value: 'Lambda Estimate', angle: -90, position: 'insideLeft', fill: 'var(--color-ink)', fontSize: 10, fontFamily: 'var(--font-mono)' }} 
               tick={{ fill: 'var(--color-ink)', fontFamily: 'var(--font-mono)' }}
            />
            <Tooltip 
               contentStyle={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-ink)', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}
               itemStyle={{ color: 'var(--color-ink)' }}
               formatter={(val: any, name: string) => {
                 if(name === "length") return [Number(val).toFixed(3), "Width"];
                 if(name === "estimate") return [Number(val).toFixed(3), "Estimate"];
                 return val;
               }}
               labelFormatter={(l) => `N = ${l}`}
            />
            
            <ReferenceLine y={TRUE_LAMBDA} stroke="var(--color-accent)" strokeDasharray="3 3" label={{ value: 'True λ=4', fill: 'var(--color-accent)', fontSize: 10, position: 'right', fontFamily: 'var(--font-mono)' }} />

            <Bar dataKey="estimate" fill="transparent" stroke="transparent">
              <ErrorBar dataKey="error" width={4} strokeWidth={2} stroke="var(--color-ink)" />
            </Bar>

            {/* Visual Guide for "Shrinking" */}
            <ReferenceLine segment={[{ x: 10, y: 8 }, { x: 500, y: 4.5 }]} stroke="var(--color-ink)" strokeOpacity={0.1} strokeDasharray="2 2" />
            <ReferenceLine segment={[{ x: 10, y: 0 }, { x: 500, y: 3.5 }]} stroke="var(--color-ink)" strokeOpacity={0.1} strokeDasharray="2 2" />

          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Math Footer */}
      <div className="flex justify-center mt-4">
         <div className="text-xs font-mono text-ink/40 bg-ink/5 px-4 py-2 rounded-full flex items-center gap-2">
            <Latex>{`$$\\text{Width} \\propto \\frac{1}{\\sqrt{n}}$$`}</Latex>
            <span>(Square Root Law)</span>
         </div>
      </div>

    </div>
  );
}