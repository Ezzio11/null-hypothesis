"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BETA = {
  cows: 0.677, feed: 0.372, inter: 0.067, const: 11.5
};

export default function InteractionHeatmap() {
  const { t, dir } = useLanguage();
  const [hoverVal, setHoverVal] = useState<number | null>(null);

  const grid = useMemo(() => {
    const rows = [];
    for (let f = 8000; f >= 2000; f -= 600) {
      const row = [];
      for (let c = 20; c <= 120; c += 10) {
        const logY = BETA.const + BETA.cows * Math.log(c) + BETA.feed * Math.log(f) + BETA.inter * Math.log(c) * Math.log(f);
        row.push({ cows: c, feed: f, milk: Math.exp(logY) });
      }
      rows.push(row);
    }
    return rows;
  }, []);

  const maxMilk = grid[0][grid[0].length - 1].milk;
  const minMilk = grid[grid.length - 1][0].milk;

  const getColor = (val: number) => {
    const intensity = (val - minMilk) / (maxMilk - minMilk);
    return `rgba(217, 119, 6, ${0.1 + intensity * 0.9})`; 
  };

  return (
    <div className="bg-paper border border-ink/10 rounded-xl p-6 md:p-8 shadow-sm h-full flex flex-col" dir={dir}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h3 className="font-serif text-lg md:text-xl text-ink flex items-center gap-2">
             <Layers className="w-5 h-5 text-amber-600"/> {t('dairy.heatmap.title') || "Synergy Map (RQ3)"}
          </h3>
          <p className="text-sm text-ink/60 font-serif mt-1 max-w-md leading-relaxed">
            {t('dairy.heatmap.desc') || "Visualizing the Translog Interaction (X1*X4). Feed becomes more effective as herd size increases."}
          </p>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto bg-ink/5 p-3 rounded-lg sm:bg-transparent sm:p-0">
           <span className="text-[10px] font-mono uppercase tracking-widest text-ink/40 block mb-1">{t('dairy.heatmap.output') || "Predicted Output"}</span>
           <div className="text-2xl font-bold text-ink font-serif">
             {hoverVal ? `${(hoverVal/1000).toFixed(1)}k L` : "---"}
           </div>
        </div>
      </div>

      <div className="relative aspect-video w-full border border-ink/10 bg-ink/5 rounded-lg overflow-hidden flex flex-col flex-1" dir="ltr">
         {grid.map((row, i) => (
           <div key={i} className="flex-1 flex">
             {row.map((cell, j) => (
               <motion.div
                 key={j}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: (i + j) * 0.01 }}
                 className="flex-1 border-[0.5px] border-paper/20 hover:border-ink/30 relative group cursor-crosshair transition-all"
                 style={{ backgroundColor: getColor(cell.milk) }}
                 onMouseEnter={() => setHoverVal(cell.milk)}
                 onMouseLeave={() => setHoverVal(null)}
               >
                 {/* Tooltip */}
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-ink text-paper text-[10px] font-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 shadow-xl border border-paper/20">
                    C:{cell.cows} | F:{cell.feed}
                 </div>
               </motion.div>
             ))}
           </div>
         ))}
         
         <div className="absolute bottom-2 right-4 text-[10px] font-mono text-ink/40 font-bold bg-paper/50 px-1 rounded backdrop-blur-sm">HERD SIZE →</div>
         <div className="absolute top-4 left-2 text-[10px] font-mono text-ink/40 font-bold rotate-90 origin-top-left bg-paper/50 px-1 rounded backdrop-blur-sm">FEED INTENSITY →</div>
      </div>
    </div>
  );
}