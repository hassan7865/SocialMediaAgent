"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiResponse, PaginationData } from "@/types/api";
import { Job } from "@/types/resources";

export function useGetJobs() {
  return useQuery({
    queryKey: queryKeys.jobs.all,
    queryFn: async () => (await api.get<ApiResponse<PaginationData<Job>>>("/api/jobs")).data.data,
  });
}
export function useCreateJobs() {
  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/api/jobs/${id}/cancel`)).data,
    onSuccess: () => toast.success("Job cancelled"),
    onError: () => toast.error("Job cancel failed"),
  });
}
export function useUpdateJobs() {
  return useCreateJobs();
}
export function useDeleteJobs() {
  return useCreateJobs();
}
