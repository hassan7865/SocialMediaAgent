import { MessageCircle, Share2, ThumbsUp } from "lucide-react";

import { PreviewHtmlContent } from "@/components/previews/PreviewHtmlContent";
import { PreviewMediaGallery } from "@/components/previews/PreviewMediaGallery";
import { PreviewPost } from "@/components/previews/types";
import { Button } from "@/components/ui/button";

interface FacebookPreviewProps {
  post: PreviewPost;
}

export function FacebookPreview({ post }: FacebookPreviewProps) {
  const items = post.mediaItems ?? [];
  return (
    <div className="w-full max-w-[480px] overflow-hidden rounded-xl border border-outline-variant/20 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-surface-container-low" />
          <div>
            <p className="text-sm font-bold">{post.authorName}</p>

          </div>
        </div>
        <PreviewHtmlContent html={post.content} className="text-on-surface" />
      </div>
      {items.length > 0 ? (
        <div className="border-t border-outline-variant/10">
          <PreviewMediaGallery
            items={items}
            layout="stack"
            stackItemClassName={items.length > 1 ? "h-[200px]" : "h-[240px]"}
          />
        </div>
      ) : null}
      <div className="grid grid-cols-3 border-t border-outline-variant/20 px-2 py-1 text-on-surface-variant">
        <Button type="button" variant="ghost" size="sm" className="h-auto gap-2 py-2 font-bold">
          <ThumbsUp size={16} />
          <span className="text-xs">Like</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-auto gap-2 py-2 font-bold">
          <MessageCircle size={16} />
          <span className="text-xs">Comment</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-auto gap-2 py-2 font-bold">
          <Share2 size={16} />
          <span className="text-xs">Share</span>
        </Button>
      </div>
    </div>
  );
}
