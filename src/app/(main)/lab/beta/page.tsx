import { supabase } from "@/lib/supabase";
import { CompileMDX } from "@/components/mdx/CompileMDX";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { Layers } from "lucide-react";
import { MDXComponents } from "@/components/mdx/MDXComponents";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'The Shape Shifter | Ezz Eldin',
};

export default async function BetaLabPage() {
  const SLUG = 'lab/beta';

  // 1. Fetch
  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", SLUG)
    .single();

  if (error || !page) {
    console.error("Error fetching page:", error);
    notFound();
  }

  // 2. Meta Parsing
  const meta = page.meta || {};
  const resources = {
    source: meta.source_url || "https://github.com/Ezzioll",
    pdf: meta.pdf_url || "/docs/Probability_Project.pdf"
  };

  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-20 px-6 bg-paper font-serif relative overflow-hidden">
      
      {/* Background Texture */}
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
            label: page.subtitle || "Probability Theory",
            icon: <Layers className="w-5 h-5" />,
            color: "text-accent"
          }}
          title={page.title}
          tagline={page.description}
          actions={{
            source: { href: resources.source, label: "Source Code" },
            pdf: { href: resources.pdf, label: "Download Paper" },
          }}
        />

        {/* 3. The Content Engine */}
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