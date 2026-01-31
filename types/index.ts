export type BadgeType = 'all-star contributor' | 'top contributor' | 'rising contributor' | null;

export interface Contributor {
  rank: number;
  name: string;
  avatar_url: string; // Mandatory
  posts: number;
  comments: number;
  reactions: number; // likes
  badge: BadgeType;
}

export interface ContributorData {
  contributors: Contributor[];
  title?: string; // Group name, default: "Visual Novel Lovers"
  month?: string; // Month abbreviation (3 letters), e.g., "Dec"
  year?: string; // Year, e.g., "2025"
  backgroundImage?: string; // Background image URL
  backgroundFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'; // Legacy: keep for fallback
  backgroundScale?: number; // Zoom level, default 1
  backgroundPosition?: { x: number; y: number }; // Pan position, default {x:0, y:0}
}

export type Step = 'paste' | 'parse' | 'edit' | 'export';

