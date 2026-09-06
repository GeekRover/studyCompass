import GatewayFlow from "@/components/ui/gateway-flow";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../state/ThemeContext";
import { ThemeToggle } from "./ui/ThemeToggle";
import { Logo } from "./Logo";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const { theme } = useTheme();
  const { pathname } = useLocation();

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* Animated background — the ground matches --background exactly, so it
          blends with no fade. Decorative, non-interactive. */}
      <GatewayFlow
        mode={theme}
        opacity={0.42}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ pointerEvents: "none" }}
      />

      <header className="relative z-10 flex items-center justify-between px-4 py-6 sm:px-8">
        <Logo to="/" />
        <ThemeToggle />
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div
          key={pathname}
          className="route-anim w-full max-w-sm rounded-2xl border border-border bg-surface/90 p-8 shadow-lg backdrop-blur-xl"
        >
          <h1 className="font-display text-[1.6rem] font-[560] tracking-[-0.02em] text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-sm text-foreground-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-foreground-muted">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthLink({
  to,
  viewTransition,
  children
}: {
  to: string;
  viewTransition?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      viewTransition={viewTransition}
      className="link-wipe font-semibold text-primary hover:text-foreground"
    >
      {children}
    </Link>
  );
}
