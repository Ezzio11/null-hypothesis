import { supabase } from "@/lib/supabase";
import { CompileMDX } from "@/components/mdx/CompileMDX";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { FileText } from "lucide-react";
import { MDXComponents } from "@/components/mdx/MDXComponents";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Justify Your Alpha | Ezz Eldin',
};

export default async function AlphaLabPage() {
  const SLUG = 'lab/alpha'; // Matches your DB slug

  // 1. Fetch Page Data
  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", SLUG)
    .single();

  if (error || !page) {
    console.error("Error fetching page:", error);
    notFound();
  }

  // 2. Parse Meta 
  // We use the 'source_url' meta field to point to the Nature Paper
  const meta = page.meta || {};
  const resources = {
    paper: meta.source_url || "https://www.nature.com/articles/s41562-018-0311-x"
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
            label: page.subtitle || "Meta-Science",
            icon: <FileText className="w-5 h-5" />,
            color: "text-accent"
          }}
          title={page.title}
          tagline={page.description}
          actions={{
            // Special case: We label the source button "Read the Paper"
            source: { 
              href: resources.paper, 
              label: "Read the Paper" 
            },
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