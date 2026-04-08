"use client";

import { PropsWithChildren, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { AppLoader } from "@/components/shared/AppLoader";

export function AuthGuard({ children }: PropsWithChildren) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (user) return;
    if (pathname === "/login") return;
    router.replace("/login");
  }, [isLoading, pathname, router, user]);

  if (isLoading) {
    return <AppLoader label="Checking your session..." fullScreen />;
  }

  if (!user) {
    return <AppLoader label="Redirecting to login..." fullScreen />;
  }

  return <>{children}</>;
}
