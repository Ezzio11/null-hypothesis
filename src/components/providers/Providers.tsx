"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";


export function Providers({ children }: { children: React.ReactNode }) {
  // Fix hydration mismatch by only rendering after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}