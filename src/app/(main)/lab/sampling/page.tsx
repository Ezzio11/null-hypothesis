import { supabase } from "@/lib/supabase";
import { CompileMDX } from "@/components/mdx/CompileMDX";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { Database } from "lucide-react";
import { MDXComponents } from "@/components/mdx/MDXComponents";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'The Stream Catcher | Ezz Eldin',
};

export default async function SamplingPage() {
  const SLUG = 'lab/sampling'; // Match your DB

  // 1. Fetch
  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", SLUG)
    .single();

  if (error || !page) notFound();

  // 2. Meta
  const meta = page.meta || {};
  const resources = {
    source: meta.source_url || "https://github.com/Ezzio11/Reservoir-Sampling-Project",
    pdf: meta.pdf_url || "https://github.com/Ezzio11/Reservoir-Sampling-Project/blob/main/paper.pdf"
  };

  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-20 px-6 bg-paper font-serif relative overflow-hidden">
      {/* Background Texture (Preserved from original) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ 
             backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }} 
      />

      <div className="max-w-6xl mx-auto relative z-10">
        
        <PageHeader
          backHref="/lab"
          backLabel="Laboratory Index"
          category={{
            label: page.subtitle || "Algorithm Study: Big Data", 
            icon: <Database className="w-5 h-5" />, 
            color: "text-accent"
          }}
          title={page.title}
          tagline={page.description} 
          actions={{
            source: { href: resources.source, label: "Source Code" },
            pdf: { href: resources.pdf, label: "Download PDF" },
          }}
        />

        {/* 3. Render MDX with Custom Components */}
        <div className="max-w-none">
          <CompileMDX 
            source={page.content_en} 
            components={MDXComponents} 
          />
        </div>

      </div>
    </main>
  );
}