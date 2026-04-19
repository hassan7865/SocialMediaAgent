"use client";

import { useState } from "react";
import { Check, Sparkles, Briefcase, Coffee, HandHeart, Volume2, Wand2, SparklesIcon } from "lucide-react";

import { useCreateBrandVoice, useGetBrandVoice, useUpdateBrandVoice } from "@/hooks/useBrandVoice";
import type { BrandVoice } from "@/types/resources";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TONE_OPTIONS = [
  { 
    value: "professional", 
    label: "Professional", 
    icon: Briefcase,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Formal, polished, authoritative for business content" 
  },
  { 
    value: "casual", 
    label: "Casual", 
    icon: Coffee,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-50",
    description: "Relaxed, informal, friendly and approachable" 
  },
  { 
    value: "friendly", 
    label: "Friendly", 
    icon: HandHeart,
    iconColor: "text-pink-600",
    bgColor: "bg-pink-50",
    description: "Warm, supportive, and personable" 
  },
  { 
    value: "authoritative", 
    label: "Authoritative", 
    icon: Volume2,
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "Confident, knowledgeable, commanding" 
  },
  { 
    value: "humorous", 
    label: "Humorous", 
    icon: Wand2,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-50",
    description: "Witty, playful, entertaining" 
  },
  { 
    value: "inspirational", 
    label: "Inspirational", 
    icon: SparklesIcon,
    iconColor: "text-cyan-600",
    bgColor: "bg-cyan-50",
    description: "Uplifting, motivational, aspirational" 
  },
] as const;

function BrandVoiceForm({ data }: { data: BrandVoice | null | undefined }) {
  const createBrandVoice = useCreateBrandVoice();
  const updateBrandVoice = useUpdateBrandVoice();
  const [tone, setTone] = useState(data?.tone ?? "professional");

  const isSaving = createBrandVoice.isPending || updateBrandVoice.isPending;
  const hasProfile = Boolean(data);

  const onSubmit = async () => {
    const payload = { tone };
    if (hasProfile) {
      await updateBrandVoice.mutateAsync(payload);
      return;
    }
    await createBrandVoice.mutateAsync(payload);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-outline-variant/20 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-on-surface mb-1">Choose Your Brand Tone</h3>
        <p className="text-sm text-on-surface-variant mb-6">Select the voice that best represents your brand for AI-generated content.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TONE_OPTIONS.map((opt) => {
            const IconComponent = opt.icon;
            return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTone(opt.value)}
              className={cn(
                "relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200",
                tone === opt.value
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-outline-variant/30 bg-white hover:border-primary/50 hover:bg-surface-container-low"
              )}
            >
              <div className={cn("p-2 rounded-lg", opt.bgColor)}>
                <IconComponent className={cn("w-5 h-5", opt.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "block font-semibold",
                  tone === opt.value ? "text-primary" : "text-on-surface"
                )}>
                  {opt.label}
                </span>
                <span className="text-xs text-on-surface-variant line-clamp-2">
                  {opt.description}
                </span>
              </div>
              {tone === opt.value && (
                <Check className="absolute top-3 right-3 h-5 w-5 text-primary" />
              )}
            </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={isSaving}
          className="rounded-xl bg-gradient-to-r from-primary to-primary-container bg-clip-padding px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg"
        >
          {isSaving ? "Saving..." : hasProfile ? "Update Tone" : "Save Tone"}
        </Button>
      </div>
    </div>
  );
}

export default function BrandVoicePage() {
  const { data, isLoading, isError } = useGetBrandVoice();

  if (isLoading) return <AppLoader label="Loading brand voice..." />;
  if (isError) return <div className="p-4 text-sm text-destructive sm:p-6">Unable to load brand voice.</div>;

  const formKey = data?.tone ?? "new";

  const selectedTone = TONE_OPTIONS.find(t => t.value === data?.tone);

  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <PageHeader
            className="rounded-2xl p-5"
            title="Brand Voice"
            description="Choose how your brand sounds to your audience."
            badge={
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles className="w-3 h-3" />
                Brand Voice
              </p>
            }
          />

          <BrandVoiceForm key={formKey} data={data} />
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-outline-variant/20 bg-gradient-to-br from-primary/5 to-primary-container/30 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-1">Current Tone</h3>
            <p className="text-xs text-on-surface-variant mb-4">Used for AI content generation</p>
            {selectedTone ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-sm border border-outline-variant/20">
                {(() => {
                  const IconComp = selectedTone.icon;
                  return <div className={cn("p-3 rounded-lg", selectedTone.bgColor)}><IconComp className={cn("w-6 h-6", selectedTone.iconColor)} /></div>;
                })()}
                <div>
                  <span className="block text-lg font-semibold text-on-surface capitalize">{selectedTone.label}</span>
                  <span className="text-xs text-on-surface-variant">AI will use this tone</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-outline-variant/40 bg-white/50 p-4 text-center">
                <span className="text-sm text-on-surface-variant">No tone selected yet</span>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-outline-variant/20 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              How it works
            </h3>
            <ul className="space-y-2 text-sm text-on-surface">
              <li className="flex items-start gap-2">
                <span className="text-primary">1.</span>
                Select a tone that matches your brand
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">2.</span>
                Save your choice
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">3.</span>
                AI uses this tone for post generation
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}