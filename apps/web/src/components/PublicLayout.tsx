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

export function PublicLayout({
  children,
  tone = "app"
}: {
  children: React.ReactNode;
  tone?: "app" | "landing";
}) {
  const landing = tone === "landing";
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            {landing && (
              <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                <a href="#features" className="link-wipe hover:text-foreground">Features</a>
                <a href="#how" className="link-wipe hover:text-foreground">How it works</a>
                <a href="#faq" className="link-wipe hover:text-foreground">FAQ</a>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <Link to="/login" viewTransition>Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register" viewTransition>Get started</Link>
            </Button>
          </div>
        </div>
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
