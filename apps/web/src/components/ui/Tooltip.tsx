import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "../../lib/cn";

export function Tooltip({
  children,
  content,
  side = "bottom"
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={6}
            className={cn(
              "z-50 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md"
            )}
          >
            {content}
            <RadixTooltip.Arrow className="fill-foreground" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
