"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Activity, Scale, HeartPulse, Brain, Calculator, FileText, Info, Target, BarChart2 } from "lucide-react"; 
import Latex from "react-latex-next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine } from "recharts";
import { jsPDF } from "jspdf"; 
import RiskRadar from "@/components/projects/bp-regression/RiskRadar";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/layout/PageHeader";
import { supabase } from '@/lib/supabase';

// --- TYPES ---
interface HeaderData {
  title: string;
  tagline: string;
  category: string;
}

interface ModelCoeffs {
  intercept: number;
  age: number;
  bsa: number;
  dur: number;
  pulse: number;
  stress: number;
}

interface AxisConfig {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

// --- DEFAULTS ---
const DEFAULT_COEFFS: ModelCoeffs = {
  intercept: 3.7897, age: 0.0048, bsa: 0.2133, dur: 0.0006, pulse: 0.0042, stress: -0.0002
};

const DEFAULT_AXES: Record<string, AxisConfig> = {
  age: { label: "Age", unit: "yrs", min: 20, max: 80, step: 5 },
  bsa: { label: "BSA", unit: "m²", min: 1.5, max: 2.5, step: 0.1 },
  pulse: { label: "Pulse", unit: "bpm", min: 50, max: 120, step: 5 },
  stress: { label: "Stress", unit: "idx", min: 0, max: 100, step: 10 },
  dur: { label: "DUR", unit: "mo", min: 0, max: 20, step: 2 },
};

// --- PURE PREDICTION FUNCTION ---
const predictBP = (inputs: any, coeffs: ModelCoeffs) => {
  const logBP = 
    coeffs.intercept +
    (coeffs.age * inputs.age) +
    (coeffs.bsa * inputs.bsa) +
    (coeffs.dur * inputs.dur) +
    (coeffs.pulse * inputs.pulse) +
    (coeffs.stress * inputs.stress);
  return Math.exp(logBP);
};

export default function VitalPredictor() {
  const { t, dir } = useLanguage();
  
  // --- STATE ---
  const [headerData, setHeaderData] = useState<HeaderData>({
      title: "The Vital Predictor",
      tagline: "Loading model...",
      category: "Biostatistics"
  });
  const [resources, setResources] = useState<{ source?: string, pdf?: string }>({});
  const [coeffs, setCoeffs] = useState<ModelCoeffs>(DEFAULT_COEFFS);
  const [axisConfig, setAxisConfig] = useState<Record<string, AxisConfig>>(DEFAULT_AXES);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // --- TOOL STATE ---
  const [inputs, setInputs] = useState({ age: 50, bsa: 2.00, dur: 6.0, pulse: 70, stress: 50 });
  const [prediction, setPrediction] = useState(0);
  const [activeAxis, setActiveAxis] = useState("bsa");

  useEffect(() => {
    setPrediction(predictBP(inputs, coeffs));
  }, [inputs, coeffs]);

  // --- FETCH DATA ---
  const fetchPageData = useCallback(async () => {
    setIsDataLoading(true);
    const { data: page } = await supabase
        .from('pages')
        .select('title, tagline, category_label, meta')
        .eq('slug', 'projects/bp-regression')
        .single();

    if (page) {
       setHeaderData({
           title: page.title,
           tagline: page.tagline || "", 
           category: page.category_label || "Regression Model"
       });

       if (page.meta) {
           setResources({
               source: page.meta.source_url,
               pdf: page.meta.pdf_url
           });
           if (page.meta.model_config) {
               if (page.meta.model_config.coeffs) setCoeffs(page.meta.model_config.coeffs);
               if (page.meta.model_config.axes) setAxisConfig(page.meta.model_config.axes);
           }
       }
    }
    setIsDataLoading(false);
  }, []);
  
  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  // --- ACTIONS ---
  const optimizeBSA = () => {
    const targetLogBP = Math.log(119);
    const otherTerms = 
      coeffs.intercept + 
      (coeffs.age * inputs.age) + 
      (coeffs.dur * inputs.dur) + 
      (coeffs.pulse * inputs.pulse) + 
      (coeffs.stress * inputs.stress);
      
    const requiredBSA = (targetLogBP - otherTerms) / coeffs.bsa;
    const minBSA = axisConfig.bsa?.min || 1.5;
    const maxBSA = axisConfig.bsa?.max || 2.5;
    const clampedBSA = Math.min(maxBSA, Math.max(minBSA, requiredBSA));
    
    setInputs(prev => ({ ...prev, bsa: Number(clampedBSA.toFixed(2)) }));
  };

  const generateReport = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    doc.text("Clinical Prediction Report", 20, 20);
    doc.text(`Predicted Systolic BP: ${prediction.toFixed(1)} mmHg`, 20, 40);
    doc.save("clinical_report.pdf");
  };

  // --- CHART ---
  const chartData = useMemo(() => {
    const config = axisConfig[activeAxis];
    if (!config) return [];
    const data = [];
    for (let x = config.min; x <= config.max + (config.step/10); x += config.step) {
      const tempInputs = { ...inputs, [activeAxis]: x };
      data.push({
        xValue: Number(x.toFixed(2)),
        bp: predictBP(tempInputs, coeffs)
      });
    }
    return data;
  }, [inputs, activeAxis, axisConfig, coeffs]);

  const status = prediction < 110 ? { label: t('bp.status.normal') || "Normal", color: "#059669", bg: "bg-emerald-500/10", text: "text-emerald-600" }
               : prediction < 120 ? { label: t('bp.status.elevated') || "Elevated", color: "#D97706", bg: "bg-amber-500/10", text: "text-amber-600" }
               : { label: t('bp.status.high') || "Hypertensive", color: "#DC2626", bg: "bg-red-500/10", text: "text-red-600" };

  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-20 px-6 bg-paper font-sans relative overflow-hidden transition-colors duration-700 ease-in-out" dir={dir}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <PageHeader
          backHref="/projects"
          category={{ label: headerData.category, icon: <Activity className="w-5 h-5" />, color: "text-accent" }}
          title={headerData.title}
          tagline={headerData.tagline}
          actions={{
            source: resources.source ? { href: resources.source } : undefined,
            pdf: { href: "#", label: "Generate Report", onClick: generateReport }
          }}
          isActionLoading={isDataLoading} 
        />

        {/* --- GRID: TOOLS & CHARTS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-16">
          
          {/* LEFT: INPUTS (3 Cols) */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-ink/5 p-6 rounded-xl border border-ink/5">
               <h3 className="font-serif text-xl text-ink mb-6 flex items-center gap-2">
                 <Calculator className="w-5 h-5 text-ink/40"/> {t('bp.controls.title') || "Inputs"}
               </h3>
               <div className="space-y-6">
                 {[
                   { key: "age", icon: undefined },
                   { key: "bsa", icon: Scale },
                   { key: "pulse", icon: HeartPulse },
                   { key: "stress", icon: Brain },
                   { key: "dur", icon: undefined }
                 ].map((item) => {
                   const config = axisConfig[item.key];
                   if (!config) return null;
                   return (
                     <div key={item.key}>
                       <div className="flex justify-between text-xs font-mono mb-2 text-ink/60">
                         <span className="flex items-center gap-2">
                           {item.icon && <item.icon className="w-3 h-3"/>} {config.label}
                         </span>
                         {/* @ts-ignore */}
                         <span>{inputs[item.key]}</span>
                       </div>
                       <input 
                         type="range" min={config.min} max={config.max} step={config.step} 
                         // @ts-ignore
                         value={inputs[item.key]}
                         // @ts-ignore
                         onChange={(e) => setInputs({...inputs, [item.key]: Number(e.target.value)})}
                         className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-accent"
                       />
                     </div>
                   );
                 })}
               </div>
               <button onClick={optimizeBSA} className="w-full mt-8 py-3 bg-paper border border-ink/10 rounded-lg flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest hover:bg-accent hover:text-white hover:border-accent transition-all group">
                 <Target className="w-4 h-4 group-hover:animate-ping" />
                 {t('bp.btn.optimize') || "Target Normal (<120)"}
               </button>
            </div>
          </div>

          {/* CENTER: MONITOR & CHART (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-8">
             <div className="bg-card border border-ink/10 rounded-2xl p-8 flex flex-col justify-center items-center relative overflow-hidden min-h-[300px]">
                <div className={`absolute top-0 right-0 p-6 ${status.text}`}><Activity className="w-10 h-10 animate-pulse opacity-50" /></div>
                <span className="font-mono text-xs text-ink/40 uppercase tracking-widest mb-8">{t('bp.monitor.label') || "Predicted Systolic Pressure"}</span>
                <div className="flex items-baseline gap-2">
                   <span className="font-serif text-8xl md:text-9xl text-ink tracking-tighter leading-none">{prediction.toFixed(0)}</span>
                   <span className="text-2xl text-ink/40 font-serif italic">mmHg</span>
                </div>
                <div className={`mt-8 px-6 py-2 rounded-full border border-ink/5 ${status.bg}`}>
                   <span className={`text-sm font-bold uppercase tracking-widest ${status.text}`}>{status.label} {t('bp.monitor.condition') || "Condition"}</span>
                </div>
             </div>

             <div className="bg-paper border border-ink/10 rounded-2xl p-6 flex flex-col h-[350px]">
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                  <span className="font-mono text-xs text-ink/40 uppercase tracking-widest flex items-center gap-2">
                    <BarChart2 className="w-3 h-3"/> {t('bp.chart.title') || "Sensitivity Analysis"}
                  </span>
                  <div className="flex gap-1 bg-ink/5 p-1 rounded-lg overflow-x-auto max-w-full">
                    {Object.entries(axisConfig).map(([key, config]) => (
                      <button key={key} onClick={() => setActiveAxis(key)} className={`px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${activeAxis === key ? "bg-paper text-ink shadow-sm font-bold" : "text-ink/40 hover:text-ink/70"}`}>
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dim)" />
                      <XAxis dataKey="xValue" tick={{fontSize: 10, fill: 'var(--color-ink)', opacity: 0.5}} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                      <YAxis domain={['auto', 'auto']} tick={{fontSize: 10, fill: 'var(--color-ink)', opacity: 0.5}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-ink)', borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: 'var(--color-ink)' }} formatter={(val: number) => val.toFixed(1) + " mmHg"} />
                      <Line type="monotone" dataKey="bp" stroke="var(--color-accent)" strokeWidth={3} dot={false} isAnimationActive={false} />
                      <ReferenceDot 
                        // @ts-ignore
                        x={inputs[activeAxis]} y={prediction} r={6} fill="var(--color-ink)" stroke="var(--color-paper)" strokeWidth={2} 
                      />
                      <ReferenceLine y={120} stroke="red" strokeDasharray="3 3" opacity={0.3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* RIGHT: RADAR & INSIGHTS (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
             <div dir="ltr"><RiskRadar inputs={inputs} /></div>

             <div className="bg-ink/5 border border-ink/10 p-6 rounded-xl">
               <h4 className="font-bold text-ink mb-4 font-serif text-lg flex items-center gap-2">
                 <Info className="w-4 h-4 text-accent" /> {t('bp.insight.title') || "Key Insights"}
               </h4>
               <ul className="text-sm text-ink/80 space-y-4 font-serif leading-relaxed">
                 <li className="border-l-2 border-ink/10 pl-4 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-4">
                   <strong className="block text-ink mb-1 font-bold text-base">{t('bp.insight.bsa') || "BSA Dominance"}</strong>
                   {t('bp.insight.bsa_desc') || "Body Surface Area is the strongest predictor. A 1-unit increase roughly correlates to a ~21% rise in BP."}
                 </li>
                 <li className="border-l-2 border-ink/10 pl-4 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-4">
                   <strong className="block text-ink mb-1 font-bold text-base">{t('bp.insight.stress') || "Stress Paradox"}</strong>
                   {t('bp.insight.stress_desc') || "Stress showed a weak negative coefficient, suggesting potential selection bias."}
                 </li>
               </ul>
             </div>
          </div>
        </div>

        {/* --- BOTTOM: MODEL LOGIC (Full Width) --- */}
        <div className="w-full">
           <div className="bg-ink/5 border border-ink/10 p-8 md:p-12 rounded-2xl font-serif">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="font-bold text-ink text-3xl flex items-center gap-3">
                   <FileText className="w-8 h-8 text-ink/50" /> {t('bp.math.title') || "The Algorithm"}
                 </h4>
                 <span className="text-sm font-mono text-ink/40 bg-paper px-3 py-1.5 rounded border border-ink/10 uppercase tracking-widest">Log-Linear</span>
              </div>
              
              {/* Plain English Explanation */}
              <div className="text-xl text-ink/80 mb-10 max-w-none leading-relaxed">
                <p className="mb-4">
                  <strong>How it works:</strong> The model doesn't calculate blood pressure directly. Instead, it calculates a <em>baseline score</em> (Intercept) and then adds specific "penalties" for your Age, Body Surface Area (BSA), and Pulse.
                </p>
                <p>
                  This total score represents the <em>natural logarithm</em> of your blood pressure. We then apply an exponential function to convert it back into meaningful <code>mmHg</code> units. Body Size (BSA) has the heaviest weight, making it the strongest driver of risk.
                </p>
              </div>

              {/* Wide Single-Line Equation */}
              <div className="text-2xl md:text-3xl text-ink leading-relaxed whitespace-nowrap overflow-x-auto pb-4 border-t border-ink/10 pt-10" dir="ltr">
                <Latex>
                  {`$$ \\ln(Y) = ${coeffs.intercept.toFixed(4)} + ${coeffs.age.toFixed(4)}(\\text{Age}) + ${coeffs.bsa.toFixed(4)}(\\text{BSA}) + ${coeffs.pulse.toFixed(4)}(\\text{Pulse}) + ${coeffs.dur.toFixed(4)}(\\text{Dur}) ${coeffs.stress < 0 ? '-' : '+'} ${Math.abs(coeffs.stress).toFixed(4)}(\\text{Str}) $$`}
                </Latex>
              </div>
           </div>
        </div>

      </div>
    </main>
  );
}