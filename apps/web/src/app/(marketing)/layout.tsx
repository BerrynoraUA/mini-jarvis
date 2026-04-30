export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-canvas text-foreground">{children}</div>;
}
