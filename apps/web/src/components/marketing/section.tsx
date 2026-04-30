import * as React from "react";
import { cn } from "@mini-jarvis/ui";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof React.JSX.IntrinsicElements;
  containerClassName?: string;
}

/** Page section with consistent vertical rhythm and a max-width container. */
export function Section({
  as: Tag = "section",
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  const Component = Tag as React.ElementType;
  return (
    <Component className={cn("w-full px-6 sm:px-10", className)} {...props}>
      <div className={cn("mx-auto w-full max-w-6xl", containerClassName)}>
        {children}
      </div>
    </Component>
  );
}

interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  dot?: boolean;
}

export function Eyebrow({ className, dot = true, children, ...props }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
      {...props}
    >
      {dot && <span className="size-1.5 rounded-full bg-terracotta" />}
      {children}
    </span>
  );
}

interface NumberLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: string;
}

export function NumberLabel({ value, className, ...props }: NumberLabelProps) {
  return (
    <span
      className={cn(
        "text-[11px] font-medium tracking-[0.2em] text-muted-foreground",
        className,
      )}
      {...props}
    >
      {value}
    </span>
  );
}
