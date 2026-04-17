import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";

import { PreviewHtmlContent } from "@/components/previews/PreviewHtmlContent";
import { PreviewMediaGallery } from "@/components/previews/PreviewMediaGallery";
import { PreviewPost } from "@/components/previews/types";

interface TwitterPreviewProps {
  post: PreviewPost;
}

export function TwitterPreview({ post }: TwitterPreviewProps) {
  const items = post.mediaItems ?? [];
  return (
    <div className="w-full max-w-[480px] rounded-2xl border border-outline-variant/20 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-surface-container-low" />
        <div>
          <p className="text-sm font-bold">{post.authorName}</p>

        </div>
      </div>
      <PreviewHtmlContent html={post.content} className="text-on-surface" />
      {items.length > 0 ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-outline-variant/10">
          <PreviewMediaGallery
            items={items}
            layout="stack"
            stackItemClassName={items.length > 1 ? "h-[180px]" : "h-[220px]"}
          />
        </div>
      ) : null}
      <div className="mt-4 flex items-center justify-between text-on-surface-variant">
        <MessageCircle size={16} />
        <Repeat2 size={16} />
        <Heart size={16} />
        <Share size={16} />
      </div>
    </div>
  );
}
