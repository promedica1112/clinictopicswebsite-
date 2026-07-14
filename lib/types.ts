export type Audience = "professional" | "patient" | "both";

export type Specialty = {
  slug: string;
  name: string;
};

export type Video = {
  id: string;
  title: string;
  url: string; // YouTube or Vimeo URL
  specialty: string; // specialty slug
  audience: Audience;
  videoType: string;
  speakerName: string;
  speakerCredentials: string;
  institution?: string;
  shortDescription: string;
  fullDescription?: string;
  duration?: string;
  tags: string[];
  reviewer?: string;
  publishedDate: string; // ISO date
  status: "draft" | "published";
  featured?: boolean;
};

export type Mood =
  | "Neutral"
  | "Professional"
  | "Promotional"
  | "Simplified Patient-Friendly"
  | "Academic/Physician-Facing"
  | "Conversational"
  | "Creative"
  | "Serious"
  | "Empathetic";

export type FactCheckStatus = "ok" | "warn" | "not_checked";

export type NewsCard = {
  id: string;
  headline: string;
  summary: string;
  expanded: string;
  specialty: string; // specialty slug
  audience: Audience;
  contentType: string;
  keyFindings: string[];
  clinicalRelevance: string;
  limitation: string;
  sourceTitle: string;
  sourceOrg: string;
  sourceUrl?: string;
  publishedDate: string;
  relatedVideoId?: string;
  status: "draft" | "published";
  featured?: boolean;
  // AI-assisted intake fields (optional — only present for cards created via URL rephrase flow)
  mood?: Mood;
  sourceDomain?: string;
  originalTitle?: string;
  originalBody?: string;
  bodyDisplayMode?: "running" | "bullets";
  imageUrl?: string;
  imageSource?: "extracted" | "uploaded" | "external";
  factCheckTitleStatus?: FactCheckStatus;
  factCheckTitleSummary?: string;
  factCheckBodyStatus?: FactCheckStatus;
  factCheckBodySummary?: string;
  hasFactCheckWarning?: boolean;
  manuallyVerified?: boolean;
  readingGrade?: number;
};
