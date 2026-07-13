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
};
