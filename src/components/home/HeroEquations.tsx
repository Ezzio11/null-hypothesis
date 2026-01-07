"use client";

import { useState, useEffect, useRef } from "react";
import Latex from "react-latex-next";
import { motion } from "framer-motion";

const equations = [
  "P(A|B) = \\frac{P(B|A)P(A)}{P(B)}", 
  "f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}(\\frac{x-\\mu}{\\sigma})^2}", 
  "\\theta_{j} := \\theta_{j} - \\alpha \\frac{\\partial}{\\partial \\theta_{j}} J(\\theta)", 
  "\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V", 
];

export default function HeroEquations() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maskPosition, setMaskPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMaskPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-[500px] h-[500px] md:w-[600px] md:h-[600px] flex flex-col justify-around pointer-events-none select-none"
      dir="ltr"
      style={{
        maskImage: `radial-gradient(circle 200px at ${maskPosition.x}px ${maskPosition.y}px, black 40%, transparent 100%)`,
        WebkitMaskImage: `radial-gradient(circle 200px at ${maskPosition.x}px ${maskPosition.y}px, black 40%, transparent 100%)`,
      }}
    >
      {equations.map((eq, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.5, x: 0 }}
          transition={{ delay: 0.5 + index * 0.2, duration: 1 }}
          className="text-center"
        >
          <span className="text-sm md:text-lg text-accent font-serif tracking-widest opacity-60">
            <Latex>{`$$${eq}$$`}</Latex>
          </span>
        </motion.div>
      ))}
    </div>
  );
}