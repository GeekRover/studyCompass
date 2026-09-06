import { Link } from "react-router-dom";
import { cn } from "../lib/cn";

export function Logo({
  to = "/",
  showTagline = false,
  className
}: {
  to?: string;
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <Link to={to} className={cn("inline-flex flex-col leading-none", className)}>
      <span className="font-display text-lg font-[560] tracking-[-0.02em] text-foreground">
        StudyCompass
      </span>
      {showTagline && (
        <span className="mt-1 text-[11px] font-medium text-foreground-subtle">
          Your Future, Our Guidance
        </span>
      )}
    </Link>
  );
}
