// Preloader.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../layout/Logo";

const LOADING_STEPS = [
  "INITIALIZING CORE...",
  "LOADING ASSETS...",
  "CALIBRATING INSTRUMENTS...",
  "ESTABLISHING CONNECTION...",
  "ACCESS GRANTED."
];

export default function Preloader() {
  // Default to false to avoid flash on server, set true in effect if needed
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState(LOADING_STEPS[0]);

  useEffect(() => {
    // 1. Session Check: Have we met before?
    const hasSeenPreloader = sessionStorage.getItem("ezz-preloader-seen");

    if (hasSeenPreloader) {
      setIsLoading(false);
      return;
    }

    // 2. Lock Scroll
    document.body.style.overflow = "hidden";

    // 3. Cycle Text (The "Boot" Effect)
    let stepIndex = 0;
    const textInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < LOADING_STEPS.length) {
        setLoadingText(LOADING_STEPS[stepIndex]);
      }
    }, 500); // 500ms leads to a smoother read

    // 4. Finish Loading
    // We wait for BOTH a minimum time (for the animation) AND the page to be fully loaded.
    const MINIMUM_TIME = 2500; // 2.5s: The Goldilocks Zone
    const startTime = Date.now();

    const finishLoading = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MINIMUM_TIME - elapsed);

      setTimeout(() => {
        setIsLoading(false);
        document.body.style.overflow = "auto";
        window.scrollTo(0, 0);
        sessionStorage.setItem("ezz-preloader-seen", "true");
        clearInterval(textInterval);
      }, remaining);
    };

    if (document.readyState === "complete") {
      finishLoading();
    } else {
      window.addEventListener("load", finishLoading);
      return () => {
        window.removeEventListener("load", finishLoading);
        clearInterval(textInterval);
        document.body.style.overflow = "auto";
      };
    }

    return () => {
      clearInterval(textInterval);
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="preloader"
          // Exit Animation: A sharper, faster "Snap" upwards
          exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-paper text-ink transition-colors duration-500 cursor-wait"
        >
          {/* Texture Layer */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />

          {/* THE LOGO */}
          <div className="relative z-10 mb-8 w-full max-w-[300px] px-8">
            <Logo fluid />
            {/* Pulse Effect behind logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 2 }}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-4 bg-ink/5 rounded-[100%] blur-xl"
            />
          </div>

          {/* THE STATUS TEXT (Typewriter style) */}
          <motion.div
            key={loadingText} // Triggers animation on text change
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-6" // Fixed height to prevent layout jump
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
              {loadingText}
            </p>
          </motion.div>

          {/* PROGRESS BAR (Visual Candy) */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-ink/5">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "linear" }}
              className="h-full bg-accent"
            />
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}