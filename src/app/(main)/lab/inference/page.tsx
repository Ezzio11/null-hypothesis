import { supabase } from "@/lib/supabase";
import { CompileMDX } from "@/components/mdx/CompileMDX";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { Activity } from "lucide-react"; 
import { MDXComponents } from "@/components/mdx/MDXComponents";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'The Crisis of Significance | Ezz Eldin',
};

export default async function InferenceLabPage() {
  const SLUG = 'lab/inference';

  // 1. Fetch Page Content
  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", SLUG)
    .single();

  if (error || !page) {
    console.error("Error fetching page:", error);
    notFound();
  }

  // 2. Prepare Meta & Resources
  const meta = page.meta || {};
  const resources = {
    source: meta.source_url || "https://github.com/Ezzio11/Statistical-Inference-Project",
    pdf: meta.pdf_url || "https://github.com/Ezzio11/Statistical-Inference-Project/blob/main/paper.pdf"
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
            label: page.subtitle || "Statistical Inference",
            icon: <Activity className="w-5 h-5" />,
            color: "text-accent"
          }}
          title={page.title}
          tagline={page.tagline}
          actions={{
            source: { href: resources.source },
            pdf: { href: resources.pdf },
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