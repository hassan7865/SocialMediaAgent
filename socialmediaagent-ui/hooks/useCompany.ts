"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Company } from "@/types/resources";
import { ApiResponse } from "@/types/api";

export function useGetCompany() {
  return useQuery({
    queryKey: queryKeys.company.all,
    queryFn: async () => (await api.get<ApiResponse<Company | null>>("/api/company")).data.data,
  });
}
export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post("/api/company", payload)).data,
    onSuccess: () => {
      toast.success("Company saved");
      queryClient.invalidateQueries({ queryKey: queryKeys.company.all });
    },
    onError: () => toast.error("Company save failed"),
  });
}
export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.patch("/api/company", payload)).data,
    onSuccess: () => {
      toast.success("Company updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.company.all });
    },
    onError: () => toast.error("Company update failed"),
  });
}
export function useDeleteCompany() {
  return useMutation({
    mutationFn: async () => (await api.post("/api/company/scrape", { url: "" })).data,
    onSuccess: () => toast.success("Company action completed"),
    onError: () => toast.error("Company action failed"),
  });
}
