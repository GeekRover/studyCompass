import { cn } from "../../lib/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-pulse rounded-md bg-surface-muted", className)} {...props} />
  );
}

/** Full-page loading placeholder used while a route's data loads. */
export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="space-y-4" role="status" aria-label={label} aria-busy="true">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
