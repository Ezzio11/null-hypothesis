import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "@/components/ui/Skeleton";
import { Activity } from "lucide-react";

interface DraftingBoardProps {
    isLoading: boolean;
    hoveredId: string;
    activeAssets: { color: string, schematic: React.ReactNode };
    t: any;
}

export function MonitorSkeleton() {
    return (
        <div className="sticky top-32 w-full aspect-[4/5] bg-paper border border-ink/10 rounded-sm p-4 relative">
            <div className="absolute inset-0 bg-ink/5 mix-blend-multiply opacity-20" />
            <div className="relative h-full border-2 border-double border-ink/10 p-4 flex flex-col items-center justify-center">
                <Skeleton className="w-3/4 h-3/4 rounded-full opacity-20" />
            </div>
        </div>
    );
}

export default function DraftingBoard({ isLoading, hoveredId, activeAssets, t }: DraftingBoardProps) {
    if (isLoading) return <MonitorSkeleton />;

    return (
        <div className="sticky top-32 w-full aspect-[4/5] bg-paper relative shadow-2xl transition-all duration-700 group">

            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply" />

            {/* "Board" Border - Double Ink Line */}
            <div className="absolute inset-2 border-2 border-double border-ink/20 pointer-events-none lg:inset-4" />

            {/* Corner Pins/Tape */}
            <div className="absolute top-4 left-4 w-12 h-4 bg-ink/5 -rotate-45 transform origin-center mix-blend-multiply" />
            <div className="absolute bottom-4 right-4 w-12 h-4 bg-ink/5 -rotate-45 transform origin-center mix-blend-multiply" />

            {/* Main Drawing Area */}
            <div className="relative w-full h-full flex flex-col p-8 lg:p-12">

                {/* Header Scribbles */}
                <div className="flex justify-between items-end border-b border-ink/10 pb-4 mb-4">
                    <div className="flex flex-col">
                        <span className="font-serif italic text-2xl text-ink">
                            Plate {hoveredId ? hoveredId.substring(0, 2).toUpperCase() : "00"}
                        </span>
                        <span className="font-mono text-[9px] text-ink/40 uppercase tracking-widest mt-1">
                            Subject: {activeAssets.color ? hoveredId : "Pending"}
                        </span>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-ink/20' : 'bg-accent animate-pulse'}`} />
                    </div>
                </div>

                {/* The Sketch/Schematic */}
                <div className="flex-1 relative flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={hoveredId}
                            initial={{ opacity: 0, scale: 0.95, filter: "blur(2px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 1.05, filter: "blur(2px)" }}
                            transition={{ duration: 0.6, ease: "anticipate" }}
                            className={`w-full h-full flex items-center justify-center`}
                        >
                            {/* Create a container that forces the schematic SVG to inherit 'currentColor' */}
                            {/* FIX: Use text-black for absolute maximum contrast in light mode. Removed mix-blend which might be hiding it. */}
                            <div className={`w-full h-full text-ink [&>svg]:drop-shadow-sm`}>
                                {activeAssets.schematic}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Grid Lines for "Drafting" effect */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-10"
                        style={{
                            backgroundImage: `linear-gradient(var(--color-ink) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--color-ink) 0.5px, transparent 0.5px)`,
                            backgroundSize: '20px 20px'
                        }}
                    />
                </div>

                {/* Footer Metadata */}
                <div className="mt-4 pt-4 border-t border-ink/10 flex justify-between items-center font-mono text-[9px] text-ink/40">
                    <span>REF: {new Date().getFullYear()}-{hoveredId.length}</span>
                    <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" /> LIVE FEED
                    </span>
                </div>

            </div>
        </div>
    );
}
