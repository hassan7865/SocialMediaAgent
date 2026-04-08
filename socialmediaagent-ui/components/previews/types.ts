export type PreviewPlatform = "linkedin" | "twitter" | "instagram" | "facebook";

export interface PreviewPost {
  authorName: string;
  authorRole: string;
  content: string;
  hashtags: string[];
  imageUrl?: string;
}
