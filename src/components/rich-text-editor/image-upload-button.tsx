'use client';

import { Editor } from '@tiptap/react';
import { ImageIcon } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { uploadToImageKit } from './upload-action';

export function ImageUploadButton({ editor }: { editor: Editor }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        // Create temporary blob URL for immediate display
        const blobUrl = URL.createObjectURL(file);
        editor.chain().focus().setImage({ src: blobUrl }).run();

        // Upload to ImageKit in the background
        const imagekitUrl = await uploadToImageKit(file);

        // Replace blob URL with ImageKit URL
        const doc = editor.state.doc;
        doc.descendants((node, pos) => {
          if (node.type.name === 'image' && node.attrs.src === blobUrl) {
            editor
              .chain()
              .focus()
              .setNodeSelection(pos)
              .updateAttributes('image', { src: imagekitUrl })
              .run();
            URL.revokeObjectURL(blobUrl); // Clean up blob URL
            return false;
          }
        });
      } catch (error) {
        console.error('Failed to upload image:', error);
        // You might want to show an error message to the user here
      }

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [editor],
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-md p-2 hover:bg-gray-100"
      >
        <ImageIcon className="h-5 w-5" />
      </button>
    </>
  );
}
