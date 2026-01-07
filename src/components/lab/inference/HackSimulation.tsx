// HackSimulation.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Trash2, FileText, CheckCircle, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LabPartner from "../LabPartner";

// Generators (omitted for brevity)
const COLORS = ["Purple", "Green", "Red", "Blue", "Yellow", "Orange", "Black", "White", "Pink", "Cyan"];
const CONDITIONS = ["Acne", "Hair Loss", "High IQ", "Laziness", "Happiness", "Insomnia"];

const generateHypothesis = () => ({
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)]
});

export default function HackSimulation() {
    const { t, dir } = useLanguage();
    const [currentHypothesis, setCurrentHypothesis] = useState(generateHypothesis());
    const [pValue, setPValue] = useState<number | null>(null);
    const [published, setPublished] = useState<{ id: number, text: string, p: number }[]>([]);
    const [trashCount, setTrashCount] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const runExperiment = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setPValue(null);
        await new Promise(r => setTimeout(r, 600));

        const p = Math.random();
        setPValue(p);
        setAttempts(a => a + 1);

        if (p < 0.05) {
            setPublished(prev => [
                {
                    id: Date.now(),
                    text: `${currentHypothesis.color} ${t('hack.hypothesis.jelly')} -> ${currentHypothesis.condition}`,
                    p
                },
                ...prev
            ]);
        } else {
            setTrashCount(c => c + 1);
        }

        setTimeout(() => {
            setIsRunning(false);
            setCurrentHypothesis(generateHypothesis());
        }, 1000);
    };

    const reset = () => {
        setPublished([]);
        setTrashCount(0);
        setAttempts(0);
        setPValue(null);
        setCurrentHypothesis(generateHypothesis()); // Generate new hypothesis on reset
    };

    return (
        // FIX: Set a min-height for mobile to ensure both panels fit (h-[500px] on md)
        // FIX: Changed flex-col md:flex-row to allow stacking on small screens
        <div className="bg-card border border-ink/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-auto" dir={dir}>
            <div className="flex flex-col md:flex-row h-auto md:h-[500px] w-full">

                {/* LEFT: THE LAB (THEMATIC BACKGROUND) - Now takes full width on mobile */}
                <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-ink/10 relative bg-ink/5 md:rtl:border-r-0 md:rtl:border-l">

                    {/* HEADER BAR FOR STATUS AND RESET BUTTON */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">

                        {/* Status: Experiments Run */}
                        <div className="text-[10px] font-mono text-ink/50 uppercase tracking-widest">
                            {t('hack.status.experiments') || "Experiments Run"}: <span className="text-ink">{attempts}</span>
                        </div>

                        {/* FIX 1: RESET BUTTON */}
                        <button
                            onClick={reset}
                            className="flex items-center gap-1.5 px-3 py-1 bg-paper border border-ink/10 rounded-full text-[10px] font-mono uppercase tracking-wider text-ink/70 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                        >
                            <RotateCcw className="w-3 h-3" />
                            {t('common.reset') || "Reset"}
                        </button>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="text-center space-y-6 max-w-sm z-10 pt-16 md:pt-24 pb-8 md:pb-0">
                        <div className="space-y-2">
                            <span className="text-accent text-xs font-mono uppercase tracking-widest">{t('hack.lab.testing') || "Current Hypothesis"}</span>
                            <h3 className="text-2xl md:text-3xl font-serif leading-tight text-ink">
                                "{t('hack.hypothesis.prefix')} <span className="text-accent">{currentHypothesis.color}</span> {t('hack.hypothesis.jelly')} {t('hack.hypothesis.cause_q')} <span className="text-accent">{currentHypothesis.condition}</span>?"
                            </h3>
                        </div>

                        <div className="h-24 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {isRunning && !pValue ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ink/40 font-mono text-sm animate-pulse">
                                        {t('hack.lab.analyzing') || "Collecting Data..."}
                                    </motion.div>
                                ) : pValue !== null ? (
                                    <motion.div
                                        key="result"
                                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                        className={`flex flex-col items-center ${pValue < 0.05 ? "text-green-600" : "text-red-500/50"}`}
                                    >
                                        <span className="text-4xl font-mono font-bold" dir="ltr">p = {pValue.toFixed(3)}</span>
                                        <span className="text-xs font-sans uppercase tracking-widest mt-2 font-bold">
                                            {pValue < 0.05 ? t('hack.result.sig') : t('hack.result.insig')}
                                        </span>
                                    </motion.div>
                                ) : (
                                    <div className="text-ink/10 text-4xl font-mono">p = ?.???</div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button onClick={runExperiment} disabled={isRunning} className="group relative px-8 py-4 bg-accent text-paper rounded-full font-bold font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-white transition-all w-full overflow-hidden disabled:opacity-50">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isRunning ? t('common.running') : t('hack.btn.run')}
                                {!isRunning && <Play className="w-3 h-3 rtl:rotate-180" />}
                            </span>
                        </button>
                    </div>

                    {/* XKCD Reference Link */}
                    <a
                        href="https://www.explainxkcd.com/wiki/index.php/882:_Significant"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-4 left-6 rtl:left-auto rtl:right-6 text-[10px] font-mono text-ink/40 hover:text-accent flex items-center gap-1 transition-colors"
                    >
                        {t('exp.inference.s5.ref') || "Ref: xkcd #882"} <ExternalLink className="w-2 h-2" />
                    </a>
                </div>


                {/* RIGHT: THE FILE DRAWER - Now takes a fixed height on mobile or collapses to md:w-80 */}
                <div className="w-full md:w-80 h-[300px] md:h-full bg-ink/10 flex flex-col shrink-0">

                    {/* Published List */}
                    <div className="flex-1 p-6 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4 border-b border-ink/10 pb-2">
                            <span className="text-xs font-mono text-green-700 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle className="w-3 h-3" /> {t('hack.list.published')}
                            </span>
                            <span className="text-ink font-mono text-xs">{published.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            <AnimatePresence>
                                {published.map((pub) => (
                                    <motion.div
                                        key={pub.id}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="bg-green-100/50 border border-green-500/20 p-3 rounded text-left rtl:text-right"
                                    >
                                        <div className="text-[10px] text-green-700 font-bold mb-1 font-serif uppercase tracking-wider">News</div>
                                        <p className="text-xs text-ink/90 font-serif leading-relaxed">"{pub.text}"</p>
                                        <div className="text-[9px] text-ink/40 font-mono mt-2 text-right" dir="ltr">p = {pub.p.toFixed(4)}</div>
                                    </motion.div>
                                ))}
                                {published.length === 0 && (
                                    <div className="text-center mt-10 opacity-20 text-ink/20">
                                        <FileText className="w-8 h-8 mx-auto mb-2" />
                                        <span className="text-xs font-mono">{t('hack.list.empty')}</span>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Trash / File Drawer */}
                    <div className="h-1/3 bg-ink/5 border-t border-ink/10 p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <span className="text-xs font-mono text-red-700/50 uppercase tracking-widest flex items-center gap-2 mb-1">
                                    <Trash2 className="w-3 h-3" /> {t('hack.list.discarded')}
                                </span>
                                <div className="text-[10px] text-ink/30 max-w-[150px] leading-tight">
                                    {t('hack.list.discarded_desc')}
                                </div>
                            </div>
                            <div className="text-4xl font-mono font-bold text-ink/10 group-hover:text-red-900/50 transition-colors">
                                {trashCount}
                            </div>
                        </div>
                        {/* Trash Visuals */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end justify-center px-4 gap-1 opacity-20">
                            {Array.from({ length: Math.min(20, trashCount) }).map((_, i) => (
                                <motion.div key={i} initial={{ y: 20 }} animate={{ y: 0 }} className="w-2 bg-ink/20 rounded-t-sm" style={{ height: `${Math.random() * 80 + 20}%` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-6 pb-6 bg-paper md:px-8 md:pb-8">
                <LabPartner
                    title="P-Hacking Detector"
                    context={{
                        simulation: "P-Hacking / Data Dredging",
                        experimentsRun: attempts,
                        significantFindings: published.length,
                        discardedFindings: trashCount,
                        minPValue: published.length > 0 ? Math.min(...published.map(p => p.p)) : "N/A",
                        conclusion: published.length > 0 ? "Spurious correlations found" : "No significance yet"
                    }}
                    defaultPrompt="Review the 'published' findings versus the 'discarded' experiments. Explain why selecting only significant results from many random trials leads to false scientific conclusions."
                />
            </div>
        </div>
    );
}