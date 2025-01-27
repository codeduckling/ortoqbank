'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { api } from '../../../../../convex/_generated/api';
import { THEMES } from '../../../../../convex/constants';
import { ImageUploadField } from './image-upload-field';
import { QuestionOption } from './question-option';
import { QuestionFormData, questionSchema } from './schema';

export function QuestionForm() {
  const createQuestion = useMutation(api.questions.createQuestion);

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
      theme: '',
      subjects: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const onSubmit = async (data: QuestionFormData) => {
    try {
      await createQuestion({
        text: data.text,
        imageUrl: data.imageUrl || undefined,
        options: data.options.map(opt => ({
          text: opt.text,
          imageUrl: opt.imageUrl || undefined,
        })),
        correctOptionIndex: data.correctOptionIndex,
        explanation: data.explanation,
        theme: data.theme,
        subjects: data.subjects,
      });

      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tema</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tema" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {THEMES.map(theme => (
                      <SelectItem key={theme.name} value={theme.name}>
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
            name="subjects"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matérias</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value.join(', ')}
                    onChange={event => {
                      const subjects = event.target.value
                        .split(',')
                        .map(subject => subject.trim())
                        .filter(Boolean);
                      field.onChange(subjects);
                    }}
                    placeholder="matéria1, matéria2, matéria3"
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
