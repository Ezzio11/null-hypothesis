"use client";

import { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { GitCompare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ModelComparison() {
  const { t, dir } = useLanguage();

  const data = useMemo(() => {
    const points = [];
    for (let c = 10; c <= 100; c += 10) {
      const logC = Math.log(c);
      const ols = Math.exp(11.57 + 0.595 * logC);
      const fe = Math.exp(11.57 + 0.662 * logC);
      points.push({ cows: c, OLS: ols, FE: fe });
    }
    return points;
  }, []);

  return (
    <div className="bg-paper border border-ink/10 rounded-xl p-6 md:p-8 shadow-sm h-full flex flex-col" dir={dir}>
       <div className="mb-6">
         <h3 className="font-serif text-lg md:text-xl text-ink flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-600"/> {t('dairy.hausman.title') || "The Hausman Test"}
         </h3>
         <p className="text-sm text-ink/60 font-serif mt-1 leading-relaxed">
           {t('dairy.hausman.desc') || "Comparing Pooled OLS vs. Fixed Effects. OLS implies lower productivity (β=0.59). Controlling for farm quality reveals the true potential (β=0.66)."}
         </p>
       </div>

       <div className="flex-1 min-h-[250px] w-full" dir="ltr">
         <ResponsiveContainer width="100%" height="100%">
           <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
             <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dim)" />
             <XAxis 
                dataKey="cows" 
                tick={{fontSize: 10, fill: 'var(--color-ink)', opacity: 0.5}} 
                label={{ value: t('dairy.input.cows') || 'Herd Size', position: 'insideBottom', offset: -5, fontSize: 10, fill: 'var(--color-ink)', opacity: 0.5 }} 
                axisLine={false} tickLine={false}
             />
             <YAxis hide />
             <Tooltip 
               contentStyle={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-ink)', borderRadius: '8px', fontSize: '12px' }}
               itemStyle={{ color: 'var(--color-ink)' }}
               formatter={(val: number) => val.toFixed(0)}
             />
             <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }}/>
             <Line type="monotone" dataKey="OLS" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" name={t('dairy.model.ols') || "Pooled OLS (Biased)"} />
             <Line type="monotone" dataKey="FE" stroke="#059669" strokeWidth={3} dot={false} name={t('dairy.model.fe') || "Fixed Effects (Robust)"} />
           </LineChart>
         </ResponsiveContainer>
       </div>
    </div>
  );
}