import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/Button";
import { ThemeToggle } from "./ui/ThemeToggle";
import { Logo } from "./Logo";

const footerLinks = [
  { label: "University matching", to: "/register" },
  { label: "Scholarships", to: "/register" },
  { label: "Cost calculator", to: "/register" },
  { label: "Visa prep", to: "/register" }
];

const sectionLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "FAQ", href: "#faq" }
];

export function PublicLayout({
  children,
  tone = "app"
}: {
  children: React.ReactNode;
  tone?: "app" | "landing";
}) {
  const landing = tone === "landing";
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            {landing && (
              <nav className="hidden items-center gap-6 text-sm text-foreground-muted md:flex">
                {sectionLinks.map((link) => (
                  <a key={link.href} href={link.href} className="link-wipe hover:text-foreground">
                    {link.label}
                  </a>
                ))}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className={landing ? "hidden items-center md:flex" : "flex items-center"}>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={landing ? "hidden md:inline-flex" : "hidden sm:inline-flex"}
              asChild
            >
              <Link to="/login" viewTransition>Log in</Link>
            </Button>
            <Button size="sm" className={landing ? "hidden md:inline-flex" : undefined} asChild>
              <Link to="/register" viewTransition>Get started</Link>
            </Button>
            {landing && (
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex items-center justify-center rounded-md p-2 text-foreground-muted hover:bg-surface-muted md:hidden"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {landing && menuOpen && (
          <div className="border-t border-border bg-background md:hidden">
            <nav className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3 text-sm sm:px-6">
              {sectionLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="rounded-lg px-2 py-2.5 text-foreground-muted hover:bg-surface-muted hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <div className="my-1 border-t border-border" />
              <Link
                to="/login"
                viewTransition
                onClick={closeMenu}
                className="rounded-lg px-2 py-2.5 font-medium text-foreground hover:bg-surface-muted"
              >
                Log in
              </Link>
              <Button className="mt-1 w-full" asChild>
                <Link to="/register" viewTransition onClick={closeMenu}>
                  Get started
                </Link>
              </Button>
              <div className="mt-2 flex items-center justify-between rounded-lg px-2 py-1">
                <span className="text-foreground-muted">Appearance</span>
                <ThemeToggle />
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <div key={pathname} className="route-anim">
          {children}
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs">
              <Logo />
              <p className="mt-3 text-sm text-foreground-muted">
                Plan studying abroad with confidence — from first shortlist to visa appointment.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-10 gap-y-2 text-sm">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="link-wipe text-foreground-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <p className="text-xs text-foreground-subtle">
            © {new Date().getFullYear()} StudyCompass. Built for students.
          </p>
        </div>
      </footer>
    </div>
  );
}
