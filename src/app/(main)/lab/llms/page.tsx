"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Layers, Bookmark, Scale, Terminal, ArrowLeft, Activity, Brain, AlertTriangle } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Latex from "react-latex-next";
import { useLanguage } from "@/contexts/LanguageContext";

// Components
import PythonPlayground from "@/components/lab/PythonPlayground";
import PageHeader from "@/components/layout/PageHeader";

import { supabase } from '@/lib/supabase';

// --- TYPE DEFINITIONS ---
interface ProjectResource {
  id: string;
  resource_type: string;
  url: string;
  label_en: string | null;
}

// --- PYTHON SIMULATION SCRIPT ---
// Simulates the Good-Turing Estimator and Missing Mass problem described in the paper [cite: 279, 667]
const HALLUCINATION_CODE = `import numpy as np
from collections import Counter

def simulate_hallucination_boundary():
    # Configuration
    N_train = 5000   # Size of pre-training corpus
    vocab_size = 2000 # Total possible facts in the universe
    alpha = 1.2      # Zipf parameter (Language is heavy-tailed)
    
    print(f"--- 1. PRE-TRAINING (DENSITY ESTIMATION) ---")
    print(f"Training on {N_train} samples from Zipfian distribution...")
    
    # 1. Generate "True" Language Distribution (Zipfian)
    # Real language data is sparse and heavy-tailed [cite: 37]
    np.random.seed(42)
    true_data = np.random.zipf(alpha, N_train)
    
    # 2. Train the Model (Count Frequencies)
    counts = Counter(true_data)
    
    # 3. Calculate Singleton Rate (sr)
    # Facts seen exactly once in training [cite: 275]
    singletons = [k for k, v in counts.items() if v == 1]
    N1 = len(singletons)
    sr = N1 / N_train
    
    print(f"Total Unique Facts Seen: {len(counts)}")
    print(f"Singletons (Seen once):  {N1}")
    print(f"Singleton Rate (sr):     {sr:.4f}")
    
    print(f"\\n--- 2. THE HALLUCINATION BOUNDARY ---")
    print(f"Theory: Error Rate >= Singleton Rate (approx)")
    print(f"The model cannot be calibrated on singletons without guessing.")
    
    # 4. Evaluate on Test Set (The "Missing Mass")
    # What is the probability of encountering a fact we haven't mastered?
    N_test = 5000
    test_data = np.random.zipf(alpha, N_test)
    
    # "Hallucinations" occur when model is forced to answer about 
    # unseen or singleton facts in a binary exam setting [cite: 98]
    unseen_errors = sum(1 for x in test_data if x not in counts or counts[x] == 1)
    error_rate = unseen_errors / N_test
    
    print(f"\\n--- 3. EMPIRICAL RESULTS (GOOD-TURING) ---")
    print(f"Actual Missing Mass/Error: {error_rate:.4f}")
    print(f"Theory Prediction (sr):    {sr:.4f}")
    print(f"Difference:                {abs(error_rate - sr):.4f}")
    
    if abs(error_rate - sr) < 0.05:
        print("\\n>> SUCCESS: Singleton Rate predicts Hallucination floor.")

simulate_hallucination_boundary()
`;

// --- COMPONENT: CALIBRATION CHAMBER (Flashlight Effect) ---
// Visualizes Epistemic Uncertainty and the "Bluffing" nature of models [cite: 8, 98]
function CalibrationChamber() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div className="w-full my-12">
      <div
        className="relative bg-[#0a0a0a] rounded-xl overflow-hidden cursor-crosshair border border-ink/10 aspect-[16/9] md:aspect-[21/9] flex items-center justify-center group"
        onMouseMove={handleMouseMove}
      >
        {/* BACKGROUND LAYER (The "Model's Bluff") */}
        <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12 opacity-30 select-none pointer-events-none transition-opacity duration-500 group-hover:opacity-10">
          <div className="text-center font-serif text-xl md:text-3xl leading-relaxed text-gray-500 blur-[1px]">
            "The model is confident. The distribution is smooth.<br />
            The answers are plausible. Rigor is optional.<br />
            Complexity is handled. The loss is minimized."
          </div>
        </div>

        {/* REVEAL LAYER (The "Statistical Reality") */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center p-8 md:p-12 pointer-events-none"
          style={{
            maskImage: useMotionTemplate`radial-gradient(250px circle at ${mouseX}px ${mouseY}px, black 100%, transparent 0%)`,
            WebkitMaskImage: useMotionTemplate`radial-gradient(250px circle at ${mouseX}px ${mouseY}px, black 100%, transparent 0%)`,
          }}
        >
          <div className="text-center font-serif text-xl md:text-3xl leading-relaxed text-[#Eae7dc] drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
            "The model is <span className="text-red-400">uncalibrated</span>. The distribution is <span className="text-accent">sparse</span>.<br />
            The answers are <span className="text-red-400">hallucinations</span>. Rigor is <span className="text-accent">missing</span>.<br />
            Complexity is <span className="text-red-400">failure</span>. The loss is <span className="text-accent">blind</span>."
          </div>
        </motion.div>

        {/* DATA POINTS (Visualizing "Singletons") */}
        <motion.div
          className="absolute inset-0 z-30 pointer-events-none"
          style={{ x: mouseX, y: mouseY, left: "-50%", top: "-50%" }}
        >
          <div className="w-[500px] h-[500px] border border-accent/20 rounded-full opacity-20 animate-spin-slow" />
        </motion.div>

        {/* META LABEL */}
        <div className="absolute bottom-4 right-4 z-40">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 border border-white/10 px-2 py-1 rounded">
            Ref: arXiv:2509.04664v1 // Singleton Rate
          </span>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function HallucinationLab() {
  const { t, dir } = useLanguage();

  // --- STATE FOR RESOURCES ---
  const [resources, setResources] = useState<{ source?: string, pdf?: string }>({});
  const [isResourceLoading, setIsResourceLoading] = useState(true);

  // --- Resource Fetching ---
  const fetchResources = useCallback(async () => {
    setIsResourceLoading(true);
    const PROJECT_ID = 'hallucination-lab';

    try {
      const { data, error } = await supabase
        .from('project_resources')
        .select('resource_type, url, label_en')
        .eq('project_id', PROJECT_ID)
        .eq('is_active', true);

      if (error) throw error;

      const newResources: { source?: string, pdf?: string } = {};

      (data as ProjectResource[]).forEach(resource => {
        if (resource.resource_type === 'source_code') {
          newResources.source = resource.url;
        } else if (resource.resource_type === 'pdf') {
          newResources.pdf = resource.url;
        }
      });

      setResources(newResources);

    } catch (err) {
      // Fallback or explicit null handling
      setResources({
        source: "https://github.com/Ezzio11", // Default to profile if missing
        pdf: "https://arxiv.org/pdf/2509.04664" // Direct link to paper [cite: 1]
      });
    } finally {
      setIsResourceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-20 px-6 bg-paper font-serif relative overflow-hidden" dir={dir}>

      {/* Background Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* HEADER */}
        <PageHeader
          backHref="/lab"
          backLabel={t('nav.back_to_lab') || "Laboratory Index"}
          category={{
            label: t('exp.hallucination.category') || "Statistical Learning Theory",
            icon: <AlertTriangle className="w-4 h-4" />,
            color: "text-red-500"
          }}
          title={t('exp.hallucination.title') || "The Hallucination Boundary"}
          tagline={t('exp.hallucination.tagline') || "Why LLMs lie: A statistical inevitability, not a bug."}
          actions={{
            source: resources.source ? {
              href: resources.source,
              label: t('common.source') || "Source Code",
            } : undefined,
            pdf: resources.pdf ? {
              href: resources.pdf,
              label: t('common.paper') || "Read Paper",
            } : undefined,
          }}
          isActionLoading={isResourceLoading}
        />

        {/* 1. MAIN INTERACTION (The Flashlight) */}
        <section className="mb-24">
          {/* Mobile stacking uses grid-cols-1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Left: Theory */}
            <div className="lg:col-span-4">
              <div className="prose prose-ink text-ink/80 text-lg leading-8 font-serif mb-8">
                <p>
                  {t('exp.hallucination.s1.p1') || "We often treat Hallucinations as mysterious failures of reasoning. The reality is simpler: they are errors in binary classification."} [cite: 11]
                </p>

                <div className="my-6 p-4 bg-ink/5 rounded border border-ink/10 text-center text-sm">
                  <p className="font-mono text-xs uppercase tracking-widest text-ink/40 mb-2">The Is-It-Valid Reduction</p>
                  <Latex>{`$$err \\ge 2 \\cdot err_{iiv} - \\frac{|\\mathcal{V}|}{|\\mathcal{E}|} - \\delta$$`}</Latex>
                  <p className="text-[10px] text-ink/40 mt-2 italic">Ref: Theorem 1 [cite: 177, 252]</p>
                </div>

                <p>
                  {t('exp.hallucination.s1.p2') || "If a model cannot perfectly distinguish valid statements from invalid ones (the Is-It-Valid problem), generative errors are statistically guaranteed."} [cite: 12]
                </p>
              </div>

              <div className="bg-ink/5 p-6 rounded-xl border border-ink/5">
                <h4 className="font-bold text-ink mb-3 font-serif flex items-center gap-2">
                  <Bookmark className="w-4 h-4" /> {t('exp.hallucination.key_factors') || "The Error Drivers"}
                </h4>
                <ul className="text-sm text-ink/70 space-y-3 list-disc pl-4 rtl:pl-0 rtl:pr-4 font-serif leading-relaxed">
                  <li><strong>{t('exp.hallucination.f1') || "Pretraining"}:</strong> Density estimation on sparse data forces guessing on 'singletons'. [cite: 50]</li>
                  <li><strong>{t('exp.hallucination.f2') || "Evaluation"}:</strong> Binary exams penalize uncertainty (IDK = 0 pts). [cite: 13]</li>
                  <li><strong>{t('exp.hallucination.f3') || "Bluffing"}:</strong> To maximize scores, models mimic confidence even when uncalibrated. [cite: 98]</li>
                </ul>
              </div>
            </div>

            {/* Right: The Instrument */}
            <div className="lg:col-span-8 w-full">
              <div className="lg:sticky lg:top-24">
                <CalibrationChamber />
              </div>
            </div>

          </div>
        </section>

        {/* 2. THE MATH (Good-Turing) */}
        <section className="mb-24 pt-16 border-t border-ink/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink/60">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-ink">
              {t('exp.hallucination.s2.title') || "2. The Singleton Rate"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="prose prose-ink text-ink/80 text-lg leading-8 font-serif">
              <p>
                {t('exp.hallucination.s2.p1') || "How do we estimate the probability of events we've never seen? This is the 'Missing Mass' problem."} [cite: 279]
              </p>
              <p>
                {t('exp.hallucination.s2.p2') || "The Good-Turing estimator suggests that the probability of encountering a new fact is proportional to the number of facts seen exactly once (Singletons)."} [cite: 275]
              </p>
              <p>
                {t('exp.hallucination.s2.p3') || "If 20% of facts in training appear only once, we expect the model to hallucinate on at least 20% of similar arbitrary facts."} [cite: 89]
              </p>
            </div>

            <div className="bg-card border border-ink/10 rounded-xl p-8 shadow-sm flex flex-col justify-center items-center text-center">
              <div className="mb-6 space-y-4">
                <div className="text-xs font-mono uppercase tracking-widest text-ink/40">{t('exp.hallucination.s2.lower_bound') || "The Hallucination Lower Bound"}</div>
                <div className="text-xl md:text-3xl font-serif text-ink overflow-x-auto max-w-full" dir="ltr">
                  <Latex>{`$$err \\ge sr - \\epsilon$$`}</Latex>
                </div>
                <p className="text-sm text-ink/60 font-mono">
                  Where <span className="text-accent font-bold">sr</span> = Singleton Rate
                </p>
              </div>
              <p className="text-sm text-ink/60 leading-relaxed max-w-sm font-serif italic">
                "{t('exp.hallucination.s2.quote') || "On these 'singleton' facts, the model cannot learn a pattern. It must guess. Guessing leads to hallucinations."}" [cite: 88, 180]
              </p>
            </div>
          </div>
        </section>

        {/* 3. SIMULATION (Full Width) */}
        <section className="mb-24 pt-16 border-t border-ink/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink/60">
              <Terminal className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-ink">
              {t('exp.hallucination.s3.title') || "3. The Missing Mass Simulation"}
            </h2>
          </div>

          <div className="max-w-4xl mb-12">
            <div className="prose prose-ink text-ink/80 text-lg leading-8 font-serif">
              <p>
                {t('exp.hallucination.s3.p1') || "This simulation generates a synthetic language following Zipf's law (heavy-tailed distribution)."} [cite: 37]
              </p>
              <p>
                {t('exp.hallucination.s3.p2') || "We calculate the Singleton Rate (sr) from the training data and compare it to the actual error rate on a held-out test set."} [cite: 284]
              </p>
              <p className="text-sm italic text-ink/50 mt-4">
                * {t('exp.hallucination.s3.note') || "Demonstrates that Singleton Rate accurately predicts the floor of model errors."}
              </p>
            </div>
          </div>

          <div className="w-full">
            <PythonPlayground initialCode={HALLUCINATION_CODE} />
          </div>
        </section>

      </div>
    </main>
  );
}