"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, addWeeks, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { useGetCalendar } from "@/hooks/useCalendar";
import { useApprovePost, useDeletePosts, useGetPosts, useUpdatePosts } from "@/hooks/usePosts";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";

type CalendarPost = {
  id: string;
  day: Date;
  time: string;
  title: string;
  rawStatus: string;
  status: "Draft" | "Scheduled" | "Published";
  platform: "LinkedIn" | "Twitter/X" | "Instagram" | "Facebook";
  borderColor: string;
};

function statusClass(status: CalendarPost["status"]) {
  if (status === "Published") return "bg-emerald-500/10 text-emerald-700";
  if (status === "Draft") return "bg-surface-container text-on-surface-variant";
  return "bg-primary/10 text-primary";
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
  const [editedText, setEditedText] = useState("");
  const weekParam = format(currentWeekStart, "yyyy-MM-dd");
  const { data: calendarRows } = useGetCalendar(weekParam);
  const { data: postsData, isLoading, isError } = useGetPosts();
  const updatePost = useUpdatePosts();
  const deletePost = useDeletePosts();
  const approvePost = useApprovePost();

  const dayHeaders = useMemo(
    () => Array.from({ length: 7 }).map((_, idx) => addDays(currentWeekStart, idx)),
    [currentWeekStart],
  );

  const posts = useMemo<CalendarPost[]>(() => {
    const items = postsData?.items ?? [];
    return items
      .map((item) => {
        const baseDate = item.scheduled_at ?? item.created_at;
        if (!baseDate) return null;
        const parsed = parseISO(baseDate);
        return {
          id: item.id,
          day: parsed,
          time: format(parsed, "hh:mm a"),
          title: item.content_text,
          rawStatus: item.status,
          status: item.status === "published" ? "Published" : item.status === "scheduled" ? "Scheduled" : "Draft",
          platform: platformLabel(item.platform),
          borderColor: platformBorder(item.platform),
        } satisfies CalendarPost;
      })
      .filter((item): item is CalendarPost => Boolean(item));
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
            actions={
              <div className="flex gap-2">
                <button type="button" onClick={() => setCurrentWeekStart((prev) => addWeeks(prev, -1))} className="rounded-full border border-outline-variant/20 bg-white p-2">
                  <ChevronLeft size={14} />
                </button>
                <button type="button" onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-white">Today</button>
                <button type="button" onClick={() => setCurrentWeekStart((prev) => addWeeks(prev, 1))} className="rounded-full border border-outline-variant/20 bg-white p-2">
                  <ChevronRight size={14} />
                </button>
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
                <div key={dayIdx} className="min-h-[420px] border-r border-outline-variant/20 bg-white/20 p-3 lg:min-h-[560px]">
                  <div className="space-y-3">
                    {weekPosts
                      .filter((p) => isSameDay(p.day, dayDate))
                      .map((post) => (
                        <button
                          key={post.id}
                          type="button"
                          onClick={() => {
                            setIsSwitchingPost(true);
                            setActivePostId(post.id);
                            setEditedText(post.title);
                            setIsEditing(false);
                            setPanelOpen(true);
                          }}
                          className={`w-full rounded-2xl border border-outline-variant/20 bg-white p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                            activePostId === post.id ? "ring-2 ring-primary/20" : ""
                          }`}
                          style={{ borderLeft: `3px solid ${post.borderColor}` }}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-[10px] font-black text-on-surface-variant">{post.time}</p>
                            <span className="text-[10px] font-semibold text-on-surface-variant">{post.platform}</span>
                          </div>
                          <h4
                            className="mb-2 text-xs font-bold leading-relaxed"
                            style={{ display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {post.title}
                          </h4>
                          <span className={`rounded px-2 py-0.5 text-[9px] font-bold ${statusClass(post.status)}`}>{post.status}</span>
                        </button>
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
            <button onClick={() => setPanelOpen(false)} className="rounded-full p-2 transition-colors hover:bg-surface-container-low">
              <X size={16} />
            </button>
          </div>
          <div
            className={`flex-1 space-y-6 overflow-y-auto p-6 transition-all duration-200 ${
              isSwitchingPost ? "translate-y-1 opacity-70" : "translate-y-0 opacity-100"
            }`}
          >
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{activePost?.platform ?? "No Selection"}</p>
              <p className="mt-1 text-sm font-semibold">{activePost?.time ?? "-"}</p>
              {activePost ? <span className={`mt-3 inline-block rounded px-2 py-0.5 text-[10px] font-bold ${statusClass(activePost.status)}`}>{activePost.status}</span> : null}
            </div>
            {isEditing ? (
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={8}
                className="w-full rounded-2xl border border-outline-variant/20 bg-white p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <p className="rounded-2xl border border-outline-variant/20 bg-white p-4 text-sm leading-relaxed">
                {activePost?.title ?? "Select a post from the calendar to preview details."}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-outline-variant/20 bg-surface-container-low/40 p-6">
            <button
              className="col-span-2 rounded-xl border border-outline-variant/20 bg-white py-3 text-sm font-bold hover:bg-surface-container-low"
              disabled={!activePost || updatePost.isPending}
              onClick={async () => {
                if (!activePost) return;
                if (isEditing) {
                  await updatePost.mutateAsync({ id: activePost.id, payload: { content_text: editedText } });
                  setIsEditing(false);
                  return;
                }
                setEditedText(activePost.title);
                setIsEditing(true);
              }}
            >
              {isEditing ? "Save Edit" : "Edit"}
            </button>
            <button
              className="rounded-xl bg-destructive/10 py-3 text-sm font-bold text-destructive hover:bg-destructive/20 disabled:opacity-60"
              disabled={!activePost || deletePost.isPending}
              onClick={async () => {
                if (!activePost) return;
                await deletePost.mutateAsync(activePost.id);
                setPanelOpen(false);
                setActivePostId(null);
              }}
            >
              Delete
            </button>
            <button
              className="rounded-xl bg-gradient-to-r from-primary to-primary-container py-3 text-sm font-bold text-white disabled:opacity-60"
              disabled={!activePost || approvePost.isPending}
              onClick={async () => {
                if (!activePost) return;
                await approvePost.mutateAsync(activePost.id);
              }}
            >
              Approve
            </button>
          </div>
      </aside>
    </PageContainer>
  );
}
