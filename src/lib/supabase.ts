// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Type definitions for your database tables
export type Database = {
  public: {
    Tables: {
      site_content: {
        Row: {
          id: string;
          key: string;
          value_en: string;
          value_ar: string;
          page: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          value_en: string;
          value_ar: string;
          page?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          key?: string;
          value_en?: string;
          value_ar?: string;
          page?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          content_en: string;
          content_ar: string | null;
          meta: { [key: string]: any } | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          subtitle?: string | null;
          description?: string | null;
          content_en: string;
          content_ar?: string | null;
          meta?: { [key: string]: any } | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          subtitle?: string | null;
          description?: string | null;
          content_en?: string;
          content_ar?: string | null;
          meta?: { [key: string]: any } | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };

      // --- ADDED THE UNIFIED 'leo' TABLE ---
      leo: {
        Row: {
          id: string;
          data_key: string;
          display_order: number;
          url: string;
          caption: string | null;
          sub_text: string | null;
          description: string | null;
          metadata: { [key: string]: any } | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          data_key: string;
          display_order: number;
          url: string;
          caption?: string | null;
          sub_text?: string | null;
          description?: string | null;
          metadata?: { [key: string]: any } | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          data_key?: string;
          display_order?: number;
          url?: string;
          caption?: string | null;
          sub_text?: string | null;
          description?: string | null;
          metadata?: { [key: string]: any } | null;
          created_at?: string;
        };
      };
      // Note: The 'translations' table used by i18n.ts is implicitly known or should be added here too if using database generics
      translations: {
        Row: { key: string; text_en: string; text_ar: string; };
        Insert: any;
        Update: any;
      };
    };
  };
};