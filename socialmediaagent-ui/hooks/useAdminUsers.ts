"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiResponse } from "@/types/api";
import { AdminUser } from "@/types/resources";

export function useGetAdminUsers() {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: async () => (await api.get<ApiResponse<AdminUser[]>>("/api/admin/users")).data.data,
  });
}
