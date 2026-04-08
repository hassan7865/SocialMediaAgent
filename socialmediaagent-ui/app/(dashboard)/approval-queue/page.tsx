"use client";

import { useState } from "react";
import { CheckCircle2, CircleSlash, Clock3 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useGetApprovalQueue } from "@/hooks/useApproval";
import { useApprovePost, useRejectPost } from "@/hooks/usePosts";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";

export default function ApprovalQueuePage() {
  const { canReview } = useAuth();
  const { data, isLoading, isError } = useGetApprovalQueue();
  const approvePost = useApprovePost();
  const rejectPost = useRejectPost();
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  if (isLoading) return <AppLoader label="Loading approval queue..." />;
  if (isError) return <div className="p-4 text-sm text-destructive sm:p-6">Unable to load approval queue.</div>;

  return (
    <PageContainer>
      <PageHeader
        title="Approval Queue"
        description="Review pending content and approve or reject quickly."
        actions={
          !canReview ? (
            <p className="text-xs font-semibold text-on-surface-variant">Your account has read-only queue access.</p>
          ) : null
        }
      />

      {(data ?? []).length === 0 ? (
        <div className="rounded-2xl border border-outline-variant/20 bg-white p-6 text-sm text-on-surface-variant shadow-sm">
          No pending posts in queue.
        </div>
      ) : (
        <div className="space-y-4">
          {(data ?? []).map((item) => (
            <div key={item.id} className="rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{item.platform}</p>
                  <p className="mt-1 text-sm leading-relaxed">{item.content_text}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-on-surface-variant">
                    <Clock3 size={12} />
                    {item.scheduled_at ? `Scheduled ${new Date(item.scheduled_at).toLocaleString()}` : "No schedule"}
                  </p>
                </div>

                <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700">
                  Pending
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  value={rejectReasons[item.id] ?? ""}
                  onChange={(e) => setRejectReasons((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  placeholder="Rejection reason (optional)"
                  disabled={!canReview}
                  className="rounded-xl border border-outline-variant/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 md:col-span-2"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => approvePost.mutate(item.id)}
                    disabled={approvePost.isPending || !canReview}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
                  >
                    <CheckCircle2 size={14} />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      rejectPost.mutate({
                        id: item.id,
                        reason: rejectReasons[item.id] || "Rejected in approval queue",
                      })
                    }
                    disabled={rejectPost.isPending || !canReview}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive disabled:opacity-60"
                  >
                    <CircleSlash size={14} />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
