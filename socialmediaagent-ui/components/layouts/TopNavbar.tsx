"use client";

import { useMemo } from "react";
import { ChevronDown, LogOut, Menu, Search } from "lucide-react";

import { AppSidebar } from "@/components/layouts/AppSidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

export function TopNavbar() {
  const { user, isCompanyOwner, logout } = useAuth();

  const accountLabel = useMemo(() => (isCompanyOwner ? "Company owner" : "Team member"), [isCompanyOwner]);

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
          <Input
            className="w-52 rounded-full border-none bg-surface-container-low py-2 pr-4 pl-10 lg:w-64"
            placeholder="Search content..."
            type="search"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="mx-1 hidden h-8 w-px bg-outline-variant/20 sm:mx-2 sm:block" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" className="gap-2 rounded-xl px-2 sm:gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold leading-tight">{user?.full_name || user?.email || "User"}</p>
                <p className="text-[10px] font-medium text-on-surface-variant">{accountLabel}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-on-surface-variant" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            <DropdownMenuItem
              variant="destructive"
              className="gap-2 font-medium"
              onSelect={async () => {
                await logout();
                if (typeof window !== "undefined") {
                  window.location.href = "/login";
                }
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
