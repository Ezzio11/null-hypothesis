"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import Skeleton from "@/components/ui/Skeleton";
import LabCard, { LabCardSkeleton } from "@/components/lab/LabCard";
import DraftingBoard, { MonitorSkeleton } from "@/components/lab/DraftingBoard";
import { Activity, Microscope } from "lucide-react";

// Helper for schematics
const DefaultSchematic = () => (
    <svg viewBox="0 0 100 60" className="w-full h-full opacity-50">
        <rect x="20" y="20" width="60" height="20" rx="2" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="2 2" />
        <text x="50" y="32" textAnchor="middle" fontSize="4" fill="currentColor" fontFamily="monospace">NO SIGNAL</text>
    </svg>
);

interface LabClientProps {
    dynamicExperiments: any[];
    legacyAssets: Record<string, any>;
    legacyIds: string[];
}

const InferenceSchematic = () => (
    <svg viewBox="0 0 100 60" className="w-full h-full opacity-80">
        <motion.path d="M 10,50 Q 30,50 40,20 Q 50,-10 60,20 Q 70,50 90,50" fill="none" stroke="currentColor" strokeWidth="0.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }} />
        <path d="M 10,50 H 90" stroke="currentColor" strokeWidth="0.2" />
        <motion.path d="M 70,50 L 70,20 Q 75,35 90,50 Z" fill="currentColor" opacity="0" animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <path d="M 70,50 L 70,20" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 1" />
    </svg>
);

const EstimationSchematic = () => (
    <svg viewBox="0 0 100 60" className="w-full h-full opacity-80">
        <line x1="10" y1="30" x2="90" y2="30" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 2" />
        <motion.path d="M 10,50 L 20,10 L 30,45 L 40,20 L 50,35 L 60,28 L 70,32 L 80,29 L 90,30" fill="none" stroke="currentColor" strokeWidth="0.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, ease: "circOut" }} />
    </svg>
);

const AlphaSchematic = () => (
    <svg viewBox="0 0 100 60" className="w-full h-full opacity-80">
        <motion.line x1="30" y1="30" x2="70" y2="30" stroke="currentColor" strokeWidth="1" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "50%", originY: "50%" }} />
        <path d="M 48,30 L 50,25 L 52,30" fill="currentColor" />
        <motion.circle cx="30" cy="25" r="3" fill="currentColor" animate={{ cy: [25, 28, 22, 25] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="70" cy="25" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" animate={{ cy: [25, 22, 28, 25] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
    </svg>
);

const BetaSchematic = () => (
    <svg viewBox="0 0 100 60" className="w-full h-full opacity-80">
        <motion.path fill="none" stroke="currentColor" strokeWidth="0.6" d="M 10,50 Q 50,-10 90,50" animate={{ d: ["M 10,50 Q 50,-10 90,50", "M 10,10 Q 50,90 90,10", "M 10,50 Q 20,10 90,50", "M 10,50 Q 50,-10 90,50"] }} transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }} />
        <rect x="10" y="10" width="80" height="40" stroke="currentColor" strokeWidth="0.2" fill="none" />
    </svg>
);

const SamplingSchematic = () => (
    <svg viewBox="0 0 100 60" className="w-full h-full opacity-80">
        {Array.from({ length: 6 }).map((_, i) => (
            <motion.circle key={i} r="1.2" fill="currentColor" initial={{ cx: 0, cy: 30, opacity: 0 }} animate={{ cx: 45, cy: 30, opacity: 1 }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3, ease: "linear" }} />
        ))}
        <rect x="45" y="20" width="20" height="20" stroke="currentColor" strokeWidth="0.6" fill="none" />
        <motion.circle cx="55" cy="30" r="1.5" fill="currentColor" animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 5, repeat: Infinity, times: [0.4, 0.45, 0.9, 1] }} />
    </svg>
);

const ASSET_MAP: Record<string, { color: string, schematic: React.ReactNode }> = {
    inference: { color: "text-red-600", schematic: <InferenceSchematic /> },
    estimation: { color: "text-emerald-600", schematic: <EstimationSchematic /> },
    alpha: { color: "text-purple-600", schematic: <AlphaSchematic /> },
    beta: { color: "text-amber-600", schematic: <BetaSchematic /> },
    sampling: { color: "text-blue-600", schematic: <SamplingSchematic /> },
};

export default function LabClient({ dynamicExperiments, legacyAssets, legacyIds }: LabClientProps) {
    const { t, isLoading } = useLanguage();

    // Combine IDs: Legacy first, then Dynamic
    const allIds = [...legacyIds, ...dynamicExperiments.map(d => d.slug)];
    const [hoveredId, setHoveredId] = useState(allIds[0] || "");

    const getAssets = (id: string) => {
        // Check legacy map internal
        if (ASSET_MAP[id]) {
            const spec = ASSET_MAP[id];
            return { ...spec, borderColor: spec.color.replace("text-", "border-") };
        }
        // Fallback for dynamic items (generic "Ink" style)
        return {
            color: "text-ink/60",
            schematic: <DefaultSchematic />,
            borderColor: "border-ink/20"
        };
    };

    const activeAssets = getAssets(hoveredId);

    // Helper to find title/desc
    const getData = (id: string) => {
        const dynamicItem = dynamicExperiments.find(d => d.slug === id);
        if (dynamicItem) return { title: dynamicItem.title, desc: dynamicItem.description, subtitle: "Database Entry" };

        return {
            title: t(`exp.${id}.title`) || id.charAt(0).toUpperCase() + id.slice(1),
            subtitle: t(`exp.${id}.subtitle`) || "Experimental Module",
            desc: t(`exp.${id}.description`) || "Data unavailable."
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

            {/* DYNAMIC LIST */}
            <div className="lg:col-span-7 flex flex-col gap-6">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <LabCardSkeleton key={`skeleton-${i}`} />
                    ))
                ) : (
                    allIds.map((id, i) => {
                        const data = getData(id);
                        return (
                            <LabCard
                                key={id}
                                id={id}
                                index={i}
                                title={data.title}
                                subtitle={data.subtitle}
                                description={data.desc}
                                isActive={hoveredId === id}
                                onHover={setHoveredId}
                                assets={getAssets(id)}
                                t={t}
                            />
                        )
                    })
                )}
            </div>

            {/* VISUALIZATION SIDEBAR */}
            <div className="hidden lg:block lg:col-span-5 relative">
                <DraftingBoard
                    isLoading={isLoading}
                    hoveredId={hoveredId}
                    activeAssets={activeAssets}
                    t={t}
                />
            </div>

        </div>
    );
}
