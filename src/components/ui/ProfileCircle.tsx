// ProfileCircle.js - Refactored to fetch profile image from Supabase

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { supabase } from '@/lib/supabase';
const FALLBACK_URL = "/portrait.png";
const ASSET_KEY = "profile_portrait";

export default function ProfileCircle({ className = "" }: { className?: string }) {
  const [profileImageUrl, setProfileImageUrl] = useState<string>(FALLBACK_URL);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCHING LOGIC ---
  const fetchProfileImage = useCallback(async () => {
    try {
        const { data, error } = await supabase
            .from('site_assets')
            .select('asset_url')
            .eq('asset_key', ASSET_KEY)
            .single();

        if (data && data.asset_url) {
            // Success: Use the dynamic URL
            setProfileImageUrl(data.asset_url);
        } else if (error) {
            console.error("Supabase failed to load profile image, using fallback.", error);
        }
    } catch (e) {
        console.error("Critical error fetching profile asset:", e);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileImage();
  }, [fetchProfileImage]);

  // Optionally, return a Skeleton component during loading if required by the design
  if (isLoading) {
    return (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
          className={`relative w-48 h-48 md:w-64 md:h-64 shrink-0 ${className}`}
        >
             {/* You might want to use a Skeleton component here, but for now, we just skip waiting */}
             {/* <Skeleton className="w-full h-full rounded-full" /> */}
        </motion.div>
    );
  }
  // --------------------------

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
      className={`relative w-48 h-48 md:w-64 md:h-64 shrink-0 ${className}`}
    >
      {/* 1. The Organic Image Container */}
      <div className="relative w-full h-full overflow-hidden border-2 border-ink/20 shadow-2xl shadow-ink/10 bg-ink/5 z-10"
           style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }} 
      >
        <Image 
          // --- DYNAMIC SOURCE ---
          src={profileImageUrl} 
          alt="Profile"
          fill
          className="object-cover object-top filter grayscale hover:grayscale-0 transition-all duration-500 ease-in-out scale-110 translate-y-2"
          sizes="(max-width: 768px) 192px, 256px"
          priority
        />
      </div>

      {/* 2. Rotating Ring (Tighter than the image now) */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 border border-dashed border-accent/30 rounded-full pointer-events-none z-0"
      />
      
      {/* 3. Outer Decoration */}
      <div className="absolute -inset-4 border border-ink/5 rounded-full pointer-events-none scale-90" />

    </motion.div>
  );
}