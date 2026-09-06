import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const alertVariants = cva("flex items-start gap-3 rounded-lg border p-4 text-sm", {
  variants: {
    tone: {
      info: "border-info/30 bg-info-muted text-info",
      success: "border-success/30 bg-success-muted text-success",
      warning: "border-warning/30 bg-warning-muted text-warning",
      danger: "border-danger/30 bg-danger-muted text-danger"
    }
  },
  defaultVariants: { tone: "info" }
});

const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle };

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
}

export function Alert({ className, tone = "info", title, children, ...props }: AlertProps) {
  const Icon = icons[tone ?? "info"];
  return (
    <div role="alert" className={cn(alertVariants({ tone }), className)} {...props}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-1", "leading-6")}>{children}</div>}
      </div>
    </div>
  );
}
