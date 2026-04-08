"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, Workflow } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useGetAdminUsers } from "@/hooks/useAdminUsers";
import { useCreateApproval, useGetApproval } from "@/hooks/useApproval";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";

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
        <section className="space-y-4 rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-black">Review Mode</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {(["full_review", "spot_check", "autonomous"] as const).map((option) => (
              <label
                key={option}
                className={`rounded-xl border p-3 text-sm transition-colors ${
                  activeMode === option
                    ? "border-primary bg-primary/10"
                    : "border-outline-variant/20 bg-surface-container-low/30"
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value={option}
                  checked={activeMode === option}
                  onChange={(event) => setSelectedMode(event.target.value)}
                  disabled={!isAdmin}
                  className="sr-only"
                />
                <p className="font-bold capitalize">{option.replace("_", " ")}</p>
                <p className="mt-1 text-xs text-on-surface-variant">{modeDescriptions[option]}</p>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Reviewers (company users)</span>
            <input
              value={reviewerSearch}
              onChange={(event) => setReviewerSearch(event.target.value)}
              placeholder="Search by name or email"
              disabled={!isAdmin}
              className="w-full rounded-xl border border-outline-variant/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="max-h-56 space-y-2 overflow-auto rounded-xl border border-outline-variant/20 p-2">
              {filteredUsers.map((user) => (
                <label key={user.id} className="flex items-center justify-between rounded-lg px-2 py-1 text-sm hover:bg-surface-container-low/40">
                  <span className="truncate">
                    <span className="font-semibold">{user.full_name || "Unnamed user"}</span>
                    <span className="ml-2 text-xs text-on-surface-variant">{user.email}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={reviewerIds.includes(user.id)}
                    disabled={!isAdmin}
                    onChange={(event) =>
                      setDraftReviewerIds((prev) => {
                        const current = prev ?? reviewerIds;
                        return event.target.checked
                          ? Array.from(new Set([...current, user.id]))
                          : current.filter((id) => id !== user.id);
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          {!isAdmin ? (
            <p className="text-xs font-semibold text-on-surface-variant">Only admins can update reviewer assignments.</p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saveWorkflow.isPending || !isAdmin}
              className="rounded-xl bg-gradient-to-r from-primary to-primary-container px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {saveWorkflow.isPending ? "Saving..." : "Save Workflow"}
            </button>
          </div>
        </section>

        <aside className="rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-sm">
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
        </aside>
      </form>
    </PageContainer>
  );
}
