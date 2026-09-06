import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

interface StatProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
}

export function Stat({ label, value, hint, icon: Icon, className }: StatProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-foreground-subtle">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-foreground-subtle" strokeWidth={1.8} aria-hidden="true" />}
      </div>
      <p className="mt-2 font-display text-2xl font-[560] tabular-nums tracking-[-0.01em] text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-foreground-muted">{hint}</p>}
    </div>
  );
}
