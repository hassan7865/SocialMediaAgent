"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, Workflow } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useGetAdminUsers } from "@/hooks/useAdminUsers";
import { useCreateApproval, useGetApproval } from "@/hooks/useApproval";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function ApprovalWorkflowPage() {
  const { isAdmin } = useAuth();
  const { data, isLoading, isError } = useGetApproval();
  const { data: users = [] } = useGetAdminUsers();
  const saveWorkflow = useCreateApproval();
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [draftReviewerIds, setDraftReviewerIds] = useState<string[] | null>(null);
  const [reviewerSearch, setReviewerSearch] = useState("");

  const modeDescriptions = useMemo(
    () => ({
      full_review: "Every post must be reviewed before it can be published.",
      spot_check: "Only sampled posts require manual review.",
      autonomous: "System can publish automatically with minimal intervention.",
    }),
    [],
  );

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    const mode = String(formData.get("mode") ?? (selectedMode || "full_review"));
    const reviewer_user_ids = draftReviewerIds ?? data?.reviewer_user_ids ?? [];
    await saveWorkflow.mutateAsync({ mode, reviewer_user_ids });
  };

  const mode = data?.mode ?? "full_review";
  const activeMode = selectedMode || mode;

  const reviewerIds = draftReviewerIds ?? data?.reviewer_user_ids ?? [];

  const filteredUsers = users.filter((user) => {
    const q = reviewerSearch.trim().toLowerCase();
    if (!q) return true;
    return user.email.toLowerCase().includes(q) || (user.full_name ?? "").toLowerCase().includes(q);
  });

  if (isLoading) return <AppLoader label="Loading approval workflow..." />;
  if (isError) return <div className="p-4 text-sm text-destructive sm:p-6">Unable to load approval workflow.</div>;

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        title="Approval Workflow"
        description="Configure how content is approved before publishing."
        badge={
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Workflow size={12} />
            Governance
          </p>
        }
      />

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <input type="hidden" name="mode" value={activeMode} readOnly aria-hidden />
        <Card className="border-outline-variant/20 bg-white shadow-sm ring-outline-variant/20 lg:col-span-2">
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-lg font-black">Review Mode</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {(["full_review", "spot_check", "autonomous"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={activeMode === option ? "default" : "outline"}
                  disabled={!isAdmin}
                  className="h-auto flex-col items-start gap-1 rounded-xl p-3 text-left text-sm whitespace-normal"
                  onClick={() => setSelectedMode(option)}
                >
                  <span className="font-bold capitalize">{option.replace("_", " ")}</span>
                  <span
                    className={cn(
                      "text-xs font-normal",
                      activeMode === option ? "text-primary-foreground/85" : "text-muted-foreground",
                    )}
                  >
                    {modeDescriptions[option]}
                  </span>
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Reviewers (company users)</span>
              <Input
                value={reviewerSearch}
                onChange={(event) => setReviewerSearch(event.target.value)}
                placeholder="Search by name or email"
                disabled={!isAdmin}
                className="h-auto min-h-9 rounded-xl py-2"
              />
              <div className="max-h-56 space-y-2 overflow-auto rounded-xl border border-outline-variant/20 p-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-sm hover:bg-surface-container-low/40"
                  >
                    <Label htmlFor={`reviewer-${user.id}`} className="min-w-0 flex-1 cursor-pointer truncate font-normal">
                      <span className="font-semibold">{user.full_name || "Unnamed user"}</span>
                      <span className="ml-2 text-xs text-on-surface-variant">{user.email}</span>
                    </Label>
                    <Checkbox
                      id={`reviewer-${user.id}`}
                      checked={reviewerIds.includes(user.id)}
                      disabled={!isAdmin}
                      onCheckedChange={(checked) =>
                        setDraftReviewerIds((prev) => {
                          const current = prev ?? reviewerIds;
                          return checked === true
                            ? Array.from(new Set([...current, user.id]))
                            : current.filter((id) => id !== user.id);
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {!isAdmin ? (
              <p className="text-xs font-semibold text-on-surface-variant">Only admins can update reviewer assignments.</p>
            ) : null}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saveWorkflow.isPending || !isAdmin}
                className="rounded-xl bg-gradient-to-r from-primary to-primary-container font-bold text-primary-foreground"
              >
                {saveWorkflow.isPending ? "Saving..." : "Save Workflow"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-outline-variant/20 bg-white shadow-sm ring-outline-variant/20">
          <CardContent className="pt-6">
            <h3 className="text-base font-black">Current Policy</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-xl bg-surface-container-low/40 p-3">
                <p className="text-xs text-on-surface-variant">Mode</p>
                <p className="font-semibold capitalize">{activeMode.replace("_", " ")}</p>
              </div>
              <div className="rounded-xl bg-surface-container-low/40 p-3">
                <p className="text-xs text-on-surface-variant">Reviewers</p>
                <p className="font-semibold">{data?.reviewer_user_ids?.length ?? 0}</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-800">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase">
                  <ShieldCheck size={14} />
                  Approval Guard Active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageContainer>
  );
}
