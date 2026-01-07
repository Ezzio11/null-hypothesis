"use client";

import { useState } from "react";
import { usePython } from "@/hooks/usePython";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { tags as t } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import { Play, Loader2, Terminal, RefreshCw, Sparkles, Bot, Microscope, BookOpen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- CUSTOM ACADEMIC THEME ---
const academicTheme = createTheme({
  theme: 'light',
  settings: {
    background: 'var(--color-paper)',
    foreground: 'var(--color-ink)',
    caret: 'var(--color-accent)',
    selection: 'rgba(209, 181, 129, 0.2)',
    selectionMatch: 'rgba(209, 181, 129, 0.2)',
    lineHighlight: 'rgba(120, 120, 120, 0.05)',
    gutterBackground: 'var(--color-paper)',
    gutterForeground: 'rgba(120, 120, 120, 0.4)',
  },
  styles: [
    { tag: t.comment, color: 'rgba(120, 120, 120, 0.6)', fontStyle: 'italic' },
    { tag: t.variableName, color: 'var(--color-ink)' },
    { tag: [t.string, t.special(t.brace)], color: 'var(--color-accent)' },
    { tag: t.number, color: 'var(--color-accent)' },
    { tag: t.bool, color: 'var(--color-accent)' },
    { tag: t.null, color: 'var(--color-accent)' },
    { tag: t.keyword, color: 'var(--color-ink)', fontWeight: 'bold' },
    { tag: t.operator, color: 'var(--color-ink)', opacity: 0.7 },
    { tag: t.className, color: 'var(--color-ink)', textDecoration: 'underline' },
    { tag: t.definition(t.typeName), color: 'var(--color-ink)' },
    { tag: t.typeName, color: 'var(--color-ink)' },
    { tag: t.angleBracket, color: 'var(--color-ink)' },
    { tag: t.tagName, color: 'var(--color-ink)' },
    { tag: t.attributeName, color: 'var(--color-ink)' },
  ],
});

const generateCacheKey = (content: string, mode: string) => {
  let hash = 0;
  const str = content + mode;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `ai_cache_${hash}`;
};

interface PythonPlaygroundProps {
  initialCode?: string;
  onChange?: (code: string) => void;
}

const FALLBACK_CODE = `import numpy as np\nprint("Hello World")`;

export default function PythonPlayground({ initialCode = FALLBACK_CODE, onChange }: PythonPlaygroundProps) {
  const [code, setCode] = useState(initialCode);

  // Use custom hook for Python execution
  const { runPython, output, isRunning, isReady, error: hookError, resetOutput } = usePython();

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<{ title: string, text: string } | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  // Use hookError as the primary error source, but we can display it
  const lastError = hookError;

  const handleRun = async () => {
    setAiAnalysis(null);
    await runPython(code);
  };

  const handleReset = () => {
    setCode(initialCode);
    resetOutput();
    setAiAnalysis(null);
  };

  // --- 3. AI HANDLER ---
  const callAI = async (type: "code" | "interpret") => {
    setIsThinking(true);
    const contentHash = type === 'code' ? code : output.join('\n');
    const cacheKey = generateCacheKey(contentHash, type);
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      setAiAnalysis(JSON.parse(cached));
      setIsThinking(false);
      return;
    }

    try {
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          code,
          output: output.join('\n'),
          error: lastError
        }),
      });
      const data = await res.json();
      const resultObj = {
        title: type === "interpret" ? "Output Interpretation" : lastError ? "Error Diagnosis" : "Code Analysis",
        text: data.suggestion || data.text || "No response generated."
      };
      setAiAnalysis(resultObj);
      sessionStorage.setItem(cacheKey, JSON.stringify(resultObj));
    } catch (e) {
      setAiAnalysis({ title: "System Failure", text: "Neural link disconnected." });
    } finally {
      setIsThinking(false);
    }
  };

  return (
    // FIX: Added dir="ltr" to enforce Left-to-Right layout for code even in Arabic pages
    <div dir="ltr" className="flex flex-col bg-paper border border-ink/20 rounded-xl overflow-hidden shadow-sm my-12 transition-colors duration-500 text-left">

      {/* --- TOP SECTION: EDITOR & TERMINAL --- */}
      <div className="flex flex-col md:flex-row h-[500px] border-b border-ink/10">

        {/* LEFT: EDITOR */}
        <div className="flex-1 flex flex-col border-r border-ink/10">

          {/* Toolbar */}
          <div className="bg-ink/5 px-4 py-3 flex justify-between items-center border-b border-ink/5">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 opacity-50">
                <div className="w-2.5 h-2.5 rounded-full bg-ink/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-ink/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-ink/20" />
              </div>
              <span className="text-[10px] text-ink/40 uppercase tracking-[0.2em] font-mono">notebook.py</span>
            </div>

            <div className="flex gap-2">
              <button onClick={handleReset} className="p-2 text-ink/30 hover:text-ink transition-colors" title="Reset Code">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button onClick={() => callAI("code")} disabled={isThinking} className="p-2 text-accent/60 hover:text-accent transition-colors" title="Analyze Code">
                <Sparkles className="w-4 h-4" />
              </button>

              <button
                onClick={handleRun}
                disabled={!isReady || isRunning}
                className="flex items-center gap-2 bg-ink text-paper hover:bg-accent hover:text-white border border-transparent text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              >
                {isRunning || !isReady ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                {!isReady ? "Loading..." : isRunning ? "Running..." : "Run"}
              </button>
            </div>
          </div>

          {/* CodeMirror Area */}
          <div className="flex-1 overflow-hidden text-sm relative bg-paper">
            <CodeMirror
              value={code}
              height="100%"
              theme={academicTheme}
              extensions={[python()]}
              onChange={(val) => {
                setCode(val);
                if (onChange) onChange(val);
              }}
              className="h-full text-[13px]"
              style={{ backgroundColor: 'transparent' }}
            />
          </div>
        </div>

        {/* RIGHT: TERMINAL (Dark Academia / CodeBlock Style) */}
        <div className="flex-1 bg-[#1e1e1e] flex flex-col relative w-full md:w-1/2 transition-colors duration-500 text-left border-l border-white/10">

          {/* Header */}
          <div className="bg-[#252526] px-4 py-2 border-b border-white/5 flex justify-between items-center h-[52px]">
            <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 font-mono">
              <Terminal className="w-3 h-3" /> Console
            </span>

            <div className="flex gap-2">
              {output.length > 0 && !lastError && (
                <button
                  onClick={() => callAI("interpret")}
                  disabled={isThinking}
                  className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all font-mono"
                >
                  {isThinking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Microscope className="w-3 h-3" />}
                  Interpret
                </button>
              )}

              {lastError && (
                <button
                  onClick={() => callAI("code")}
                  className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-all font-mono"
                >
                  <Bot className="w-3 h-3" /> Debug
                </button>
              )}
            </div>
          </div>

          {/* Output Area */}
          <div className="flex-1 p-6 text-xs text-gray-300 overflow-auto custom-scrollbar font-mono leading-relaxed text-left selection:bg-white/20 selection:text-white">
            {output.length > 0 ? (
              output.map((line, i) => (
                <div key={i} className="break-words whitespace-pre-wrap mb-1 font-mono">{line}</div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/10 select-none">
                <Terminal className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-[10px] uppercase tracking-[0.3em]">
                  {isReady ? "Ready to execute" : "Initializing Kernel..."}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* --- BOTTOM SECTION: THE LAB NOTEBOOK (AI Results) --- */}
      <AnimatePresence>
        {aiAnalysis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-ink/10 bg-paper overflow-hidden"
          >
            <div className="p-6 md:p-8 flex gap-6">

              {/* Icon Column */}
              <div className="hidden md:flex flex-col items-center gap-2 pt-1">
                <div className="p-2 bg-accent/10 rounded-lg border border-accent/20 text-accent">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="w-[1px] h-full bg-ink/5" />
              </div>

              {/* Content Column */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-bold text-accent font-mono uppercase tracking-widest">
                    {aiAnalysis.title}
                  </h4>
                  <button onClick={() => setAiAnalysis(null)} className="text-ink/30 hover:text-ink transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-base text-ink/80 leading-8 font-serif tracking-wide whitespace-pre-wrap">
                  {aiAnalysis.text.split('**').map((part, i) =>
                    i % 2 === 1 ? <strong key={i} className="text-ink font-bold bg-accent/10 px-1 rounded">{part}</strong> : part
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Status */}
      <div className="bg-ink/5 border-t border-ink/5 px-4 py-1.5 text-[9px] text-ink/30 font-mono flex justify-between uppercase tracking-widest">
        <span>Pyodide Kernel (Standard)</span>
        <span className={isReady ? "text-emerald-600" : "text-amber-600"}>{isReady ? "● Online" : "○ Loading Libraries..."}</span>
      </div>

    </div>
  );
}