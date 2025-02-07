'use client';

import { useMutation } from 'convex/react';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { type Control, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

import { api } from '../../../../../../convex/_generated/api';
import { QuestionFormData } from './schema';

interface ImageUploadFieldProps {
  control: Control<QuestionFormData>;
  name: 'questionImageUrl' | 'explanationImageUrl';
  label?: string;
  field: any;
}

export function ImageUploadField({
  control,
  name,
  label,
  field,
}: ImageUploadFieldProps) {
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { watch, setValue } = useFormContext<QuestionFormData>();
  const imageUrl = watch(name);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveImageUrl = useMutation(api.files.saveImageUrl);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);

      // Step 1: Get upload URL
      const postUrl = await generateUploadUrl();

      // Step 2: Upload file
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error('Upload failed');
      }

      const { storageId } = await result.json();

      // Step 3: Save URL to form
      setValue(name, storageId);

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInput.current?.click();
  };

  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <div className={`flex gap-2 ${label ? '' : 'pl-10'}`}>
        <FormControl>
          <Input
            type="url"
            value={imageUrl || ''}
            readOnly
            placeholder="Nenhuma imagem selecionada"
            className={label ? '' : 'text-sm'}
          />
        </FormControl>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={event => {
            const file = event.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size={label ? 'default' : 'sm'}
          className="shrink-0"
          onClick={handleClick}
          disabled={isUploading}
        >
          <Upload className={`${label ? 'mr-2' : ''} h-4 w-4`} />
          {label && (isUploading ? 'Uploading...' : 'Upload')}
        </Button>
      </div>
      <FormMessage />
    </FormItem>
  );
}
