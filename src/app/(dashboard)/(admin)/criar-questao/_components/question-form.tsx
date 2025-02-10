'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import RichTextEditor from '@/components/rich-text-editor/rich-text-editor';
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
import { useToast } from '@/hooks/use-toast';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { QuestionOption } from './question-option';
import { QuestionFormData, questionSchema } from './schema';

interface QuestionFormProps {
  mode?: 'create' | 'edit';
  defaultValues?: any; // We'll type this properly later
}

export function QuestionForm({
  mode = 'create',
  defaultValues,
}: QuestionFormProps) {
  const { toast } = useToast();

  const createQuestion = useMutation(api.questions.create);
  const updateQuestion = useMutation(api.questions.update);
  const themes = useQuery(api.themes.list);

  const [selectedTheme, setSelectedTheme] = useState<Id<'themes'> | undefined>(
    defaultValues?.themeId,
  );
  const [selectedSubtheme, setSelectedSubtheme] = useState<
    Id<'subthemes'> | undefined
  >(defaultValues?.subthemeId);

  const subthemes = useQuery(
    api.subthemes.list,
    selectedTheme ? { themeId: selectedTheme } : 'skip',
  );
  const groups = useQuery(
    api.groups.list,
    selectedSubtheme ? { subthemeId: selectedSubtheme } : 'skip',
  );

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: defaultValues || {
      title: '',
      questionText: {
        type: 'paragraph',
        content: [{ type: 'text', text: '' }],
      },
      options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
      correctOptionIndex: 0,
      explanationText: {
        type: 'paragraph',
        content: [{ type: 'text', text: '' }],
      },
      themeId: '',
      subthemeId: undefined,
      groupId: undefined,
    },
  });

  const { fields } = useFieldArray({ name: 'options', control: form.control });

  const onSubmit = async (data: QuestionFormData) => {
    try {
      if (mode === 'edit' && defaultValues) {
        await updateQuestion({ id: defaultValues._id, ...data });
        toast({ title: 'Questão atualizada com sucesso!' });
      } else {
        await createQuestion(data);
        toast({ title: 'Questão criada com sucesso!' });
      }

      if (mode === 'create') {
        form.reset();
      }
    } catch {
      toast({
        title: 'Erro ao salvar questão',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    }
  };

  const getButtonText = () => {
    if (form.formState.isSubmitting) {
      return mode === 'edit' ? 'Salvando...' : 'Criando...';
    }
    return mode === 'edit' ? 'Salvar Alterações' : 'Criar Questão';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Questão</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="questionText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto da Questão</FormLabel>
              <FormControl>
                <RichTextEditor
                  onChange={field.onChange}
                  initialContent={defaultValues?.questionText}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
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
          name="explanationText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Explicação</FormLabel>
              <FormControl>
                <RichTextEditor
                  onChange={field.onChange}
                  initialContent={defaultValues?.explanationText}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="themeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tema <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={value => {
                    field.onChange(value);
                    setSelectedTheme(value as Id<'themes'>);
                    setSelectedSubtheme(undefined);
                    form.setValue('subthemeId', undefined);
                    form.setValue('groupId', undefined);
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
                <FormLabel>Subtema (opcional)</FormLabel>
                <Select
                  value={field.value ?? 'none'}
                  onValueChange={value => {
                    const newValue = value === 'none' ? undefined : value;
                    field.onChange(newValue);
                    setSelectedSubtheme(newValue as Id<'subthemes'>);
                    form.setValue('groupId', undefined);
                  }}
                  disabled={!selectedTheme}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o subtema" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {subthemes?.map(subtheme => (
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

          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo (opcional)</FormLabel>
                <Select
                  value={field.value ?? 'none'}
                  onValueChange={value => {
                    field.onChange(value === 'none' ? undefined : value);
                  }}
                  disabled={!selectedSubtheme}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o grupo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {groups?.map(group => (
                      <SelectItem key={group._id} value={group._id}>
                        {group.name}
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
          {getButtonText()}
        </Button>
      </form>
    </Form>
  );
}
