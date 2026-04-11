import { Heart, ImageIcon, MessageCircle, Send } from "lucide-react";

import { PreviewHtmlContent } from "@/components/previews/PreviewHtmlContent";
import { PreviewMediaGallery } from "@/components/previews/PreviewMediaGallery";
import { PreviewPost } from "@/components/previews/types";

interface InstagramPreviewProps {
  post: PreviewPost;
}

export function InstagramPreview({ post }: InstagramPreviewProps) {
  const items = post.mediaItems ?? [];
  return (
    <div className="w-full max-w-[380px] overflow-hidden rounded-2xl border border-outline-variant/20 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3 p-3">
        <div className="h-8 w-8 rounded-full bg-surface-container-low" />
        <p className="text-sm font-semibold">{post.authorName}</p>
      </div>
      <div className="relative min-h-[360px] bg-gradient-to-br from-surface-container-low to-surface-container">
        {items.length > 0 ? (
          <PreviewMediaGallery items={items} layout="carousel" carouselSlideClassName="h-[360px]" />
        ) : (
          <div className="flex h-[360px] flex-col items-center justify-center gap-2 px-6 text-center">
            <ImageIcon className="h-10 w-10 text-on-surface-variant/50" aria-hidden />
            <p className="text-xs font-medium text-on-surface-variant">No media attached</p>
            <p className="max-w-[240px] text-[11px] leading-snug text-on-surface-variant/80">
              Attach images or short videos in the composer, or keep it text-only.
            </p>
          </div>
        )}
      </div>
      {items.length > 1 ? (
        <p className="border-b border-outline-variant/15 px-3 py-1.5 text-center text-[10px] font-semibold text-on-surface-variant">
          {items.length} slides — swipe preview
        </p>
      ) : null}
      <div className="p-3">
        <div className="mb-2 flex items-center gap-3">
          <Heart size={18} />
          <MessageCircle size={18} />
          <Send size={18} />
        </div>
        <div className="text-sm leading-relaxed">
          <p className="font-semibold">{post.authorName}</p>
          <div className="mt-1">
            <PreviewHtmlContent html={post.content} />
          </div>
        </div>
      </div>
    </div>
  );
}
