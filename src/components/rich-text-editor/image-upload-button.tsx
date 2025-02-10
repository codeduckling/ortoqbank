'use client';

import { Editor } from '@tiptap/react';
import { ImageIcon } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import type { ImageAttributes } from './rich-text-editor';
import { uploadToImageKit } from './upload-action';

export function ImageUploadButton({ editor }: { editor: Editor }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        setIsUploading(true);
        const imagekitUrl = await uploadToImageKit(file);

        const imageAttributes: ImageAttributes = {
          src: imagekitUrl,
          style: 'width: 250px; height: 250px;',
        };

        editor.chain().focus().setImage(imageAttributes).run();
      } catch (error) {
        console.error('Failed to upload image:', error);
      } finally {
        setIsUploading(false);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
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
        disabled={isUploading}
      >
        {isUploading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        ) : (
          <ImageIcon className="h-5 w-5" />
        )}
      </button>
    </>
  );
}
