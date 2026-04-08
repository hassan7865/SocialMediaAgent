"use client";

import { useMemo, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Search } from "lucide-react";

import { AppSidebar } from "@/components/layouts/AppSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

export function TopNavbar() {
  const { user, isAdmin, canReview, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const roleLabel = useMemo(() => {
    if (isAdmin) return "Admin";
    if (canReview) return "Reviewer";
    return "User";
  }, [canReview, isAdmin]);

  return (
    <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:left-[240px] lg:px-8">
      <div className="flex items-center gap-3 sm:gap-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="lg:hidden">
              <Menu className="h-5 w-5 text-on-surface-variant" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] p-0" showCloseButton>
            <AppSidebar className="h-full w-full border-r-0" />
          </SheetContent>
        </Sheet>
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-outline" />
          <input
            className="w-52 rounded-full border-none bg-surface-container-low py-2 pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-primary/20 lg:w-64"
            placeholder="Search content..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative rounded-full p-2 transition-all hover:bg-surface-container-low">
          <Bell className="h-5 w-5 text-on-surface-variant" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <div className="mx-1 hidden h-8 w-px bg-outline-variant/20 sm:mx-2 sm:block" />
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-surface-container-low sm:gap-3"
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold leading-tight">{user?.full_name || user?.email || "User"}</p>
              <p className="text-[10px] font-medium text-on-surface-variant">{roleLabel}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-on-surface-variant" />
          </button>

          {isMenuOpen ? (
            <div className="absolute top-12 right-0 min-w-48 rounded-xl border border-outline-variant/20 bg-white p-2 shadow-lg">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                onClick={async () => {
                  setIsMenuOpen(false);
                  await logout();
                  if (typeof window !== "undefined") {
                    window.location.href = "/login";
                  }
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
