"use client";

import Link from "next/link";
import { ArrowLeft, Ban, Construction, HardHat, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function AcademyIndex() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-6 relative bg-paper overflow-hidden flex flex-col items-center justify-center">

      {/* Background Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-2xl mx-auto text-center relative z-10 p-12 border-2 border-dashed border-ink/10 rounded-2xl bg-paper/50 backdrop-blur-sm">

        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
          className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-ink/10"
        >
          <Construction className="w-8 h-8 text-accent" />
        </motion.div>

        <h1 className="font-serif text-4xl md:text-6xl text-ink mb-6">
          Restricted Sector
        </h1>

        <p className="font-sans text-lg text-ink/60 leading-relaxed mb-8">
          The Department of Education is currently undergoing a complete architectural overhaul.
          We are preparing a rigorous, interactive curriculum for the Arabic data science community.
        </p>

        <div className="flex flex-col items-center gap-4">
          <div className="px-4 py-2 bg-ink/5 rounded-full border border-ink/10 flex items-center gap-3">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="font-mono text-xs text-ink/50 uppercase tracking-widest">
              Estimated Launch: Q1 2026
            </span>
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-ink hover:text-accent transition-colors border-b border-transparent hover:border-accent pb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Base
          </Link>
        </div>

      </div>
    </main>
  );
}