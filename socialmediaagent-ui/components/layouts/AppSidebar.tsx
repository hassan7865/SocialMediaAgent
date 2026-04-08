"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChartNoAxesColumn, Building2, Workflow, PenSquare, Sparkles, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const baseLinks = [
  { href: "/company", label: "Company", icon: Building2 },
  { href: "/brand-voice", label: "Brand Voice", icon: Sparkles },
  { href: "/platforms", label: "Platforms", icon: Workflow },
  { href: "/posts", label: "Posts", icon: PenSquare },
  { href: "/calendar", label: "Content Calendar", icon: CalendarDays },
  { href: "/approval-workflow", label: "Approval", icon: Workflow },
  { href: "/analytics", label: "Reports", icon: ChartNoAxesColumn },
];

type AppSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const links = isAdmin ? [...baseLinks, { href: "/admin/users", label: "User Access", icon: Settings }] : baseLinks;

  return (
    <aside
      className={cn(
        "flex h-full w-[240px] flex-col border-r border-outline-variant/20 bg-surface-container-low px-4 py-6",
        className,
      )}
    >
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container text-white">
          <Sparkles size={18} />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tighter text-on-surface">SocialAgent</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Editorial Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium tracking-tight transition-colors",
              pathname.startsWith(link.href)
                ? "bg-surface-container text-primary font-bold"
                : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary",
            )}
          >
            <link.icon size={17} />
            {link.label}
          </Link>
        ))}
      </nav>

    </aside>
  );
}
