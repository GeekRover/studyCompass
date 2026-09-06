import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ icon: Icon, title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-foreground-muted">
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
          </span>
        )}
        <div>
          <h1 className="font-display text-[1.7rem] font-[560] leading-tight tracking-[-0.02em] text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-foreground-muted">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
