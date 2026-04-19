"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiResponse, PaginationData } from "@/types/api";
import { Post } from "@/types/resources";

const apiBase = () => (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function parseApiError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => null)) as { message?: string; detail?: unknown } | null;
  if (body?.message) return body.message;
  if (typeof body?.detail === "string") return body.detail;
  return "Request failed";
}

export function useGetPosts() {
  return useQuery({
    queryKey: queryKeys.posts.all,
    queryFn: async () =>
      (await api.get<ApiResponse<PaginationData<Post>>>("/api/posts")).data.data,
  });
}
export function useUploadPostMedia() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${apiBase()}/api/posts/upload-media`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const json = (await res.json()) as ApiResponse<{ url: string }>;
      return json.data.url;
    },
    onError: (e: Error) => toast.error(e.message || "Upload failed"),
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
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data as { message?: string } | undefined;
        if (msg?.message) {
          toast.error(msg.message);
          return;
        }
      }
      toast.error("Post create failed");
    },
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

