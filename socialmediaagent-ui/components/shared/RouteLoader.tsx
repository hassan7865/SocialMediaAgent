"use client";

import { usePathname } from "next/navigation";

import { AppLoader } from "@/components/shared/AppLoader";

const routeLabels: Array<{ prefix: string; label: string }> = [
  { prefix: "/posts", label: "Loading posts..." },
  { prefix: "/calendar", label: "Loading calendar..." },
  { prefix: "/analytics", label: "Loading analytics..." },
  { prefix: "/company", label: "Loading company profile..." },
  { prefix: "/brand-voice", label: "Loading brand voice..." },
  { prefix: "/platforms", label: "Loading platform connections..." },
  { prefix: "/approval-workflow", label: "Loading approval workflow..." },
  { prefix: "/approval-queue", label: "Loading approval queue..." },
  { prefix: "/admin/users", label: "Loading user access..." },
];

export function RouteLoader() {
  const pathname = usePathname();
  const routeMatch = routeLabels.find((item) => pathname.startsWith(item.prefix));
  const label = routeMatch?.label ?? "Preparing your workspace...";

  return <AppLoader label={label} fullScreen />;
}
