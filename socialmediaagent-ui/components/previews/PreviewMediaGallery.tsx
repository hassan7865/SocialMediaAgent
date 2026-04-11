import { PreviewPostMedia } from "@/components/previews/PreviewPostMedia";
import type { PreviewMediaItem } from "@/components/previews/types";
import { cn } from "@/lib/utils";

interface PreviewMediaGalleryProps {
  items: PreviewMediaItem[];
  /** Instagram-style horizontal swipe vs stacked cards */
  layout: "carousel" | "stack";
  /** Tailwind height for each carousel slide */
  carouselSlideClassName?: string;
  /** Tailwind height for each stacked row */
  stackItemClassName?: string;
}

export function PreviewMediaGallery({
  items,
  layout,
  carouselSlideClassName = "h-[360px]",
  stackItemClassName = "h-[220px]",
}: PreviewMediaGalleryProps) {
  if (!items.length) return null;

  if (layout === "carousel") {
    return (
      <div
        className={cn(
          "flex w-full overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {items.map((item, i) => (
          <div
            key={`${item.url}-${i}`}
            className={cn(
              "relative w-full min-w-full shrink-0 snap-center snap-always bg-surface-container-low",
              carouselSlideClassName,
            )}
          >
            <PreviewPostMedia url={item.url} mediaType={item.type} className="object-cover" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {items.map((item, i) => (
        <div
          key={`${item.url}-${i}`}
          className={cn("relative overflow-hidden rounded-lg bg-surface-container-low sm:rounded-none", stackItemClassName)}
        >
          <PreviewPostMedia url={item.url} mediaType={item.type} />
        </div>
      ))}
    </div>
  );
}
