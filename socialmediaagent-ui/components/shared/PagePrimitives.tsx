"use client";

import { PropsWithChildren, ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageContainerProps = PropsWithChildren<{
  className?: string;
  wide?: boolean;
}>;

export function PageContainer({ children, className, wide = false }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full space-y-6 px-0 py-2 sm:space-y-8 sm:py-4",
        wide ? "max-w-7xl" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

type PageHeaderProps = {
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, badge, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("rounded-3xl border border-outline-variant/20 bg-white p-6 shadow-sm", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {badge ? <div className="mb-2">{badge}</div> : null}
          <h1 className="text-3xl font-black tracking-tight text-on-background">{title}</h1>
          {description ? <p className="mt-1 text-sm text-on-surface-variant">{description}</p> : null}
        </div>
        {actions ? <div className="w-full sm:w-auto">{actions}</div> : null}
      </div>
    </div>
  );
}
