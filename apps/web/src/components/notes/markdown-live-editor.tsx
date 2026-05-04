"use client";

import dynamic from "next/dynamic";

const MarkdownLiveEditorClient = dynamic(
  () =>
    import("./markdown-live-editor-client").then((module) => module.MarkdownLiveEditorClient),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[60vh] rounded-[28px] border border-hairline bg-surface/35 px-5 py-4 text-sm text-muted-foreground">
        Loading editor...
      </div>
    ),
  },
);

export function MarkdownLiveEditor(props: {
  documentKey: string;
  initialValue: string;
  onChange: (nextValue: string) => void;
}) {
  return <MarkdownLiveEditorClient {...props} />;
}
