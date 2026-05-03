import { AppHeader } from "./app-header";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string };
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <AppHeader user={user} />
      <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
