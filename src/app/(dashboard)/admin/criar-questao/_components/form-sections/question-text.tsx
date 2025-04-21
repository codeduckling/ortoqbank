'use client';

import { type UseFormReturn } from 'react-hook-form';

import RichTextEditor from '@/components/rich-text-editor/rich-text-editor';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { QuestionFormData } from '../schema';

interface QuestionTextProps {
  form: UseFormReturn<QuestionFormData>;
  initialContent?: any;
  onEditorReady: (editor: any) => void;
}

export function QuestionText({
  form,
  initialContent,
  onEditorReady,
}: QuestionTextProps) {
  return (
    <FormField
      control={form.control}
      name="questionText"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Texto da Questão</FormLabel>
          <FormControl>
            <RichTextEditor
              onChange={field.onChange}
              initialContent={initialContent}
              onEditorReady={onEditorReady}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
