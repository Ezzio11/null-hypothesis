// src/components/PageHeader.tsx
"use client";

import { ReactNode } from "react";
import { ArrowLeft, Github, Download, Printer } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface PageHeaderProps {
  backHref: string;
  backLabel?: string;
  category: {
    label: string;
    icon: ReactNode; // <--- CHANGED: Accepts a rendered element (e.g. <Database />)
    color?: string;
  };
  title: string;
  tagline?: string;
  actions?: {
    source?: {
      href: string;
      label?: string;
    };
    pdf?: {
      href: string;
      label?: string;
      onClick?: () => void;
    };
    print?: {
      onClick: () => void;
      label?: string;
    };
  };
  isActionLoading?: boolean;
}

export default function PageHeader({
  backHref,
  backLabel,
  category,
  title,
  tagline,
  actions,
  isActionLoading = false,
}: PageHeaderProps) {
  const { t } = useLanguage();

  // We no longer extract "Icon" here because we expect a ReactNode
  const categoryColor = category.color || "text-accent";

  // Class to apply to buttons when loading
  const loadingClass = isActionLoading ? 'opacity-50 pointer-events-none animate-pulse' : '';

  return (
    <header className="mb-16 border-b border-ink/10 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-xs font-mono text-ink/50 hover:text-ink transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-3 h-3 rtl:rotate-180" />
          {backLabel || t('nav.back_to_archive') || "Return to Archive"}
        </Link>

        {/* ACTIONS */}
        {actions && (actions.source || actions.pdf || actions.print) && (
          <div className="flex gap-3 w-full md:w-auto">
            {actions.source && (
              <a
                href={actions.source.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-full border border-ink/10 hover:bg-ink/5 transition-all text-xs font-mono uppercase tracking-widest text-ink/70 ${loadingClass}`}
                onClick={(e) => { if (isActionLoading) e.preventDefault(); }}
              >
                <Github className="w-3 h-3" /> {actions.source.label || t('common.source') || "Source"}
              </a>
            )}
            {actions.pdf && (
              <a
                href={actions.pdf.href}
                download={actions.pdf.href.startsWith('#') ? undefined : true}
                onClick={(e) => {
                  if (isActionLoading) {
                    e.preventDefault();
                    return;
                  }
                  if (actions.pdf?.onClick) {
                    actions.pdf.onClick();
                  }
                }}
                className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-paper hover:bg-accent transition-all text-xs font-mono uppercase tracking-widest ${loadingClass}`}
              >
                <Download className="w-3 h-3" /> {actions.pdf.label || t('common.pdf') || "PDF"}
              </a>
            )}
            {actions.print && (
              <button
                onClick={actions.print.onClick}
                disabled={isActionLoading}
                className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-full border border-ink/10 hover:bg-ink/5 transition-all text-xs font-mono uppercase tracking-widest text-ink/70 ${loadingClass}`}
              >
                <Printer className="w-3 h-3" /> {actions.print.label || t('common.print') || "Print"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <span className={`font-mono text-xs ${categoryColor} uppercase tracking-widest flex items-center gap-2 mb-4`}>
            {/* RENDER THE ICON DIRECTLY */}
            {category.icon}
            {category.label}
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-ink leading-[0.9]">
            {title}
          </h1>
        </div>
        {tagline && (
          <div className="max-w-md text-ink/70 latex-prose italic text-lg md:text-xl text-left md:text-right border-l-2 md:border-l-2 md:rtl:border-l-0 md:rtl:border-r-2 border-accent pl-6 rtl:pr-6">
            "{tagline}"
          </div>
        )}
      </div>
    </header>
  );
}