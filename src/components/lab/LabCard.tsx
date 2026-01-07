import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Microscope } from "lucide-react";

import Skeleton from "@/components/ui/Skeleton";

export function LabCardSkeleton() {
    return (
        <div className="relative p-8 border border-ink/10 rounded-sm bg-paper h-full flex flex-col">
            <div className="flex justify-between items-baseline mb-6 border-b border-ink/5 pb-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-24 mb-4" />

            <div className="flex-grow space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
            </div>

            <div className="mt-8 pt-4 border-t border-ink/5 flex justify-between items-center">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    );
}

interface LabCardProps {
    id: string;
    index: number;
    title: string;
    subtitle: string;
    description: string;
    isActive: boolean;
    onHover: (id: string) => void;
    // Re-using the assets prop structure for compatibility, though we might style differently
    assets: { color: string, schematic: React.ReactNode, borderColor: string };
    t: any;
}

export default function LabCard({ id, index, title, subtitle, description, isActive, onHover, assets, t }: LabCardProps) {
    return (
        <Link href={`/lab/${id}`}>
            <motion.div
                onHoverStart={() => onHover(id)}
                className="group relative h-full"
                whileHover={{ scale: 1.01, rotate: 0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {/* Paper Background */}
                <div className={`absolute inset-0 bg-paper transition-colors duration-500 rounded-sm border border-ink/10 ${isActive ? 'shadow-xl scale-[1.02] -rotate-1 z-10' : 'shadow-sm group-hover:shadow-md'}`}>
                    {/* Paper Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply dark:mix-blend-screen" />

                    {/* Corner Flourishes (Codex Style) */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-ink/20 rounded-tl-sm opacity-50" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-ink/20 rounded-br-sm opacity-50" />
                </div>

                {/* Content Container */}
                <div className="relative p-8 h-full flex flex-col z-10">

                    {/* Header Metedata */}
                    <div className="flex justify-between items-baseline mb-6 border-b border-ink/10 pb-2">
                        <span className="font-serif italic text-ink/60 text-sm">
                            Fig. {String(index + 1)}
                        </span>
                        <div className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest transition-colors ${isActive ? "text-accent" : "text-ink/40"}`}>
                            {isActive ? "Observing" : "Indexed"}
                        </div>
                    </div>

                    {/* Title Section */}
                    <div className="mb-4">
                        <h3 className={`font-serif text-3xl text-ink mb-1 group-hover:text-accent transition-colors duration-300`}>
                            {title}
                        </h3>
                        <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest">
                            {subtitle}
                        </p>
                    </div>

                    {/* Description (Always visible now, but stylized) */}
                    <div className="flex-grow">
                        <p className="font-serif text-lg leading-relaxed text-ink/70 line-clamp-3">
                            {description}
                        </p>
                    </div>

                    {/* Footer / CTA */}
                    <div className="mt-8 pt-4 border-t border-ink/5 flex items-center justify-between">
                        <span className="font-mono text-[10px] text-ink/30">
                            ID: {id.toUpperCase()}
                        </span>
                        <motion.div
                            className="flex items-center gap-2 text-xs font-bold font-serif italic text-accent"
                            animate={{ x: isActive ? 5 : 0 }}
                        >
                            {t('lab.cta') || "Examine"} <ArrowRight className="w-3 h-3" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
