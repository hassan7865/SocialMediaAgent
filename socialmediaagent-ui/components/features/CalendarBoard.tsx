"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, addWeeks, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Clapperboard, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { PreviewPostMedia } from "@/components/previews/PreviewPostMedia";
import { PostRichTextEditor } from "@/components/features/PostRichTextEditor";
import { useGetCalendar } from "@/hooks/useCalendar";
import { useDeletePosts, useGetPosts, useUpdatePosts, useUploadPostMedia } from "@/hooks/usePosts";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { htmlToPlainText } from "@/lib/post-text";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/resources";
import type { PreviewMediaKind } from "@/components/previews/types";

type CalendarPost = {
  id: string;
  day: Date;
  time: string;
  /** Stored post body (may be HTML from the composer). */
  contentText: string;
  /** Plain text for calendar cards and read-only preview. */
  previewPlain: string;
  rawStatus: string;
  /** Publishing state for the badge. */
  displayLabel: string;
  displayTone: "success" | "warning" | "danger" | "default" | "muted";
  publishLastError?: string | null;
  platform: "LinkedIn" | "Twitter/X" | "Instagram" | "Facebook";
  borderColor: string;
  mediaUrls: string[];
};

const MAX_MEDIA_FILES = 10;

type EditMediaItem = { id: string; url: string; type: PreviewMediaKind };

function mediaTypeFromUrl(url: string): PreviewMediaKind {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  if (/\.(mp4|webm|mov|m4v|ogv)$/.test(path)) return "video";
  return "image";
}

function urlsToEditMedia(urls: string[]): EditMediaItem[] {
  return urls.map((url) => ({ id: url, url, type: mediaTypeFromUrl(url) }));
}

/** Maps API `status` to one clear calendar label. */
function calendarDisplay(item: Post): { label: string; tone: CalendarPost["displayTone"] } {
  const st = item.status;
  if (st === "failed") return { label: "Publish failed", tone: "danger" };
  if (st === "published") return { label: "Published", tone: "success" };
  if (st === "scheduled") return { label: "Scheduled", tone: "default" };
  if (st === "expired") return { label: "Expired", tone: "warning" };
  if (st === "paused") return { label: "Paused", tone: "muted" };
  return { label: "Draft", tone: "default" };
}

function calendarBadgeClass(tone: CalendarPost["displayTone"]) {
  switch (tone) {
    case "success":
      return "bg-emerald-500/10 text-emerald-700";
    case "warning":
      return "bg-amber-500/10 text-amber-800";
    case "danger":
      return "bg-red-500/10 text-red-800";
    case "default":
      return "bg-primary/10 text-primary";
    default:
      return "bg-surface-container text-on-surface-variant";
  }
}

function platformLabel(value: string): CalendarPost["platform"] {
  if (value === "linkedin") return "LinkedIn";
  if (value === "twitter") return "Twitter/X";
  if (value === "instagram") return "Instagram";
  return "Facebook";
}

function platformBorder(value: string): string {
  if (value === "linkedin") return "#0A66C2";
  if (value === "twitter") return "#111827";
  if (value === "instagram") return "#E1306C";
  return "#1877F2";
}

export function CalendarBoard() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isSwitchingPost, setIsSwitchingPost] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedHtml, setEditedHtml] = useState("");
  const [editMedia, setEditMedia] = useState<EditMediaItem[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const weekParam = format(currentWeekStart, "yyyy-MM-dd");
  const { data: calendarRows } = useGetCalendar(weekParam);
  const { data: postsData, isLoading, isError } = useGetPosts();
  const updatePost = useUpdatePosts();
  const deletePost = useDeletePosts();
  const uploadMedia = useUploadPostMedia();

  const dayHeaders = useMemo(
    () => Array.from({ length: 7 }).map((_, idx) => addDays(currentWeekStart, idx)),
    [currentWeekStart],
  );

  const posts = useMemo<CalendarPost[]>(() => {
    const items = postsData?.items ?? [];
    return items.flatMap((item): CalendarPost[] => {
      const baseDate = item.scheduled_at ?? item.created_at;
      if (!baseDate) return [];
      const parsed = parseISO(baseDate);
      const raw = item.content_text ?? "";
      const disp = calendarDisplay(item);
      return [
        {
          id: item.id,
          day: parsed,
          time: format(parsed, "hh:mm a"),
          contentText: raw,
          previewPlain: htmlToPlainText(raw),
          rawStatus: item.status,
          displayLabel: disp.label,
          displayTone: disp.tone,
          publishLastError: item.publish_last_error,
          platform: platformLabel(item.platform),
          borderColor: platformBorder(item.platform),
          mediaUrls: item.media_urls ?? [],
        },
      ];
    });
  }, [postsData]);

  const weekPosts = useMemo(
    () =>
      posts.filter((post) =>
        dayHeaders.some((date) => isSameDay(post.day, date)),
      ),
    [dayHeaders, posts],
  );

  const activePost = useMemo(() => weekPosts.find((p) => p.id === activePostId) ?? weekPosts[0], [activePostId, weekPosts]);

  useEffect(() => {
    if (!isSwitchingPost) return;
    const timeout = window.setTimeout(() => setIsSwitchingPost(false), 180);
    return () => window.clearTimeout(timeout);
  }, [isSwitchingPost]);

  return (
    <PageContainer wide className="relative space-y-0 text-foreground">
      <div className={panelOpen ? "xl:pr-[420px]" : ""}>
        <div className="flex flex-col gap-8">
          <PageHeader
            title="Content Calendar"
            description={`${format(currentWeekStart, "MMM d")} - ${format(addDays(currentWeekStart, 6), "MMM d, yyyy")}`}
            badge={
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar
              </p>
            }
            actions={
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full border-outline-variant/20 bg-white"
                  onClick={() => setCurrentWeekStart((prev) => addWeeks(prev, -1))}
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button type="button" size="sm" className="rounded-full px-5 text-xs font-bold" onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
                  Today
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full border-outline-variant/20 bg-white"
                  onClick={() => setCurrentWeekStart((prev) => addWeeks(prev, 1))}
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            }
          />

          <div className="overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-low/50">
            <div className="overflow-x-auto">
            <div className="min-w-[980px]">
            <div className="grid grid-cols-7 border-b border-outline-variant/20 bg-white/40 backdrop-blur-sm">
              {dayHeaders.map((d) => (
                <div key={d.toISOString()} className="px-6 py-4 text-center text-sm font-black">{format(d, "EEE dd")}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {dayHeaders.map((dayDate, dayIdx) => (
                <div
                  key={dayIdx}
                  className="min-h-[420px] min-w-0 border-r border-outline-variant/20 bg-white/20 p-3 lg:min-h-[560px]"
                >
                  <div className="min-w-0 space-y-3">
                    {weekPosts
                      .filter((p) => isSameDay(p.day, dayDate))
                      .map((post) => (
                        <Button
                          key={post.id}
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setIsSwitchingPost(true);
                            setActivePostId(post.id);
                            setEditedHtml(post.contentText);
                            setEditMedia(urlsToEditMedia(post.mediaUrls));
                            setIsEditing(false);
                            setPanelOpen(true);
                          }}
                          className={`h-auto w-full min-w-0 max-w-full flex-col items-stretch overflow-hidden rounded-2xl border border-outline-variant/20 bg-white p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md ${
                            activePostId === post.id ? "ring-2 ring-primary/20" : ""
                          }`}
                          style={{ borderLeft: `3px solid ${post.borderColor}` }}
                        >
                          <div className="mb-2 flex w-full min-w-0 items-center justify-between gap-2">
                            <p className="shrink-0 text-[10px] font-black text-on-surface-variant">{post.time}</p>
                            <span className="min-w-0 truncate text-right text-[10px] font-semibold text-on-surface-variant">
                              {post.platform}
                            </span>
                          </div>
                          <h4 className="mb-2 line-clamp-5 min-h-0 min-w-0 w-full break-words text-xs font-bold leading-relaxed text-on-surface">
                            {post.previewPlain}
                          </h4>
                          <span className={`rounded px-2 py-0.5 text-[9px] font-bold ${calendarBadgeClass(post.displayTone)}`}>
                            {post.displayLabel}
                          </span>
                        </Button>
                      ))}
                    {!isLoading && !isError && weekPosts.filter((p) => isSameDay(p.day, dayDate)).length === 0 ? (
                      <p className="rounded-xl bg-white/70 p-3 text-xs text-on-surface-variant">No posts</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            </div>
            </div>
          </div>
          {isLoading ? <AppLoader label="Loading calendar data..." /> : null}
          {isError ? <p className="text-sm text-destructive">Unable to load calendar posts.</p> : null}
          <p className="text-xs text-on-surface-variant">Calendar snapshots this week: {calendarRows?.length ?? 0}</p>
        </div>
      </div>

      <aside
        className={`fixed top-16 right-0 z-50 flex h-[calc(100vh-4rem)] w-full flex-col border-l border-outline-variant/20 bg-white shadow-2xl transition-all duration-300 ease-out sm:w-[400px] ${
          panelOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
          <div className="flex items-center justify-between border-b border-outline-variant/20 p-6">
            <h3 className="text-lg font-black">Post Details</h3>
            <Button type="button" variant="ghost" size="icon-sm" className="rounded-full" onClick={() => setPanelOpen(false)}>
              <X size={16} />
            </Button>
          </div>
          <div
            className={`flex-1 space-y-6 overflow-y-auto p-6 transition-all duration-200 ${
              isSwitchingPost ? "translate-y-1 opacity-70" : "translate-y-0 opacity-100"
            }`}
          >
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{activePost?.platform ?? "No Selection"}</p>
              <p className="mt-1 text-sm font-semibold">{activePost?.time ?? "-"}</p>
              {activePost ? (
                <span className={`mt-3 inline-block rounded px-2 py-0.5 text-[10px] font-bold ${calendarBadgeClass(activePost.displayTone)}`}>
                  {activePost.displayLabel}
                </span>
              ) : null}
              {activePost?.publishLastError ? (
                <p className="mt-2 rounded-lg bg-red-500/10 p-2 text-[11px] leading-snug text-red-800">{activePost.publishLastError}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Post body</Label>
              {isEditing ? (
                <PostRichTextEditor
                  key={`${activePost?.id ?? "none"}-edit`}
                  content={editedHtml}
                  onChange={setEditedHtml}
                  className="min-w-0"
                  editorClassName="min-h-[200px] max-h-[min(50vh,420px)] text-sm"
                />
              ) : activePost ? (
                <div
                  className={cn(
                    "rounded-2xl border border-outline-variant/20 bg-white p-4 text-sm leading-relaxed text-on-surface",
                    "[&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
                    "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_strong]:font-semibold",
                    "[&_a]:text-primary [&_a]:underline",
                  )}
                  dangerouslySetInnerHTML={{
                    __html:
                      activePost.contentText?.trim() ||
                      `<p class="text-on-surface-variant">${activePost.previewPlain || "No content yet."}</p>`,
                  }}
                />
              ) : (
                <p className="rounded-2xl border border-outline-variant/20 bg-white p-4 text-sm text-on-surface-variant">
                  Select a post from the calendar to preview details.
                </p>
              )}
            </div>

            {activePost && (isEditing || activePost.mediaUrls.length > 0) ? (
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Media</Label>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      ref={mediaInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const picked = Array.from(e.target.files ?? []);
                        e.target.value = "";
                        if (!picked.length) return;
                        const remaining = MAX_MEDIA_FILES - editMedia.length;
                        if (remaining <= 0) {
                          toast.error(`You can attach up to ${MAX_MEDIA_FILES} files per post`);
                          return;
                        }
                        const valid = picked.filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
                        if (valid.length < picked.length) toast.error("Only image and video files are allowed");
                        const files = valid.slice(0, remaining);
                        if (!files.length) return;
                        setIsUploadingMedia(true);
                        try {
                          const newItems: EditMediaItem[] = await Promise.all(
                            files.map(async (file) => {
                              const url = await uploadMedia.mutateAsync(file);
                              return {
                                id: crypto.randomUUID(),
                                url,
                                type: file.type.startsWith("video/") ? "video" : "image",
                              };
                            }),
                          );
                          setEditMedia((prev) => [...prev, ...newItems]);
                        } catch {
                          /* hook may toast */
                        } finally {
                          setIsUploadingMedia(false);
                        }
                      }}
                    />
                    {editMedia.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {editMedia.map((a) => (
                          <div
                            key={a.id}
                            className="relative aspect-square overflow-hidden rounded-xl border border-outline-variant/20 bg-black/5"
                          >
                            <PreviewPostMedia url={a.url} mediaType={a.type} className="h-full w-full object-cover" />
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="absolute top-1.5 right-1.5 h-8 w-8 rounded-full shadow-md"
                              onClick={() => setEditMedia((prev) => prev.filter((x) => x.id !== a.id))}
                              aria-label="Remove media"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {editMedia.length < MAX_MEDIA_FILES ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploadingMedia || uploadMedia.isPending}
                        onClick={() => mediaInputRef.current?.click()}
                        className="h-auto w-full flex-col gap-2 rounded-xl border-dashed border-outline-variant/40 py-4"
                      >
                        {isUploadingMedia || uploadMedia.isPending ? (
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        ) : (
                          <Clapperboard className="h-5 w-5 text-primary" aria-hidden />
                        )}
                        <span className="text-xs font-semibold">
                          {isUploadingMedia || uploadMedia.isPending ? "Uploading…" : "Add images or videos"}
                        </span>
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {activePost.mediaUrls.map((url) => (
                      <div
                        key={url}
                        className="relative aspect-square overflow-hidden rounded-xl border border-outline-variant/20 bg-black/5"
                      >
                        <PreviewPostMedia url={url} mediaType={mediaTypeFromUrl(url)} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-outline-variant/20 bg-surface-container-low/40 p-6">
            <Button
              type="button"
              variant="outline"
              className="col-span-2 rounded-xl border-outline-variant/20 py-3 text-sm font-bold"
              disabled={!activePost || updatePost.isPending || isUploadingMedia || uploadMedia.isPending}
              onClick={async () => {
                if (!activePost) return;
                if (isEditing) {
                  await updatePost.mutateAsync({
                    id: activePost.id,
                    payload: {
                      content_text: editedHtml,
                      media_urls: editMedia.map((m) => m.url),
                    },
                  });
                  setIsEditing(false);
                  return;
                }
                setEditedHtml(activePost.contentText);
                setEditMedia(urlsToEditMedia(activePost.mediaUrls));
                setIsEditing(true);
              }}
            >
              {isEditing ? "Save edit" : "Edit"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl py-3 text-sm font-bold"
              disabled={!activePost || deletePost.isPending}
              onClick={async () => {
                if (!activePost) return;
                await deletePost.mutateAsync(activePost.id);
                setPanelOpen(false);
                setActivePostId(null);
              }}
            >
              Delete
            </Button>
          </div>
      </aside>
    </PageContainer>
  );
}
