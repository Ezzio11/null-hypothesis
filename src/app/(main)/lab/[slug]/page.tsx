import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ContentRenderer from "@/components/cms/ContentRenderer";
import { ArrowLeft, Microscope, Activity } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getExperiment(slug: string) {
    const { data, error } = await supabase
        .from('content_nodes')
        .select('*')
        .eq('slug', slug)
        .eq('type', 'lab_experiment')
        .eq('published', true)
        .single();

    if (error || !data) return null;
    return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const exp = await getExperiment(slug);
    if (!exp) return { title: 'Experiment Not Found' };

    return {
        title: `${exp.title} | Laboratory`,
        description: exp.description,
    };
}

export default async function LabPage({ params }: PageProps) {
    const { slug } = await params;
    const exp = await getExperiment(slug);

    if (!exp) {
        notFound();
    }

    return (
        <main className="min-h-screen pt-32 pb-24 px-6 bg-paper relative font-serif">
            {/* Lab Grid Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0"
                style={{
                    backgroundImage: `linear-gradient(var(--color-ink) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--color-ink) 0.5px, transparent 0.5px)`,
                    backgroundSize: '20px 20px'
                }}
            />

            <article className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Meta & Nav */}
                <div className="lg:col-span-3 flex flex-col gap-8">
                    <Link href="/lab" className="inline-flex items-center gap-2 text-ink/50 hover:text-accent transition-colors font-mono text-xs uppercase tracking-widest group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Lab
                    </Link>

                    <div className="p-6 border-2 border-double border-ink/10 bg-paper relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-ink/20" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-ink/20" />

                        <h3 className="font-mono text-xs uppercase tracking-widest text-ink/40 mb-4">Properties</h3>

                        <div className="space-y-4 font-mono text-xs text-ink/70">
                            <div>
                                <span className="block text-ink/30 mb-1">Status</span>
                                <span className="flex items-center gap-2 text-accent">
                                    <Activity className="w-3 h-3" /> Active
                                </span>
                            </div>
                            <div>
                                <span className="block text-ink/30 mb-1">ID Code</span>
                                <span>{exp.slug.substring(0, 6).toUpperCase()}</span>
                            </div>
                            <div>
                                <span className="block text-ink/30 mb-1">Date</span>
                                <span>{new Date(exp.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="lg:col-span-9">
                    <header className="mb-12 border-b border-ink/10 pb-8">
                        <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-widest mb-4">
                            <Microscope className="w-4 h-4" />
                            Experiment Log
                        </div>
                        <h1 className="font-serif text-5xl md:text-6xl text-ink leading-tight">
                            {exp.title}
                        </h1>
                        {exp.description && (
                            <p className="mt-4 text-xl text-ink/60 italic leading-relaxed max-w-2xl">
                                {exp.description}
                            </p>
                        )}
                    </header>

                    <div className="prose prose-lg prose-ink max-w-none">
                        <ContentRenderer content={exp.content} />
                    </div>
                </div>

            </article>
        </main>
    )
}
