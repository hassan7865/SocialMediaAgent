"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiResponse } from "@/types/api";
import { AdminUser } from "@/types/resources";

export function useGetAdminUsers() {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: async () => (await api.get<ApiResponse<AdminUser[]>>("/api/admin/users")).data.data,
  });
}

export function useUpdateReviewerPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, canReview }: { userId: string; canReview: boolean }) =>
      (await api.patch(`/api/admin/users/${userId}/reviewer`, { can_review: canReview })).data,
    onSuccess: () => {
      toast.success("Reviewer permission updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.approval.workflow });
    },
    onError: () => toast.error("Unable to update reviewer permission"),
  });
}

export function useAddCompanyMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ identifier, fullName }: { identifier: string; fullName?: string }) =>
      (await api.post("/api/admin/users/company-members", { identifier, full_name: fullName || null })).data,
    onSuccess: () => {
      toast.success("User added to company");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
    onError: () => toast.error("Unable to add user to company"),
  });
}
