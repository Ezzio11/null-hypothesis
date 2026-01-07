"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Archive, Activity, TrendingUp, Crown, PenTool, Wheat, Brain } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import FolioCard, { FolioCardSkeleton, ProjectAsset } from "@/components/projects/FolioCard";
import Skeleton from "@/components/ui/Skeleton";

interface ProjectsGridProps {
    dynamicProjects: any[]; // ContentNodes
    legacyIds: string[];
}

const ASSET_MAP: Record<string, ProjectAsset> = {

    "bp": {
        icon: Activity,
        iconColor: "text-rose-700",
        bg: "bg-rose-900/5",
        link: "/projects/bp-regression",
        defaultCategory: "Data Analysis"
    },
    "vix": {
        icon: TrendingUp,
        iconColor: "text-emerald-700",
        bg: "bg-emerald-900/5",
        link: "/projects/vix-tsa",
        defaultCategory: "Time Series"
    },
    "dairy": {
        icon: Wheat,
        iconColor: "text-amber-700",
        bg: "bg-amber-900/5",
        link: "/projects/dairy-eco",
        defaultCategory: "Analysis"
    }
};

export default function ProjectsGrid({ dynamicProjects, legacyIds }: ProjectsGridProps) {
    const { t, isLoading } = useLanguage();
    const [activeFilter, setActiveFilter] = useState("All");

    const FILTERS = [
        { key: "All", label: t('filter.all') || "All" },
        { key: "Showcase", label: t('filter.showcase') || "Showcase" },
        { key: "Data Analysis", label: t('filter.analysis') || "Data Analysis" },
        { key: "Design", label: t('filter.design') || "Design" },
    ];

    // Helper to normalize content nodes to "ProjectAsset" shape for the card
    const normalizeDynamic = (node: any): { id: string, asset: ProjectAsset } => {
        let category = "Data Analysis"; // Default
        if (node.metadata?.tech_stack?.some((t: string) => t.includes('design') || t.includes('figma'))) category = "Design";

        return {
            id: node.slug,
            asset: {
                icon: Filter, // Default Icon
                iconColor: "text-ink/50",
                bg: "bg-ink/5",
                link: `/projects/${node.slug}`,
                defaultCategory: category
            }
        };
    };

    const allItems = [
        ...legacyIds.map(id => ({ id, asset: ASSET_MAP[id] })),
        ...dynamicProjects.map(normalizeDynamic)
    ];

    const filteredItems = allItems.filter(item => {
        if (activeFilter === "All") return true;
        const translatedCat = t(`project.${item.id}.category`);
        return translatedCat === activeFilter || item.asset.defaultCategory === activeFilter;
    });

    return (
        <>
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-8">


                <div className="flex flex-wrap justify-end gap-2">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => setActiveFilter(filter.key)}
                            className={`
                    px-4 py-2 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-all duration-300 border
                    ${activeFilter === filter.key
                                    ? "bg-ink text-paper border-ink shadow-sm"
                                    : "bg-transparent text-ink/50 border-ink/10 hover:border-ink/30 hover:text-ink"}
                    `}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <FolioCardSkeleton key={`skeleton-${index}`} />
                    ))
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item) => (
                            <FolioCard
                                key={item.id}
                                id={item.id} // This ID is used for translation keys. Dynamic items fallback to defaults.
                                assets={item.asset}
                                t={t}
                                // Pass override title/desc from DB if available
                                overrideTitle={dynamicProjects.find(d => d.slug === item.id)?.title}
                                overrideDesc={dynamicProjects.find(d => d.slug === item.id)?.description}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </motion.div>

            {!isLoading && filteredItems.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="w-full py-32 text-center border border-dashed border-ink/10 rounded-sm flex flex-col items-center justify-center bg-paper"
                >
                    <div className="w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center mb-4">
                        <Filter className="w-6 h-6 text-ink/30" />
                    </div>
                    <p className="font-serif text-ink/40 text-xl italic">
                        {t('project.empty') || "No records match this classification."}
                    </p>
                </motion.div>
            )}
        </>
    );
}
