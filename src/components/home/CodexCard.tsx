"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CodexCardProps {
    id: string;
    title: string;
    category: string;
    year: string;
    href: string;
    icon: any;
    status?: string;
}

export default function CodexCard({ id, title, category, year, href, icon: Icon, status = "Ready" }: CodexCardProps) {
    return (
        <Link href={href} className="group relative block h-full">

            {/* PAPER BACKGROUND w/ TEXTURE */}
            <div className="absolute inset-0 bg-paper rounded-sm shadow-sm transition-transform duration-500 group-hover:scale-[1.02] group-hover:rotate-1 z-0 border border-ink/10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`
                }}
            />

            {/* CONTENT CONTAINER */}
            <div className="relative z-10 p-6 h-full flex flex-col items-center text-center border-double border-4 border-transparent group-hover:border-ink/5 transition-all duration-500 rounded-sm">

                {/* DECORATIVE CORNERS (The "Flourish") */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-ink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-ink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-ink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-ink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* HEADER: FIG. NO */}
                <span className="font-serif italic text-ink/40 text-sm mb-6">{id.replace('MOD-', 'Fig. ').replace('CASE-', 'Plate ')}</span>

                {/* ICON AS "INK SKETCH" */}
                <div className="mb-6 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                    <Icon strokeWidth={1} className="w-12 h-12 text-ink" />
                </div>

                {/* TITLE TYPOGRAPHY */}
                <h3 className="font-serif text-3xl text-ink leading-[0.9] italic mb-3 group-hover:text-accent transition-colors duration-300">
                    {title}
                </h3>

                {/* CATEGORY LABEL */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="h-[1px] w-4 bg-ink/20" />
                    <span className="font-mono text-[10px] text-ink/50 uppercase tracking-widest">{category}</span>
                    <div className="h-[1px] w-4 bg-ink/20" />
                </div>

                {/* FOOTER METADATA */}
                <div className="mt-auto flex flex-col items-center gap-2 opactiy-60">
                    <span className="font-serif italic text-xs text-ink/40">Anno {year}</span>
                    {status === 'LIVE' && (
                        <span className="font-mono text-[9px] text-emerald-600/60 uppercase tracking-widest border border-emerald-900/10 px-2 py-0.5 rounded-full">
                            Verified
                        </span>
                    )}
                </div>

            </div>
        </Link>
    );
}
