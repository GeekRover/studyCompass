import * as RadixProgress from "@radix-ui/react-progress";
import { cn } from "../../lib/cn";

export function Progress({
  value,
  className,
  barClassName
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <RadixProgress.Root
      value={clamped}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-muted", className)}
    >
      <RadixProgress.Indicator
        className={cn("h-full rounded-full bg-primary transition-transform", barClassName)}
        style={{ transform: `translateX(-${100 - clamped}%)` }}
      />
    </RadixProgress.Root>
  );
}

/** Circular score indicator (0-100). Replaces the hand-rolled score circles. */
export function ScoreRing({
  value,
  size = 64,
  label
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--surface-muted))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (clamped / 100) * circumference}
        />
      </svg>
      <span className="absolute text-sm font-semibold text-foreground">
        {label ?? Math.round(clamped)}
      </span>
    </div>
  );
}
