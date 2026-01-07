"use client";

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div 
      className={`
        relative overflow-hidden rounded-md bg-ink/5 
        before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] 
        before:bg-gradient-to-r before:from-transparent before:via-ink/5 before:to-transparent
        ${className}
      `}
    />
  );
}