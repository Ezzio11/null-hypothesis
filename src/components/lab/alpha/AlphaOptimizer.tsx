"use client";

import { useState, useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import { Scale, AlertTriangle, ShieldCheck, Microscope } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// --- MATH HELPER FUNCTIONS ---
function getZ(p: number) {
    // Inverse Error Function Approximation for Z-score
    return Math.sqrt(2) * erfinv(2 * p - 1);
}

function erfinv(x: number){
    var z;
    var a = 0.147;
    var sign_x;
    if(0==x) { sign_x = 0; } else if(x>0){ sign_x = 1; } else { sign_x = -1; }
    var ln_1minus_x_sq = Math.log(1-x*x);
    var lnx_sq_plus_a = (2/(Math.PI*a)) + (ln_1minus_x_sq/2);
    var sqrt1 = Math.sqrt(lnx_sq_plus_a*lnx_sq_plus_a - (ln_1minus_x_sq/a));
    var sqrt2 = Math.sqrt(sqrt1 - lnx_sq_plus_a);
    z = sqrt2 * sign_x;
    return z;
}

export default function AlphaOptimizer() {
  const { t } = useLanguage();
  const [costRatio, setCostRatio] = useState(1);
  const [sampleSize, setSampleSize] = useState(100);
  const [effectSize, setEffectSize] = useState(0.5);

  const data = useMemo(() => {
    const points = [];
    let minLoss = Infinity;
    let optimalAlpha = 0.05;

    for (let a = 0.001; a <= 0.20; a += 0.002) {
      const z_crit = getZ(1 - a/2);
      const non_centrality = effectSize * Math.sqrt(sampleSize);
      const z_beta = z_crit - non_centrality;
      const beta = 0.5 * (1 + (Math.sign(z_beta) * (Math.sqrt(1 - Math.exp(-2 * z_beta * z_beta / Math.PI)))));
      
      const loss = (costRatio * a) + (1 * beta);

      if (loss < minLoss) {
        minLoss = loss;
        optimalAlpha = a;
      }

      points.push({
        alpha: a,
        loss: loss,
        beta: beta,
        label: a.toFixed(3)
      });
    }
    return { points, optimalAlpha, minLoss };
  }, [costRatio, sampleSize, effectSize]);

  const getStatusMessage = (alpha: number) => {
      if (alpha < 0.01) return t('alpha.status.strict') || "Status: Extremely Rigorous";
      if (alpha > 0.05) return t('alpha.status.high') || "Status: High Discovery Rate";
      return t('alpha.status.standard') || "Status: Standard Convention";
  };

  return (
    <div className="bg-card border border-ink/10 rounded-xl p-4 md:p-8 shadow-sm relative overflow-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6 md:gap-8 relative z-10">
         <div>
           <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5 text-accent"/> 
              <h3 className="font-serif text-xl md:text-2xl text-ink">{t('alpha.tool.title') || "The Compromise Function"}</h3>
           </div>
           <p className="text-sm text-ink/60 font-serif max-w-md leading-relaxed">
             {t('alpha.tool.desc') || "This graph finds the 'Valley of Truth'—the lowest point on the error curve based on your constraints."}
           </p>
         </div>

         {/* RESULT BADGE */}
         <div className="bg-ink/5 border border-ink/10 p-4 rounded-xl text-left md:text-right w-full md:w-auto min-w-[200px]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink/40 block mb-1">{t('alpha.tool.result_label') || "Recommended Alpha"}</span>
            <div className="text-4xl font-mono font-bold text-accent">
               {data.optimalAlpha.toFixed(4)}
            </div>
            <div className="text-[10px] text-ink/40 mt-1 font-serif italic">
               {getStatusMessage(data.optimalAlpha)}
            </div>
         </div>
      </div>

      {/* CHART */}
      <div className="h-[250px] md:h-[300px] w-full relative z-10 mb-8">
        <ResponsiveContainer>
          {/* FIX: Increased Top and Bottom margins to prevent text clipping */}
          <AreaChart data={data.points} margin={{ top: 25, right: 10, left: -20, bottom: 25 }}>
             <defs>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-ink)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--color-ink)" stopOpacity={0}/>
                </linearGradient>
             </defs>
             <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dim)" vertical={false} />
             
             <XAxis 
               dataKey="alpha" 
               type="number"
               tickFormatter={(val) => val.toFixed(2)}
               tick={{fill: 'var(--color-ink)', fontSize: 10, fontFamily: 'var(--font-mono)'}} 
               axisLine={false} tickLine={false}
               // Adjusted label offset to sit comfortably in the new margin
               label={{ value: 'Alpha Level (α)', position: 'insideBottom', offset: -15, fill: 'var(--color-ink)', fontSize: 10 }}
             />
             <YAxis hide />
             
             <Tooltip 
               contentStyle={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-ink)', fontFamily: 'var(--font-mono)', borderRadius: '8px' }}
               itemStyle={{ color: 'var(--color-ink)' }}
               formatter={(val: number) => val.toFixed(4)}
               labelFormatter={(val) => `α: ${Number(val).toFixed(3)}`}
             />
             
             <Area 
               type="monotone" 
               dataKey="loss" 
               stroke="var(--color-ink)" 
               strokeWidth={2} 
               fill="url(#lossGradient)" 
               animationDuration={500}
             />
             
             {/* Reference Lines */}
             <ReferenceLine x={0.05} stroke="var(--color-ink)" strokeOpacity={0.2} strokeDasharray="3 3" label={{ value: '0.05', fill: 'var(--color-ink)', opacity: 0.5, fontSize: 10, position: 'insideTopLeft' }} />
             
             {/* Optimal Line Label position optimized */}
             <ReferenceLine x={data.optimalAlpha} stroke="var(--color-accent)" strokeWidth={2} label={{ value: 'OPTIMAL', fill: 'var(--color-accent)', fontSize: 10, position: 'top', dy: -10 }} />

          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-ink/5">
         
         {/* 1. Cost Ratio */}
         <div>
            <label className="flex justify-between text-xs font-mono mb-3 text-ink/60">
               <span className="flex items-center gap-2"><AlertTriangle className="w-3 h-3"/> {t('alpha.control.ratio') || "Relative Cost (C1/C2)"}</span>
               <span className="text-accent font-bold">1:{costRatio}</span>
            </label>
            <input 
              type="range" min="0.1" max="10" step="0.1" 
              value={costRatio} onChange={(e) => setCostRatio(Number(e.target.value))}
              className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <p className="text-[11px] text-ink/50 mt-3 leading-snug">
               <strong>{t('alpha.control.ratio_tag') || "The Philosophy Slider."}</strong>
               <br/>{t('alpha.control.ratio_desc') || "High values mean 'False Positives are expensive'. Low values mean 'Missed Discoveries are expensive'."}
            </p>
         </div>

         {/* 2. Sample Size */}
         <div>
            <label className="flex justify-between text-xs font-mono mb-3 text-ink/60">
               <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3"/> {t('alpha.control.sample') || "Sample Size (n)"}</span>
               <span>{sampleSize}</span>
            </label>
            <input 
              type="range" min="10" max="1000" step="10" 
              value={sampleSize} onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-ink"
            />
            <p className="text-[11px] text-ink/50 mt-3 leading-snug">
               <strong>{t('alpha.control.sample_tag') || "The Budget Slider."}</strong>
               <br/>{t('alpha.control.sample_desc') || "More data gives you the 'luxury' of being stricter. Watch how the optimal alpha drops as you increase N."}
            </p>
         </div>

         {/* 3. Effect Size */}
         <div>
            <label className="flex justify-between text-xs font-mono mb-3 text-ink/60">
               <span className="flex items-center gap-2"><Microscope className="w-3 h-3"/> {t('alpha.control.effect') || "Effect Size (d)"}</span>
               <span>{effectSize}</span>
            </label>
            <input 
              type="range" min="0.1" max="2.0" step="0.1" 
              value={effectSize} onChange={(e) => setEffectSize(Number(e.target.value))}
              className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-ink"
            />
            <p className="text-[11px] text-ink/50 mt-3 leading-snug">
               <strong>{t('alpha.control.effect_tag') || "The Reality Slider."}</strong>
               <br/>{t('alpha.control.effect_desc') || "Are you looking for a needle (0.2) or an elephant (2.0)? Bigger effects are easier to prove."}
            </p>
         </div>

      </div>
    </div>
  );
}