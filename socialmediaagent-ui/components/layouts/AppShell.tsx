"use client";

import { PropsWithChildren } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppSidebar } from "@/components/layouts/AppSidebar";
import { TopNavbar } from "@/components/layouts/TopNavbar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <AppSidebar className="fixed top-0 left-0 z-50 hidden h-screen lg:flex" />
        <div className="flex min-h-screen flex-1 flex-col lg:pl-[240px]">
          <TopNavbar />
          <main className="mt-16 flex-1 bg-surface px-4 py-4 sm:px-6 sm:py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
