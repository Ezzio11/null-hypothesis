"use client";

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    baseX: number;
    baseY: number;
    size: number;
    density: number;
    color: string;

    value: string; // The data char

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.vx = (Math.random() - 0.5);
        this.vy = (Math.random() - 0.5);
        this.size = Math.random() * 10 + 8; // Font size
        this.density = (Math.random() * 30) + 1;
        this.color = color;
        this.value = Math.random() > 0.5 ? '1' : '0';
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px "EB Garamond", serif`; // Use serif for academic feel
        ctx.fillText(this.value, this.x, this.y);
    }

    update(mouse: { x: number | null, y: number | null, radius: number }) {
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < mouse.radius) {
                this.x -= directionX;
                this.y -= directionY;
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx / 10;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy / 10;
                }
            }
        } else {
            // Return to base if no mouse
            if (this.x !== this.baseX) { this.x -= (this.x - this.baseX) / 20; }
            if (this.y !== this.baseY) { this.y -= (this.y - this.baseY) / 20; }
        }
    }
}

export default function DataStreamHero({ className }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;

        // Config based on theme (approximate colors as theme variable access in canvas is tricky)
        // Light mode needs to be much darker/stronger to be visible against the paper background
        const particleColor = theme === 'dark' ? 'rgba(224, 220, 211, 0.5)' : 'rgba(31, 29, 27, 0.8)';

        const mouse = {
            x: null as number | null,
            y: null as number | null,
            radius: 150
        };

        const handleResize = () => {
            canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
            canvas.height = canvas.parentElement?.offsetHeight || 400; // Adapt to parent height
            init();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left; // Use clientX/Y for accuracy
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        }

        const init = () => {
            particles = [];
            // Create a grid of points representing "Data"
            const gap = 40; // OPTIMIZED: Increased from 20 to 40 to reduce draw calls by ~75%
            for (let y = 0; y < canvas.height; y += gap) {
                for (let x = 0; x < canvas.width; x += gap) {
                    // Randomly skip some to create "sparse data" look
                    if (Math.random() > 0.1) {
                        particles.push(new Particle(x, y, particleColor));
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].draw(ctx);
                particles[i].update(mouse);
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', handleResize);
        canvas.addEventListener('mousemove', handleMouseMove); // Attach to canvas for interaction
        canvas.addEventListener('mouseleave', handleMouseLeave);

        handleResize(); // Init
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <div className={`overflow-hidden relative ${className}`}>
            <canvas ref={canvasRef} className="absolute inset-0 z-10 block" />
        </div>
    );
}
