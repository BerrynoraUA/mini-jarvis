import { AppShell } from "@/components/shell/app-shell";
import { WorkspacePage } from "@/components/workspace/workspace-page";

interface HomeProps {
  user: { name: string; email: string };
}

export function Home({ user }: HomeProps) {
  return (
    <AppShell user={user}>
      <WorkspacePage />
    </AppShell>
  );
}
