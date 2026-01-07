// DistributionGraph.tsx

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Latex from "react-latex-next";
import { Split, Activity, Settings2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// --- MATH ENGINES (Unchanged) ---
function gamma(z: number): number {
  const p = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < p.length; i++) x += p[i] / (z + i + 1);
  const t = z + p.length - 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

const dists = {
  normal: {
    name: "Normal (Z)",
    pdf: (x: number) => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x),
    range: [-4, 4],
    defaultVal: 1.96,
    step: 0.05,
    formula: `f(x) = \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{1}{2}x^2}`,
    critOne: 1.645, 
    critTwo: 1.96
  },
  chisq: {
    name: "Chi-Square (χ²)",
    pdf: (x: number, k: number = 3) => {
      if (x <= 0) return 0;
      return (Math.pow(x, k/2 - 1) * Math.exp(-x/2)) / (Math.pow(2, k/2) * gamma(k/2));
    },
    range: [0, 12],
    defaultVal: 3.5,
    step: 0.1,
    formula: `f(x; k) = \\frac{x^{k/2-1} e^{-x/2}}{2^{k/2} \\Gamma(k/2)}`,
    critOne: 7.815, 
    critTwo: 7.815
  }
};

export default function DistributionGraph() {
  const { t, dir } = useLanguage();
  const [activeDist, setActiveDist] = useState<"normal" | "chisq">("normal");
  const [sides, setSides] = useState<1 | 2>(2);
  const [testStat, setTestStat] = useState(1.96);
  const [df, setDf] = useState(3); 
  
  // FIX 1: Dynamic sizing state and ref
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgWidth, setSvgWidth] = useState(300); // Start with small default
  const height = 250;

  // FIX 2: Calculate container width on mount and resize
  useEffect(() => {
    const handleResize = () => {
        if (containerRef.current) {
            // Get the actual width, subtract container padding if necessary
            setSvgWidth(containerRef.current.clientWidth); 
        }
    };
    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); 

  // CONFIG
  const currentDist = dists[activeDist];
  const [minX, maxX] = currentDist.range;
  const range = maxX - minX;
  
  // Dynamic Scaling
  const scaleX = svgWidth / range;
  
  const mapX = (val: number) => (val - minX) * scaleX;
  const mapY = (val: number) => height - val * (activeDist === 'normal' ? 500 : 800); 

  // GENERATE PATHS & AREA
  const { curvePath, tailPaths, area } = useMemo(() => {
    let curvePts = [];
    let rightTailPts = [];
    let leftTailPts = [];
    let totalArea = 0;
    let tailArea = 0;
    const dx = 0.05; 

    for (let x = minX; x <= maxX; x += dx) {
      const y = currentDist.pdf(x, df);
      const px = mapX(x);
      const py = mapY(y);
      
      curvePts.push(`${px},${py}`);
      totalArea += y * dx;

      const isRightTail = sides === 1 ? x >= testStat : x >= Math.abs(testStat);
      const isLeftTail  = sides === 2 && activeDist === 'normal' && x <= -Math.abs(testStat);

      if (isRightTail) {
        rightTailPts.push(`${px},${py}`);
        tailArea += y * dx;
      }
      
      if (isLeftTail) {
        leftTailPts.push(`${px},${py}`);
        tailArea += y * dx;
      }
    }

    const cPath = `M ${mapX(minX)},${height} L ${curvePts.join(" L ")} L ${mapX(maxX)},${height} Z`;
    
    const rStartVal = sides === 1 ? testStat : Math.abs(testStat);
    const rightStart = mapX(rStartVal);
    
    const rightPath = rightTailPts.length > 0 
      ? `M ${rightStart},${height} L ${rightTailPts.join(" L ")} L ${mapX(maxX)},${height} Z` : "";
      
    const leftStart = mapX(-Math.abs(testStat));
    const leftPath = leftTailPts.length > 0
      ? `M ${mapX(minX)},${height} L ${leftTailPts.join(" L ")} L ${leftStart},${height} Z` : "";

    const p = totalArea > 0 ? (tailArea / totalArea) : 0;

    return { curvePath: cPath, tailPaths: [rightPath, leftPath], area: p };
  }, [activeDist, testStat, df, minX, maxX, sides, currentDist, svgWidth]); // Added svgWidth to dependencies


  return (
    // FIX 3: Adjusted padding on mobile (p-4)
    <div className="bg-card border border-ink/10 rounded-xl p-4 md:p-8 relative overflow-hidden transition-colors shadow-sm" dir={dir}>
      
      {/* CONTROLS HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6 mb-6 md:mb-8 relative z-20">
        <div className="flex flex-wrap gap-2 md:gap-4">
            <div className="flex gap-1 md:gap-2 p-1 bg-ink/5 rounded-lg border border-ink/5 h-fit">
            {(Object.keys(dists) as Array<"normal" | "chisq">).map((key) => (
                <button
                key={key}
                onClick={() => {
                    setActiveDist(key);
                    setTestStat(dists[key].defaultVal);
                    if (key === 'chisq') setSides(1);
                }}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-[9px] md:text-[10px] font-bold font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeDist === key 
                    ? "bg-paper text-accent shadow-sm border border-ink/10" 
                    : "text-ink/40 hover:text-ink/70"
                }`}
                >
                {dists[key].name}
                </button>
            ))}
            </div>

            {activeDist === 'normal' && (
                <button
                    onClick={() => setSides(sides === 1 ? 2 : 1)}
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-ink/5 hover:bg-ink/10 border border-ink/5 transition-colors text-[9px] md:text-[10px] font-mono uppercase tracking-wider text-ink/60"
                >
                    <Split className="w-3 h-3" />
                    {sides === 1 ? (t('inf.alpha.one_sided') || "One-Sided") : (t('inf.alpha.two_sided') || "Two-Sided")}
                </button>
            )}
        </div>

        <div className="text-left md:text-right w-full md:w-auto">
           <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-ink/40 block mb-1 flex items-center gap-2">
             <Activity className="w-3 h-3" /> {t('inf.alpha.p_value') || "P-Value"}
           </span>
           <span className={`font-mono text-2xl md:text-4xl ${area < 0.05 ? "text-accent" : "text-ink"}`} dir="ltr">
             {area < 0.0001 ? "< .0001" : area.toFixed(4)}
           </span>
        </div>
      </div>

      {/* MATH BG */}
      <div className="absolute top-24 md:top-28 left-4 md:left-8 hidden lg:block text-xs md:text-sm text-ink/30 font-serif pointer-events-none">
        <Latex>{`$$${currentDist.formula}$$`}</Latex>
      </div>

      {/* CANVAS */}
      {/* FIX 4: Use ref for container and remove fixed width */}
      <div ref={containerRef} className="relative h-[200px] md:h-[250px] w-full flex justify-center mt-4 md:mt-8 mb-4 md:mb-8 select-none overflow-x-hidden">
        {/* FIX 5: Use dynamic width and height */}
        <svg width={svgWidth} height={height} className="overflow-visible w-full"> 
          
          {/* Curve */}
          <path d={curvePath} fill="currentColor" className="text-ink/5 transition-all duration-500" />
          <path d={curvePath} fill="none" stroke="currentColor" strokeWidth="2" className="text-ink/20 transition-all duration-500" />
          
          {/* --- CRITICAL LINES (Alpha = 0.05) --- */}
          {/* Right Critical Line */}
          <line 
            x1={mapX(sides === 2 ? 1.96 : 1.645)} y1={50} 
            x2={mapX(sides === 2 ? 1.96 : 1.645)} y2={height} 
            stroke="#DC2626" strokeWidth="1" strokeDasharray="4 4" opacity="0.4"
          />
          <text x={mapX(sides === 2 ? 1.96 : 1.645)} y="45" textAnchor="middle" className="fill-red-500/50 text-[9px] font-mono">
            α=.05
          </text>

          {/* Left Critical Line (Only 2-Sided Normal) */}
          {sides === 2 && activeDist === 'normal' && (
            <>
              <line 
                x1={mapX(-1.96)} y1={50} 
                x2={mapX(-1.96)} y2={height} 
                stroke="#DC2626" strokeWidth="1" strokeDasharray="4 4" opacity="0.4"
              />
               <text x={mapX(-1.96)} y="45" textAnchor="middle" className="fill-red-500/50 text-[9px] font-mono">
                α=.05
              </text>
            </>
          )}

          {/* --- USER INTERACTION --- */}
          
          {/* Tails */}
          <motion.path 
            d={tailPaths[0]} 
            fill="var(--color-accent)" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.6 }} 
            transition={{ duration: 0.1 }}
          />
          {sides === 2 && activeDist === 'normal' && (
            <motion.path 
              d={tailPaths[1]} 
              fill="var(--color-accent)" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.1 }} 
            />
          )}
          
          {/* Handle (Right / Main) */}
          <line 
            x1={mapX(sides === 2 ? Math.abs(testStat) : testStat)} y1={0} 
            x2={mapX(sides === 2 ? Math.abs(testStat) : testStat)} y2={height} 
            stroke="var(--color-accent)" strokeWidth="2" 
            className="transition-all duration-75"
          />
          
          {/* Handle (Left Mirror - Only 2-Sided) */}
          {sides === 2 && activeDist === 'normal' && (
             <line 
                x1={mapX(-Math.abs(testStat))} y1={0} 
                x2={mapX(-Math.abs(testStat))} y2={height} 
                stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" 
             />
          )}

        </svg>
      </div>

      {/* INPUTS */}
      <div className="space-y-4 md:space-y-6">
        
        <div>
          <div className="flex justify-between text-xs font-mono mb-2 text-ink/60">
            <span>{t('inf.dist.stat') || "Observed Statistic (t)"}</span>
            <span dir="ltr">{testStat.toFixed(2)}</span>
          </div>
          <input 
            type="range" 
            min={minX} max={maxX} step={currentDist.step} 
            value={testStat}
            onChange={(e) => setTestStat(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>

        {activeDist === "chisq" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <div className="flex justify-between text-xs font-mono mb-2 text-ink/60">
              <span className="flex items-center gap-2"><Settings2 className="w-3 h-3"/> {t('inf.dist.df') || "Degrees of Freedom (df)"}</span>
              <span>{df}</span>
            </div>
            <input 
              type="range" min="1" max="10" step="1" 
              value={df}
              onChange={(e) => setDf(parseInt(e.target.value))}
              className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-ink"
            />
          </motion.div>
        )}

      </div>
    </div>
  );
}