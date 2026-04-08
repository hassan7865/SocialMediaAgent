import Image from "next/image";
import { MessageCircle, Repeat2, Send, ThumbsUp } from "lucide-react";

import { PreviewPost } from "@/components/previews/types";

interface LinkedinPreviewProps {
  post: PreviewPost;
}

export function LinkedinPreview({ post }: LinkedinPreviewProps) {
  return (
    <div className="w-full max-w-[480px] overflow-hidden rounded-lg border border-outline-variant/20 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="flex gap-3 p-4">
        <div className="h-12 w-12 rounded bg-surface-container-low" />
        <div className="flex-1">
          <p className="text-sm font-bold leading-none">{post.authorName}</p>
          <p className="mt-0.5 text-[11px] leading-tight text-on-surface-variant">{post.authorRole}</p>
          <p className="text-[10px] text-on-surface-variant/70">1m - Public</p>
        </div>
      </div>
      <div className="px-4 pb-3 text-sm leading-relaxed text-on-surface">
        <p>{post.content}</p>
        <p className="mt-3 font-semibold text-primary">{post.hashtags.join(" ")}</p>
      </div>
      {post.imageUrl && (
        <div className="relative h-[240px] bg-surface-container-low">
          <Image alt="Post media" src={post.imageUrl} fill className="object-cover" />
        </div>
      )}
      <div className="grid grid-cols-4 px-2 py-1">
        <button className="flex items-center justify-center gap-2 rounded py-2 text-on-surface-variant hover:bg-surface-container-low">
          <ThumbsUp size={16} />
          <span className="text-xs font-bold">Like</span>
        </button>
        <button className="flex items-center justify-center gap-2 rounded py-2 text-on-surface-variant hover:bg-surface-container-low">
          <MessageCircle size={16} />
          <span className="text-xs font-bold">Comment</span>
        </button>
        <button className="flex items-center justify-center gap-2 rounded py-2 text-on-surface-variant hover:bg-surface-container-low">
          <Repeat2 size={16} />
          <span className="text-xs font-bold">Repost</span>
        </button>
        <button className="flex items-center justify-center gap-2 rounded py-2 text-on-surface-variant hover:bg-surface-container-low">
          <Send size={16} />
          <span className="text-xs font-bold">Send</span>
        </button>
      </div>
    </div>
  );
}
