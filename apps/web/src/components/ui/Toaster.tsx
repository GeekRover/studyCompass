import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "../../state/ThemeContext";

export function Toaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={theme}
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "!bg-surface !border-border !text-foreground !rounded-lg !shadow-lg",
          description: "!text-foreground-muted",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-surface-muted !text-foreground-muted"
        }
      }}
    />
  );
}

export { toast } from "sonner";
