"use client";

import { Loader2 } from "lucide-react";

interface AppLoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export function AppLoader({ label = "Loading...", fullScreen = false }: AppLoaderProps) {
  return (
    <div className={fullScreen ? "flex min-h-screen items-center justify-center" : "flex min-h-[200px] items-center justify-center"}>
      <div className="flex items-center gap-3 rounded-xl border border-outline-variant/20 bg-white px-4 py-3 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm font-medium text-on-surface-variant">{label}</span>
      </div>
    </div>
  );
}
