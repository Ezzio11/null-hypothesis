import React from "react";

// --- 1. ICONS (Full Set) ---
import {
  Database, Sigma, GitCompare, Archive, Layers, Cpu, CheckCircle,
  Scale, Terminal, Bookmark, FileText, Target, Crosshair, Ruler,
  BookOpen, AlertTriangle, GitCommit, Search, Activity, Filter
} from "lucide-react";

// --- 2. MATH ---
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";

// --- 3. INTERACTIVE LAB COMPONENTS ---
import CodeBlock from "@/components/ui/CodeBlock";

// Sampling Lab
import ReservoirSimulation from "@/components/lab/sampling/ReservoirSimulation";

// Beta Lab
import BetaShaper from "@/components/lab/beta/BetaShaper";

// Alpha Lab
import AlphaOptimizer from "@/components/lab/alpha/AlphaOptimizer";

// Estimation Lab
import GammaPlayground from "@/components/lab/estimation/GammaPlayground";
import ConsistencySimulator from "@/components/lab/estimation/ConsistencySimulator";
import MSERace from "@/components/lab/estimation/MSERace";
import IntervalAnalysis from "@/components/lab/estimation/IntervalAnalysis";

// Inference Lab
import DistributionGraph from "@/components/lab/inference/DistributionGraph";
import AlphaSelector from "@/components/lab/inference/AlphaSelector";
import PowerAnalysis from "@/components/lab/inference/PowerAnalysis";
import PValueDistribution from "@/components/lab/inference/PValueDistribution";
import HackSimulation from "@/components/lab/inference/HackSimulation";
import DataTorture from "@/components/lab/inference/DataTorture";
import ConfidenceIntervals from "@/components/lab/inference/ConfidenceIntervals";

// Common
import PythonPlayground from "@/components/lab/PythonPlayground";


// --- 4. SAFETY WRAPPERS ---

/**
 * A safe wrapper for Latex to prevent MDX crashes.
 * It accepts content via 'info' prop (safer) or children (if string).
 */
const SafeLatex = ({ children, info }: { children?: React.ReactNode, info?: string }) => {
  // If 'info' prop is provided, use it. Otherwise check if children is a string.
  // If children is an object (which happens if MDX parses braces), fallback to empty string.
  const content = info || (typeof children === 'string' ? children : "");

  if (!content) return null;

  return <Latex>{content}</Latex>;
};


// --- 5. PAGE LAYOUTS ---

const Section = ({ children }: { children: React.ReactNode }) => (
  <section className="mb-24 md:mb-32">
    {children}
  </section>
);

// Used for "Part I", "Part II" dividers in Inference Lab
const ActHeader = ({ label, title }: { label: string, title: string }) => (
  <div className="mb-12 border-t border-ink/10 pt-24 first:border-t-0 first:pt-0">
    <span className="font-mono text-xs text-ink/40 uppercase tracking-[0.3em] block mb-2">{label}</span>
    <h2 className="text-3xl md:text-4xl text-ink latex-prose font-bold">{title}</h2>
  </div>
);

const Header = ({ icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-4 mb-10">
    <div className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center text-ink/60">
      {typeof icon === 'function' ? React.createElement(icon, { className: "w-5 h-5" }) : icon}
    </div>
    <h2 className="text-3xl md:text-4xl text-ink latex-prose font-bold">{title}</h2>
  </div>
);

// Standard Split: Text Left (5 cols), Component Right (7 cols)
const SplitLayout = ({ left, right }: { left: React.ReactNode, right: React.ReactNode }) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
    <div className="lg:col-span-5 prose prose-ink text-ink/80 text-xl latex-prose">
      {left}
    </div>
    <div className="lg:col-span-7 w-full">
      {right}
    </div>
  </div>
);

// Reverse Split: Component Left (7 cols), Text Right (5 cols)
const ReverseSplitLayout = ({ left, right }: { left: React.ReactNode, right: React.ReactNode }) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
    <div className="lg:col-span-7 w-full order-2 lg:order-1">
      {left}
    </div>
    <div className="lg:col-span-5 prose prose-ink text-ink/80 text-xl latex-prose order-1 lg:order-2">
      {right}
    </div>
  </div>
);

// Symmetrical Split: 50/50 for Tablet+ (Used in Alpha Lab)
const TwoColumnSection = ({ left, right }: { left: React.ReactNode, right: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-20">
    <div className="prose prose-ink text-lg text-ink/80 latex-prose">
      {left}
    </div>
    <div className="prose prose-ink text-lg text-ink/80 latex-prose">
      {right}
    </div>
  </div>
);


// --- 6. CONTENT HELPERS ---

const SimulationBox = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-card border border-ink/10 rounded-3xl p-1 shadow-sm">
    {children}
  </div>
);

const ProblemText = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <>
    <h3 className="text-2xl font-bold text-ink mb-6">{title}</h3>
    <div className="mb-8 space-y-8">
      {children}
    </div>
  </>
);

const SolutionBox = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-ink/5 p-8 md:p-12 rounded-2xl border border-ink/10 relative overflow-hidden">
    <div className="absolute top-0 right-0 p-6 opacity-10 rtl:left-0 rtl:right-auto pointer-events-none">
      <Database className="w-32 h-32" />
    </div>
    <h3 className="text-3xl text-ink mb-10 border-b border-ink/10 pb-6 latex-prose font-bold">{title}</h3>
    <div className="space-y-10 text-ink/80 text-xl latex-prose">
      {children}
    </div>
  </div>
);

const Step = ({ n, title, children }: { n: string, title: string, children: React.ReactNode }) => (
  <div className="flex gap-6 items-start">
    <span className="font-mono text-accent font-bold text-2xl mt-1">{n}</span>
    <div className="w-full">
      <strong className="block text-ink text-xl mb-2">{title}</strong>
      <span>{children}</span>
    </div>
  </div>
);

// Universal Math Box: Accepts `latex` string prop OR children elements. 
const MathBox = ({ latex, children }: { latex?: string, children?: React.ReactNode }) => (
  <div
    className="my-8 p-6 bg-paper rounded-xl border border-ink/10 text-center text-xl md:text-2xl shadow-sm overflow-x-auto"
    dir="ltr"
  >
    {latex ? <SafeLatex>{latex}</SafeLatex> : children}
  </div>
);

const CheckItem = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="flex gap-5">
    <CheckCircle className="w-8 h-8 text-accent shrink-0 mt-1" />
    <div>
      <strong className="block text-ink text-xl mb-2">{title}</strong>
      <span>{children}</span>
    </div>
  </div>
);

const ComparisonSection = ({ children }: { children: React.ReactNode }) => (
  <section className="mb-12 pt-16 border-t border-ink/10">
    {children}
  </section>
);

const ComparisonGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mt-16">
    {children}
  </div>
);

const MethodCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="group">
    <h3 className="text-3xl text-ink mb-6 flex items-center gap-3 group-hover:text-accent transition-colors latex-prose font-bold">
      <Archive className="w-6 h-6 text-ink/40" /> {title}
    </h3>
    {children}
  </div>
);

const InfoBox = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-ink/5 p-6 rounded-xl border border-ink/5 mt-8">
    <h4 className="font-bold text-ink mb-3 flex items-center gap-2 latex-prose">
      <Bookmark className="w-4 h-4" /> {title}
    </h4>
    <div className="text-sm text-ink/70 leading-relaxed latex-prose">
      {children}
    </div>
  </div>
);

const MathCard = ({ label, quote, children }: { label: string, quote: string, children: React.ReactNode }) => (
  <div className="bg-card border border-ink/10 rounded-xl p-8 shadow-sm flex flex-col justify-center items-center text-center h-full">
    <div className="mb-6 space-y-4 w-full">
      <div className="text-xs font-mono uppercase tracking-widest text-ink/40">{label}</div>
      <div className="text-xl md:text-2xl text-ink overflow-x-auto max-w-full latex-prose" dir="ltr">
        {children}
      </div>
    </div>
    <p className="text-sm text-ink/60 leading-relaxed max-w-sm italic latex-prose">
      "{quote}"
    </p>
  </div>
);

const CaseGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
    {children}
  </div>
);

const CaseCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="p-6 bg-ink/5 rounded-xl border border-ink/5 h-full">
    <h4 className="text-lg text-ink mb-2 font-bold latex-prose">{title}</h4>
    <div className="text-sm text-ink/60 leading-relaxed latex-prose">
      {children}
    </div>
  </div>
);


// --- 7. THE EXPORT MAP ---

export const MDXComponents = {
  // Core Elements
  Latex: SafeLatex,
  CodeBlock,

  // Layouts
  Section, Header, ActHeader,
  SplitLayout, ReverseSplitLayout, TwoColumnSection,

  // Content Helpers
  SimulationBox, ProblemText, SolutionBox, Step, MathBox, CheckItem,
  ComparisonSection, ComparisonGrid, MethodCard, InfoBox, MathCard,
  CaseGrid, CaseCard,

  // Interactive Lab Components
  ReservoirSimulation, // Sampling
  BetaShaper,          // Beta
  PythonPlayground,    // Common
  AlphaOptimizer,      // Alpha
  GammaPlayground, ConsistencySimulator, MSERace, IntervalAnalysis, // Estimation
  DistributionGraph, AlphaSelector, PowerAnalysis, PValueDistribution, // Inference
  HackSimulation, DataTorture, ConfidenceIntervals, // Inference

  // Icons (Exposed as tags for database string usage)
  Sigma, Layers, Cpu, GitCompare, Database, Scale, Terminal, Bookmark, FileText,
  Target, Crosshair, Ruler, BookOpen, AlertTriangle, GitCommit, Search, Activity, Filter
};