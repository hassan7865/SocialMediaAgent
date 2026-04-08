"use client";

import { useCreateCompany, useGetCompany, useUpdateCompany } from "@/hooks/useCompany";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";

export default function CompanyPage() {
  const { data, isLoading, isError } = useGetCompany();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const isSaving = createCompany.isPending || updateCompany.isPending;
  const hasProfile = Boolean(data?.id);
  const submitLabel = hasProfile ? "Update Company Profile" : "Create Company Profile";
  const industryOptions = [
    "Technology",
    "E-commerce",
    "Healthcare",
    "Finance",
    "Education",
    "Real Estate",
    "Marketing",
    "Media",
    "SaaS",
    "Other",
  ];
  const audienceOptions = [
    "B2B Decision Makers",
    "B2C Consumers",
    "Startups",
    "Enterprise Teams",
    "SMBs",
    "Developers",
    "Creators",
    "Students",
    "General Audience",
    "Other",
  ];

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;
    const keyMessages = String(formData.get("key_messages") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const payload = {
      name,
      website: String(formData.get("website") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      industry: String(formData.get("industry") ?? "").trim() || null,
      target_audience: String(formData.get("target_audience") ?? "").trim() || null,
      value_proposition: String(formData.get("value_proposition") ?? "").trim() || null,
      differentiators: String(formData.get("differentiators") ?? "").trim() || null,
      key_messages: keyMessages,
    };
    if (hasProfile) {
      await updateCompany.mutateAsync(payload);
      return;
    }
    await createCompany.mutateAsync(payload);
  };

  if (isLoading) return <AppLoader label="Loading company profile..." />;
  if (isError) return <div className="p-4 text-sm text-destructive sm:p-6">Unable to load company profile.</div>;

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title="Company Profile"
        description="Set up your company details so posts, calendar, and generation features work correctly."
      />

      <form key={data?.id ?? "new-company"} onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-outline-variant/20 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Company Name *</span>
            <input name="name" defaultValue={data?.name ?? ""} className="w-full rounded-xl border border-outline-variant/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" required />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Website</span>
            <input name="website" defaultValue={data?.website ?? ""} placeholder="https://example.com" className="w-full rounded-xl border border-outline-variant/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Industry</span>
            <select name="industry" defaultValue={data?.industry ?? ""} className="w-full rounded-xl border border-outline-variant/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Select industry</option>
              {industryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Target Audience</span>
            <select name="target_audience" defaultValue={data?.target_audience ?? ""} className="w-full rounded-xl border border-outline-variant/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Select target audience</option>
              {audienceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</span>
          <textarea name="description" defaultValue={data?.description ?? ""} rows={4} className="w-full rounded-xl border border-outline-variant/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Value Proposition</span>
          <textarea name="value_proposition" defaultValue={data?.value_proposition ?? ""} rows={3} className="w-full rounded-xl border border-outline-variant/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Differentiators</span>
          <textarea name="differentiators" defaultValue={data?.differentiators ?? ""} rows={3} className="w-full rounded-xl border border-outline-variant/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Key Messages (one per line)</span>
          <textarea name="key_messages" defaultValue={(data?.key_messages ?? []).join("\n")} rows={4} className="w-full rounded-xl border border-outline-variant/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        </label>

        <div className="flex justify-end">
          <button type="submit" disabled={isSaving} className="rounded-xl bg-gradient-to-r from-primary to-primary-container px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {isSaving ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
