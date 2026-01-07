"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RefreshCw, Settings2, Activity } from "lucide-react";
import Latex from "react-latex-next";
import { useLanguage } from "@/contexts/LanguageContext"; // Use translations

export default function ReservoirSimulation() {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reservoir, setReservoir] = useState<{ id: number; color: string }[]>([]);
  const [count, setCount] = useState(0);
  
  // Interactive Variables
  const [k, setK] = useState(5); // Reservoir Size
  const [speed, setSpeed] = useState(1); // Simulation Speed

  // --- CANVAS RESIZING ---
  // Ensure canvas fits container width on mobile
  const [width, setWidth] = useState(800);
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize(); // Initial call
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: { x: number; y: number; id: number; color: string }[] = [];
    let streamCount = count;
    let currentReservoir = [...reservoir];

    const COLORS = ["#C17D5D", "#4A5568", "#059669", "#D97706"];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isPlaying && Math.random() > (1 - speed * 0.05)) {
        streamCount++;
        setCount(streamCount);
        
        const id = streamCount;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        // ALGORITHM LOGIC
        if (currentReservoir.length < k) {
          currentReservoir.push({ id, color });
          setReservoir([...currentReservoir]);
        } 
        else {
          const j = Math.floor(Math.random() * streamCount);
          if (j < k) {
            currentReservoir[j] = { id, color };
            setReservoir([...currentReservoir]);
          }
        }

        particles.push({
          x: -20,
          y: canvas.height / 2 + (Math.random() - 0.5) * 80, 
          id,
          color
        });
      }

      particles.forEach((p) => {
        p.x += 3 * speed;
        const inReservoir = currentReservoir.some(r => r.id === p.id);
        
        ctx.globalAlpha = inReservoir ? 1 : 0.15;
        ctx.fillStyle = p.color;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, inReservoir ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (inReservoir) {
           ctx.fillStyle = "grey"; // Simplified color for contrast
           ctx.font = "10px monospace"; 
           ctx.fillText(p.id.toString(), p.x - 5, p.y - 10);
        }
      });

      particles = particles.filter(p => p.x < canvas.width + 50);
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, k, speed, width]); // Added 'width' to dependency

  const probability = count > 0 ? (k / count).toFixed(4) : "1.0000";

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
      
      {/* --- 1. CONTROL PANEL --- */}
      <div className="bg-paper border border-ink/10 rounded-xl p-6 flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-8 border-b border-ink/10 pb-4">
            <Settings2 className="w-4 h-4 text-accent" />
            <h3 className="font-serif text-lg text-ink">{t('sampling.tool.controls') || "System Controls"}</h3>
          </div>

          {/* Slider: Size */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-mono mb-3 uppercase tracking-widest text-ink/60">
              <span>{t('sampling.control.size') || "Reservoir Size (k)"}</span>
              <span className="text-ink font-bold">{k}</span>
            </div>
            <input 
              type="range" min="1" max="20" value={k} 
              onChange={(e) => { 
                setK(Number(e.target.value)); 
                setReservoir([]); 
                setCount(0);
                setIsPlaying(false);
              }}
              className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>

          {/* Slider: Speed */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-mono mb-3 uppercase tracking-widest text-ink/60">
              <span>{t('sampling.control.velocity') || "Stream Velocity"}</span>
              <span className="text-ink font-bold">{speed}x</span>
            </div>
            <input 
              type="range" min="0.5" max="3" step="0.1" value={speed} 
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full h-1.5 bg-ink/10 rounded-lg appearance-none cursor-pointer accent-ink"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-mono text-xs uppercase tracking-widest border ${
              isPlaying 
                ? "bg-paper border-ink text-ink hover:bg-ink/5" 
                : "bg-ink border-ink text-paper hover:bg-accent hover:border-accent"
            }`}
          >
            {isPlaying ? <><Pause className="w-3 h-3" /> {t('common.pause') || "Pause"}</> : <><Play className="w-3 h-3" /> {t('common.initiate') || "Initiate"}</>}
          </button>
          <button 
            onClick={() => { setIsPlaying(false); setCount(0); setReservoir([]); }}
            className="p-3 border border-ink/10 rounded-lg hover:bg-ink/5 transition-colors text-ink/60 hover:text-ink"
            title="Reset System"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>


      {/* --- 2. VISUALIZATION --- */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Math Monitor */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-ink/5 rounded-xl p-4 border border-ink/5 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-ink/40 uppercase tracking-widest mb-1">{t('sampling.logic') || "Algorithm Logic"}</span>
              <div className="text-ink font-serif text-lg" dir="ltr">
                 <Latex>{`$$P = \\frac{k}{n}$$`}</Latex>
              </div>
           </div>
           <div className="bg-ink/5 rounded-xl p-4 border border-ink/5 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-ink/40 uppercase tracking-widest mb-1 flex items-center gap-2">
                 <Activity className="w-3 h-3"/> {t('sampling.prob') || "Live Probability"}
              </span>
              <span className="text-3xl font-mono text-accent tracking-tight">
                {probability}
              </span>
           </div>
        </div>

        {/* Canvas Container (Responsive) */}
        <div ref={containerRef} className="relative h-56 bg-paper border border-ink/10 rounded-xl overflow-hidden shadow-inner w-full">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: `radial-gradient(circle, var(--color-ink) 1px, transparent 1px)`, backgroundSize: '20px 20px' }} 
          />
          
          <canvas ref={canvasRef} width={width} height={224} className="w-full h-full relative z-10 block" />
          
          <div className="absolute top-3 left-3 bg-paper/80 backdrop-blur px-2 py-1 text-[10px] font-mono text-ink/50 border border-ink/10 rounded">
            STREAM: {count}
          </div>
        </div>

        {/* Bucket */}
        <div className="bg-card border border-ink/10 rounded-xl p-6">
          <span className="text-[10px] font-mono text-ink/40 uppercase tracking-widest block mb-4">
            {t('sampling.bucket.status') || "Reservoir Status"} (Capacity: {k})
          </span>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: k }).map((_, i) => {
              const item = reservoir[i];
              return (
                <div 
                  key={i} 
                  className="w-10 h-10 md:w-12 md:h-12 rounded border border-dashed border-ink/20 flex items-center justify-center bg-paper relative transition-all overflow-hidden"
                  style={{ borderColor: item ? item.color : '' }}
                >
                  {item ? (
                    <div className="font-mono text-sm md:text-base font-bold text-ink animate-in zoom-in duration-300" style={{ color: item.color }}>
                      {item.id}
                    </div>
                  ) : (
                    <span className="text-ink/10 text-xs font-serif italic">Null</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}