"use client";

import { useMemo } from "react";

import { useCreateBrandVoice, useGetBrandVoice, useUpdateBrandVoice } from "@/hooks/useBrandVoice";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";

export default function BrandVoicePage() {
  const { data, isLoading, isError } = useGetBrandVoice();
  const createBrandVoice = useCreateBrandVoice();
  const updateBrandVoice = useUpdateBrandVoice();

  const isSaving = createBrandVoice.isPending || updateBrandVoice.isPending;
  const hasProfile = Boolean(data);

  const formalityText = useMemo(() => {
    const level = data?.formality_level ?? 3;
    if (level <= 2) return "Casual";
    if (level === 3) return "Balanced";
    return "Formal";
  }, [data?.formality_level]);

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

  if (isLoading) return <AppLoader label="Loading brand voice profile..." />;
  if (isError) return <div className="p-4 text-sm text-destructive sm:p-6">Unable to load brand voice profile.</div>;

  return (
    <PageContainer>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <PageHeader
          className="rounded-2xl p-5"
          title="Brand Voice Studio"
          description="Define voice style and writing guardrails for consistent AI-generated content."
        />

        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-2xl border border-outline-variant/20 bg-white p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Voice Style</span>
              <select
                name="style"
                defaultValue={data?.style ?? "expert"}
                className="w-full rounded-xl border border-outline-variant/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="expert">Expert</option>
                <option value="community">Community</option>
                <option value="story">Story</option>
                <option value="data">Data</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Formality Level (1-5)</span>
              <input
                type="number"
                name="formality_level"
                min={1}
                max={5}
                defaultValue={data?.formality_level ?? 3}
                className="w-full rounded-xl border border-outline-variant/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Persona Prompt *</span>
            <textarea
              name="persona_prompt"
              defaultValue={data?.persona_prompt ?? ""}
              rows={6}
              placeholder="Describe tone, writing rules, dos/don'ts, and editorial perspective..."
              className="w-full rounded-xl border border-outline-variant/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Sample Approved Posts (one per line)
            </span>
            <textarea
              name="sample_approved_posts"
              defaultValue={(data?.sample_approved_posts ?? []).join("\n")}
              rows={5}
              placeholder="Add examples of approved content for style grounding..."
              className="w-full rounded-xl border border-outline-variant/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-primary to-primary-container px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {isSaving ? "Saving..." : hasProfile ? "Update Brand Voice" : "Create Brand Voice"}
            </button>
          </div>
        </form>
      </div>

      <aside className="space-y-4 lg:col-span-2">
        <div className="rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-sm">
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
        </div>

        <div className="rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Persona Preview</h3>
          <p className="mt-3 rounded-xl border border-outline-variant/20 bg-surface-container-low/40 p-3 text-sm leading-relaxed">
            {data?.persona_prompt ?? "No persona prompt configured yet."}
          </p>
        </div>
      </aside>
    </div>
    </PageContainer>
  );
}
