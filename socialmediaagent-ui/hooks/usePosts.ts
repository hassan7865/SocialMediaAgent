"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiResponse, PaginationData } from "@/types/api";
import { Post } from "@/types/resources";

export function useGetPosts() {
  return useQuery({
    queryKey: queryKeys.posts.all,
    queryFn: async () =>
      (await api.get<ApiResponse<PaginationData<Post>>>("/api/posts")).data.data,
  });
}
export function useCreatePosts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post("/api/posts", payload)).data,
    onSuccess: () => {
      toast.success("Post created");
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
    onError: () => toast.error("Post create failed"),
  });
}
export function useUpdatePosts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      (await api.patch(`/api/posts/${id}`, payload)).data,
    onSuccess: () => {
      toast.success("Post updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
    onError: () => toast.error("Post update failed"),
  });
}
export function useDeletePosts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/api/posts/${id}`)).data,
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
    onError: () => toast.error("Post delete failed"),
  });
}

export function useApprovePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/api/posts/${id}/approve`)).data,
    onSuccess: () => {
      toast.success("Post approved");
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
    onError: () => toast.error("Post approve failed"),
  });
}

export function useRejectPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) =>
      (await api.post(`/api/posts/${id}/reject`, null, { params: { reason } })).data,
    onSuccess: () => {
      toast.success("Post rejected");
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.approval.queue });
    },
    onError: () => toast.error("Post reject failed"),
  });
}
