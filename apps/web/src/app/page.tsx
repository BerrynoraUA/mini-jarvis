import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@mini-jarvis/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-12">
      <h1 className="font-display text-5xl tracking-tight">
        Mini Jarvis — <em>foundations</em> ready.
      </h1>
      <p className="text-muted-foreground max-w-md text-center">
        Design system loaded. Tokens, fonts, and shadcn-style primitives are
        wired up via shared workspace packages.
      </p>
      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Quiet by design</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Badge>default</Badge>
          <Badge variant="accent">accent</Badge>
          <Badge variant="sage">sage</Badge>
          <Badge variant="sky">sky</Badge>
        </CardContent>
      </Card>
    </main>
  );
}
