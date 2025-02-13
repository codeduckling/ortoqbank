'use client';

import { Color } from '@tiptap/extension-color';
import ImageExtension from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import UnderlineExtension from '@tiptap/extension-underline';
import { EditorContent, type JSONContent, useEditor } from '@tiptap/react';
import StarterKitExtension from '@tiptap/starter-kit';
import { useEffect } from 'react';
import ResizeImage from 'tiptap-extension-resize-image';

import TextEditorMenuBar from './editor-menu-bar';

interface RichTextEditorProps {
  onChange?: (value: any) => void;
  initialContent?: any;
  onEditorReady?: (editor: any) => void;
}

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
  onEditorReady,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKitExtension,
      UnderlineExtension,
      ImageExtension,
      ExtendedImage,
      ResizeImage,
      Color,
      TextStyle,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[150px] cursor-text rounded-md border p-5 ring-offset-background focus-within:outline-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        role: 'textbox',
        'aria-label': 'Rich text editor',
      },
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  return (
    <div>
      <TextEditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

// Export for use in image-upload-button
export type { ImageAttributes };
