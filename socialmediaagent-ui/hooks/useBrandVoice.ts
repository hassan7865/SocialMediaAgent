"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiResponse } from "@/types/api";
import { BrandVoice } from "@/types/resources";

export function useGetBrandVoice() {
  return useQuery({
    queryKey: queryKeys.brandVoice.all,
    queryFn: async () => (await api.get<ApiResponse<BrandVoice | null>>("/api/brand-voice")).data.data,
  });
}
export function useCreateBrandVoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post("/api/brand-voice", payload)).data,
    onSuccess: () => {
      toast.success("Brand voice saved");
      queryClient.invalidateQueries({ queryKey: queryKeys.brandVoice.all });
    },
    onError: () => toast.error("Brand voice save failed"),
  });
}
export function useUpdateBrandVoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.patch("/api/brand-voice", payload)).data,
    onSuccess: () => {
      toast.success("Brand voice updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.brandVoice.all });
    },
    onError: () => toast.error("Brand voice update failed"),
  });
}
export function useDeleteBrandVoice() {
  return useMutation({
    mutationFn: async () => (await api.post("/api/brand-voice/test")).data,
    onSuccess: () => toast.success("Preview generated"),
    onError: () => toast.error("Preview failed"),
  });
}
