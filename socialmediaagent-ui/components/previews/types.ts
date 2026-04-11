export type PreviewPlatform = "linkedin" | "twitter" | "instagram" | "facebook";

export type PreviewMediaKind = "image" | "video";

export interface PreviewMediaItem {
  url: string;
  type: PreviewMediaKind;
}

export interface PreviewPost {
  authorName: string;
  authorRole: string;
  /** Rich HTML from the editor (sanitized in previews). */
  content: string;
  /** One or more images/videos (order preserved for publishing). */
  mediaItems?: PreviewMediaItem[];
}
