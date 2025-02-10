'use client';

import { Color } from '@tiptap/extension-color';
import ImageExtension from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import UnderlineExtension from '@tiptap/extension-underline';
import { EditorContent, type JSONContent, useEditor } from '@tiptap/react';
import StarterKitExtension from '@tiptap/starter-kit';
import ResizeImage from 'tiptap-extension-resize-image';

import TextEditorMenuBar from './editor-menu-bar';

type TextEditorProps = {
  onChange: (content: JSONContent) => void;
  initialContent?: JSONContent;
};

type ImageAttributes = { src: string; alt?: string; style?: string };

const ExtendedImage = ImageExtension.extend({
  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: undefined },
      style: { default: undefined },
    };
  },
});

export default function RichTextEditor({
  onChange,
  initialContent,
}: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKitExtension,
      UnderlineExtension,
      ExtendedImage,
      ResizeImage,
      Color,
      TextStyle,
    ],
    content: initialContent || {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[150px] cursor-text rounded-md border p-5 ring-offset-background focus-within:outline-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
      },
    },
  });

  return (
    <div>
      <TextEditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

// Export for use in image-upload-button
export type { ImageAttributes };
