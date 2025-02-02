'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import RichTextEditor from '@/components/rich-text-editor';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { ImageUploadField } from './image-upload-field';
import { QuestionOption } from './question-option';
import { QuestionFormData, questionSchema } from './schema';

export function QuestionForm() {
  const createQuestion = useMutation(api.questions.create);
  const themes = useQuery(api.themes.list);
  const [selectedTheme, setSelectedTheme] = useState<
    Id<'themes'> | undefined
  >();
  const subthemes = useQuery(
    api.themes.getWithSubthemes,
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
      subthemeId: '',
    },
  });

  const { fields } = useFieldArray({
    name: 'options',
    control: form.control,
  });

  const onSubmit = async (data: QuestionFormData) => {
    try {
      await createQuestion({
        ...data,
        options: data.options.map(o => o.text),
        themeId: data.themeId as Id<'themes'>,
        subthemeId: data.subthemeId as Id<'subthemes'>,
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
                <RichTextEditor onChange={field.onChange} />
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

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="themeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tema</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={value => {
                    field.onChange(value);
                    setSelectedTheme(value as Id<'themes'>);
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tema" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {themes?.map(theme => (
                      <SelectItem key={theme._id} value={theme._id}>
                        {theme.name}
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
            name="subthemeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtema</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedTheme}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o subtema" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subthemes?.subthemes?.map(subtheme => (
                      <SelectItem key={subtheme._id} value={subtheme._id}>
                        {subtheme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
