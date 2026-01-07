// Footer.tsx - CMS Version
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Github, Code2, ChevronUp, FlaskConical, BookOpen, Activity, Layout, LucideIcon, Download, Globe } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Logo from './Logo';
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from '@/lib/supabase';


// Helper to resolve icon string to component
const getIcon = (name: string | null): LucideIcon => {
  if (!name) return Activity;
  // @ts-ignore
  return LucideIcons[name] || Activity;
};

interface FooterLink {
  slug: string;
  title: string;
  category_label: string; // 'Platform' | 'Research'
  icon_name: string | null;
}

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();





  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };



  return (
    <footer className="w-full bg-paper border-t border-ink/10 py-12 transition-colors duration-500 relative overflow-hidden font-serif">

      {/* 1. BACKGROUND WATERMARK */}
      <div className="absolute -right-12 -bottom-24 opacity-[0.03] pointer-events-none rotate-[-15deg] z-0">
        <Logo size={400} />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">

          {/* LEFT: BRAND IDENTITY */}
          <div className="flex flex-col items-start gap-6 max-w-lg">
            <Link href="/" className="group flex items-center gap-3">
              <Logo size={32} />
              <span className="font-serif text-2xl font-bold tracking-tight text-ink group-hover:text-accent transition-colors">
                The Null Hypothesis<span className="text-accent">.</span>
              </span>
            </Link>

            <p className="font-serif text-lg text-ink/60 leading-relaxed">
              {t('hero.description') || "Where rigorous statistics and fluid design converge to build the architecture of insight."}
            </p>
          </div>

          {/* RIGHT: INDEX */}
          <div className="flex flex-col md:items-end gap-6 min-w-[200px]">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-ink/40 text-right">
              Index
            </h4>
            <ul className="space-y-3 md:text-right">
              <li>
                <Link href="/" className="group inline-flex items-center gap-2 text-base text-ink/70 hover:text-accent transition-colors">
                  Home
                  <Layout className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/lab" className="group inline-flex items-center gap-2 text-base text-ink/70 hover:text-accent transition-colors">
                  Labs
                  <FlaskConical className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/projects" className="group inline-flex items-center gap-2 text-base text-ink/70 hover:text-accent transition-colors">
                  Case Files
                  <Activity className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* 2. THE TECHNICAL FOOTER */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-ink/5 gap-4">

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="font-mono text-xs text-ink/40 uppercase tracking-widest">
              &copy; {currentYear} All Rights Reserved. Created by <a href="https://ezzio.netlify.app" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors border-b border-transparent hover:border-accent">Ezz Eldin Ahmed</a>.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={scrollToTop}
              className="p-2 border border-ink/10 rounded-full hover:bg-ink hover:text-paper transition-all group"
              aria-label="Back to top"
            >
              <ChevronUp className="w-4 h-4 text-ink/40 group-hover:text-paper" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}