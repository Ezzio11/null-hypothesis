// lib/types.ts

export interface PolymathData {
  qid?: string;
  name: string;
  birth_year: number;
  death_year?: number;
  place_of_birth?: string;
  citizenship?: string;
  gender?: string;
  occupations: string;
  polymath_score_mapped: number;
  birth_decade?: number;
}

export interface Polymath {
  id: number;
  name_en: string;
  name_ar?: string;
  fields_en: string;
  fields_ar?: string;
  quote_en: string;
  quote_ar?: string;
  description_en: string;
  description_ar?: string;
  image_url: string;
  birth_year?: number;
  polymath_score_mapped?: number;
  occupations?: string;
  citizenship?: string;
}

export interface PolymathCSVRow {
  birth_year: string;
  polymath_score_mapped: string;
  name: string;
  occupations: string;
  citizenship: string;
}

export interface Translation {
  [key: string]: string;
}

export type Language = 'en' | 'ar';

export interface ChartDataPoint {
  year: number;
  avgScore: number;
  count: number;
}

export interface CountryData {
  name: string;
  value: number;
}

export interface OccupationData {
  name: string;
  value: number;
  icon?: string;
  tooltip?: string;
}

// --- NEW DATA STRUCTURES FOR LEO GIFT PROJECT ---

// Used by MemoriesSection (Mapped from 'leo' table rows)
export interface Memory {
  id: string;
  type: 'note' | 'photo';
  text: string; // The primary text content (quote for note, or short caption for photo display)
  src: string;  // The image URL
  caption: string; // The detailed caption (for the modal)
  date: string; // The date label (from caption/sub_text)
  top: number;
  left: number;
  rot: number;
}

// Used by ComicModal (Mapped from 'leo' table rows)
export interface ComicPage {
  id: string;
  url: string;
  display_order: number;
}

// Used by MagicGallery (Mapped from 'leo' table rows)
export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  caption: string; // Item title (e.g., 'فرحة الفوز')
  sub: string;     // Item subtitle (e.g., 'Celebration')
  display_order: number;
  poster?: string; // For video fallback
}

// Used by StatsSection Players (Mapped from 'leo' table rows)
export interface PlayerData {
  id: string;
  name: string; // The caption field (e.g., 'روبيرت ليفاندوفسكي')
  role: string; // The sub_text field (e.g., 'MAN OF THE MATCH')
  desc: string; // The description field
  img: string;  // The url field (player image)
  display_order: number;
}

// Used by StatsSection Stats (Stored in metadata)
export interface StatData {
  label: string;
  barca: number;
  madrid: number;
  max: number;
  icon?: any;
}

// Used by StatsSection for the crest image
export interface StatsAsset {
  url: string;
}

// Used by Jukebox (Mapped from 'leo' table rows)
export interface Track {
  id: string;
  title: string;  // caption
  artist: string; // sub_text
  src: string;    // url
}

// --- NEW INTERFACE FOR project_resources TABLE ---
export interface ProjectResource {
  id: string;
  project_id: string;
  resource_type: string; // 'source_code', 'pdf', 'demo', etc.
  url: string;
  label_en: string | null;
  label_ar: string | null;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
}

// --- NEW DATA STRUCTURES FOR LAB & PLATFORM ---

export interface PageRow {
  id: string; // generated ID (e.g. EXP-01)
  slug: string;
  title: string;
  category: string;
  year: string;
  status: string;
  icon_name: string;
}

export interface SupabasePage {
  slug: string;
  title: string;
  category_label: string;
  icon_name: string;
  published_at: string;
}

export interface LabContext {
  [key: string]: any;
}