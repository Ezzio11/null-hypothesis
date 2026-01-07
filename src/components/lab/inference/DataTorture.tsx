"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, RefreshCw, Trash2, AlertCircle, ArrowRightLeft } from "lucide-react";
import Latex from "react-latex-next";
import { useLanguage } from "@/contexts/LanguageContext";

// --- MATH: T-TEST ENGINE ---
function calculateTTest(groupA: number[], groupB: number[]) {
  const n1 = groupA.length;
  const n2 = groupB.length;
  if (n1 < 2 || n2 < 2) return { t: 0, p: 1, meanA: 0, meanB: 0, diff: 0 };

  // Means
  const meanA = groupA.reduce((a, b) => a + b, 0) / n1;
  const meanB = groupB.reduce((a, b) => a + b, 0) / n2;
  
  // Variances
  const varA = groupA.reduce((a, b) => a + Math.pow(b - meanA, 2), 0) / (n1 - 1);
  const varB = groupB.reduce((a, b) => a + Math.pow(b - meanB, 2), 0) / (n2 - 1);

  // Pooled Standard Error (assuming equal variance for sim)
  const pooledVar = ((n1 - 1) * varA + (n2 - 1) * varB) / (n1 + n2 - 2);
  const se = Math.sqrt(pooledVar * (1/n1 + 1/n2));

  const tStat = (meanA - meanB) / se;
  
  // P-Value Approx (from T-stat)
  // Using Gaussian approximation for df > 30, close enough for viz
  const p = 2 * (1 - 0.5 * (1 + erf(Math.abs(tStat) / Math.sqrt(2))));
  
  return { t: tStat, p, meanA, meanB, diff: meanA - meanB };
}

// Error function for P-calc
function erf(x: number) {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1.0 / (1.0 + p * x);
  return sign * (1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x));
}

export default function DataTorture() {
  const { t, dir } = useLanguage();
  // Two groups, same population (Mean=50, SD=15)
  const generateGroup = (n: number) => Array.from({ length: n }, (_, i) => ({
    id: Math.random(), // Unique ID for animation
    val: 50 + (Math.random() - 0.5) * 30 // Random spread 35-65
  }));

  const [groupA, setGroupA] = useState(() => generateGroup(20));
  const [groupB, setGroupB] = useState(() => generateGroup(20));

  const stats = useMemo(() => calculateTTest(
    groupA.map(d => d.val), 
    groupB.map(d => d.val)
  ), [groupA, groupB]);

  // THE HACK: Separate the means
  // 1. Remove lowest from A (Push Mean A up)
  // 2. Remove highest from B (Push Mean B down)
  const torture = () => {
    if (groupA.length <= 5 || groupB.length <= 5) return;

    const newA = [...groupA].sort((a, b) => a.val - b.val).slice(2); // Remove 2 lowest
    const newB = [...groupB].sort((a, b) => b.val - a.val).slice(2); // Remove 2 highest
    
    setGroupA(newA);
    setGroupB(newB);
  };

  const reset = () => {
    setGroupA(generateGroup(25));
    setGroupB(generateGroup(25));
  };

  return (
    <div className="bg-card border border-ink/10 rounded-xl p-4 md:p-8 shadow-sm relative overflow-hidden" dir={dir}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 relative z-10 gap-4">
        <div>
           <h3 className="font-serif text-xl md:text-2xl text-ink">{t('inf.torture.title') || "Outlier Removal"}</h3>
           <p className="text-xs md:text-sm text-ink/60 font-serif mt-2 italic">
             {t('inf.torture.quote') || "\"If you torture the data long enough, it will confess.\" — Ronald Coase"}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 relative z-10">
        
        {/* --- THE PLOT (Beeswarm) --- */}
        <div className="md:col-span-2 h-[300px] md:h-[450px] bg-paper border border-ink/10 rounded-lg relative overflow-hidden flex justify-around items-end pb-8 md:pb-12 px-4 md:px-12">
           
           {/* Grid Texture */}
           <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                style={{ backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px)`, backgroundSize: '20px 20px' }} 
           />
           
           {/* MEAN LINE A */}
           <motion.div 
             className="absolute h-[2px] w-1/3 bg-accent z-10 left-[10%]"
             animate={{ bottom: `${stats.meanA}%` }}
           />
           {/* MEAN LINE B */}
           <motion.div 
             className="absolute h-[2px] w-1/3 bg-ink z-10 right-[10%]"
             animate={{ bottom: `${stats.meanB}%` }}
           />

           {/* GROUP A PARTICLES */}
           <div className="relative w-1/3 h-full">
             <span className="absolute -bottom-6 md:-bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] md:text-xs text-accent font-bold uppercase tracking-widest">{t('inf.torture.group_a') || "Group A"}</span>
             <AnimatePresence>
               {groupA.map((p) => (
                 <motion.div
                   layoutId={p.id.toString()}
                   key={p.id}
                   initial={{ opacity: 0, scale: 0 }}
                   animate={{ opacity: 0.6, scale: 1, bottom: `${p.val}%` }}
                   exit={{ opacity: 0, scale: 0, backgroundColor: "red" }}
                   className="absolute w-3 h-3 rounded-full bg-accent shadow-sm"
                   style={{ left: `${(p.id * 100) % 80 + 10}%` }} // Deterministic random X
                 />
               ))}
             </AnimatePresence>
           </div>

           {/* GROUP B PARTICLES */}
           <div className="relative w-1/3 h-full">
             <span className="absolute -bottom-6 md:-bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] md:text-xs text-ink font-bold uppercase tracking-widest">{t('inf.torture.group_b') || "Group B"}</span>
             <AnimatePresence>
               {groupB.map((p) => (
                 <motion.div
                   layoutId={p.id.toString()}
                   key={p.id}
                   initial={{ opacity: 0, scale: 0 }}
                   animate={{ opacity: 0.6, scale: 1, bottom: `${p.val}%` }}
                   exit={{ opacity: 0, scale: 0, backgroundColor: "red" }}
                   className="absolute w-3 h-3 rounded-full bg-ink shadow-sm"
                   style={{ left: `${(p.id * 100) % 80 + 10}%` }} 
                 />
               ))}
             </AnimatePresence>
           </div>
           
           {/* Difference Indicator (Arrow) */}
           <motion.div 
              className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-ink/20 top-0 bottom-0 border-r border-dashed border-ink/30"
           />

        </div>


        {/* --- CONTROLS & METRICS --- */}
        <div className="flex flex-col justify-between h-full">
           
           <div className="space-y-4 md:space-y-6">
             
             {/* METRICS PANEL */}
             <div className="space-y-3 md:space-y-4 p-4 md:p-6 bg-ink/5 rounded-xl border border-ink/5">
               <div>
                  <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-ink/40 mb-1 block">
                    {t('inf.torture.diff') || "Diff of Means"} (<Latex>{"$\\Delta\\bar{x}$"}</Latex>)
                  </span>
                  <span className="text-2xl md:text-3xl font-mono font-bold text-ink" dir="ltr">{stats.diff.toFixed(2)}</span>
               </div>
               <div className="h-[1px] w-full bg-ink/10" />
               <div>
                  <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-ink/40 mb-1 block">
                    {t('inf.torture.hypothesis') || "Hypothesis"}: <Latex>{"$\\mu_A \\neq \\mu_B$"}</Latex>
                  </span>
                  <span className={`text-2xl md:text-3xl font-mono font-bold ${stats.p < 0.05 ? "text-red-600" : "text-ink/40"}`} dir="ltr">
                    P = {stats.p.toFixed(4)}
                  </span>
               </div>
             </div>

             {/* ACTIONS */}
             <div className="space-y-2 md:space-y-3">
                <div className="text-xs text-ink/60 font-serif italic mb-2">
                  {t('inf.torture.click') || "Click points to remove..."}
                </div>
                <button 
                  onClick={torture}
                  disabled={groupA.length <= 5}
                  className="w-full py-3 md:py-4 bg-ink text-paper font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Trash2 className="w-3 h-3 md:w-4 md:h-4" /> {t('inf.torture.separate') || "SEPARATE GROUPS"}
                </button>
                
                <button 
                  onClick={reset}
                  className="w-full py-2 md:py-3 border border-ink/10 text-ink/60 font-mono text-xs uppercase tracking-widest hover:bg-ink/5 transition-colors flex items-center justify-center gap-2 rounded-lg"
                >
                  <RefreshCw className="w-3 h-3 md:w-4 md:h-4" /> {t('common.reset') || "Reset"}
                </button>
             </div>
           </div>

           {/* ALERT */}
           <div className="min-h-[80px] md:min-h-[100px] flex items-end">
             <AnimatePresence>
               {stats.p < 0.05 && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0 }}
                   className="w-full bg-paper border-l-4 border-green-600 p-3 md:p-4 shadow-sm rtl:border-l-0 rtl:border-r-4"
                 >
                    <div className="flex items-center gap-2 mb-1 text-green-700 font-serif font-bold text-base md:text-lg">
                       {t('inf.torture.sig') || "Significant Difference!"}
                    </div>
                    <div className="text-ink/60 text-xs font-serif italic leading-relaxed">
                      {t('inf.torture.sig_desc') || "By deleting the overlap, you forced a difference where none existed."}
                    </div>
                 </motion.div>
               )}
               {stats.p >= 0.05 && (
                 <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="w-full p-3 md:p-4 text-center"
                 >
                    <span className="text-ink/30 text-xs font-mono uppercase tracking-widest">{t('inf.torture.insig') || "No Difference"}</span>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

        </div>

      </div>
    </div>
  );
}