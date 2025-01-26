'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { Check, Plus, Trash2, Upload } from 'lucide-react';
import { useFieldArray,useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { api } from '../../../../../convex/_generated/api';

const questionSchema = z.object({
  text: z.string().min(10, 'A questão deve ter pelo menos 10 caracteres'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  options: z
    .array(
      z.object({
        text: z.string().min(1, 'A alternativa não pode estar vazia'),
        imageUrl: z.string().url().optional().or(z.literal('')),
      }),
    )
    .length(4, 'A questão deve ter exatamente 4 alternativas'),
  correctOptionIndex: z.number().min(0).max(3),
  explanation: z
    .string()
    .min(10, 'A explicação deve ter pelo menos 10 caracteres'),
  subject: z.string().min(3, 'O assunto deve ter pelo menos 3 caracteres'),
  tags: z.array(z.string().min(1, 'Tag não pode estar vazia')),
});

type QuestionFormData = z.infer<typeof questionSchema>;

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
      subject: '',
      tags: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
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
        subject: data.subject,
        tags: data.tags,
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem da Questão (opcional)</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    type="url"
                    {...field}
                    disabled
                    placeholder="Nenhuma imagem selecionada"
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => {
                    // Will be implemented later
                    console.log('Upload image');
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Alternativas</FormLabel>
          <Card>
            <CardContent className="space-y-2 p-2">
              {fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="relative">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name={`options.${index}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={
                                form.watch('correctOptionIndex') === index
                                  ? 'default'
                                  : 'outline'
                              }
                              size="sm"
                              className="h-8 w-8 shrink-0 p-0"
                              onClick={() =>
                                form.setValue('correctOptionIndex', index)
                              }
                            >
                              {form.watch('correctOptionIndex') === index ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <span>{String.fromCharCode(65 + index)}</span>
                              )}
                            </Button>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`options.${index}.imageUrl`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-2 pl-10">
                            <FormControl>
                              <Input
                                type="url"
                                {...field}
                                disabled
                                placeholder="Nenhuma imagem selecionada"
                                className="text-sm"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                              onClick={() => {
                                // Will be implemented later
                                console.log('Upload image for option', index);
                              }}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
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
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assunto</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value.join(', ')}
                    onChange={e => {
                      const tags = e.target.value
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(Boolean);
                      field.onChange(tags);
                    }}
                    placeholder="tag1, tag2, tag3"
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
