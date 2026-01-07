"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, BookOpen, X, MessageSquareQuote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LabContext } from "@/lib/types";

interface LabPartnerProps {
    title?: string;
    context: LabContext;
    defaultPrompt?: string;
}

export default function LabPartner({ title = "Lab Partner", context, defaultPrompt }: LabPartnerProps) {
    const { t, dir } = useLanguage();
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [error, setError] = useState("");

    const handleAsk = async () => {
        setIsThinking(true);
        setError("");
        setAnalysis(null);

        try {
            // Construct a prompt based on the context
            const contextStr = JSON.stringify(context, null, 2);
            const prompt = `
        You are a helpful scientific lab partner. 
        The student is running a simulation with the following parameters and results:
        ${contextStr}
        
        ${defaultPrompt || "Explain what these results mean in the context of statistics. Be concise but insightful."}
        
        Provide a friendly, educational explanation. Use specific numbers from the data in your response.
      `;

            const res = await fetch("/api/ai-assist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: [{ role: "user", text: prompt }],
                    overridePrompt: "You are a biology/statistics professor explaining a concept to a student." // Hints to the system instruction
                }),
            });

            if (!res.ok) throw new Error("Failed to contact Lab Partner");

            const data = await res.json();
            setAnalysis(data.reply);

        } catch (err) {
            setError("Lab Partner is currently offline.");
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="mt-8 border-t border-ink/10 pt-6" dir={dir}>
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-serif text-lg text-ink flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    {title}
                </h4>

                {!analysis && !isThinking && (
                    <button
                        onClick={handleAsk}
                        className="text-xs font-mono uppercase tracking-widest text-accent hover:text-ink transition-colors flex items-center gap-2"
                    >
                        {t('lab.partner.ask', 'Ask AI for Analysis')}
                        <MessageSquareQuote className="w-4 h-4" />
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isThinking && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-ink/5 rounded-lg p-6 flex flex-col items-center justify-center text-ink/40 space-y-3"
                    >
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-xs font-mono uppercase tracking-widest">Analyzing Data...</span>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-red-500/10 text-red-600 rounded-lg text-sm font-mono border border-red-500/20"
                    >
                        {error}
                    </motion.div>
                )}

                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-paper border border-ink/10 rounded-xl overflow-hidden shadow-sm relative group"
                    >
                        <button
                            onClick={() => setAnalysis(null)}
                            className="absolute top-4 right-4 text-ink/20 hover:text-ink transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-6 md:p-8 flex gap-6">
                            {/* Icon Column (Desktop) */}
                            <div className="hidden md:flex flex-col items-center gap-2 pt-1 min-w-[40px]">
                                <div className="p-2 bg-accent/10 rounded-lg border border-accent/20 text-accent">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div className="w-[1px] h-full bg-ink/5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="prose prose-sm prose-p:font-serif prose-p:text-ink/80 prose-headings:font-sans prose-strong:text-accent max-w-none">
                                    <div className="whitespace-pre-wrap leading-relaxed">
                                        {analysis}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
