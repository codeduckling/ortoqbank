'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { api } from '../../../../../convex/_generated/api';
import { ImageUploadField } from './image-upload-field';
import { QuestionOption } from './question-option';
import { QuestionFormData, questionSchema } from './schema';

export function QuestionForm() {
  const createQuestion = useMutation(api.questions.createQuestion);
  const themes = useQuery(api.themes.getAll);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const subthemes = useQuery(
    api.themes.getSubthemes,
    selectedTheme ? { themeId: selectedTheme } : 'skip',
  );

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: '',
      imageUrl: '',
      options: [
        { text: '', imageUrl: '' },
        { text: '', imageUrl: '' },
        { text: '', imageUrl: '' },
        { text: '', imageUrl: '' },
      ],
      correctOptionIndex: 0,
      explanation: '',
      themeId: '',
      subthemeIds: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const onSubmit = async (data: QuestionFormData) => {
    try {
      await createQuestion({
        ...data,
        options: data.options.map(opt => opt.text),
      });
      form.reset();
    } catch (error) {
      console.error('Failed to create question:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto da Questão</FormLabel>
              <FormControl>
                <Textarea className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={() => (
            <ImageUploadField
              control={form.control}
              name="imageUrl"
              label="Imagem da Questão (opcional)"
            />
          )}
        />

        <div className="space-y-2">
          <FormLabel>Alternativas</FormLabel>
          <Card>
            <CardContent className="space-y-2 p-2">
              {fields.map((field, index) => (
                <QuestionOption
                  key={field.id}
                  control={form.control}
                  index={index}
                  isSelected={form.watch('correctOptionIndex') === index}
                  onSelect={() => form.setValue('correctOptionIndex', index)}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        <FormField
          control={form.control}
          name="explanation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Explicação</FormLabel>
              <FormControl>
                <Textarea className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="themeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tema</FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={value => {
                    field.onChange(value);
                    setSelectedTheme(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes?.map(theme => (
                      <SelectItem key={theme._id} value={theme._id}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subthemeIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtemas</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={
                      subthemes?.map(s => ({
                        value: s._id,
                        label: s.name,
                      })) || []
                    }
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Selecione os subtemas"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? 'Criando...' : 'Criar Questão'}
        </Button>
      </form>
    </Form>
  );
}
