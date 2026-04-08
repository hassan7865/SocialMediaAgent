"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiResponse } from "@/types/api";
import {
  AnalyticsEngagementPoint,
  AnalyticsSummary,
  AnalyticsTopPost,
  HeatmapPoint,
  PlatformBreakdownItem,
} from "@/types/resources";

export function useGetAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics.summary,
    queryFn: async () => (await api.get<ApiResponse<AnalyticsSummary>>("/api/analytics/summary")).data.data,
  });
}

export function useGetAnalyticsEngagement(days = 30) {
  return useQuery({
    queryKey: [...queryKeys.analytics.engagement, days],
    queryFn: async () =>
      (await api.get<ApiResponse<{ series: AnalyticsEngagementPoint[] }>>("/api/analytics/engagement", { params: { days } })).data.data,
  });
}

export function useGetAnalyticsTopPosts() {
  return useQuery({
    queryKey: queryKeys.analytics.topPosts,
    queryFn: async () => (await api.get<ApiResponse<AnalyticsTopPost[]>>("/api/analytics/top-posts")).data.data,
  });
}

export function useGetAnalyticsHeatmap() {
  return useQuery({
    queryKey: queryKeys.analytics.heatmap,
    queryFn: async () => (await api.get<ApiResponse<{ matrix: HeatmapPoint[] }>>("/api/analytics/posting-heatmap")).data.data,
  });
}

export function useGetAnalyticsBreakdown() {
  return useQuery({
    queryKey: queryKeys.analytics.breakdown,
    queryFn: async () => (await api.get<ApiResponse<PlatformBreakdownItem[]>>("/api/analytics/platform-breakdown")).data.data,
  });
}
export function useCreateAnalytics() {
  return useMutation({
    mutationFn: async () => (await api.post("/api/analytics/sync")).data,
    onSuccess: () => toast.success("Analytics sync queued"),
    onError: () => toast.error("Analytics sync failed"),
  });
}
export function useUpdateAnalytics() {
  return useCreateAnalytics();
}
export function useDeleteAnalytics() {
  return useMutation({
    mutationFn: async () => (await api.get("/api/analytics/top-posts")).data,
    onSuccess: () => toast.success("Top posts fetched"),
    onError: () => toast.error("Fetch failed"),
  });
}
