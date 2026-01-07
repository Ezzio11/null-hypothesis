"use client";

import { ArrowLeft, Target, Beaker, BookOpen } from "lucide-react";
import Link from "next/link";

interface EditablePageHeaderProps {
    title: string;
    setTitle: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
    type: string;
    setType: (val: string) => void;
    slug: string;
    setSlug: (val: string) => void;
    backHref: string;
    metadata?: any;
    setMetadata?: (val: any) => void;
}

export default function EditablePageHeader({
    title, setTitle,
    description, setDescription,
    type, setType,
    slug, setSlug,
    backHref,
    metadata, setMetadata
}: EditablePageHeaderProps) {

    // Helper to get icon based on type
    const getIcon = () => {
        switch (type) {
            case 'lab_experiment': return <Beaker className="w-5 h-5" />;
            case 'essay': return <BookOpen className="w-5 h-5" />;
            default: return <Target className="w-5 h-5" />;
        }
    };

    return (
        <header className="mb-16 border-b border-ink/10 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <Link
                    href={backHref}
                    className="inline-flex items-center gap-2 text-xs font-mono text-ink/50 hover:text-ink transition-colors uppercase tracking-widest"
                >
                    <ArrowLeft className="w-3 h-3 rtl:rotate-180" />
                    Return to CMS
                </Link>

                {/* TYPE SELECTOR (Looking like metadata) */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-ink/30">Type:</span>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="bg-transparent text-xs font-mono uppercase tracking-widest text-ink/70 border-none focus:ring-0 cursor-pointer hover:text-ink"
                    >
                        <option value="project">Project</option>
                        <option value="lab_experiment">Lab Experiment</option>
                        <option value="essay">Essay</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex-1">
                    <div className="font-mono text-xs text-accent uppercase tracking-widest flex items-center gap-2 mb-4">
                        {getIcon()}
                        {/* URL SLUG EDIT */}
                        <span className="opacity-50">/</span>
                        <input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="url-slug"
                            className="bg-transparent border-b border-transparent hover:border-accent/30 focus:border-accent focus:outline-none placeholder:text-accent/30 text-accent transition-colors w-full md:w-auto"
                        />
                    </div>

                    {/* EDITABLE TITLE */}
                    <textarea
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Page Title"
                        className="w-full bg-transparent font-serif text-5xl md:text-7xl text-ink leading-[0.9] placeholder:text-ink/20 focus:outline-none resize-none overflow-hidden h-auto"
                        // Auto-resize logic would go here, but focusing on simple layout for now
                        rows={1}
                        style={{ minHeight: '1.2em', height: 'auto' }}
                        onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                        }}
                    />
                </div>

                {/* EDITABLE DESCRIPTION / TAGLINE */}
                <div className="w-full md:w-[400px] border-l-2 border-accent pl-6">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter a brief tagline or description..."
                        className="w-full bg-transparent text-ink/70 italic text-lg md:text-xl text-left md:text-right font-serif placeholder:text-ink/10 focus:outline-none resize-none"
                        rows={3}
                    />
                </div>
            </div>
        </header>
    );
}
