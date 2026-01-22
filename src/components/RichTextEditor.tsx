"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  dir?: "ltr" | "rtl";
};

const ToolbarButton = ({
  label,
  onClick,
  active
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded px-2 py-1 text-xs font-medium transition ${
      active ? "bg-brand-orange text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
    }`}
  >
    {label}
  </button>
);

export const RichTextEditor = ({ value, onChange, dir = "ltr" }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class:
          "tiptap prose max-w-none focus:outline-none prose-headings:text-slate-900 prose-p:text-slate-700"
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "<p></p>", false);
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm">Loading editor...</div>;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 p-2">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarButton
          label="Bullet"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Numbered"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()} />
      </div>
      <div dir={dir} className="p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
