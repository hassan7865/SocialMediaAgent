import Image from "next/image";
import { MessageCircle, Share2, ThumbsUp } from "lucide-react";

import { PreviewPost } from "@/components/previews/types";

interface FacebookPreviewProps {
  post: PreviewPost;
}

export function FacebookPreview({ post }: FacebookPreviewProps) {
  return (
    <div className="w-full max-w-[480px] overflow-hidden rounded-xl border border-outline-variant/20 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-surface-container-low" />
          <div>
            <p className="text-sm font-bold">{post.authorName}</p>
            <p className="text-xs text-on-surface-variant">1h - Public</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-on-surface">{post.content}</p>
      </div>
      {post.imageUrl && (
        <div className="relative h-[240px] bg-surface-container-low">
          <Image alt="Post media" src={post.imageUrl} fill className="object-cover" />
        </div>
      )}
      <div className="grid grid-cols-3 border-t border-outline-variant/20 px-2 py-1 text-on-surface-variant">
        <button className="flex items-center justify-center gap-2 rounded py-2 hover:bg-surface-container-low">
          <ThumbsUp size={16} />
          <span className="text-xs font-bold">Like</span>
        </button>
        <button className="flex items-center justify-center gap-2 rounded py-2 hover:bg-surface-container-low">
          <MessageCircle size={16} />
          <span className="text-xs font-bold">Comment</span>
        </button>
        <button className="flex items-center justify-center gap-2 rounded py-2 hover:bg-surface-container-low">
          <Share2 size={16} />
          <span className="text-xs font-bold">Share</span>
        </button>
      </div>
    </div>
  );
}
