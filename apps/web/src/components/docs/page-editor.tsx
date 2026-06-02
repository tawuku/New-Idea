"use client";

import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef } from "react";
import * as Y from "yjs";

type PageEditorProps = {
  pageId: string;
  initialTitle: string;
  onTitleChange: (title: string) => void;
};

const COLLAB_URL =
  typeof window !== "undefined"
    ? (process.env["NEXT_PUBLIC_COLLAB_URL"] ?? "ws://localhost:3002")
    : "ws://localhost:3002";

export function PageEditor({ pageId, initialTitle, onTitleChange }: PageEditorProps) {
  const ydoc = useRef(new Y.Doc());
  const providerRef = useRef<HocuspocusProvider | null>(null);

  useEffect(() => {
    // Read session cookie for auth token
    const token = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("better-auth.session_token="))
      ?.split("=")[1];

    const provider = new HocuspocusProvider({
      url: COLLAB_URL,
      name: `page:${pageId}`,
      document: ydoc.current,
      token: token ?? "",
    });

    providerRef.current = provider;

    return () => {
      provider.destroy();
    };
  }, [pageId]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Collaboration replaces the built-in History
        history: false,
      }),
      Collaboration.configure({ document: ydoc.current }),
      CollaborationCursor.configure({
        provider: providerRef.current ?? undefined,
      }),
      Placeholder.configure({ placeholder: "Start writing…" }),
      Typography,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[60vh] px-1",
      },
    },
  });

  const titleRef = useRef<HTMLHeadingElement>(null);

  const handleTitleBlur = useCallback(() => {
    const text = titleRef.current?.textContent?.trim() ?? "Untitled";
    onTitleChange(text);
  }, [onTitleChange]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        editor?.commands.focus("start");
      }
    },
    [editor],
  );

  return (
    <div className="flex flex-col gap-4 py-8 px-4 max-w-3xl mx-auto w-full">
      <h1
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleTitleBlur}
        onKeyDown={handleTitleKeyDown}
        className="text-4xl font-bold outline-none empty:before:content-['Untitled'] empty:before:text-neutral-300 dark:empty:before:text-neutral-600"
      >
        {initialTitle}
      </h1>
      <EditorContent editor={editor} />
    </div>
  );
}
