import { supabase } from '@/lib/supabase';
import { PageRow, SupabasePage } from '@/lib/types';
import HomeClient from "@/components/home/HomeClient";

// --- SERVER COMPONENT ---
export default async function Home() {

  // FETCH DATA (Server-Side)
  const { data: pagesData } = await supabase
    .from('pages')
    .select('slug, title, category_label, icon_name, published_at')
    .or('slug.like.lab/%,slug.like.projects/%')
    .order('published_at', { ascending: false });

  const labs: PageRow[] = [];
  const projects: PageRow[] = [];

  if (pagesData) {
    let labCount = 1;
    let projCount = 1;

    (pagesData as unknown as SupabasePage[]).forEach((page) => {
      const isLab = page.slug.startsWith('lab/');
      const isProj = page.slug.startsWith('projects/');

      const row: PageRow = {
        id: isLab ? `MOD-0${labCount}` : `CASE-0${projCount}`,
        slug: `/${page.slug}`,
        title: page.title,
        category: page.category_label || (isLab ? "Core Module" : "Application"),
        year: new Date(page.published_at).getFullYear().toString(),
        status: "LIVE",
        icon_name: page.icon_name || (isLab ? "Microscope" : "Activity")
      };

      if (isLab && labCount <= 4) { // Show 4 labs
        labs.push(row);
        labCount++;
      } else if (isProj && projCount <= 2) { // Show 2 projects
        projects.push(row);
        projCount++;
      }
    });
  }

  return (
    <HomeClient labs={labs} projects={projects} />
  );
}