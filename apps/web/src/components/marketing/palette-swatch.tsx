import { cn } from "@mini-jarvis/ui";

interface PaletteSwatchProps {
  name: string;
  hex: string;
  className?: string;
  textOnSwatch?: "light" | "dark";
}

export function PaletteSwatch({
  name,
  hex,
  className,
  textOnSwatch = "dark",
}: PaletteSwatchProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className="size-14 rounded-2xl border border-border/50"
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <span
        className={cn(
          "text-xs",
          textOnSwatch === "dark" ? "text-foreground" : "text-canvas",
        )}
      >
        {name}
      </span>
    </div>
  );
}
