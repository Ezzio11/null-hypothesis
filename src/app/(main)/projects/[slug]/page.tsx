import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ContentRenderer from "@/components/cms/ContentRenderer";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

// Force dynamic rendering (since we want to fetch fresh data)
// OR use ISG with revalidate
export const revalidate = 60; // Revalidate every minute
export const dynamicParams = true; // Allow new paths

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getProject(slug: string) {
    const { data, error } = await supabase
        .from('content_nodes')
        .select('*')
        .eq('slug', slug)
        .eq('type', 'project')
        .eq('published', true)
        .single();

    if (error || !data) return null;
    return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const project = await getProject(slug);
    if (!project) return { title: 'Project Not Found' };

    return {
        title: `${project.title} | The Null Hypothesis`,
        description: project.description,
    };
}

export default async function ProjectPage({ params }: PageProps) {
    const { slug } = await params;
    const project = await getProject(slug);

    if (!project) {
        notFound();
    }

    return (
        <main className="min-h-screen pt-32 pb-24 px-6 bg-paper relative">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <article className="max-w-4xl mx-auto relative z-10">

                {/* Back Link */}
                <Link href="/projects" className="inline-flex items-center gap-2 text-ink/50 hover:text-accent mb-8 transition-colors font-mono text-xs uppercase tracking-widest group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Return to Archive
                </Link>

                {/* Header */}
                <header className="mb-12 border-b border-ink/10 pb-8">
                    <div className="flex flex-wrap gap-4 mb-6">
                        {project.metadata?.tech_stack?.map((tech: string) => (
                            <span key={tech} className="px-3 py-1 rounded-full border border-ink/10 text-xs font-mono text-ink/60">
                                {tech}
                            </span>
                        ))}
                        {/* Fallback if no metadata */}
                        {!project.metadata?.tech_stack && (
                            <span className="px-3 py-1 rounded-full border border-ink/10 text-xs font-mono text-ink/60 flex items-center gap-2">
                                <Tag className="w-3 h-3" /> Case Study
                            </span>
                        )}
                    </div>

                    <h1 className="font-serif text-5xl md:text-7xl text-ink mb-6 leading-tight">
                        {project.title}
                    </h1>

                    <div className="flex items-center gap-6 text-ink/40 font-mono text-xs uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                        </span>
                        <span>//</span>
                        <span>ID: {project.slug.toUpperCase()}</span>
                    </div>
                </header>

                {/* Content Body */}
                <div className="bg-paper border border-ink/5 p-8 md:p-12 rounded-sm shadow-sm">
                    <ContentRenderer content={project.content} />
                </div>

            </article>
        </main>
    )
}
