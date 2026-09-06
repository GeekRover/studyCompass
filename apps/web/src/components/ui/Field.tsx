import { cloneElement, isValidElement, useId } from "react";
import { cn } from "../../lib/cn";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Label + control + error wrapper. Pass a single control as the child; it is
 * cloned with `id` / `aria-describedby` / `aria-invalid` so screen readers
 * announce the error. Props already set on the child are preserved.
 */
export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  const generatedId = useId();
  const id = htmlFor ?? generatedId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  const childProps = isValidElement(children)
    ? (children.props as Record<string, unknown>)
    : {};
  const control = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: childProps.id ?? id,
        "aria-describedby": childProps["aria-describedby"] ?? describedBy,
        "aria-invalid": error ? true : childProps["aria-invalid"]
      })
    : children;

  return (
    <div className={cn("block", className)}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {control}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-foreground-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
