'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { InfoIcon as InfoCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { type TestFormData, testFormSchema } from '../schema';

type Theme = { _id: string; name: string };

type Subtheme = { _id: string; name: string; themeId: string };

type Group = { _id: string; name: string; subthemeId: string };

export default function TestForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSubthemes, setExpandedSubthemes] = useState<string[]>([]);

  const createCustomQuiz = useMutation(api.customQuizzes.create);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TestFormData>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      testMode: 'study',
      questionMode: ['all'], // Default to 'all' questions
      selectedThemes: [],
      selectedSubthemes: [],
      selectedGroups: [],
    },
  });

  // Watch form values for UI updates
  const testMode = watch('testMode');
  const selectedThemes = watch('selectedThemes');
  const selectedSubthemes = watch('selectedSubthemes');
  const selectedGroups = watch('selectedGroups');
  const questionMode = watch('questionMode');

  // Fetch hierarchical data
  const hierarchicalData = useQuery(api.themes.getHierarchicalData);
  const { themes, subthemes, groups } = hierarchicalData ?? {
    themes: [],
    subthemes: [],
    groups: [],
  };

  const onSubmit = async (data: TestFormData) => {
    try {
      setIsSubmitting(true);

      // Map string arrays to appropriate ID types
      const formattedData = {
        name: `Quiz Personalizado - ${new Date().toLocaleDateString()}`,
        description: `Quiz criado em ${new Date().toLocaleDateString()}`,
        testMode: data.testMode,
        questionMode: data.questionMode.map(mode => {
          // Map UI question modes to API question modes
          switch (mode) {
            case 'marked': {
              return 'bookmarked';
            }
            case 'unused': {
              return 'unanswered';
            }
            default: {
              return mode as 'all' | 'incorrect';
            }
          }
        }),
        selectedThemes: data.selectedThemes as Id<'themes'>[],
        selectedSubthemes: data.selectedSubthemes as Id<'subthemes'>[],
        selectedGroups: data.selectedGroups as Id<'groups'>[],
      };

      // Create the custom quiz
      const result = await createCustomQuiz(formattedData);

      if (result.quizId) {
        toast({
          title: 'Quiz criado com sucesso!',
          description: `Seu quiz com ${result.questionCount} questões foi criado.`,
        });

        // Navigate to the quiz - no need to pass mode as it's stored in the database
        router.push(`/criar-teste/${result.quizId}`);
      }
    } catch (error) {
      console.error('Erro ao criar quiz:', error);
      toast({
        title: 'Erro ao criar quiz',
        description:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao criar o quiz.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTheme = (themeId: string) => {
    const current = selectedThemes || [];
    setValue(
      'selectedThemes',
      current.includes(themeId)
        ? current.filter(id => id !== themeId)
        : [...current, themeId],
      { shouldValidate: true },
    );
  };

  const toggleQuestionMode = (mode: string, checked: boolean) => {
    const current = questionMode || [];
    setValue(
      'questionMode',
      checked
        ? [...current, mode as TestFormData['questionMode'][number]]
        : current.filter(m => m !== mode),
      { shouldValidate: true },
    );
  };

  const toggleSubtheme = (subthemeId: string) => {
    const current = selectedSubthemes || [];
    setValue(
      'selectedSubthemes',
      current.includes(subthemeId)
        ? current.filter(id => id !== subthemeId)
        : [...current, subthemeId],
      { shouldValidate: true },
    );
  };

  const toggleGroup = (groupId: string) => {
    const current = selectedGroups || [];
    setValue(
      'selectedGroups',
      current.includes(groupId)
        ? current.filter(id => id !== groupId)
        : [...current, groupId],
      { shouldValidate: true },
    );
  };

  const toggleExpandedSubtheme = (subthemeId: string) => {
    setExpandedSubthemes(previous =>
      previous.includes(subthemeId)
        ? previous.filter(id => id !== subthemeId)
        : [...previous, subthemeId],
    );
  };

  const SubthemeItem = ({ subtheme }: { subtheme: Subtheme }) => {
    const subthemeGroups = groups?.filter(g => g.subthemeId === subtheme._id);
    const isSelected = selectedSubthemes.includes(subtheme._id);
    const hasGroups = subthemeGroups && subthemeGroups.length > 0;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Checkbox
            id={subtheme._id}
            checked={isSelected}
            onCheckedChange={() => toggleSubtheme(subtheme._id)}
          />
          <Label htmlFor={subtheme._id} className="flex-1 truncate text-sm">
            {subtheme.name}
          </Label>
          {hasGroups && (
            <button
              onClick={() => toggleExpandedSubtheme(subtheme._id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
        {hasGroups && expandedSubthemes.includes(subtheme._id) && (
          <div className="space-y-1 pl-6">
            {subthemeGroups.map(group => (
              <div key={group._id} className="flex items-center gap-2">
                <Checkbox
                  id={group._id}
                  checked={selectedGroups.includes(group._id)}
                  onCheckedChange={() => toggleGroup(group._id)}
                />
                <Label htmlFor={group._id} className="text-sm">
                  {group.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Simple grouping of subthemes by theme
  const themeSubthemes = themes?.reduce<Record<string, Subtheme[]>>(
    (accumulator, theme) => {
      accumulator[theme._id] =
        subthemes?.filter(s => s.themeId === theme._id) ?? [];
      return accumulator;
    },
    {},
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="space-y-12 p-4 sm:space-y-14 sm:p-6">
          {/* Modo */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium">Modo</h3>
              <InfoCircle className="text-muted-foreground h-4 w-4" />
            </div>
            <div className="flex items-start">
              <Tabs
                value={testMode}
                onValueChange={value =>
                  setValue('testMode', value as 'study' | 'exam', {
                    shouldValidate: true,
                  })
                }
              >
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="exam">Simulado</TabsTrigger>
                  <TabsTrigger value="study">Estudo</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Questões */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium">Questões</h3>
              <InfoCircle className="text-muted-foreground h-4 w-4" />
            </div>
            <div
              className="flex flex-wrap gap-4"
              role="group"
              aria-label="Questões"
            >
              {[
                { id: 'all', label: 'Todas', count: 3896 },
                { id: 'unused', label: 'Não respondidas', count: 30 },
                { id: 'incorrect', label: 'Incorretas', count: 3 },
                { id: 'marked', label: 'Marcadas', count: 3 },
              ].map(({ id, label, count }) => (
                <div key={id} className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={questionMode?.includes(
                      id as TestFormData['questionMode'][number],
                    )}
                    onCheckedChange={checked =>
                      toggleQuestionMode(id, checked as boolean)
                    }
                  />
                  <Label htmlFor={id} className="flex items-center gap-2">
                    <span>{label}</span>
                    {count && (
                      <span className="bg-secondary rounded px-1.5 py-0.5 text-xs">
                        {count}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
            {errors.questionMode && (
              <p className="text-destructive text-sm">
                {errors.questionMode.message}
              </p>
            )}
          </div>

          {/* Themes */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Temas</h3>
            <div className="xs:grid-cols-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {themes?.map(theme => (
                <Button
                  key={theme._id}
                  type="button"
                  onClick={() => toggleTheme(theme._id)}
                  variant={
                    selectedThemes.includes(theme._id) ? 'default' : 'outline'
                  }
                  className="h-auto w-full justify-start py-2 text-left"
                >
                  <span className="truncate text-sm">{theme.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Only show Subtemas if themes are selected */}
          {selectedThemes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Subtemas</h3>
              {selectedThemes.map(themeId => {
                const theme = themes?.find(t => t._id === themeId);
                const themeSubthemesList = themeSubthemes?.[themeId] ?? [];

                return (
                  <div key={themeId} className="space-y-2">
                    <h4 className="text-muted-foreground text-sm font-medium">
                      {theme?.name}
                    </h4>
                    <div className="xs:grid-cols-2 grid grid-cols-1 gap-4">
                      {themeSubthemesList.map(subtheme => (
                        <SubthemeItem key={subtheme._id} subtheme={subtheme} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {errors.selectedThemes && (
            <p className="text-destructive text-sm">
              {errors.selectedThemes.message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Gerando...' : 'Gerar Teste'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
