"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const extensions = [
  StarterKit.configure({
    bulletList: { HTMLAttributes: { class: "list-disc pl-5 my-2" } },
    orderedList: { HTMLAttributes: { class: "list-decimal pl-5 my-2" } },
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { class: "text-primary underline", rel: "noopener noreferrer", target: "_blank" },
  }),
  Placeholder.configure({
    placeholder: "Start writing your post or use the AI Assistant to generate content...",
  }),
];

interface PostRichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
  editorClassName?: string;
}

function isEditorHtmlEmpty(html: string): boolean {
  const t = (html ?? "").trim();
  return (
    t === "" ||
    t === "<p></p>" ||
    t === "<p><br></p>" ||
    t === '<p><br class="ProseMirror-trailingBreak"></p>'
  );
}

function editorHtmlEquivalent(a: string, b: string): boolean {
  if (a === b) return true;
  return isEditorHtmlEmpty(a) && isEditorHtmlEmpty(b);
}

function EditorToolbarButton({
  pressed,
  onClick,
  children,
  label,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant={pressed ? "secondary" : "ghost"}
      size="sm"
      className="h-8 w-8 shrink-0 p-0"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
    >
      {children}
    </Button>
  );
}

export function PostRichTextEditor({ content, onChange, className, editorClassName }: PostRichTextEditorProps) {
  // Do not pass `content` into useEditor: TipTap calls setOptions on every render when options differ.
  // Streaming updates would re-apply the full document on each frame (and fight useEffect). Sync via effect below.
  const editorProps = useMemo(
    () => ({
      attributes: {
        class: cn(
          "tiptap ProseMirror min-h-[240px] max-h-[min(60vh,520px)] overflow-y-auto rounded-2xl border-none bg-white px-6 py-5 text-base leading-relaxed shadow-[0px_20px_40px_rgba(21,28,39,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          "prose-editor [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2:first-child]:mt-0 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3:first-child]:mt-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_p]:mb-2 [&_p:last-child]:mb-0",
          editorClassName,
        ),
      },
    }),
    [editorClassName],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: "",
    editorProps,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const next = content ?? "";
    const current = editor.getHTML();
    if (editorHtmlEquivalent(current, next)) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [content, editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          "min-h-[240px] animate-pulse rounded-2xl bg-white shadow-[0px_20px_40px_rgba(21,28,39,0.04)]",
          className,
        )}
      />
    );
  }

  const toggleLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = typeof window !== "undefined" ? window.prompt("Link URL", prev || "https://") : null;
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-outline-variant/15 bg-white/80 p-1.5 shadow-[0px_8px_24px_rgba(21,28,39,0.04)] backdrop-blur-sm">
        <EditorToolbarButton
          label="Bold"
          pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </EditorToolbarButton>
        <EditorToolbarButton
          label="Italic"
          pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </EditorToolbarButton>
        <EditorToolbarButton
          label="Underline"
          pressed={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={16} />
        </EditorToolbarButton>
        <EditorToolbarButton
          label="Strikethrough"
          pressed={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={16} />
        </EditorToolbarButton>
        <span className="mx-1 h-5 w-px bg-outline-variant/40" aria-hidden />
        <EditorToolbarButton
          label="Bullet list"
          pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </EditorToolbarButton>
        <EditorToolbarButton
          label="Numbered list"
          pressed={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </EditorToolbarButton>
        <span className="mx-1 h-5 w-px bg-outline-variant/40" aria-hidden />
        <EditorToolbarButton label="Add link" pressed={editor.isActive("link")} onClick={toggleLink}>
          <Link2 size={16} />
        </EditorToolbarButton>
        <span className="mx-1 h-5 w-px bg-outline-variant/40" aria-hidden />
        <EditorToolbarButton label="Undo" pressed={false} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={16} />
        </EditorToolbarButton>
        <EditorToolbarButton label="Redo" pressed={false} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={16} />
        </EditorToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
