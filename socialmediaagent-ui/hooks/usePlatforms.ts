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

type ConnectResponse = { auth_url: string; platform: string };

export function useCreatePlatforms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (platform: string) =>
      (await api.post<ApiResponse<ConnectResponse>>(`/api/platforms/connect/${platform}`)).data,
    onSuccess: (wrapper) => {
      const authUrl = wrapper.data?.auth_url;
      if (authUrl && typeof window !== "undefined") {
        window.location.href = authUrl;
        return;
      }
      toast.error("No OAuth URL returned. Is POSTFORME_API_KEY set on the API?");
    },
    onError: () => toast.error("Could not start Post for Me connection"),
  });
}

export function useSyncPlatform() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (platform: string) =>
      (await api.post<ApiResponse<PlatformConnection>>(`/api/platforms/sync/${platform}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platforms.all });
    },
    onError: () => toast.error("Could not sync account from Post for Me"),
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
