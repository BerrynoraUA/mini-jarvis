"use client";

import { useRef } from "react";
import {
  codeBlockPlugin,
  codeMirrorPlugin,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
} from "@mdxeditor/editor";

export function MarkdownLiveEditorClient({
  documentKey,
  initialValue,
  onChange,
}: {
  documentKey: string;
  initialValue: string;
  onChange: (nextValue: string) => void;
}) {
  const editorRef = useRef<MDXEditorMethods>(null);

  return (
    <div className="rounded-[28px] border border-hairline bg-surface/35 px-5 py-4">
      <MDXEditor
        key={documentKey}
        ref={editorRef}
        markdown={initialValue}
        onChange={onChange}
        placeholder="Write markdown here..."
        className="mj-note-editor"
        contentEditableClassName="mj-note-editor__content min-h-[60vh] px-0 py-0 text-[15px] leading-7 text-ink focus:outline-none"
        plugins={[
          headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4] }),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          tablePlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              txt: "Plain text",
              ts: "TypeScript",
              tsx: "TSX",
              js: "JavaScript",
              json: "JSON",
              bash: "Bash",
              md: "Markdown",
            },
          }),
          markdownShortcutPlugin(),
        ]}
      />
    </div>
  );
}
