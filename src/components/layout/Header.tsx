"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react"; // Icons for mobile toggle
import { ThemeToggle } from "../ui/ThemeToggle";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import Logo from "./Logo";
import { useLanguage } from "@/contexts/LanguageContext";


export default function Header() {
  const { t } = useLanguage();
  const [isMobileOpen, setIsMobileOpen] = useState(false);



  // Close mobile menu when a link is clicked
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex justify-center py-4 px-4 w-full">
      <div className="relative flex items-center justify-between px-6 py-3 rounded-full bg-paper/90 backdrop-blur-md border border-ink/5 shadow-sm w-full max-w-5xl z-50">

        {/* 1. LOGO IDENTITY */}
        <Link href="/" className="group flex items-center gap-3 text-ink hover:text-accent transition-colors duration-300" onClick={closeMobile}>
          <div className="flex items-center justify-center w-8 h-8 text-current">
            <Logo size={30} />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-current">
            The Null Hypothesis
          </span>
        </Link>

        {/* 2. DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/lab">Labs</NavLink>
          <NavLink href="/projects">Case Files</NavLink>
        </nav>

        {/* 3. ACTIONS (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* 4. MOBILE TOGGLE */}
        <button
          className="md:hidden p-2 text-ink hover:bg-ink/5 rounded-full"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 5. MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-20 left-4 right-4 bg-paper/95 backdrop-blur-xl border border-ink/10 rounded-2xl p-6 shadow-2xl md:hidden flex flex-col gap-6 z-40 origin-top"
          >
            <nav className="flex flex-col space-y-4">
              <MobileLink href="/" onClick={closeMobile}>Home</MobileLink>
              <MobileLink href="/lab" onClick={closeMobile}>Labs</MobileLink>
              <MobileLink href="/projects" onClick={closeMobile}>Case Files</MobileLink>
            </nav>

            <div className="h-[1px] bg-ink/5 w-full" />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <span className="text-xs font-mono uppercase text-ink/60">Theme</span>
              </div>
              <LanguageSwitcher />
            </div>


          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// Helper for Desktop Links
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="relative group py-2">
      <span className="font-serif text-lg font-medium text-ink/80 hover:text-ink transition-colors">
        {children}
      </span>
      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

// Helper for Mobile Links
function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-2xl font-serif text-ink hover:text-accent transition-colors"
    >
      {children}
    </Link>
  );
}