"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiResponse } from "@/types/api";
import { CalendarItem } from "@/types/resources";

export function useGetCalendar(week?: string) {
  return useQuery({
    queryKey: [...queryKeys.calendar.all, week ?? "all"],
    queryFn: async () => (await api.get<ApiResponse<CalendarItem[]>>("/api/calendar", { params: week ? { week } : undefined })).data.data,
  });
}
export function useCreateCalendar() {
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post("/api/calendar/generate", payload)).data,
    onSuccess: () => toast.success("Calendar generation queued"),
    onError: () => toast.error("Calendar generation failed"),
  });
}
export function useUpdateCalendar() {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      (await api.patch(`/api/calendar/${id}`, payload)).data,
    onSuccess: () => toast.success("Calendar updated"),
    onError: () => toast.error("Calendar update failed"),
  });
}
export function useDeleteCalendar() {
  return useMutation({
    mutationFn: async () => (await api.post("/api/calendar/approve-all")).data,
    onSuccess: () => toast.success("Calendar approved"),
    onError: () => toast.error("Approve all failed"),
  });
}
