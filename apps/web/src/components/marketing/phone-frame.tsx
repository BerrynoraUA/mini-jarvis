import * as React from "react";
import { cn } from "@mini-jarvis/ui";

interface PhoneFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tailwind width classes — defaults to a single phone size. */
  widthClassName?: string;
}

/**
 * Stylised iPhone frame with a Dynamic-Island-ish bar.
 * Children render inside the screen (a flex column).
 */
export function PhoneFrame({
  className,
  widthClassName = "w-[280px]",
  children,
  ...props
}: PhoneFrameProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 rounded-[2.6rem] bg-ink p-2 shadow-[0_30px_80px_-30px_rgba(27,31,42,0.35)]",
        widthClassName,
        className,
      )}
      {...props}
    >
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.1rem] bg-card">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3 text-[10px] font-medium text-foreground">
          <span>9:41</span>
          <span className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-ink" />
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-foreground/60" />
            <span className="h-2 w-4 rounded-sm border border-foreground/60" />
          </span>
        </div>
        <div className="flex h-full flex-col px-4 pb-4 pt-6">{children}</div>
      </div>
    </div>
  );
}
