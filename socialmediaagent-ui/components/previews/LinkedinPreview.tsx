import { MessageCircle, Repeat2, Send, ThumbsUp } from "lucide-react";

import { PreviewHtmlContent } from "@/components/previews/PreviewHtmlContent";
import { PreviewMediaGallery } from "@/components/previews/PreviewMediaGallery";
import { PreviewPost } from "@/components/previews/types";
import { Button } from "@/components/ui/button";

interface LinkedinPreviewProps {
  post: PreviewPost;
}

export function LinkedinPreview({ post }: LinkedinPreviewProps) {
  const items = post.mediaItems ?? [];
  return (
    <div className="w-full max-w-[480px] overflow-hidden rounded-lg border border-outline-variant/20 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="flex gap-3 p-4">
        <div className="h-12 w-12 rounded bg-surface-container-low" />
        <div className="flex-1">
          <p className="text-sm font-bold leading-none">{post.authorName}</p>
          <p className="mt-0.5 text-[11px] leading-tight text-on-surface-variant">{post.authorRole}</p>

        </div>
      </div>
      <div className="px-4 pb-3 text-sm leading-relaxed text-on-surface">
        <PreviewHtmlContent html={post.content} />
      </div>
      {items.length > 0 ? (
        <PreviewMediaGallery
          items={items}
          layout="stack"
          stackItemClassName={items.length > 1 ? "h-[200px]" : "h-[240px]"}
        />
      ) : null}
      <div className="grid grid-cols-4 px-2 py-1">
        <Button type="button" variant="ghost" size="sm" className="h-auto gap-2 py-2 font-bold text-on-surface-variant">
          <ThumbsUp size={16} />
          <span className="text-xs">Like</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-auto gap-2 py-2 font-bold text-on-surface-variant">
          <MessageCircle size={16} />
          <span className="text-xs">Comment</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-auto gap-2 py-2 font-bold text-on-surface-variant">
          <Repeat2 size={16} />
          <span className="text-xs">Repost</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-auto gap-2 py-2 font-bold text-on-surface-variant">
          <Send size={16} />
          <span className="text-xs">Send</span>
        </Button>
      </div>
    </div>
  );
}
