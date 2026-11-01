import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Calculator,
  CheckCircle2,
  Clock,
  FolderOpen,
  GraduationCap,
  Info,
  LayoutDashboard,
  Menu,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSfr } from "@/context/sfr-context";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Student Data", href: "/student-data", icon: Users },
  { label: "Faculty Data", href: "/faculty-data", icon: UserRound },
  { label: "SFR Calculation", href: "/sfr-calculation", icon: Calculator },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "About", href: "/about", icon: Info },
];

function SmartSfrLogo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-md bg-sidebar-accent text-sidebar-primary">
        <GraduationCap className="size-7" strokeWidth={2.2} aria-hidden="true" />
      </div>
      <div>
        <div className="text-xl font-bold text-sidebar-foreground">SmartSFR</div>
        <div className="text-[10px] text-sidebar-muted">NBA Compliance Made Easier</div>
      </div>
    </Link>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <>
      {open ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-overlay md:hidden"
          onClick={onClose}
          type="button"
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 md:static md:w-[214px] md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-24 items-center justify-between px-5">
          <SmartSfrLogo />
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>

        <nav aria-label="Main navigation" className="mt-1 space-y-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === "/"
                ? currentPath === "/"
                : currentPath.startsWith(href);

            return (
              <Link
                key={label}
                to={href}
                onClick={onClose}
                className={cn(
                  "flex h-12 w-full items-center gap-4 border-l-[3px] px-5 text-left text-sm transition-colors",
                  isActive
                    ? "border-sidebar-primary bg-sidebar-accent font-semibold text-sidebar-foreground"
                    : "border-transparent text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2 px-5 py-4 text-[10px] text-sidebar-muted">
          <div className="flex items-center gap-2">
            <span>SmartSFR v1.0</span>
            <span aria-hidden="true">|</span>
            <span>AIML Project</span>
          </div>
          <p className="text-[9px] text-sidebar-muted/70">NBA Accreditation Chapter 4, Sec 4.1</p>
        </div>
      </aside>
    </>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { analysis, analysisState } = useSfr();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const currentNav = NAV_ITEMS.find((item) =>
    item.href === "/" ? currentPath === "/" : currentPath.startsWith(item.href)
  );

  return (
    <div className="flex min-h-screen bg-workspace font-sans text-foreground">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-w-0 flex-1 flex flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-topbar px-4 md:px-7 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu />
            </Button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base md:text-lg text-foreground">
                {currentNav?.label ?? "SmartSFR"}
              </span>
              {analysis ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-[11px] font-medium text-success-foreground border border-success-border">
                  <CheckCircle2 className="size-3" />
                  Analysis Ready
                </span>
              ) : analysisState === "loading" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2.5 py-0.5 text-[11px] font-medium text-info-foreground border border-info-border">
                  <Clock className="size-3 animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border">
                  No Active Analysis
                </span>
              )}
            </div>
          </div>

          <div className="ml-auto text-right">
            <p className="text-xs font-bold text-foreground sm:text-sm">Student-Faculty Ratio Analysis</p>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Based on NBA Accreditation Template (Section 4.1)
            </p>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
