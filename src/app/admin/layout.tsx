"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Database, Settings, LogOut, Feather, BookOpen, Scroll } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const NAV_ITEMS = [
        { label: "Overview", icon: LayoutDashboard, href: "/admin" },
        { label: "Manuscripts", icon: Scroll, href: "/admin/content" },
        { label: "Assets", icon: Database, href: "/admin/media" },
        { label: "System Config", icon: Settings, href: "/admin/settings" },
    ];

    return (
        <div className="min-h-screen bg-paper text-ink font-serif selection:bg-accent/20">

            {/* SIDEBAR (The Spine) */}
            <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#110F0E] text-[#e5e5e0] flex flex-col z-50 shadow-2xl border-r border-white/5">

                {/* Brand */}
                <div className="h-24 flex items-center px-8 border-b border-white/10 bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-accent/20 flex items-center justify-center border border-accent/40">
                            <Feather className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                            <span className="block font-serif text-xl tracking-wide text-white">Scriptorium</span>
                            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Control Deck</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6 space-y-2">
                    <div className="mb-6 px-3">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">Index</span>
                    </div>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href; // Exact match for now
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center gap-4 px-4 py-3 rounded-sm transition-all duration-300 border-l-2 ${isActive
                                        ? "bg-white/5 border-accent text-accent"
                                        : "border-transparent text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20"
                                    }`}
                            >
                                <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-accent" : "opacity-70"}`} />
                                <span className="font-sans text-sm tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-black/20">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-sm bg-white/5 border border-white/5">
                        <div className="w-6 h-6 rounded-full bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <span className="block font-mono text-[9px] uppercase tracking-widest text-white/40">System Status</span>
                            <span className="block font-sans text-xs text-emerald-400">Nominal</span>
                        </div>
                    </div>

                    <button className="flex items-center gap-3 px-4 py-2 w-full text-sm font-sans text-fire-400 hover:text-fire-300 transition-colors opacity-60 hover:opacity-100">
                        <LogOut className="w-4 h-4" />
                        Abandon Session
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT (The Desk) */}
            <main className="pl-72 min-h-screen relative">
                {/* Noise Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat',
                    }}
                />

                <header className="h-24 border-b border-ink/10 flex items-center justify-between px-10 sticky top-0 z-40 bg-paper/80 backdrop-blur-md">
                    <div>
                        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink/40 mb-1">
                            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long' })}</span>
                            <span>//</span>
                            <span>{new Date().toLocaleTimeString()}</span>
                        </div>
                        <h2 className="font-serif text-2xl text-ink">
                            {pathname === '/admin' ? 'Overview' : pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink/40 hover:text-ink hover:border-ink/30 transition-all bg-paper">
                            <Settings className="w-4 h-4" />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center font-serif italic border border-ink shadow-sm">
                            A
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
