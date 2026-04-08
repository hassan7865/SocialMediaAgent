"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useAddCompanyMember, useGetAdminUsers, useUpdateReviewerPermission } from "@/hooks/useAdminUsers";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";

export default function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const { data, isLoading, isError } = useGetAdminUsers();
  const updatePermission = useUpdateReviewerPermission();
  const addMember = useAddCompanyMember();
  const [identifier, setIdentifier] = useState("");
  const [fullName, setFullName] = useState("");

  if (!isAdmin) return <div className="p-4 text-sm text-destructive sm:p-6">You do not have permission to view this page.</div>;

  if (isLoading) return <AppLoader label="Loading users..." />;
  if (isError) return <div className="p-4 text-sm text-destructive sm:p-6">Unable to load users.</div>;

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        title="User Access"
        description="Add users to this company, then grant reviewer access."
        badge={
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <ShieldCheck size={12} />
            Admin
          </p>
        }
      />

      <div className="rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-sm">
        <h2 className="text-base font-black">Add Company User</h2>
        <p className="mt-1 text-xs text-on-surface-variant">
          Enter an existing user email/name to add membership, or enter a new email to create and add a new user to this company.
        </p>
        <form
          className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!identifier.trim()) return;
            await addMember.mutateAsync({ identifier: identifier.trim(), fullName: fullName.trim() || undefined });
            setIdentifier("");
            setFullName("");
          }}
        >
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Email or full name"
            className="w-full rounded-xl border border-outline-variant/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 md:col-span-2"
          />
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Full name (optional for new user)"
            className="w-full rounded-xl border border-outline-variant/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 md:col-span-2"
          />
          <button
            type="submit"
            disabled={addMember.isPending}
            className="rounded-xl bg-gradient-to-r from-primary to-primary-container px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {addMember.isPending ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-white shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface-container-low/50 text-left text-xs uppercase tracking-wider text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Reviewer</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((user) => (
              <tr key={user.id} className="border-t border-outline-variant/10">
                <td className="px-4 py-3 font-semibold">{user.full_name || "Unnamed user"}</td>
                <td className="px-4 py-3 text-on-surface-variant">{user.email}</td>
                <td className="px-4 py-3 capitalize">{user.role}</td>
                <td className="px-4 py-3">
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={user.can_review}
                      onChange={(event) =>
                        updatePermission.mutate({
                          userId: user.id,
                          canReview: event.target.checked,
                        })
                      }
                      disabled={updatePermission.isPending || user.role === "admin"}
                    />
                    <span className="text-xs text-on-surface-variant">
                      {user.role === "admin" ? "Admins always have review access" : user.can_review ? "Enabled" : "Disabled"}
                    </span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </PageContainer>
  );
}
