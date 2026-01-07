"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Trash2, Eye, Grid } from "lucide-react";
import { supabase } from "@/lib/supabase";
import TiptapEditor from "@/components/admin/Editor";
import EditablePageHeader from "@/components/admin/EditablePageHeader";
import Link from "next/link";

interface ContentEditorFormProps {
    initialData?: any;
    isNew?: boolean;
}

export default function ContentEditorForm({ initialData, isNew = false }: ContentEditorFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState(initialData?.content || {});

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        type: initialData?.type || "project",
        description: initialData?.description || "",
        published: initialData?.published || false,
        metadata: initialData?.metadata || { tech_stack: [], status: 'active' }
    });

    const handleSave = async () => {
        setLoading(true);

        let finalSlug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        try {
            const payload = {
                title: formData.title,
                slug: finalSlug,
                type: formData.type,
                description: formData.description,
                content: content,
                published: formData.published,
                metadata: formData.metadata,
                updated_at: new Date().toISOString(),
            };

            if (isNew) {
                const { error } = await supabase.from('content_nodes').insert(payload);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('content_nodes').update(payload).eq('id', initialData.id);
                if (error) throw error;
            }
            router.push(`/admin/content`);
        } catch (e: any) {
            console.error(e);
            alert("Failed to save: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this page?")) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('content_nodes').delete().eq('id', initialData.id);
            if (error) throw error;
            router.push('/admin/content');
        } catch (e: any) {
            alert("Error deleting: " + e.message);
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen pt-12 md:pt-16 pb-40 px-6 bg-paper font-serif relative overflow-hidden transition-colors selection:bg-accent/20">

            {/* Background Texture (Identical to Frontend) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="max-w-6xl mx-auto relative z-10">

                {/* 1. Header Area - Identical Layout */}
                <EditablePageHeader
                    title={formData.title}
                    setTitle={(val) => setFormData({ ...formData, title: val })}
                    description={formData.description}
                    setDescription={(val) => setFormData({ ...formData, description: val })}
                    type={formData.type}
                    setType={(val) => setFormData({ ...formData, type: val })}
                    slug={formData.slug}
                    setSlug={(val) => setFormData({ ...formData, slug: val })}
                    backHref="/admin/content"
                    metadata={formData.metadata}
                />

                {/* 2. Editor Canvas - Seamless Blend */}
                <div className="max-w-none">
                    <TiptapEditor
                        initialContent={content}
                        onChange={setContent}
                        // Removing border/bg to make it truly part of the page
                        className="min-h-[600px] border-none shadow-none bg-transparent"
                    />
                </div>

            </div>

            {/* 3. Floating Action Island (Notion Style) */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-neutral-900/90 backdrop-blur text-white p-2 rounded-full shadow-2xl border border-white/10 transition-transform hover:scale-105">

                <div className="h-4 border-l border-white/20 mx-2" />

                <div className="flex items-center gap-2 px-2">
                    <input
                        type="checkbox"
                        checked={formData.published}
                        onChange={e => setFormData({ ...formData, published: e.target.checked })}
                        className="w-3 h-3 rounded-full border-white/40 bg-transparent checked:bg-emerald-500 appearance-none cursor-pointer ring-1 ring-white/20 checked:ring-emerald-500 transition-all"
                        title="Publish Status"
                    />
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                        {formData.published ? "Live" : "Draft"}
                    </span>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save
                </button>

                {!isNew && (
                    <Link href={`/${formData.type === 'lab_experiment' ? 'lab' : 'projects'}/${formData.slug}`} target="_blank" className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors">
                        <Eye className="w-3 h-3" />
                    </Link>
                )}

                {!isNew && (
                    <button onClick={handleDelete} className="p-2 hover:bg-red-500/20 rounded-full text-white/40 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </div>

        </main>
    );
}
