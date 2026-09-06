import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { useTheme } from "../../state/ThemeContext";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    const startViewTransition = (
      document as Document & {
        startViewTransition?: (cb: () => void) => {
          ready: Promise<void>;
          finished: Promise<void>;
        };
      }
    ).startViewTransition;

    if (!startViewTransition || prefersReducedMotion()) {
      toggle();
      return;
    }

    // Circular wipe from the button, revealing the new theme.
    const { clientX: x, clientY: y } = event;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const root = document.documentElement;
    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);
    root.style.setProperty("--vt-r", `${radius}px`);
    root.classList.add("theme-vt");

    const transition = startViewTransition.call(document, () => {
      flushSync(() => toggle());
    });
    transition.finished.finally(() => root.classList.remove("theme-vt"));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Sun
        className="h-[18px] w-[18px] rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0"
        strokeWidth={1.8}
        aria-hidden="true"
      />
      <Moon
        className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100"
        strokeWidth={1.8}
        aria-hidden="true"
      />
    </button>
  );
}
