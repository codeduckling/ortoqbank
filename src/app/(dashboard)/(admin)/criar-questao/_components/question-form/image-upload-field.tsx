import { Upload } from 'lucide-react';
import { type Control } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { QuestionFormData } from '../../schema';

interface ImageUploadFieldProps {
  control: Control<QuestionFormData>;
  name: `options.${number}.imageUrl` | 'imageUrl';
  label?: string;
}

export function ImageUploadField({
  control,
  name,
  label,
}: ImageUploadFieldProps) {
  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <div className={`flex gap-2 ${label ? '' : 'pl-10'}`}>
        <FormControl>
          <Input
            type="url"
            disabled
            placeholder="Nenhuma imagem selecionada"
            className={label ? '' : 'text-sm'}
          />
        </FormControl>
        <Button
          type="button"
          variant="outline"
          size={label ? 'default' : 'sm'}
          className="shrink-0"
          onClick={() => {
            // Will be implemented later
            console.log('Upload image');
          }}
        >
          <Upload className={`${label ? 'mr-2' : ''} h-4 w-4`} />
          {label && 'Upload'}
        </Button>
      </div>
      <FormMessage />
    </FormItem>
  );
}
