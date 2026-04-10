"use client";

import { useMemo, useState } from "react";

import { useCreateBrandVoice, useGetBrandVoice, useUpdateBrandVoice } from "@/hooks/useBrandVoice";
import type { BrandVoice } from "@/types/resources";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const STYLE_OPTIONS = [
  { value: "expert", label: "Expert" },
  { value: "community", label: "Community" },
  { value: "story", label: "Story" },
  { value: "data", label: "Data" },
] as const;

function BrandVoiceForm({ data }: { data: BrandVoice | null | undefined }) {
  const createBrandVoice = useCreateBrandVoice();
  const updateBrandVoice = useUpdateBrandVoice();
  const [style, setStyle] = useState(data?.style ?? "expert");

  const isSaving = createBrandVoice.isPending || updateBrandVoice.isPending;
  const hasProfile = Boolean(data);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      style: String(formData.get("style") ?? "expert"),
      formality_level: Number(formData.get("formality_level") ?? 3),
      persona_prompt: String(formData.get("persona_prompt") ?? "").trim(),
      sample_approved_posts: String(formData.get("sample_approved_posts") ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };
    if (!payload.persona_prompt) return;
    if (hasProfile) {
      await updateBrandVoice.mutateAsync(payload);
      return;
    }
    await createBrandVoice.mutateAsync(payload);
  };

  return (
    <Card className="border-outline-variant/20 bg-white shadow-sm ring-outline-variant/20">
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <input type="hidden" name="style" value={style} readOnly aria-hidden />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand-style" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Voice Style
              </Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="brand-style" className="h-auto min-h-9 w-full rounded-xl py-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="formality_level" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Formality Level (1-5)
              </Label>
              <Input
                id="formality_level"
                type="number"
                name="formality_level"
                min={1}
                max={5}
                defaultValue={data?.formality_level ?? 3}
                className="h-auto min-h-9 rounded-xl py-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona_prompt" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Persona Prompt *
            </Label>
            <Textarea
              id="persona_prompt"
              name="persona_prompt"
              defaultValue={data?.persona_prompt ?? ""}
              rows={6}
              placeholder="Describe tone, writing rules, dos/don'ts, and editorial perspective..."
              className="min-h-[140px] rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sample_approved_posts" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Sample Approved Posts (one per line)
            </Label>
            <Textarea
              id="sample_approved_posts"
              name="sample_approved_posts"
              defaultValue={(data?.sample_approved_posts ?? []).join("\n")}
              rows={5}
              placeholder="Add examples of approved content for style grounding..."
              className="min-h-[120px] rounded-xl"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-primary to-primary-container px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              {isSaving ? "Saving..." : hasProfile ? "Update Brand Voice" : "Create Brand Voice"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function BrandVoicePage() {
  const { data, isLoading, isError } = useGetBrandVoice();

  const formalityText = useMemo(() => {
    const level = data?.formality_level ?? 3;
    if (level <= 2) return "Casual";
    if (level === 3) return "Balanced";
    return "Formal";
  }, [data?.formality_level]);

  if (isLoading) return <AppLoader label="Loading brand voice profile..." />;
  if (isError) return <div className="p-4 text-sm text-destructive sm:p-6">Unable to load brand voice profile.</div>;

  const formKey = data ? `${data.style}-${data.formality_level}-${data.persona_prompt.length}` : "new";

  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <PageHeader
            className="rounded-2xl p-5"
            title="Brand Voice Studio"
            description="Define voice style and writing guardrails for consistent AI-generated content."
          />

          <BrandVoiceForm key={formKey} data={data} />
        </div>

        <aside className="space-y-4 lg:col-span-2">
          <Card className="border-outline-variant/20 bg-white shadow-sm ring-outline-variant/20">
            <CardContent className="pt-6">
              <h3 className="text-lg font-black">Voice Snapshot</h3>
              <p className="mt-1 text-xs text-on-surface-variant">Current applied profile</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low/50 px-3 py-2">
                  <span className="text-on-surface-variant">Style</span>
                  <span className="font-semibold capitalize">{data?.style ?? "Not set"}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low/50 px-3 py-2">
                  <span className="text-on-surface-variant">Formality</span>
                  <span className="font-semibold">{formalityText}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low/50 px-3 py-2">
                  <span className="text-on-surface-variant">Samples</span>
                  <span className="font-semibold">{data?.sample_approved_posts?.length ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-outline-variant/20 bg-white shadow-sm ring-outline-variant/20">
            <CardContent className="pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Persona Preview</h3>
              <p className="mt-3 rounded-xl border border-outline-variant/20 bg-surface-container-low/40 p-3 text-sm leading-relaxed">
                {data?.persona_prompt ?? "No persona prompt configured yet."}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
