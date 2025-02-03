import { Check } from 'lucide-react';
import { type Control } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { QuestionFormData } from '../../schema';
import { ImageUploadField } from './image-upload-field';

const ASCII_UPPERCASE_A = 65;

interface QuestionOptionProps {
  control: Control<QuestionFormData>;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function QuestionOption({
  control,
  index,
  isSelected,
  onSelect,
}: QuestionOptionProps) {
  return (
    <div className="space-y-2">
      <FormField
        control={control}
        name={`options.${index}.text`}
        render={({ field }) => (
          <FormItem>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 shrink-0 p-0"
                onClick={onSelect}
              >
                {isSelected ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{String.fromCodePoint(ASCII_UPPERCASE_A + index)}</span>
                )}
              </Button>
              <FormControl>
                <Input
                  {...field}
                  placeholder={`Alternativa ${String.fromCodePoint(ASCII_UPPERCASE_A + index)}`}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`options.${index}.imageUrl`}
        render={() => (
          <ImageUploadField
            control={control}
            name={`options.${index}.imageUrl`}
          />
        )}
      />
    </div>
  );
}
