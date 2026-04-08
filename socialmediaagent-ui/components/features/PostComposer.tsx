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

const defaultPost: PreviewPost = {
  authorName: "Julian Thorne",
  authorRole: "Editorial Director @ SocialAgent - 1st",
  content:
    "The future of autonomous agents is not just about automation, it is about augmentation. By leveraging LLMs for high-level reasoning and strategic oversight, we are entering an era where the Digital Curator becomes the standard for brand authority.",
  hashtags: ["#AI", "#TechStrategy", "#FutureOfWork"],
  imageUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCNfK7G3bNimWbz4-myRZe1JzH5c3Q3KrOD1T6gLURsag9V1MUlyschpMCtXM_pGNfZ_3vaVVl9y0k6Ozd-lSKrj42FggA1m8TTL9ue_JwIwY9BffCy1Lt1vsZvDLi7qq9Phki2i8RfQHHmjkEuF7jTObPCYXtTn6vy38dFwH1kN0W5fNQPOceWF-6G3lSLfLGC8Er00qcA4n3IOZ3EIL2I0VF3JvvC7C2F6fVSuheLa6MTiRKdmJlwZ4tKf-QZfGMv9a00aAN6Dlnu",
};

export function PostComposer() {
  const { data: company } = useGetCompany();
  const createPost = useCreatePosts();
  const [platform, setPlatform] = useState<PreviewPlatform>("linkedin");
  const [content, setContent] = useState(defaultPost.content);
  const [scheduledAt, setScheduledAt] = useState("2026-04-09T11:00");
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

  return (
    <PageContainer wide className="max-w-[1400px]">
      <PageHeader
        title="Compose Content"
        description="Craft your editorial thread across multiple networks."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-6 sm:space-y-8">
          <section className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline">Target Platforms</label>
          <div className="flex flex-wrap gap-2">
            {(["linkedin", "twitter", "instagram", "facebook"] as PreviewPlatform[]).map((item) => (
              <button
                key={item}
                onClick={() => setPlatform(item)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  platform === item
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {item === "linkedin" ? "LinkedIn" : item === "twitter" ? "X" : item === "instagram" ? "Instagram" : "Facebook"}
              </button>
            ))}
          </div>
        </section>
          <section className="space-y-4">
          <div className="flex items-end justify-between">
            <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline">Editorial Content</label>
            <div className="flex gap-3 text-[10px] font-bold text-on-surface-variant">
              <span>LinkedIn: {linkedinCount}/3000</span>
              <span>X: {twitterCount}/280</span>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full rounded-2xl border-none bg-white p-6 text-base leading-relaxed text-on-surface shadow-[0px_20px_40px_rgba(21,28,39,0.04)] outline-none focus:ring-2 focus:ring-primary/20"
          />
        </section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <section className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline">Tone Voice</label>
            <select className="w-full rounded-xl border-none bg-white px-4 py-3 text-sm font-medium shadow-[0px_20px_40px_rgba(21,28,39,0.04)] outline-none focus:ring-2 focus:ring-primary/20">
              <option>Thought Leader</option>
              <option>Casual & Friendly</option>
              <option>Data-Driven</option>
              <option>Story-Driven</option>
            </select>
          </section>
          <section className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-outline">Schedule Release</label>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-outline" />
              <input
                className="w-full rounded-xl border-none bg-white py-3 pr-4 pl-10 text-sm font-medium shadow-[0px_20px_40px_rgba(21,28,39,0.04)] outline-none focus:ring-2 focus:ring-primary/20"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          </section>
        </div>
          <div className="flex items-center justify-end gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={createPost.isPending}
            className="rounded-xl border border-outline-variant/30 bg-white px-5 py-2.5 text-sm font-semibold text-on-surface transition-all hover:bg-surface-container-low active:scale-[0.99] disabled:opacity-60"
          >
            {createPost.isPending ? "Saving..." : "Save"}
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99]">
            <WandSparkles size={18} />
            Generate with AI
          </button>
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
              <button
                key={item}
                onClick={() => setPlatform(item)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  platform === item ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {item === "linkedin" ? "LinkedIn" : item === "twitter" ? "X" : item === "instagram" ? "Instagram" : "Facebook"}
              </button>
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
