"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiResponse } from "@/types/api";
import { PlatformConnection } from "@/types/resources";

export function useGetPlatforms() {
  return useQuery({
    queryKey: queryKeys.platforms.all,
    queryFn: async () => (await api.get<ApiResponse<PlatformConnection[]>>("/api/platforms")).data.data,
  });
}
export function useCreatePlatforms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (platform: string) => (await api.get(`/api/platforms/callback/${platform}`)).data,
    onSuccess: () => {
      toast.success("Platform connected");
      queryClient.invalidateQueries({ queryKey: queryKeys.platforms.all });
    },
    onError: () => toast.error("Platform connect failed"),
  });
}
export function useUpdatePlatforms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/api/platforms/${id}/test`)).data,
    onSuccess: () => {
      toast.success("Platform validated");
      queryClient.invalidateQueries({ queryKey: queryKeys.platforms.all });
    },
    onError: () => toast.error("Validation failed"),
  });
}
export function useDeletePlatforms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/api/platforms/${id}`)).data,
    onSuccess: () => {
      toast.success("Platform disconnected");
      queryClient.invalidateQueries({ queryKey: queryKeys.platforms.all });
    },
    onError: () => toast.error("Disconnect failed"),
  });
}
