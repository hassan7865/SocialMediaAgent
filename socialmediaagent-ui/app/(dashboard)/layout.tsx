import { PropsWithChildren } from "react";

import { AppShell } from "@/components/layouts/AppShell";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return <AppShell>{children}</AppShell>;
}
