"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { ArrowRight, Microscope, Activity } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageRow } from "@/lib/types";

// New Components
import DataStreamHero from "@/components/home/DataStreamHero";
import CodexCard from "@/components/home/CodexCard";
import TechStackRiver from "@/components/home/TechStackRiver";
import Skeleton from "@/components/ui/Skeleton";

// --- PROPS ---
interface HomeClientProps {
    labs: PageRow[];
    projects: PageRow[];
}

// --- SKELETON ---
function CardSkeleton() {
    return (
        <div className="h-64 border border-ink/10 rounded-xl p-4 flex flex-col gap-4">
            <div className="h-6 w-full bg-ink/5 rounded" />
            <div className="h-10 w-10 bg-ink/5 rounded" />
            <div className="h-6 w-3/4 bg-ink/5 rounded" />
            <div className="mt-auto h-4 w-1/2 bg-ink/5 rounded" />
        </div>
    )
}

// --- CLIENT COMPONENT ---
export default function HomeClient({ labs, projects }: HomeClientProps) {
    const { dir, isLoading } = useLanguage();

    return (
        <main className="min-h-screen pt-24 pb-20 bg-paper relative" dir={dir}>

            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                style={{ backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
            />

            {/* 1. HERO - THE MANIFESTO OF OPENNESS */}
            <section className="w-full mb-0 flex flex-col items-center justify-center text-center px-6 relative z-10 min-h-[60vh]">

                {/* HERO BACKGROUND: DATA STREAM */}
                <div className="absolute inset-x-0 -top-20 bottom-0 z-0 opacity-100 pointer-events-auto">
                    <DataStreamHero className="w-full h-full" />
                </div>

                {/* HERO TEXT */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 mt-12"
                >
                    <h1 className="font-serif text-7xl md:text-[10rem] text-ink leading-[0.85] tracking-tighter mb-6 mix-blend-difference">
                        Reject the <span className="text-accent italic">status quo</span><span className="text-accent">.</span>
                    </h1>
                    <p className="font-mono text-xs md:text-sm text-ink/60 uppercase tracking-[0.2em] max-w-xl mx-auto mb-10">
                        Data Science. Free. Forever.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/lab" className="group relative px-8 py-3 bg-ink text-paper rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors duration-300 shadow-xl overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                                Start Learning <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                    </div>
                </motion.div>
            </section>

            {/* 3. TECH STACK RIVER */}
            <TechStackRiver />



            {/* 4. THE CURRICULUM GRID */}
            <section className="w-full max-w-7xl mx-auto px-6 mb-24">

                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="font-serif text-4xl text-ink mb-2">Deployed Modules</h2>
                        <p className="font-mono text-xs text-ink/40 uppercase tracking-widest">Core Curriculum Status</p>
                    </div>
                    <Link href="/lab" className="text-xs font-mono text-ink/40 hover:text-accent border-b border-transparent hover:border-accent transition-all uppercase tracking-widest pb-1 flex items-center gap-2">
                        Full Index <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                    ) : (
                        labs.map((lab) => {
                            const IconComp = (LucideIcons as any)[lab.icon_name] || Microscope;
                            return (
                                <CodexCard
                                    key={lab.id}
                                    icon={IconComp}
                                    href={lab.slug}
                                    {...lab}
                                />
                            );
                        })
                    )}
                </div>

            </section>

            {/* 5. THE CASE STUDIES */}
            <section className="w-full max-w-7xl mx-auto px-6 mb-32">

                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="font-serif text-4xl text-ink mb-2">Live Deployments</h2>
                        <p className="font-mono text-xs text-ink/40 uppercase tracking-widest">Real-World Case Studies</p>
                    </div>
                    <Link href="/projects" className="text-xs font-mono text-ink/40 hover:text-accent border-b border-transparent hover:border-accent transition-all uppercase tracking-widest pb-1 flex items-center gap-2">
                        All Files <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {isLoading ? (
                        Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)
                    ) : (
                        projects.map((proj) => {
                            const IconComp = (LucideIcons as any)[proj.icon_name] || Activity;
                            return (
                                <CodexCard
                                    key={proj.id}
                                    icon={IconComp}
                                    href={proj.slug}
                                    {...proj}
                                />
                            );
                        })
                    )}
                </div>

            </section>

        </main>
    );
}
