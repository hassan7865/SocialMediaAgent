"use client";

import { useState } from "react";

import { useCreateCompany, useGetCompany, useUpdateCompany } from "@/hooks/useCompany";
import type { Company } from "@/types/resources";
import { AppLoader } from "@/components/shared/AppLoader";
import { FormSelectField } from "@/components/shared/FormSelectField";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

function CompanyProfileForm({ data }: { data: Company | null | undefined }) {
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const [industry, setIndustry] = useState(data?.industry ?? "");
  const [targetAudience, setTargetAudience] = useState(data?.target_audience ?? "");

  const isSaving = createCompany.isPending || updateCompany.isPending;
  const hasProfile = Boolean(data?.id);
  const submitLabel = hasProfile ? "Update Company Profile" : "Create Company Profile";

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

  return (
    <Card className="border-outline-variant/20 bg-white shadow-sm ring-outline-variant/20">
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Company Name *
              </Label>
              <Input
                id="company-name"
                name="name"
                defaultValue={data?.name ?? ""}
                className="h-auto min-h-9 rounded-xl py-2"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-website" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Website
              </Label>
              <Input
                id="company-website"
                name="website"
                defaultValue={data?.website ?? ""}
                placeholder="https://example.com"
                className="h-auto min-h-9 rounded-xl py-2"
              />
            </div>
            <FormSelectField
              id="company-industry"
              name="industry"
              label="Industry"
              value={industry}
              onValueChange={setIndustry}
              placeholder="Select industry"
              options={industryOptions.map((option) => ({ value: option, label: option }))}
            />
            <FormSelectField
              id="company-audience"
              name="target_audience"
              label="Target Audience"
              value={targetAudience}
              onValueChange={setTargetAudience}
              placeholder="Select target audience"
              options={audienceOptions.map((option) => ({ value: option, label: option }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-description" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Description
            </Label>
            <Textarea
              id="company-description"
              name="description"
              defaultValue={data?.description ?? ""}
              rows={4}
              className="min-h-[100px] rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-value-prop" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Value Proposition
            </Label>
            <Textarea
              id="company-value-prop"
              name="value_proposition"
              defaultValue={data?.value_proposition ?? ""}
              rows={3}
              className="min-h-[80px] rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-diff" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Differentiators
            </Label>
            <Textarea
              id="company-diff"
              name="differentiators"
              defaultValue={data?.differentiators ?? ""}
              rows={3}
              className="min-h-[80px] rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-key-messages" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Key Messages (one per line)
            </Label>
            <Textarea
              id="company-key-messages"
              name="key_messages"
              defaultValue={(data?.key_messages ?? []).join("\n")}
              rows={4}
              className="min-h-[100px] rounded-xl"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-primary to-primary-container bg-clip-padding px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              {isSaving ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function CompanyPage() {
  const { data, isLoading, isError } = useGetCompany();

  if (isLoading) return <AppLoader label="Loading company profile..." />;
  if (isError) return <div className="p-4 text-sm text-destructive sm:p-6">Unable to load company profile.</div>;

  return (
    <PageContainer>
      <PageHeader
        title="Company Profile"
        description="Set up your company details so posts, calendar, and generation features work correctly."
        badge={
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Company
          </p>
        }
      />

      <CompanyProfileForm key={data?.id ?? "new-company"} data={data} />
    </PageContainer>
  );
}
