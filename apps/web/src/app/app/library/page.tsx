export default function LibraryPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Library
      </span>
      <h1 className="font-display text-4xl text-ink">
        A shelf for <em className="italic text-terracotta">later</em>.
      </h1>
      <p className="text-sm text-muted-foreground">
        Saved articles, links, and references will live here once Drive sync arrives.
      </p>
    </div>
  );
}
