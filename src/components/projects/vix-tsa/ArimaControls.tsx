"use client";

import { Settings, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface ArimaControlsProps {
  p: number; setP: (v: number) => void;
  d: number; setD: (v: number) => void;
  q: number; setQ: (v: number) => void;
}

export default function ArimaControls({ p, setP, d, setD, q, setQ }: ArimaControlsProps) {
  const { t } = useLanguage();
  
  // Check for optimal model ARIMA(1,0,0)
  const isOptimal = p === 1 && d === 0 && q === 0;

  return (
    <div className="bg-[#111] border border-[#333] rounded-xl p-6 h-full flex flex-col">
       <div className="flex items-center gap-3 mb-6 border-b border-[#333] pb-4">
          <Settings className="w-5 h-5 text-white/40" />
          <h3 className="text-white font-mono text-lg">{t('vix.controls.title') || "Model Parameters"}</h3>
       </div>

       <div className="space-y-8 flex-1">
          {/* P Slider */}
          <div>
             <div className="flex justify-between text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">
                <span>{t('vix.control.p') || "Auto-Regressive (p)"}</span>
                <span className="text-white">{p}</span>
             </div>
             <input 
               type="range" min="0" max="3" value={p} onChange={(e) => setP(Number(e.target.value))}
               className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-emerald-500"
             />
             <p className="text-[10px] text-gray-600 mt-2">{t('vix.control.p_desc') || "Controls the 'memory' of the model. High P = Momentum."}</p>
          </div>

          {/* D Slider */}
          <div>
             <div className="flex justify-between text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">
                <span>{t('vix.control.d') || "Integrated (d)"}</span>
                <span className="text-white">{d}</span>
             </div>
             <input 
               type="range" min="0" max="2" value={d} onChange={(e) => setD(Number(e.target.value))}
               className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-500"
             />
             <p className="text-[10px] text-gray-600 mt-2">{t('vix.control.d_desc') || "Differencing order. Removes trends (Stationarity)."}</p>
          </div>

          {/* Q Slider */}
          <div>
             <div className="flex justify-between text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">
                <span>{t('vix.control.q') || "Moving Average (q)"}</span>
                <span className="text-white">{q}</span>
             </div>
             <input 
               type="range" min="0" max="3" value={q} onChange={(e) => setQ(Number(e.target.value))}
               className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-purple-500"
             />
             <p className="text-[10px] text-gray-600 mt-2">{t('vix.control.q_desc') || "Smoothing factor for error shocks."}</p>
          </div>
       </div>

       {/* Result Display */}
       <motion.div 
         layout
         className={`mt-8 p-4 rounded-lg border ${isOptimal ? "bg-emerald-900/20 border-emerald-500/50" : "bg-[#0a0a0a] border-[#333]"}`}
       >
          {isOptimal ? (
             <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                   <div className="text-emerald-500 font-bold font-mono text-sm">{t('vix.status.optimal') || "OPTIMAL MODEL FOUND"}</div>
                   <p className="text-emerald-500/60 text-xs mt-1 leading-relaxed font-mono">
                      {t('vix.status.optimal_desc') || "ARIMA(1,0,0) minimizes AIC. The series is stationary."}
                   </p>
                </div>
             </div>
          ) : (
             <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                   <div className="text-gray-500 font-bold font-mono text-sm">{t('vix.status.suboptimal') || "SUB-OPTIMAL FIT"}</div>
                   <p className="text-gray-600 text-xs mt-1 leading-relaxed font-mono">
                      {t('vix.status.suboptimal_desc') || "Adjust parameters to minimize Information Criterion (AIC/BIC)."}
                   </p>
                </div>
             </div>
          )}
       </motion.div>
    </div>
  );
}  