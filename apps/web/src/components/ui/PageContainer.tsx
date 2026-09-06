import { cn } from "../../lib/cn";

/** Standard page width + vertical rhythm. Replaces the ad-hoc max-w-[...] values. */
export function PageContainer({
  className,
  size = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { size?: "default" | "narrow" | "wide" }) {
  return (
    <div
      className={cn(
        "mx-auto space-y-6",
        size === "narrow" && "max-w-3xl",
        size === "default" && "max-w-5xl",
        size === "wide" && "max-w-7xl",
        className
      )}
      {...props}
    />
  );
}
