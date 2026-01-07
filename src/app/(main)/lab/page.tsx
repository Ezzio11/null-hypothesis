import { FlaskConical } from "lucide-react";
import LabClient from "@/components/lab/LabClient";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion"; // Schematic imports needed for Client wrapper logic? No, moved to client.

// Enable revalidation for fresh content
export const revalidate = 60;

// Legacy IDs that exist as hardcoded maps in the Client
const LEGACY_IDS = ["inference", "estimation", "alpha", "beta", "sampling"];

export default async function LabIndex() {

  // Fetch Dynamic Experiments
  const { data: dynamicExperiments } = await supabase
    .from('content_nodes')
    .select('*')
    .eq('type', 'lab_experiment')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 bg-paper font-serif relative">

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <header className="mb-16 border-b border-ink/10 pb-12">
          <span className="font-mono text-xs text-accent uppercase tracking-widest mb-4 flex items-center gap-2">
            <FlaskConical className="w-4 h-4" /> R&D Department
          </span>
          <h1 className="font-serif text-6xl md:text-8xl text-ink mb-8 leading-[0.9] tracking-tight">
            The Laboratory.
          </h1>
          <p className="text-xl text-ink/70 max-w-2xl leading-relaxed latex-prose">
            Instruments of intuition. Where abstract theory becomes observable reality.
          </p>
        </header>

        <LabClient
          dynamicExperiments={dynamicExperiments || []}
          legacyIds={LEGACY_IDS}
          legacyAssets={{}} // We will define the registry inside LabClient to avoid serialization pain
        />

      </div>
    </main>
  );
}