"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { LoginInput, RegisterInput } from "@/lib/validations/auth";
import { ApiResponse, User } from "@/types/api";

type ApiValidationErrorItem = {
  msg?: string;
};

type ApiErrorPayload = {
  message?: string;
  data?: ApiValidationErrorItem[] | unknown;
};

function parseApiError(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiErrorPayload> | undefined;
  const payload = axiosError?.response?.data;
  if (Array.isArray(payload?.data) && payload.data.length > 0 && payload.data[0]?.msg) {
    return payload.data[0].msg as string;
  }
  if (payload?.message) {
    return payload.message;
  }
  return fallback;
}

export function useGetAuth() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => (await api.get<ApiResponse<User>>("/api/auth/me")).data.data,
    retry: false,
  });
}

export function useCreateAuth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RegisterInput) => (await api.post<ApiResponse<User>>("/api/auth/register", payload)).data,
    onSuccess: async (response) => {
      queryClient.setQueryData(queryKeys.auth.me, response.data ?? null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success("Registration successful");
    },
    onError: (error) => toast.error(parseApiError(error, "Registration failed")),
  });
}

export function useUpdateAuth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LoginInput) => (await api.post<ApiResponse<User>>("/api/auth/login", payload)).data,
    onSuccess: async (response) => {
      queryClient.setQueryData(queryKeys.auth.me, response.data ?? null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success("Login successful");
    },
    onError: (error) => toast.error(parseApiError(error, "Login failed")),
  });
}

export function useDeleteAuth() {
  return useMutation({
    mutationFn: async () => (await api.post("/api/auth/logout")).data,
    onSuccess: () => toast.success("Logged out"),
    onError: () => toast.error("Logout failed"),
  });
}
