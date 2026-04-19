"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { CalendarClock, Clapperboard, Loader2, Send, Sparkles, Wand2, X } from "lucide-react";
import { toast } from "sonner";

import { FacebookPreview } from "@/components/previews/FacebookPreview";
import { InstagramPreview } from "@/components/previews/InstagramPreview";
import { LinkedinPreview } from "@/components/previews/LinkedinPreview";
import { TwitterPreview } from "@/components/previews/TwitterPreview";
import { useGetCompany } from "@/hooks/useCompany";
import { useGetPlatforms } from "@/hooks/usePlatforms";
import { useCreatePosts, useUploadPostMedia } from "@/hooks/usePosts";
import { generatePostNonStreaming, streamAIGeneratePost } from "@/hooks/useAI";
import { useGetBrandVoice } from "@/hooks/useBrandVoice";
import { PreviewPostMedia } from "@/components/previews/PreviewPostMedia";
import type { PreviewMediaKind, PreviewPlatform, PreviewPost } from "@/components/previews/types";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";
import { PostRichTextEditor } from "@/components/features/PostRichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { markdownToEditorHtml } from "@/lib/markdown-to-editor-html";
import { htmlToPlainText } from "@/lib/post-text";
import { cn } from "@/lib/utils";

const DEFAULT_HTML = "";

const MAX_MEDIA_FILES = 10;


function formatDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type MediaAttachment = { id: string; url: string; type: PreviewMediaKind };

const FALLBACK_AUTHOR = {
  name: "Your Brand",
  role: "Complete your company profile to personalize previews",
} as const;

const PREVIEW_ORDER: PreviewPlatform[] = ["linkedin", "twitter", "instagram", "facebook"];

export function PostComposer() {
  const { data: company } = useGetCompany();
  const { data: brandVoice } = useGetBrandVoice();
  const { data: platforms, isLoading: platformsLoading } = useGetPlatforms();
  const createPost = useCreatePosts();
  const uploadMedia = useUploadPostMedia();
  const [aiStreaming, setAiStreaming] = useState(false);
  const aiGenerateInFlightRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const connectedPlatforms = useMemo(() => {
    const active = new Set((platforms ?? []).filter((p) => p.is_active).map((p) => p.platform));
    return PREVIEW_ORDER.filter((id) => active.has(id));
  }, [platforms]);

  const [selectedPlatform, setSelectedPlatform] = useState<PreviewPlatform | null>(null);
  const [contentHtml, setContentHtml] = useState(DEFAULT_HTML);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(() => formatDatetimeLocalValue(new Date()));
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAIChat, setShowAIChat] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAiPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(80, textareaRef.current.scrollHeight)}px`;
    }
  };

  const platform = useMemo(() => {
    if (connectedPlatforms.length === 0) return null;
    if (selectedPlatform && connectedPlatforms.includes(selectedPlatform)) return selectedPlatform;
    return connectedPlatforms[0];
  }, [connectedPlatforms, selectedPlatform]);

  const plainText = useMemo(() => htmlToPlainText(contentHtml), [contentHtml]);

  const post = useMemo<PreviewPost>(() => {
    return {
      authorName: company?.name?.trim() || FALLBACK_AUTHOR.name,
      authorRole:
        company?.industry?.trim() ||
        (company?.description?.trim() ? company.description.trim().slice(0, 80) : "") ||
        FALLBACK_AUTHOR.role,
      content: contentHtml,
      mediaItems: attachments.map((a) => ({ url: a.url, type: a.type })),
    };
  }, [company, contentHtml, attachments]);

  const linkedinCount = plainText.length;
  const twitterCount = plainText.length;

  const onPickFile = useCallback(() => fileInputRef.current?.click(), []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!picked.length) return;

    const remaining = MAX_MEDIA_FILES - attachments.length;
    if (remaining <= 0) {
      toast.error(`You can attach up to ${MAX_MEDIA_FILES} files per post`);
      return;
    }

    const valid = picked.filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
    if (valid.length < picked.length) {
      toast.error("Only image and video files are allowed");
    }
    const files = valid.slice(0, remaining);
    if (!files.length) return;

    setIsUploadingMedia(true);
    try {
      const newItems: MediaAttachment[] = await Promise.all(
        files.map(async (file) => {
          const url = await uploadMedia.mutateAsync(file);
          return {
            id: crypto.randomUUID(),
            url,
            type: file.type.startsWith("video/") ? "video" : "image",
          };
        }),
      );
      setAttachments((prev) => [...prev, ...newItems]);
      const skipped = valid.length - files.length;
      if (skipped > 0) {
        toast.success(
          `Added ${newItems.length} file(s). ${skipped} not added (max ${MAX_MEDIA_FILES} per post).`,
        );
      } else {
        toast.success(`Added ${newItems.length} file${newItems.length === 1 ? "" : "s"}`);
      }
    } catch {
      /* upload hook may toast */
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;

    abortControllerRef.current?.abort();
    const gen = ++generationRef.current;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    aiGenerateInFlightRef.current = true;
    const promptSnapshot = aiPrompt.trim();
    setAiPrompt("");
    setContentHtml("");
    setAiStreaming(true);

    let markdown = "";
    let raf: number | null = null;
    const flushEditor = () => setContentHtml(markdownToEditorHtml(markdown));
    const scheduleFlush = () => {
      if (raf != null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        flushEditor();
      });
    };

    try {
      await streamAIGeneratePost(
        { prompt: promptSnapshot, platform: selectedPlatform || "linkedin" },
        (text) => {
          if (controller.signal.aborted) return;
          markdown += text;
          scheduleFlush();
        },
        controller.signal,
      );

      if (controller.signal.aborted || generationRef.current !== gen) return;
      flushEditor();
      if (!markdown.trim()) {
        if (generationRef.current !== gen || controller.signal.aborted) return;
        const fallback = await generatePostNonStreaming({
          prompt: promptSnapshot,
          platform: selectedPlatform || "linkedin",
        });
        if (generationRef.current !== gen) return;
        if (fallback.trim()) {
          markdown = fallback;
          flushEditor();
        }
      }
      if (generationRef.current !== gen) return;
      if (markdown.trim()) {
        toast.success("AI generated your post!");
      } else {
        toast.error(
          "No text was returned. Check that GROQ_API_KEY is set and try again.",
        );
      }
    } catch (error) {
      if (controller.signal.aborted || generationRef.current !== gen) return;
      setAiPrompt(promptSnapshot);
      const raw = error instanceof Error ? error.message : "Generation failed";
      const short =
        raw.length > 280 ? `${raw.slice(0, 280)}…` : raw;
      const friendly = /RESOURCE_EXHAUSTED|429|quota/i.test(raw)
        ? "AI quota exceeded or rate limited. Try again shortly."
        : short;
      toast.error(friendly);
    } finally {
      if (raf != null) cancelAnimationFrame(raf);
      if (generationRef.current !== gen) return;
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      aiGenerateInFlightRef.current = false;
      setAiStreaming(false);
    }
  };

  const handleSave = async () => {
    if (!company?.id) {
      toast.error("Please create company profile first");
      return;
    }
    if (!platform) {
      toast.error("Select a connected platform");
      return;
    }
    if (!connectedPlatforms.includes(platform)) {
      toast.error("Connect this platform under Platforms first");
      return;
    }
    await createPost.mutateAsync({
      company_id: company.id,
      platform,
      content_text: contentHtml,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      ...(attachments.length ? { media_urls: attachments.map((a) => a.url) } : {}),
    });
  };

  const platformLabel = (item: PreviewPlatform) =>
    item === "linkedin" ? "LinkedIn" : item === "twitter" ? "X" : item === "instagram" ? "Instagram" : "Facebook";

  const saveDisabled =
    createPost.isPending || isUploadingMedia || uploadMedia.isPending || !platform || connectedPlatforms.length === 0;

  const platformPicker = (className?: string) => (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {platformsLoading ? (
        <div className="h-10 w-full max-w-md animate-pulse rounded-full bg-white/60" />
      ) : connectedPlatforms.length === 0 ? (
        <div className="w-full max-w-lg rounded-2xl border border-outline-variant/25 bg-white/80 p-4 shadow-sm">
          <p className="text-sm font-medium text-on-surface">No connected platforms yet.</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Connect at least one account to choose where this post will go.
          </p>
          <Button type="button" asChild className="mt-3 rounded-xl font-semibold" size="sm">
            <Link href="/platforms">Go to Platforms</Link>
          </Button>
        </div>
      ) : (
        connectedPlatforms.map((item) => (
          <Button
            key={item}
            type="button"
            variant={platform === item ? "default" : "outline"}
            size="sm"
            className="rounded-full px-4 font-semibold"
            onClick={() => setSelectedPlatform(item)}
          >
            {platformLabel(item)}
          </Button>
        ))
      )}
    </div>
  );

  return (
    <PageContainer wide className="max-w-[1400px]">
      <PageHeader
        title="Compose Content"
        description="Craft your editorial thread across networks you have connected."
        badge={
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Posts
          </p>
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-6 sm:space-y-8">
          <section className="space-y-3">
            <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline">Target platform</Label>
            {platformPicker()}
          </section>
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline">Editorial Content</Label>
              <div className="flex shrink-0 flex-wrap justify-end gap-3 text-[10px] font-bold text-on-surface-variant">
                <span>LinkedIn: {linkedinCount}/3000</span>
                <span>X: {twitterCount}/280</span>
              </div>
            </div>
            <PostRichTextEditor content={contentHtml} onChange={setContentHtml} />
          </section>
          <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline">Media (optional)</Label>
                {attachments.length > 0 ? (
                  <span className="text-[10px] font-semibold text-on-surface-variant">
                    {attachments.length}/{MAX_MEDIA_FILES}
                  </span>
                ) : null}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/x-m4v,video/ogg"
                className="sr-only"
                onChange={onFileChange}
              />
              {attachments.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {attachments.map((a) => (
                    <div
                      key={a.id}
                      className="relative aspect-square overflow-hidden rounded-xl border border-outline-variant/20 bg-black/5 shadow-sm"
                    >
                      <PreviewPostMedia url={a.url} mediaType={a.type} className="h-full w-full object-cover" />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute top-1.5 right-1.5 h-8 w-8 rounded-full shadow-md"
                        onClick={() => removeAttachment(a.id)}
                        aria-label="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
              {attachments.length < MAX_MEDIA_FILES ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploadingMedia || uploadMedia.isPending}
                  onClick={onPickFile}
                  className="h-auto w-full flex-col items-stretch gap-2 rounded-2xl border-dashed border-outline-variant/40 bg-white py-5 shadow-[0px_20px_40px_rgba(21,28,39,0.04)]"
                >
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                    {isUploadingMedia || uploadMedia.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    ) : (
                      <Clapperboard className="h-5 w-5 text-primary" aria-hidden />
                    )}
                    {isUploadingMedia || uploadMedia.isPending
                      ? "Uploading…"
                      : attachments.length
                        ? "Add more media"
                        : "Attach images or videos"}
                  </div>
                  <p className="text-center text-[11px] font-normal text-on-surface-variant">
                    Select multiple files · up to {MAX_MEDIA_FILES} per post · images up to 10MB · short videos up to 80MB
                  </p>
                </Button>
              ) : null}
            </section>
            
            {brandVoice ? (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline">AI Assistant</Label>
                </div>
                {connectedPlatforms.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-warning/40 bg-warning/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                        <Wand2 className="h-5 w-5 text-warning" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-on-surface">Connect a social account first</p>
                        <p className="text-xs text-on-surface-variant">
                          AI post generation requires at least one connected platform
                        </p>
                      </div>
                      <Button type="button" asChild className="rounded-full font-semibold" size="sm">
                        <Link href="/platforms">Connect</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl border border-outline-variant/20 bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
                    <Textarea
                      ref={textareaRef}
                      className="min-h-[100px] w-full resize-none rounded-xl border-none p-4 pr-12 text-sm shadow-none focus:ring-0"
                      placeholder="Describe what you want to post... (e.g., 'Write a post about our new product launch')"
                      value={aiPrompt}
                      onChange={handleAiPromptChange}
                    />
                    <Button
                      type="button"
                      size="icon"
                      className={cn(
                        "absolute bottom-3 right-3 h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-container shadow-md",
                        aiStreaming && "pointer-events-none",
                      )}
                      onClick={handleAIGenerate}
                      disabled={!aiPrompt.trim() || aiStreaming}
                      aria-disabled={aiStreaming}
                    >
                      {aiStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
                <p className="text-xs text-on-surface-variant">
                  Describe your post idea and AI will generate content for you
                </p>
              </section>
            ) : (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-outline" />
                  <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline">AI Assistant</Label>
                </div>
                <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Wand2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-on-surface">Set up Brand Voice to use AI</p>
                      <p className="text-xs text-on-surface-variant">
                        Configure your brand voice to enable AI-powered post generation
                      </p>
                    </div>
                    <Button type="button" asChild className="rounded-full font-semibold" size="sm">
                      <Link href="/brand-voice">Set up</Link>
                    </Button>
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline">Schedule Release</Label>
              <div className="relative">
                <CalendarClock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-outline" />
                <Input
                  className="rounded-xl border-none bg-white py-3 pr-4 pl-10 shadow-[0px_20px_40px_rgba(21,28,39,0.04)]"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            </section>
          <div className="flex items-center justify-end gap-3 pt-1">
            {connectedPlatforms.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-warning/40 bg-warning/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium text-warning">
                    Connect a social account to save posts
                  </span>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleSave}
                disabled={saveDisabled}
                className="rounded-xl border-outline-variant/30 font-semibold"
              >
                {createPost.isPending ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-outline-variant/20 bg-surface-container-low p-4 sm:space-y-8 sm:p-6 lg:p-8">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <Sparkles size={18} className="text-primary" />
              Live Preview
            </h3>
            <div className="flex flex-wrap rounded-full border border-white/20 bg-white/50 p-1 backdrop-blur">
              {platformsLoading ? (
                <span className="px-4 py-2 text-xs text-on-surface-variant">Loading…</span>
              ) : connectedPlatforms.length === 0 ? (
                <span className="px-4 py-2 text-xs text-on-surface-variant">No previews</span>
              ) : (
                connectedPlatforms.map((item) => (
                  <Button
                    key={item}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-full px-4 text-xs font-bold",
                      platform === item && "bg-white text-primary shadow-sm",
                    )}
                    onClick={() => setSelectedPlatform(item)}
                  >
                    {platformLabel(item)}
                  </Button>
                ))
              )}
            </div>
          </header>

          <div className="flex min-h-[460px] items-center justify-center py-2 sm:min-h-[520px] sm:py-4 lg:min-h-[580px] lg:py-6">
            {!platform || connectedPlatforms.length === 0 ? (
              <p className="max-w-sm text-center text-sm text-on-surface-variant">
                Connect a platform to see live previews and save posts for that network.
              </p>
            ) : (
              <>
                {platform === "linkedin" && <LinkedinPreview post={post} />}
                {platform === "twitter" && <TwitterPreview post={post} />}
                {platform === "instagram" && <InstagramPreview post={post} />}
                {platform === "facebook" && <FacebookPreview post={post} />}
              </>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
