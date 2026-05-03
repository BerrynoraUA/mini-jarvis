export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-canvas px-6 py-16 text-foreground sm:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-4 font-display text-5xl text-ink">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you tried to open does not exist.
        </p>
        <p className="mt-8 text-sm text-muted-foreground">Back to workspace: /</p>
      </div>
    </main>
  );
}
