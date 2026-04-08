import Image from "next/image";
import { Heart, MessageCircle, Send } from "lucide-react";

import { PreviewPost } from "@/components/previews/types";

interface InstagramPreviewProps {
  post: PreviewPost;
}

export function InstagramPreview({ post }: InstagramPreviewProps) {
  return (
    <div className="w-full max-w-[380px] overflow-hidden rounded-2xl border border-outline-variant/20 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3 p-3">
        <div className="h-8 w-8 rounded-full bg-surface-container-low" />
        <p className="text-sm font-semibold">{post.authorName}</p>
      </div>
      <div className="relative h-[360px] bg-surface-container-low">
        {post.imageUrl ? <Image alt="Post media" src={post.imageUrl} fill className="object-cover" /> : null}
      </div>
      <div className="p-3">
        <div className="mb-2 flex items-center gap-3">
          <Heart size={18} />
          <MessageCircle size={18} />
          <Send size={18} />
        </div>
        <p className="text-sm leading-relaxed">
          <span className="font-semibold">{post.authorName}</span> {post.content}
        </p>
      </div>
    </div>
  );
}
