// VixChart.tsx

"use client";

import { useState, useMemo } from "react";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, Eye, EyeOff } from "lucide-react";
import REAL_HISTORY from "@/data/vix_real.json"; 
import { useLanguage } from "@/contexts/LanguageContext";

// --- FORECAST DATA (CONSTANTS - Unchanged) ---
const CUBIC_FORECAST = [
  { year: 2025, val: 19.30 }, { year: 2026, val: 20.22 }, { year: 2027, val: 20.86 }, 
  { year: 2028, val: 21.60 }, { year: 2029, val: 22.44 }, { year: 2030, val: 23.40 },
  { year: 2031, val: 24.49 }, { year: 2032, val: 25.73 }, { year: 2033, val: 27.12 }, 
  { year: 2034, val: 28.65 }
];

const ARIMA_FORECAST = [
  { year: 2025, val: 16.36 }, { year: 2026, val: 17.14 }, { year: 2027, val: 17.60 }, 
  { year: 2028, val: 17.88 }, { year: 2029, val: 18.04 }, { year: 2030, val: 18.14 }, 
  { year: 2031, val: 18.19 }, { year: 2032, val: 18.22 }, { year: 2033, val: 18.24 }, 
  { year: 2034, val: 18.25 }
];

interface VixChartProps {
  p?: number; d?: number; q?: number;
}

export default function VixChart({ p = 1, d = 0, q = 0 }: VixChartProps) {
  const { t } = useLanguage();
  const [showCubic, setShowCubic] = useState(true);
  const [showArima, setShowArima] = useState(true);

  const data = useMemo(() => {
    const points = [];
    
    // HISTORY
    const history = REAL_HISTORY.map((point, i) => {
       const t = i / 100; 
       const cubicFit = 15 + 0.5*t - 0.02*Math.pow(t, 2) + 0.003*Math.pow(t, 3);
       return { time: point.year, year: Math.floor(point.year), actual: point.value, cubic: cubicFit, arima: undefined };
    });
    points.push(...history);

    // FORECAST
    for (let i = 0; i < 120; i++) { 
       const currentYear = 2025 + Math.floor(i / 12);
       const monthFraction = (i % 12) / 12;
       
       const getInterp = (dataset: {year: number, val: number}[]) => {
          const start = dataset.find(f => f.year === currentYear)?.val || 0;
          const end = dataset.find(f => f.year === currentYear + 1)?.val || start;
          return start + (end - start) * monthFraction;
       };

       const cubicVal = getInterp(CUBIC_FORECAST);
       let arimaVal = getInterp(ARIMA_FORECAST);
       
       if (d > 0) arimaVal += (i * d * 0.2); 
       if (p === 0) arimaVal += (Math.random() - 0.5) * 5; 
       if (q > 2) arimaVal = (arimaVal * 0.9); 

       points.push({ time: currentYear + monthFraction, year: currentYear, actual: undefined, cubic: Number(cubicVal.toFixed(2)), arima: Number(arimaVal.toFixed(2)) });
    }
    return points;
  }, [p, d, q]);

  return (
    // FIX 1: Reduce padding on mobile (p-4)
    <div className="bg-[#0a0a0a] border border-[#333] rounded-xl p-4 md:p-6 shadow-2xl h-full flex flex-col">
      
      {/* HEADER: Title & Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-[#333] pb-4 gap-4">
        
        {/* Title/Subtitle */}
        <div>
           <h3 className="text-white font-mono text-lg flex items-center gap-2">
             <TrendingUp className="w-4 h-4 text-emerald-500"/> {t('vix.chart.title') || "Volatility Index (VIX)"}
           </h3>
           <p className="text-[#666] text-xs font-mono uppercase tracking-widest mt-1">
             {t('vix.chart.subtitle') || "Real History vs. Research Forecasts"}
           </p>
        </div>
        
        {/* FIX 2: Button Group (Allows wrapping on mobile) */}
        <div className="flex flex-wrap gap-2 self-start sm:self-auto justify-end sm:justify-start">
          <button 
            type="button"
            onClick={() => setShowCubic(!showCubic)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-all whitespace-nowrap ${showCubic ? "bg-red-900/20 text-red-500 border-red-500/50" : "border-[#333] text-gray-500 hover:text-white"}`}
          >
            {showCubic ? <Eye className="w-3 h-3 inline mr-1"/> : <EyeOff className="w-3 h-3 inline mr-1"/>}
            {t('vix.legend.cubic') || "Cubic (Classic)"}
          </button>
          <button 
            type="button"
            onClick={() => setShowArima(!showArima)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-all whitespace-nowrap ${showArima ? "bg-purple-900/20 text-purple-500 border-purple-500/50" : "border-[#333] text-gray-500 hover:text-white"}`}
          >
            {showArima ? <Eye className="w-3 h-3 inline mr-1"/> : <EyeOff className="w-3 h-3 inline mr-1"/>}
            {t('vix.legend.arima') || "ARIMA (Modern)"}
          </button>
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div className="flex-1 min-h-[300px] sm:min-h-[400px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVix" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            
            <XAxis 
              dataKey="time" 
              type="number"
              domain={['dataMin', 'dataMax']}
              tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} 
              axisLine={false} 
              tickLine={false}
              tickCount={5}
              tickFormatter={(val) => Math.floor(val).toString()}
              allowDataOverflow
            />
            <YAxis 
              domain={[0, 100]} 
              orientation="right"
              tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} 
              axisLine={false} 
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
              itemStyle={{ fontFamily: 'monospace' }}
              labelFormatter={(val) => Math.floor(Number(val)).toString()}
              formatter={(value: number) => value ? value.toFixed(2) : "N/A"}
            />
            
            <ReferenceLine x={2025} stroke="#666" strokeDasharray="3 3" label={{ value: "FORECAST", position: "insideTopLeft", fill: "#666", fontSize: 10, angle: 90 }} />

            <Area 
              type="monotone" 
              dataKey="actual" 
              name={t('vix.legend.history') || "Historical"}
              stroke="#10B981" 
              strokeWidth={1.5}
              fillOpacity={1} 
              fill="url(#colorVix)" 
              isAnimationActive={false}
            />
            
            {showCubic && (
              <Line 
                type="monotone" 
                dataKey="cubic" 
                name={t('vix.legend.cubic') || "Cubic Trend"}
                stroke="#ef4444" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                connectNulls={true}
                isAnimationActive={false}
              />
            )}

            {showArima && (
              <Line 
                type="monotone" 
                dataKey="arima" 
                name={t('vix.legend.arima') || "ARIMA Projection"}
                stroke="#a855f7" 
                strokeWidth={2} 
                dot={false}
                connectNulls={true} 
                isAnimationActive={false}
              />
            )}

          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}