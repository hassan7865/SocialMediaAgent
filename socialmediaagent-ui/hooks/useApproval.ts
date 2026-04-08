"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiResponse } from "@/types/api";
import { ApprovalWorkflow, Post } from "@/types/resources";

export function useGetApproval() {
  return useQuery({
    queryKey: queryKeys.approval.workflow,
    queryFn: async () => (await api.get<ApiResponse<ApprovalWorkflow>>("/api/approval-workflow")).data.data,
  });
}

export function useGetApprovalQueue() {
  return useQuery({
    queryKey: queryKeys.approval.queue,
    queryFn: async () => (await api.get<ApiResponse<Post[]>>("/api/approval-queue")).data.data,
  });
}
export function useCreateApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.patch("/api/approval-workflow", payload)).data,
    onSuccess: () => {
      toast.success("Workflow saved");
      queryClient.invalidateQueries({ queryKey: queryKeys.approval.workflow });
    },
    onError: () => toast.error("Workflow save failed"),
  });
}
export function useUpdateApproval() {
  return useCreateApproval();
}
export function useDeleteApproval() {
  return useMutation({
    mutationFn: async () => (await api.get("/api/approval-queue")).data,
    onSuccess: () => toast.success("Queue fetched"),
    onError: () => toast.error("Queue fetch failed"),
  });
}
