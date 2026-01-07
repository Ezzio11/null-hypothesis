// DairyProject.tsx

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Milk, Tractor, Users, Wheat, TrendingUp, Scale, Info, Database, BarChart2 } from "lucide-react";
import Latex from "react-latex-next";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/layout/PageHeader";

// Components
import InteractionHeatmap from "@/components/projects/dairy-eco/InteractionHeatmap";
import ModelComparison from "@/components/projects/dairy-eco/ModelComparison";

// --- Import Supabase ---
import { supabase } from '@/lib/supabase';

// --- TYPES ---
interface HeaderData {
   title: string;
   tagline: string;
   category: string;
}

interface ModelCoeffs {
   intercept: number;
   cows: number;
   land: number;
   labor: number;
   feed: number;
}

// --- DEFAULTS ---
const DEFAULT_COEFFS: ModelCoeffs = {
   intercept: 11.57,
   cows: 0.662,
   land: 0.037,
   labor: 0.030,
   feed: 0.382
};

export default function DairyProject() {
   const { t, dir } = useLanguage();

   // --- STATE ---
   const [headerData, setHeaderData] = useState<HeaderData>({
      title: "The Yield Optimizer.",
      tagline: "Maximizing milk production efficiency using Fixed Effects Panel Data models.",
      category: "AGRICULTURAL ECONOMICS"
   });

   const [resources, setResources] = useState<{ source?: string, pdf?: string, demo?: string }>({});
   const [coeffs, setCoeffs] = useState<ModelCoeffs>(DEFAULT_COEFFS);
   const [isDataLoading, setIsDataLoading] = useState(true);

   const [inputs, setInputs] = useState({ cows: 50, land: 20, labor: 2000, feed: 5000 });
   const [output, setOutput] = useState(0);

   // --- MATH: DYNAMIC CALCULATION ---
   useEffect(() => {
      const logY =
         coeffs.intercept +
         coeffs.cows * Math.log(inputs.cows) +
         coeffs.land * Math.log(inputs.land) +
         coeffs.labor * Math.log(inputs.labor) +
         coeffs.feed * Math.log(inputs.feed);
      setOutput(Math.exp(logY));
   }, [inputs, coeffs]);

   // --- FETCH DATA (CMS PATTERN) ---
   const fetchPageData = useCallback(async () => {
      setIsDataLoading(true);
      try {
         const { data: page } = await supabase
            .from('pages')
            .select('title, tagline, category_label, meta')
            .eq('slug', 'projects/dairy-eco')
            .single();

         if (page) {
            // 1. Text Content
            setHeaderData({
               title: page.title || headerData.title,
               tagline: page.tagline || headerData.tagline,
               category: page.category_label || headerData.category
            });

            // 2. Meta Parsing (Resources + Model Config)
            if (page.meta) {
               setResources({
                  source: page.meta.source_url,
                  pdf: page.meta.pdf_url,
                  demo: page.meta.demo_url
               });

               if (page.meta.model_config && page.meta.model_config.coeffs) {
                  setCoeffs(prev => ({ ...prev, ...page.meta.model_config.coeffs }));
               }
            }
         }
      } catch (err) {
         console.error('Error fetching page data:', err);
      } finally {
         setIsDataLoading(false);
      }
   }, []); // eslint-disable-line react-hooks/exhaustive-deps

   useEffect(() => {
      fetchPageData();
   }, [fetchPageData]);


   const chartData = useMemo(() => {
      const data = [];
      for (let c = 10; c <= 200; c += 10) {
         const logY =
            coeffs.intercept + coeffs.cows * Math.log(c) + coeffs.land * Math.log(inputs.land) +
            coeffs.labor * Math.log(inputs.labor) + coeffs.feed * Math.log(inputs.feed);
         data.push({ cows: c, milk: Math.exp(logY) });
      }
      return data;
   }, [inputs.land, inputs.labor, inputs.feed, coeffs]);

   return (
      <main className="min-h-screen pt-24 md:pt-32 pb-20 px-6 bg-paper font-serif relative overflow-hidden transition-colors duration-700" dir={dir}>

         <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
               backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
            }}
         />

         <div className="max-w-6xl mx-auto relative z-10">

            <PageHeader
               backHref="/projects"
               category={{
                  label: headerData.category,
                  icon: <Wheat className="w-5 h-5" />,
                  color: "text-amber-600"
               }}
               title={headerData.title}
               tagline={headerData.tagline}
               actions={{
                  source: resources.source ? { href: resources.source } : undefined,
                  pdf: resources.pdf ? { href: resources.pdf } : undefined,
               }}
               isActionLoading={isDataLoading}
            />

            {/* DASHBOARD - FIX 1: Ensure vertical stacking on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-24">

               {/* --- LEFT: CONTROLS (lg:col-span-4) --- */}
               <div className="lg:col-span-4 space-y-6 md:space-y-8">
                  {/* FIX 2: Reduced padding on controls container for mobile */}
                  <div className="bg-ink/5 p-4 md:p-8 rounded-xl border border-ink/5">
                     <h3 className="font-serif text-xl text-ink mb-6 md:mb-8 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-ink/40" /> {t('dairy.controls.title') || "Farm Inputs"}
                     </h3>

                     {/* COWS (All inputs now use smaller bottom margin on mobile) */}
                     <div className="mb-6">
                        <div className="flex justify-between text-xs font-mono mb-2 text-ink/60">
                           <span className="flex items-center gap-2"><Milk className="w-3 h-3" /> {t('dairy.input.cows') || "Herd Size"}</span>
                           <span>{inputs.cows} {t('dairy.unit.head') || "Head"}</span>
                        </div>
                        <input
                           type="range" min="10" max="500" step="10" value={inputs.cows}
                           onChange={(e) => setInputs({ ...inputs, cows: Number(e.target.value) })}
                           className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                     </div>

                     {/* FEED */}
                     <div className="mb-6">
                        <div className="flex justify-between text-xs font-mono mb-2 text-ink/60">
                           <span className="flex items-center gap-2"><Wheat className="w-3 h-3" /> {t('dairy.input.feed') || "Feed"}</span>
                           <span>{inputs.feed} kg</span>
                        </div>
                        <input
                           type="range" min="1000" max="50000" step="500" value={inputs.feed}
                           onChange={(e) => setInputs({ ...inputs, feed: Number(e.target.value) })}
                           className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                     </div>

                     {/* LAND */}
                     <div className="mb-6">
                        <div className="flex justify-between text-xs font-mono mb-2 text-ink/60">
                           <span className="flex items-center gap-2"><Tractor className="w-3 h-3" /> {t('dairy.input.land') || "Land Area"}</span>
                           <span>{inputs.land} Ha</span>
                        </div>
                        <input
                           type="range" min="5" max="100" step="1" value={inputs.land}
                           onChange={(e) => setInputs({ ...inputs, land: Number(e.target.value) })}
                           className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                     </div>

                     {/* LABOR */}
                     <div className="mb-2">
                        <div className="flex justify-between text-xs font-mono mb-2 text-ink/60">
                           <span className="flex items-center gap-2"><Users className="w-3 h-3" /> {t('dairy.input.labor') || "Labor"}</span>
                           <span>{inputs.labor} Hrs</span>
                        </div>
                        <input
                           type="range" min="500" max="10000" step="100" value={inputs.labor}
                           onChange={(e) => setInputs({ ...inputs, labor: Number(e.target.value) })}
                           className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                     </div>
                  </div>

                  {/* RETURNS BADGE - Reduced padding on mobile */}
                  <div className="p-4 md:p-6 rounded-xl border border-amber-600/20 bg-amber-50 dark:bg-amber-900/10">
                     <h4 className="text-amber-700 dark:text-amber-500 font-bold mb-2 flex items-center gap-2 text-sm font-mono uppercase tracking-wider">
                        <TrendingUp className="w-4 h-4" /> {t('dairy.returns') || "Increasing Returns"}
                     </h4>
                     {/* FIX: Changed font-serif to font-sans */}
                     <p className="text-xs text-ink/80 leading-relaxed font-serif">
                        {t('dairy.returns.desc') || "Sum of Elasticities = 1.11. Scaling up operations yields exponential gains."}
                     </p>
                  </div>
               </div>

               {/* --- RIGHT: VISUALS (lg:col-span-8) --- */}
               <div className="lg:col-span-8 space-y-6 md:space-y-8">

                  {/* BIG NUMBER - Reduced padding/text size on mobile */}
                  <div className="bg-card border border-ink/10 rounded-2xl p-6 md:p-10 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 rtl:left-0 rtl:right-auto">
                        <Milk className="w-20 h-20 md:w-24 md:h-24 text-ink" />
                     </div>
                     <span className="font-mono text-xs text-ink/40 uppercase tracking-widest mb-4">
                        {t('dairy.monitor.label') || "Predicted Annual Production"}
                     </span>
                     <div className="flex items-baseline gap-4">
                        {/* FIX 3: Reduced text size for better fit on small screens */}
                        <span className="font-serif text-5xl md:text-8xl text-ink tracking-tighter">
                           {(output / 1000).toFixed(1)}k
                        </span>
                        <span className="text-lg md:text-xl text-ink/40 font-serif italic">Liters</span>
                     </div>
                  </div>

                  {/* CHART - Reduced padding and height on mobile */}
                  <div className="bg-paper border border-ink/10 rounded-2xl p-4 md:p-6 h-[300px] md:h-[400px]">
                     <div className="flex justify-between mb-4 md:mb-6">
                        <h3 className="font-serif text-base md:text-lg text-ink flex items-center gap-2">
                           <BarChart2 className="w-4 h-4 text-ink/40" /> {t('dairy.chart.title') || "Marginal Product of Herd Size"}
                        </h3>
                     </div>
                     <div className="h-full w-full" dir="ltr">
                        <ResponsiveContainer>
                           <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                 <linearGradient id="colorMilk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dim)" vertical={false} />
                              <XAxis
                                 dataKey="cows"
                                 tick={{ fontSize: 9, fill: 'var(--color-ink)', opacity: 0.5 }} // Smaller ticks
                                 axisLine={false} tickLine={false}
                                 label={{ value: t('dairy.unit.head') || 'Herd Size', position: 'insideBottom', offset: -5, fontSize: 9, fill: 'var(--color-ink)', opacity: 0.5 }} // Smaller label
                              />
                              <YAxis
                                 tick={{ fontSize: 9, fill: 'var(--color-ink)', opacity: 0.5 }} // Smaller ticks
                                 axisLine={false} tickLine={false}
                                 tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                              />
                              <Tooltip
                                 contentStyle={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-ink)', borderRadius: '8px', fontSize: '12px' }}
                                 formatter={(val: number) => [`${(val / 1000).toFixed(2)}k L`, t('dairy.monitor.label') || "Output"]}
                                 labelFormatter={(label) => `${label} ${t('dairy.unit.head') || "Cows"}`}
                              />
                              <Area type="monotone" dataKey="milk" stroke="#D97706" strokeWidth={2} fill="url(#colorMilk)" />
                              <ReferenceDot x={inputs.cows} y={output} r={6} fill="var(--color-ink)" stroke="var(--color-paper)" strokeWidth={2} />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  {/* MATH CARD - Reduced padding and better overflow handling */}
                  <div className="bg-ink/5 p-4 md:p-6 rounded-xl border border-ink/5">
                     <h4 className="font-bold text-ink mb-3 font-serif text-base md:text-lg flex items-center gap-2">
                        <Info className="w-4 h-4 text-ink/40" /> {t('dairy.math.title') || "The Fixed Effects Model"}
                     </h4>
                     {/* Ensure the Latex container handles horizontal overflow */}
                     <div className="text-sm text-ink/80 leading-relaxed font-serif overflow-x-auto pb-2" dir="ltr">
                        <Latex>
                           {`$$ \\ln(Y_{it}) = ${coeffs.intercept.toFixed(2)} + ${coeffs.cows.toFixed(2)} \\ln(C) + ${coeffs.feed.toFixed(2)} \\ln(F) + ${coeffs.land.toFixed(2)} \\ln(L) + \\epsilon_{it} $$`}
                        </Latex>
                     </div>
                  </div>

               </div>
            </div>

            {/* --- ADVANCED MODELING --- */}
            <section className="mb-24 pt-8 md:pt-12 border-t border-ink/10">
               <div className="flex items-center gap-3 mb-6 md:mb-8">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink/60">
                     <Database className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl text-ink">{t('dairy.advanced.title') || "Advanced Architectures"}</h2>
               </div>

               {/* Ensure horizontal flow on desktop but stack on mobile (md:grid-cols-2) */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch" dir="ltr">
                  <div className="h-full"><InteractionHeatmap /></div>
                  <div className="h-full"><ModelComparison /></div>
               </div>
            </section>

         </div>
      </main>
   );
}