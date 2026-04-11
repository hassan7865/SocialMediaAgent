import { cn } from "@/lib/utils";
import type { PreviewMediaKind } from "@/components/previews/types";

function inferMediaType(url: string): PreviewMediaKind {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  if (/\.(mp4|webm|mov|m4v|ogv)$/.test(path)) return "video";
  return "image";
}

interface PreviewPostMediaProps {
  url: string;
  mediaType?: PreviewMediaKind;
  className?: string;
}

/** Renders uploaded preview URL as image or short video (composer + network cards). */
export function PreviewPostMedia({ url, mediaType, className }: PreviewPostMediaProps) {
  const kind = mediaType ?? inferMediaType(url);

  if (kind === "video") {
    return (
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        className={cn("h-full w-full object-cover bg-black/90", className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- user-supplied preview URL
    <img src={url} alt="" className={cn("h-full w-full object-cover", className)} />
  );
}
