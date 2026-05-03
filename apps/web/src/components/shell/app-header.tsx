import { LogOut } from "lucide-react";
import { Button } from "@mini-jarvis/ui";

export function AppHeader({ user }: { user: { name: string; email: string } }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline bg-canvas/85 px-6 py-4 backdrop-blur sm:px-10">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-ink font-display text-sm text-canvas">
          Q
        </span>
        <span className="font-display text-lg italic text-ink">Mini Jarvis</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="hidden text-right sm:block">
          <p className="font-medium text-ink">{user.name}</p>
          <p className="text-xs">{user.email}</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <Button type="submit" variant="outline" size="sm" className="rounded-full">
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
