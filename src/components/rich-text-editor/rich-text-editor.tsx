'use client';

import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import ResizeImage from 'tiptap-extension-resize-image';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';

import TextEditorMenuBar from './editor-menu-bar';

type TextEditorProps = {
  onChange: (content: JSONContent) => void;
  initialContent?: JSONContent; // Add this line
};

export default function RichTextEditor({
  onChange,
  initialContent,
}: TextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Image, ResizeImage, Color, TextStyle],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },

    editorProps: {
      attributes: {
        class:
          'min-h-[150px] cursor-text rounded-md border p-5 ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ',
      },
    },
    immediatelyRender: false,
  });
  return (
    <div>
      <TextEditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
