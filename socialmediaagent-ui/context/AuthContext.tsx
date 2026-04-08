"use client";

import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiResponse, User } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  canReview: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const res = await api.get<ApiResponse<User>>("/api/auth/me");
      return res.data.data;
    },
    retry: false,
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data ?? null,
      isAdmin: (data?.role ?? "user") === "admin",
      canReview: (data?.role ?? "user") === "admin" || Boolean(data?.can_review),
      isLoading,
      logout: async () => {
        await api.post("/api/auth/logout");
        queryClient.setQueryData(queryKeys.auth.me, null);
      },
    }),
    [data, isLoading, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
