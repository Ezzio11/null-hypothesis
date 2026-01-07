"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

// Normalization Helper (Min-Max Scaling)
const norm = (val: number, min: number, max: number) => {
  return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
};

export default function RiskRadar({ inputs }: { inputs: any }) {
  const { t, dir } = useLanguage();
  
  // Dynamic Labels
  const data = [
    { subject: t('bp.input.age') || 'Age',       A: norm(inputs.age, 20, 80),    B: norm(55, 20, 80), fullMark: 100 },
    { subject: t('bp.input.bsa') || 'BSA',       A: norm(inputs.bsa, 1.5, 2.5),  B: norm(2.2, 1.5, 2.5), fullMark: 100 },
    { subject: t('bp.input.pulse') || 'Pulse',   A: norm(inputs.pulse, 50, 120), B: norm(85, 50, 120), fullMark: 100 },
    { subject: t('bp.input.stress') || 'Stress', A: norm(inputs.stress, 0, 100), B: norm(70, 0, 100), fullMark: 100 },
    { subject: t('bp.input.dur') || 'Dur',       A: norm(inputs.dur, 0, 20),     B: norm(10, 0, 20), fullMark: 100 },
  ];

  return (
    <div 
      className="h-[300px] w-full relative bg-paper border border-ink/10 rounded-xl overflow-hidden shadow-sm transition-colors duration-700"
      dir={dir}
    >
      {/* Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col md:flex-row md:justify-between md:items-start pointer-events-none">
         <div>
            <h3 className="font-serif text-lg text-ink leading-none">
                {t('bp.radar.title') || "Risk Profile Topology"}
            </h3>
            <p className="text-[10px] font-mono text-ink/40 uppercase tracking-widest mt-1">
                {t('bp.radar.subtitle') || "Current vs. Avg Hypertensive"}
            </p>
         </div>
      </div>

      <div className="w-full h-full pt-8 md:pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="55%" outerRadius="65%" data={data}>
            <PolarGrid stroke="var(--color-ink)" strokeOpacity={0.1} />
            <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: 'var(--color-ink)', fontSize: 10, fontFamily: 'var(--font-mono)' }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            
            {/* Reference Profile (Grey) */}
            <Radar
              name={t('bp.radar.avg') || "Avg. Hypertensive"}
              dataKey="B"
              stroke="var(--color-ink)"
              strokeOpacity={0.3}
              fill="var(--color-ink)"
              fillOpacity={0.1}
            />
            
            {/* Current Patient (Accent) */}
            <Radar
              name={t('bp.radar.current') || "Current Patient"}
              dataKey="A"
              stroke="var(--color-accent)"
              strokeWidth={2}
              fill="var(--color-accent)"
              fillOpacity={0.4}
            />
            <Tooltip 
               contentStyle={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-ink)', borderRadius: '8px', fontSize: '12px' }}
               itemStyle={{ color: 'var(--color-ink)' }}
            />
            <Legend 
                wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--font-mono)', paddingTop: '10px' }}
                formatter={(value) => <span className="text-ink/70 mx-2">{value}</span>}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}