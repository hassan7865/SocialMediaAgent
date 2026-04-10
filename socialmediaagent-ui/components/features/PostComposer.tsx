"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Sparkles, WandSparkles } from "lucide-react";
import { toast } from "sonner";

import { FacebookPreview } from "@/components/previews/FacebookPreview";
import { InstagramPreview } from "@/components/previews/InstagramPreview";
import { LinkedinPreview } from "@/components/previews/LinkedinPreview";
import { TwitterPreview } from "@/components/previews/TwitterPreview";
import { useGetCompany } from "@/hooks/useCompany";
import { useCreatePosts } from "@/hooks/usePosts";
import { PreviewPlatform, PreviewPost } from "@/components/previews/types";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const defaultPost: PreviewPost = {
  authorName: "Julian Thorne",
  authorRole: "Editorial Director @ SocialAgent - 1st",
  content:
    "The future of autonomous agents is not just about automation, it is about augmentation. By leveraging LLMs for high-level reasoning and strategic oversight, we are entering an era where the Digital Curator becomes the standard for brand authority.",
  hashtags: ["#AI", "#TechStrategy", "#FutureOfWork"],
  imageUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCNfK7G3bNimWbz4-myRZe1JzH5c3Q3KrOD1T6gLURsag9V1MUlyschpMCtXM_pGNfZ_3vaVVl9y0k6Ozd-lSKrj42FggA1m8TTL9ue_JwIwY9BffCy1Lt1vsZvDLi7qq9Phki2i8RfQHHmjkEuF7jTObPCYXtTn6vy38dFwH1kN0W5fNQPOceWF-6G3lSLfLGC8Er00qcA4n3IOZ3EIL2I0VF3JvvC7C2F6fVSuheLa6MTiRKdmJlwZ4tKf-QZfGMv9a00aAN6Dlnu",
};

const TONE_OPTIONS = [
  { value: "thought_leader", label: "Thought Leader" },
  { value: "casual", label: "Casual & Friendly" },
  { value: "data_driven", label: "Data-Driven" },
  { value: "story_driven", label: "Story-Driven" },
] as const;

export function PostComposer() {
  const { data: company } = useGetCompany();
  const createPost = useCreatePosts();
  const [platform, setPlatform] = useState<PreviewPlatform>("linkedin");
  const [content, setContent] = useState(defaultPost.content);
  const [scheduledAt, setScheduledAt] = useState("2026-04-09T11:00");
  const [tone, setTone] = useState<string>(TONE_OPTIONS[0].value);
  const post = useMemo<PreviewPost>(() => ({ ...defaultPost, content }), [content]);
  const linkedinCount = content.length;
  const twitterCount = content.length;

  const handleSave = async () => {
    if (!company?.id) {
      toast.error("Please create company profile first");
      return;
    }
    await createPost.mutateAsync({
      company_id: company.id,
      platform,
      content_text: content,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    });
  };

  const platformLabel = (item: PreviewPlatform) =>
    item === "linkedin" ? "LinkedIn" : item === "twitter" ? "X" : item === "instagram" ? "Instagram" : "Facebook";

  return (
    <PageContainer wide className="max-w-[1400px]">
      <PageHeader
        title="Compose Content"
        description="Craft your editorial thread across multiple networks."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-6 sm:space-y-8">
          <section className="space-y-3">
            <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline">Target Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {(["linkedin", "twitter", "instagram", "facebook"] as PreviewPlatform[]).map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={platform === item ? "default" : "outline"}
                  size="sm"
                  className="rounded-full px-4 font-semibold"
                  onClick={() => setPlatform(item)}
                >
                  {platformLabel(item)}
                </Button>
              ))}
            </div>
          </section>
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline">Editorial Content</Label>
              <div className="flex gap-3 text-[10px] font-bold text-on-surface-variant">
                <span>LinkedIn: {linkedinCount}/3000</span>
                <span>X: {twitterCount}/280</span>
              </div>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="min-h-[240px] rounded-2xl border-none bg-white p-6 text-base leading-relaxed shadow-[0px_20px_40px_rgba(21,28,39,0.04)]"
            />
          </section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <section className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline">Tone Voice</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="h-auto min-h-10 w-full rounded-xl border-none bg-white py-3 shadow-[0px_20px_40px_rgba(21,28,39,0.04)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>
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
          </div>
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleSave}
              disabled={createPost.isPending}
              className="rounded-xl border-outline-variant/30 font-semibold"
            >
              {createPost.isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              className="gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25"
            >
              <WandSparkles size={18} />
              Generate with AI
            </Button>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-outline-variant/20 bg-surface-container-low p-4 sm:space-y-8 sm:p-6 lg:p-8">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <Sparkles size={18} className="text-primary" />
              Live Preview
            </h3>
            <div className="flex flex-wrap rounded-full border border-white/20 bg-white/50 p-1 backdrop-blur">
              {(["linkedin", "twitter", "instagram", "facebook"] as PreviewPlatform[]).map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-full px-4 text-xs font-bold",
                    platform === item && "bg-white text-primary shadow-sm",
                  )}
                  onClick={() => setPlatform(item)}
                >
                  {platformLabel(item)}
                </Button>
              ))}
            </div>
          </header>

          <div className="flex min-h-[460px] items-center justify-center py-2 sm:min-h-[520px] sm:py-4 lg:min-h-[580px] lg:py-6">
            {platform === "linkedin" && <LinkedinPreview post={post} />}
            {platform === "twitter" && <TwitterPreview post={post} />}
            {platform === "instagram" && <InstagramPreview post={post} />}
            {platform === "facebook" && <FacebookPreview post={post} />}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
