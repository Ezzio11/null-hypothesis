import { Archive } from "lucide-react";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import { supabase } from "@/lib/supabase";

// Enable revalidation for fresh content
export const revalidate = 60;

// Legacy IDs for the client to map
const LEGACY_IDS = ["bp", "vix", "dairy"];

export default async function ProjectsPage() {

  // Fetch Dynamic Projects
  const { data: dynamicProjects } = await supabase
    .from('content_nodes')
    .select('*')
    .eq('type', 'project')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 relative bg-paper overflow-x-hidden">

      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">

        <header className="mb-12 border-b border-ink/10 pb-12">
          <span className="font-mono text-xs text-accent uppercase tracking-widest mb-4 flex items-center gap-2">
            <Archive className="w-4 h-4" /> Investigation Log
          </span>
          <h1 className="font-serif text-6xl md:text-8xl text-ink mb-6 leading-[0.9] tracking-tight">
            The Case Files.
          </h1>
          <p className="font-serif text-xl text-ink/70 max-w-2xl leading-relaxed">
            A collection of systems, analyses, and artifacts. Transforming static statistical analysis into living, interactive web experiences.
          </p>
        </header>

        <ProjectsGrid
          dynamicProjects={dynamicProjects || []}
          legacyIds={LEGACY_IDS}
        />

      </div>
    </main>
  );
}