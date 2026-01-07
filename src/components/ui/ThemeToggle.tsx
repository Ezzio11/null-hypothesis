"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full text-ink hover:bg-ink/5 transition-all duration-300 group"
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? (
        <Moon className="w-5 h-5 group-hover:text-accent transition-colors" />
      ) : (
        <Sun className="w-5 h-5 group-hover:text-accent transition-colors" />
      )}
    </button>
  );
}