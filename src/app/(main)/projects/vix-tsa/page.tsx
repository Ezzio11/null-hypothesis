// VixProject.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, FileText, Info, Calendar } from "lucide-react";
import Latex from "react-latex-next";
import { useLanguage } from "@/contexts/LanguageContext";
import PageHeader from "@/components/layout/PageHeader";

// Components
import VixChart from "@/components/projects/vix-tsa/VixChart";
import ArimaControls from "@/components/projects/vix-tsa/ArimaControls";

// --- Import Supabase and Types ---
import { supabase } from '@/lib/supabase';
// Assuming ProjectResource interface is available in lib/types.ts
interface ProjectResource {
  id: string;
  resource_type: string;
  url: string;
}
// ---------------------------------


export default function VixProject() {
  const { t, dir } = useLanguage();

  // --- NEW STATE FOR RESOURCES ---
  const [resources, setResources] = useState<{ source?: string, pdf?: string, demo?: string }>({});
  const [isResourceLoading, setIsResourceLoading] = useState(true);

  // STATE: Lifted here so controls affect chart
  const [p, setP] = useState(1); // Default to Optimal AR(1)
  const [d, setD] = useState(0);
  const [q, setQ] = useState(0);

  // Force Dark Mode for this financial dashboard aesthetic
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  // --- Resource Fetching ---
  const fetchResources = useCallback(async () => {
    setIsResourceLoading(true);
    const PROJECT_ID = 'vix-tsa';

    try {
      const { data, error } = await supabase
        .from('project_resources')
        .select('resource_type, url')
        .eq('project_id', PROJECT_ID)
        .eq('is_active', true);

      if (error) throw error;

      const newResources: { source?: string, pdf?: string, demo?: string } = {};

      (data as ProjectResource[]).forEach(resource => {
        if (resource.resource_type === 'source_code') {
          newResources.source = resource.url;
        } else if (resource.resource_type === 'documentation' || resource.resource_type === 'pdf') {
          newResources.pdf = resource.url;
        } else if (resource.resource_type === 'demo') {
          newResources.demo = resource.url;
        }
      });

      setResources(newResources);

    } catch (err) {
      console.error('Error fetching project resources:', err);
    } finally {
      setIsResourceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);


  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-20 px-6 bg-[#050505] font-sans text-gray-300 selection:bg-emerald-900 selection:text-white" dir={dir}>

      <div className="max-w-7xl mx-auto">

        <PageHeader
          backHref="/projects"
          category={{
            label: t('project.vix.category') || "QUANTITATIVE FINANCE",
            icon: <TrendingUp className="w-5 h-5" />,
            color: "text-emerald-500"
          }}
          title={t('project.vix.title') || "The Volatility Engine."}
          actions={{
            // --- DYNAMIC ACTIONS MAPPED FROM DB RESOURCES ---
            source: resources.source ? {
              href: resources.source
            } : undefined,
            pdf: resources.pdf ? {
              href: resources.pdf,
            } : undefined,
            // --- END DYNAMIC ACTIONS ---
          }}
          isActionLoading={isResourceLoading}
        />

        {/* Additional metadata row for VIX page */}
        <div className="flex gap-4 text-xs font-mono text-gray-500 mb-8 -mt-8">
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> 1990 - 2034</span>
          <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Forecast Model</span>
        </div>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

          {/* CHART AREA */}
          <div className="lg:col-span-8 h-[400px] md:h-[500px]">
            <VixChart p={p} d={d} q={q} />
          </div>

          {/* CONTROLS AREA */}
          <div className="lg:col-span-4">
            <ArimaControls
              p={p} setP={setP}
              d={d} setD={setD}
              q={q} setQ={setQ}
            />
          </div>
        </div>

        {/* INSIGHTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Insight 1: Mean Reversion */}
          <div className="bg-[#111] border border-[#333] p-6 rounded-xl hover:border-emerald-500/30 transition-colors">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
              <Info className="w-4 h-4 text-emerald-500" /> {t('vix.insight1.title') || "Mean Reversion"}
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('vix.insight1.body') || "Unlike stock prices, Volatility (VIX) does not drift indefinitely. It spikes during panic (2008, 2020) and mathematically reverts to a mean of ~19.3."}
            </p>
          </div>

          {/* Insight 2: Cubic Trap */}
          <div className="bg-[#111] border border-[#333] p-6 rounded-xl hover:border-emerald-500/30 transition-colors">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
              <FileText className="w-4 h-4 text-emerald-500" /> {t('vix.insight2.title') || "The Cubic Trap"}
            </h4>
            <div className="text-sm text-gray-400 leading-relaxed" dir="ltr">
              {t('vix.insight2.body') || "We fitted a Cubic Trend:"}
              <span className="block my-2 text-emerald-400/80">
                <Latex>$T_t = \beta_0 + \beta_1 t + \beta_2 t^2 + \beta_3 t^3$</Latex>
              </span>
              {t('vix.insight2.warn') || "While it fits history (R2=0.42), it is dangerous for long-term forecasting."}
            </div>
          </div>

          {/* Insight 3: Forecast */}
          <div className="bg-[#111] border border-[#333] p-6 rounded-xl hover:border-emerald-500/30 transition-colors">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> {t('vix.insight3.title') || "Forecast 2034"}
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('vix.insight3.body') || "Using the cubic model, we project VIX to rise to 28.65 by 2034. This implies a structural increase in global market uncertainty over the next decade."}
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}