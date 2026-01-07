"use client";

import Link from "next/link";
import { Plus, Newspaper, Activity, Clock, ArrowUpRight, Search } from "lucide-react";
// import { Toaster } from 'sonner';

export default function AdminDashboard() {

    const STATS = [
        { label: "Total Manuscripts", value: "12", sub: "Archived", change: "+2 this week", icon: Newspaper },
        { label: "Traffic Volume", value: "2.4k", sub: "Visitors", change: "+12% vs last cycle", icon: Activity },
        { label: "System Uptime", value: "99.9%", sub: "Nominal", change: "No anomalies", icon: Clock },
    ];

    return (
        <div className="space-y-12">
            {/* <Toaster position="bottom-right" theme="dark" /> */}

            {/* Quick Actions */}
            <div className="flex items-center justify-between">
                <div className="max-w-xl">
                    <h3 className="font-serif text-3xl text-ink mb-2">Welcome, Architect.</h3>
                    <p className="text-ink/60 font-sans text-sm leading-relaxed">
                        The archives are stable. There are 2 pending drafts requiring your attention.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30 group-focus-within:text-ink/60 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search archives..."
                            className="pl-10 pr-4 py-2.5 bg-transparent border border-ink/20 rounded-sm w-64 text-sm font-sans focus:outline-none focus:border-ink/50 focus:bg-ink/5 transition-all placeholder:text-ink/30 text-ink"
                        />
                    </div>
                    <Link
                        href="/admin/content/new"
                        className="flex items-center gap-2 bg-ink text-paper px-6 py-2.5 rounded-sm hover:bg-accent hover:text-white transition-all duration-300 font-sans text-sm tracking-wide shadow-lg shadow-ink/10"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Manuscript</span>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STATS.map((stat, i) => (
                    <div key={i} className="group p-6 bg-paper border border-ink/10 rounded-sm hover:border-ink/30 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <stat.icon className="w-24 h-24 text-ink" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 text-ink/40">
                                <stat.icon className="w-4 h-4" />
                                <span className="font-mono text-[10px] uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="font-serif text-5xl text-ink">{stat.value}</span>
                                <span className="font-sans text-sm text-ink/40">{stat.sub}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-sm border border-emerald-100">
                                <ArrowUpRight className="w-3 h-3" />
                                {stat.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Ledger */}
            <div className="border border-ink/10 rounded-sm bg-paper overflow-hidden">
                <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between bg-ink/5">
                    <h3 className="font-serif text-lg text-ink">Recent Transmissions</h3>
                    <button className="text-[10px] font-mono uppercase tracking-widest text-ink/40 hover:text-ink transition-colors">View All Logs</button>
                </div>

                <div className="divide-y divide-ink/5">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-ink/[0.02] transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink/40 font-serif italic border border-ink/10">
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="font-serif text-ink group-hover:text-accent transition-colors">Project Alpha / Phase {i + 1}</p>
                                    <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest">Edited by Architect • 2h ago</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest border border-ink/10 rounded-sm text-ink/40">
                                    Draft
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
