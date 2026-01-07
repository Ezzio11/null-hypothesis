"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Search, Filter, MoreHorizontal, Edit, Eye, Trash2 } from "lucide-react";

export default function ContentIndexPage() {
    const [nodes, setNodes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("all");

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('content_nodes')
            .select('*')
            .order('updated_at', { ascending: false });

        if (data) setNodes(data);
        setIsLoading(false);
    };

    const filteredNodes = nodes.filter(node => {
        const matchesSearch = node.title.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'all' || node.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-ink mb-2">Manuscripts</h1>
                    <p className="text-ink/60 font-sans text-sm">Manage the Codex archives ({nodes.length} total entries).</p>
                </div>
                <Link
                    href="/admin/content/new"
                    className="flex items-center gap-2 bg-ink text-paper px-6 py-2.5 rounded-sm hover:bg-accent hover:text-white transition-all duration-300 font-sans text-sm tracking-wide shadow-lg shadow-ink/10"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create New</span>
                </Link>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-paper p-4 border border-ink/10 rounded-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title..."
                        className="w-full pl-10 pr-4 py-2 bg-ink/5 border border-transparent focus:border-ink/20 focus:bg-white rounded-sm outline-none transition-all text-sm text-ink placeholder:text-ink/30"
                    />
                </div>
                <div className="flex items-center gap-2 border-l border-ink/10 pl-4">
                    <Filter className="w-4 h-4 text-ink/30" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-transparent text-sm text-ink/60 outline-none cursor-pointer hover:text-ink transition-colors"
                    >
                        <option value="all">All Types</option>
                        <option value="project">Projects</option>
                        <option value="lab_experiment">Laboratory</option>
                        <option value="essay">Essays</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="border border-ink/10 rounded-sm bg-paper overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-ink/5 border-b border-ink/10 text-[10px] font-mono uppercase tracking-widest text-ink/40">
                            <th className="px-6 py-4 font-normal">Title / Slug</th>
                            <th className="px-6 py-4 font-normal">Type</th>
                            <th className="px-6 py-4 font-normal">Status</th>
                            <th className="px-6 py-4 font-normal">Last Updated</th>
                            <th className="px-6 py-4 font-normal text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-ink/40 font-mono text-xs">Loading ledger...</td>
                            </tr>
                        ) : filteredNodes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-ink/40 font-mono text-xs">No manuscripts matching criteria.</td>
                            </tr>
                        ) : filteredNodes.map((node) => (
                            <tr key={node.id} className="group hover:bg-ink/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-serif text-ink">{node.title}</div>
                                    <div className="font-mono text-[10px] text-ink/30">{node.slug}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50 bg-ink/5 px-2 py-1 rounded-sm border border-ink/5">
                                        {node.type === 'lab_experiment' ? 'Experiment' : node.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${node.published
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${node.published ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                                        {node.published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs text-ink/40">
                                        {new Date(node.updated_at).toLocaleDateString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/admin/content/${node.slug}`} className="p-2 border border-ink/10 rounded-sm text-ink/40 hover:text-ink hover:border-ink/30 hover:bg-white transition-all" title="Edit">
                                            <Edit className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
