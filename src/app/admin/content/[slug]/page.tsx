import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ContentEditorForm from "@/components/admin/ContentEditorForm";

export const revalidate = 0; // Always fresh for admin editing

export default async function EditContentPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const { data: node } = await supabase
        .from('content_nodes')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!node) {
        return notFound();
    }

    return (
        <ContentEditorForm initialData={node} isNew={false} />
    );
}
