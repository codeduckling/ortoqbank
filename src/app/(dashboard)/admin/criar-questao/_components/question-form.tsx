'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { v } from 'convex/values';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { pendingUploads } from '@/components/rich-text-editor/image-upload-button';
import RichTextEditor from '@/components/rich-text-editor/rich-text-editor';
import { uploadToImageKit } from '@/components/rich-text-editor/upload-action';
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
import { normalizeText } from '../../../../../../convex/utils';
import { QuestionOption } from './question-option';
import { QuestionFormData, questionSchema } from './schema';

const NUMBER_OF_ALTERNATIVES = 4;

interface QuestionFormProps {
  mode?: 'create' | 'edit';
  defaultValues?: any; // We'll type this properly later
  onSuccess?: () => void; // New callback for handling successful submission
}

const hasBlobUrls = (content: any[]): boolean => {
  for (const node of content) {
    if (node.type === 'image' && node.attrs?.src?.startsWith('blob:')) {
      return true;
    }
  }
  return false;
};

export function QuestionForm({
  mode = 'create',
  defaultValues,
  onSuccess,
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
      alternatives: Array.from({ length: NUMBER_OF_ALTERNATIVES }).fill(''),
      correctAlternativeIndex: 0,
      explanationText: {
        type: 'paragraph',
        content: [{ type: 'text', text: '' }],
      },
      themeId: '',
      subthemeId: undefined,
      groupId: undefined,
    },
  });

  const { fields } = useFieldArray({
    name: 'alternatives',
    control: form.control,
    rules: { minLength: 4, maxLength: 4 },
  });

  // Add refs to store editor instances
  const [questionEditor, setQuestionEditor] = useState<any>();
  const [explanationEditor, setExplanationEditor] = useState<any>();
  const [generatedId, setGeneratedId] = useState<string>('');

  // Watch for changes in theme, subtheme, and group
  const selectedThemeId = form.watch('themeId');
  const selectedSubthemeId = form.watch('subthemeId');
  const selectedGroupId = form.watch('groupId');

  // Query to get theme question counts
  const queryCountByTheme = useQuery(api.questions.countQuestionsByTheme, {
    questionMode: 'all',
  });

  // Generate an ID when relevant fields change or data loads
  useEffect(() => {
    // Don't try to generate if theme not selected or data not loaded
    if (!selectedThemeId || !themes) {
      setGeneratedId('');
      return;
    }

    const theme = themes.find(t => t._id === selectedThemeId);
    if (!theme) {
      setGeneratedId('');
      return;
    }

    // Get theme prefix from the database or default to first 3 letters
    // Ensure the prefix is normalized to prevent accents, spaces, dots, etc.
    const themePrefix = theme.prefix
      ? normalizeText(theme.prefix).toUpperCase()
      : normalizeText(theme.name.slice(0, 3)).toUpperCase();

    // Build parts of the ID
    let codePrefix = themePrefix;

    // Add subtheme prefix if selected
    if (selectedSubthemeId && subthemes) {
      const subtheme = subthemes.find(s => s._id === selectedSubthemeId);
      if (subtheme?.prefix) {
        // Ensure subtheme prefix is properly normalized
        const normalizedSubthemePrefix = normalizeText(
          subtheme.prefix,
        ).toUpperCase();
        codePrefix += `-${normalizedSubthemePrefix}`;
      }
    }

    // Add group prefix if selected
    if (selectedGroupId && groups) {
      const group = groups.find(g => g._id === selectedGroupId);
      if (group?.prefix) {
        // Ensure group prefix is properly normalized
        const normalizedGroupPrefix = normalizeText(group.prefix).toUpperCase();
        codePrefix += `-${normalizedGroupPrefix}`;
      }
    }

    // Get theme question counts from the query result
    if (!queryCountByTheme) {
      return; // Wait for query to load
    }

    const themeData = queryCountByTheme.find(
      t => t.theme._id === selectedThemeId,
    );

    const count = (themeData?.count || 0) + 1;
    const paddedCount = String(count).padStart(3, '0');

    setGeneratedId(`${codePrefix}-${paddedCount}`);
  }, [
    selectedThemeId,
    selectedSubthemeId,
    selectedGroupId,
    themes,
    subthemes,
    groups,
    queryCountByTheme,
  ]);

  const onSubmit = async (data: QuestionFormData) => {
    try {
      // Process both questionText and explanationText
      const processContent = async (content: any[]) => {
        const promises = content.map(async node => {
          if (node.type === 'image' && node.attrs?.src?.startsWith('blob:')) {
            const blobUrl = node.attrs.src;
            const pendingUpload = pendingUploads.get(blobUrl);

            if (pendingUpload) {
              try {
                const imagekitUrl = await uploadToImageKit(pendingUpload.file);
                // Clean up
                URL.revokeObjectURL(blobUrl);
                pendingUploads.delete(blobUrl);

                return { ...node, attrs: { ...node.attrs, src: imagekitUrl } };
              } catch (error) {
                console.error('Failed to upload image:', error);
                return node; // Keep original node if upload fails
              }
            }
          }
          return node;
        });

        return await Promise.all(promises);
      };

      const processedQuestionText = {
        type: 'doc',
        content: await processContent(data.questionText.content),
      };

      const processedExplanationText = {
        type: 'doc',
        content: await processContent(data.explanationText.content),
      };

      // Include generated question code in submission
      const submissionData = {
        ...data,
        // Make one final pass with normalizeText to guarantee no special characters
        questionCode: normalizeText(generatedId).toUpperCase(),
        questionText: processedQuestionText,
        explanationText: processedExplanationText,
      };

      // Check for any remaining blob URLs after processing
      if (
        hasBlobUrls(submissionData.questionText.content) ||
        hasBlobUrls(submissionData.explanationText.content)
      ) {
        toast({
          title: 'Erro ao salvar questão',
          description: 'Algumas imagens não foram processadas corretamente',
          variant: 'destructive',
        });
        return;
      }

      const processedData = {
        ...submissionData,
        themeId: selectedTheme!,
        subthemeId: selectedSubtheme,
        groupId: selectedSubtheme ? (data.groupId as Id<'groups'>) : undefined,
      };

      if (mode === 'edit' && defaultValues) {
        await updateQuestion({
          id: defaultValues._id,
          ...processedData,
        });
        toast({ title: 'Questão atualizada com sucesso!' });

        // Call the success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        await createQuestion(processedData);
        toast({ title: 'Questão criada com sucesso!' });
      }

      // Only clear the form if we're in create mode
      if (mode === 'create') {
        form.reset();
        // Clear editors
        questionEditor?.commands.setContent('');
        explanationEditor?.commands.setContent('');
      }
    } catch (error) {
      console.error('Failed to submit:', error);
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

        {/* Display generated ID */}
        <div className="flex flex-row items-center gap-4 py-2">
          <div className="flex-1">
            <div className="mb-1 text-sm font-medium">Código da Questão</div>
            <div className="flex items-center gap-2">
              <div
                className={`rounded-md border px-3 py-1 ${generatedId ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' : 'bg-muted'}`}
              >
                {generatedId || 'Selecione um tema para gerar o código'}
              </div>
              {generatedId && (
                <div className="text-muted-foreground text-xs">
                  Este código será salvo com a questão e ajudará na
                  identificação
                </div>
              )}
            </div>
          </div>
        </div>

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
                  onEditorReady={setQuestionEditor}
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
              {Array.from({ length: NUMBER_OF_ALTERNATIVES }, (_, index) => (
                <QuestionOption
                  key={index}
                  control={form.control}
                  index={index}
                  isSelected={form.watch('correctAlternativeIndex') === index}
                  onSelect={() =>
                    form.setValue('correctAlternativeIndex', index)
                  }
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
                  onEditorReady={setExplanationEditor}
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
