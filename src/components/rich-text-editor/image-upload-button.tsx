'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { ImageIcon } from 'lucide-react';
import { IKUpload } from 'imagekitio-next';

interface ImageUploadButtonProps {
  editor: Editor;
}

export function ImageUploadButton({ editor }: ImageUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onSuccess = (response: {
    fileId: string;
    name: string;
    url: string;
    filePath: string;
  }) => {
    setIsUploading(false);
    const imageUrl = `${process.env.NEXT_PUBLIC_URL_ENDPOINT}/${response.filePath}`;
    editor
      .chain()
      .focus()
      .setImage({
        src: imageUrl,
        alt: response.name,
      })
      .run();
  };

  const onError = (err: any) => {
    setIsUploading(false);
    console.error('Upload failed:', err);
  };

  return (
    <div className="relative">
      <button
        className={`relative p-2 ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
        disabled={isUploading}
      >
        {isUploading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        ) : (
          <ImageIcon className="h-5 w-5" />
        )}
      </button>
      <div className="absolute left-0 top-0 h-full w-full opacity-0">
        <IKUpload
          onUploadStart={() => setIsUploading(true)}
          onSuccess={onSuccess}
          onError={onError}
          className="h-full w-full cursor-pointer"
          urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}
          publicKey={process.env.NEXT_PUBLIC_PUBLIC_KEY}
          folder="/questions"
        />
      </div>
    </div>
  );
}
