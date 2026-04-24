import type { Database } from "@/integrations/supabase/types";

export type Show = Database["public"]["Tables"]["shows"]["Row"];
export type Episode = Database["public"]["Tables"]["episodes"]["Row"];
export type Source = Database["public"]["Tables"]["sources"]["Row"];
export type NewsItem = Database["public"]["Tables"]["news_items"]["Row"];
export type Voice = Database["public"]["Tables"]["voices"]["Row"];
export type Schedule = Database["public"]["Tables"]["schedules"]["Row"];
export type UserRequest = Database["public"]["Tables"]["user_requests"]["Row"];

export interface ScriptLine {
  speaker: string;
  text: string;
}

export interface SourceRef {
  title: string;
  url: string;
}

export interface ScriptShape {
  show_title?: string;
  episode_title?: string;
  language?: string;
  city?: string | null;
  duration_estimate?: number;
  characters?: string[];
  lines?: ScriptLine[];
  source_references?: SourceRef[];
  moderation_notes?: string;
  voice_direction?: string;
}

export type EpisodeWithShow = Episode & { shows?: Pick<Show, "name" | "accent_color" | "format_type"> | null };

export const TAMIL_CITIES = [
  "All Tamil Nadu",
  "Chennai",
  "Salem",
  "Coimbatore",
  "Madurai",
  "Trichy",
  "Tiruppur",
] as const;
