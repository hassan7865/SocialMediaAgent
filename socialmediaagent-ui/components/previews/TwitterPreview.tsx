import Image from "next/image";
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";

import { PreviewPost } from "@/components/previews/types";

interface TwitterPreviewProps {
  post: PreviewPost;
}

export function TwitterPreview({ post }: TwitterPreviewProps) {
  return (
    <div className="w-full max-w-[480px] rounded-2xl border border-outline-variant/20 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-surface-container-low" />
        <div>
          <p className="text-sm font-bold">{post.authorName}</p>
          <p className="text-xs text-on-surface-variant">@socialagent</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-on-surface">{post.content}</p>
      <p className="mt-2 text-sm font-semibold text-primary">{post.hashtags.join(" ")}</p>
      {post.imageUrl && (
        <div className="relative mt-3 h-[220px] overflow-hidden rounded-2xl bg-surface-container-low">
          <Image alt="Post media" src={post.imageUrl} fill className="object-cover" />
        </div>
      )}
      <div className="mt-4 flex items-center justify-between text-on-surface-variant">
        <MessageCircle size={16} />
        <Repeat2 size={16} />
        <Heart size={16} />
        <Share size={16} />
      </div>
    </div>
  );
}
