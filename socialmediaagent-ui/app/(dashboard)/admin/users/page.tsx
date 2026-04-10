"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useAddCompanyMember, useGetAdminUsers, useUpdateReviewerPermission } from "@/hooks/useAdminUsers";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

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

      <Card className="border-outline-variant/20 bg-white shadow-sm ring-outline-variant/20">
        <CardContent className="pt-6">
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
            <Input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Email or full name"
              className={cn("h-auto min-h-9 rounded-xl py-2 md:col-span-2")}
            />
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Full name (optional for new user)"
              className={cn("h-auto min-h-9 rounded-xl py-2 md:col-span-2")}
            />
            <Button
              type="submit"
              disabled={addMember.isPending}
              className="rounded-xl bg-gradient-to-r from-primary to-primary-container font-bold text-primary-foreground"
            >
              {addMember.isPending ? "Adding..." : "Add User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-outline-variant/20 bg-white shadow-sm ring-outline-variant/20">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow className="border-outline-variant/10 hover:bg-surface-container-low/50">
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-on-surface-variant">Name</TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-on-surface-variant">Email</TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-on-surface-variant">Role</TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wider text-on-surface-variant">Reviewer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((user) => (
              <TableRow key={user.id} className="border-outline-variant/10">
                <TableCell className="px-4 py-3 font-semibold">{user.full_name || "Unnamed user"}</TableCell>
                <TableCell className="px-4 py-3 text-on-surface-variant">{user.email}</TableCell>
                <TableCell className="px-4 py-3 capitalize">{user.role}</TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={user.can_review}
                      disabled={updatePermission.isPending || user.role === "admin"}
                      onCheckedChange={(checked) =>
                        updatePermission.mutate({
                          userId: user.id,
                          canReview: checked === true,
                        })
                      }
                    />
                    <Label className="cursor-pointer text-xs font-normal text-on-surface-variant">
                      {user.role === "admin" ? "Admins always have review access" : user.can_review ? "Enabled" : "Disabled"}
                    </Label>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}
