import * as RadixDialog from "@radix-ui/react-dialog";
import { LogOut, Menu, Settings, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { apiRequest } from "../api/client";
import { cn } from "../lib/cn";
import { useAuth } from "../state/AuthContext";
import type { ProfileResponse } from "../types";
import { Logo } from "./Logo";
import { navGroups, titleForPath } from "./navigation";
import { Card } from "./ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/DropdownMenu";
import { Progress } from "./ui/Progress";
import { ThemeToggle } from "./ui/ThemeToggle";

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-6">
      {navGroups.map((group) => (
        <div key={group.heading}>
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
            {group.heading}
          </p>
          <div className="mt-2 space-y-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                viewTransition
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-muted text-primary"
                      : "text-foreground-muted hover:bg-surface-muted hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function ProfileCompletionCard({ completion }: { completion: number }) {
  const done = completion >= 80;
  return (
    <Card className="p-4 text-center">
      <p className="text-sm font-medium text-foreground">
        {done ? "Your profile is almost complete" : "Complete your profile for better matches"}
      </p>
      <p className="mt-2 text-sm font-semibold text-primary">{completion}% complete</p>
      <Progress value={completion} className="mt-2" />
      <Link
        to="/profile"
        viewTransition
        className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg border border-input text-sm font-semibold text-primary hover:bg-surface-muted"
      >
        {done ? "Edit profile" : "Complete profile"}
      </Link>
    </Card>
  );
}

export function AppLayout() {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.title = `${titleForPath(location.pathname)} · StudyCompass`;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    async function loadProfileCompletion() {
      if (!token || user?.role !== "STUDENT") {
        return;
      }
      try {
        const response = await apiRequest<ProfileResponse>("/student/profile", { token });
        setProfileCompletion(
          response.completeness.complete
            ? 90
            : Math.max(0, 90 - response.completeness.missingFields.length * 10)
        );
      } catch {
        setProfileCompletion(0);
      }
    }
    loadProfileCompletion();
  }, [token, user?.role]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo to="/dashboard" showTagline />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <NavItems />
        </div>
        {user?.role === "STUDENT" && (
          <div className="p-4">
            <ProfileCompletionCard completion={profileCompletion} />
          </div>
        )}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-2 text-foreground-muted hover:bg-surface-muted lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo to="/dashboard" className="lg:hidden" />
            <h1 className="hidden text-sm font-semibold text-foreground lg:block">
              {titleForPath(location.pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Account menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-muted text-xs font-semibold text-primary">
                  {initials(user?.name)}
                </span>
                <span className="hidden text-sm font-medium text-foreground sm:inline">{user?.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" viewTransition>
                    <UserRound className="h-4 w-4" strokeWidth={1.8} />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/readiness" viewTransition>
                    <Settings className="h-4 w-4" strokeWidth={1.8} />
                    Readiness
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout} className="text-danger">
                  <LogOut className="h-4 w-4" strokeWidth={1.8} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div key={location.pathname} className="route-anim">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile nav sheet */}
      <RadixDialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden" />
          <RadixDialog.Content className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface p-4 focus:outline-none lg:hidden">
            <div className="flex items-center justify-between">
              <Logo to="/dashboard" />
              <RadixDialog.Close
                className="rounded-md p-2 text-foreground-muted hover:bg-surface-muted"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </RadixDialog.Close>
            </div>
            <RadixDialog.Title className="sr-only">Navigation</RadixDialog.Title>
            <div className="mt-6 flex-1 overflow-y-auto">
              <NavItems onNavigate={() => setMobileOpen(false)} />
            </div>
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    </div>
  );
}
