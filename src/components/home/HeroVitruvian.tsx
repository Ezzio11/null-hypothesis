"use client";

import { useState, useEffect, useRef } from "react";

export default function HeroVitruvian() {
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
      className="w-[500px] h-[500px] md:w-[600px] md:h-[600px] pointer-events-none select-none"
      style={{
        maskImage: `radial-gradient(circle 250px at ${maskPosition.x}px ${maskPosition.y}px, black 20%, transparent 80%)`,
        WebkitMaskImage: `radial-gradient(circle 250px at ${maskPosition.x}px ${maskPosition.y}px, black 20%, transparent 80%)`,
      }}
    >
      <div 
        className="w-full h-full bg-accent opacity-20 dark:opacity-20 transition-colors duration-700"
        style={{
          maskImage: `url("/vitruvian.svg")`,
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskImage: `url("/vitruvian.svg")`,
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
        }}
      />
    </div>
  );
}