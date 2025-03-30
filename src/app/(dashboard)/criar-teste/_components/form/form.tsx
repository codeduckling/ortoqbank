'use client';

/* eslint-disable unicorn/no-nested-ternary */

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { ConvexError } from 'convex/values';
import {
  CheckCircle2,
  InfoIcon as InfoCircle,
  Loader2,
  Plus,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { type TestFormData, testFormSchema } from '../schema';

type Theme = { _id: string; name: string };

type Subtheme = { _id: string; name: string; themeId: string };

type Group = { _id: string; name: string; subthemeId: string };

// Map UI question modes to API question modes
const mapQuestionMode = (
  mode: string,
): 'all' | 'unanswered' | 'incorrect' | 'bookmarked' => {
  switch (mode) {
    case 'marked': {
      return 'bookmarked';
    }
    case 'unused': {
      return 'unanswered';
    }
    case 'incorrect': {
      return 'incorrect';
    }
    default: {
      return 'all';
    }
  }
};

export default function TestForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [formData, setFormData] = useState<TestFormData | undefined>();
  const [submissionState, setSubmissionState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [resultMessage, setResultMessage] = useState<{
    title: string;
    description: string;
  }>({
    title: '',
    description: '',
  });
  const [expandedSubthemes, setExpandedSubthemes] = useState<string[]>([]);
  const [availableQuestionCount, setAvailableQuestionCount] = useState<
    number | undefined
  >();
  const [isCountLoading, setIsCountLoading] = useState(false);

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
      name: 'Personalizado',
      testMode: 'study',
      questionMode: 'all',
      numQuestions: 30,
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
  const numQuestions = watch('numQuestions');
  const quizName = watch('name');

  // Query question counts by mode (efficient new approach)
  const questionModeCounts = useQuery(api.questions.countQuestionsByMode, {
    questionMode: mapQuestionMode(questionMode || 'all'),
  });

  // Query question counts by theme for the selected mode
  const themeQuestionCounts = useQuery(api.questions.countQuestionsByTheme, {
    questionMode: mapQuestionMode(questionMode || 'all'),
  });

  // Query the count of available questions based on current selection
  const countQuestions = useQuery(
    api.questions.countAvailableQuestionsEfficient,
    {
      questionMode: mapQuestionMode(questionMode || 'all'),
      selectedThemes: selectedThemes as Id<'themes'>[],
      selectedSubthemes: selectedSubthemes as Id<'subthemes'>[],
      selectedGroups: selectedGroups as Id<'groups'>[],
    },
  );

  // Update available question count when Convex query result changes
  useEffect(() => {
    setAvailableQuestionCount(countQuestions?.count);
    setIsCountLoading(countQuestions === undefined);
  }, [countQuestions]);

  // Fetch hierarchical data
  const hierarchicalData = useQuery(api.themes.getHierarchicalData);
  const { themes, subthemes, groups } = hierarchicalData ?? {
    themes: [],
    subthemes: [],
    groups: [],
  };

  const onSubmit = async (data: TestFormData) => {
    setFormData(data);
    setShowNameModal(true);
  };

  const submitWithName = async (testName: string) => {
    if (!formData) return;

    try {
      setIsSubmitting(true);
      setSubmissionState('loading');

      // Map string arrays to appropriate ID types
      const formattedData = {
        name: testName,
        description: `Teste criado em ${new Date().toLocaleDateString()}`,
        testMode: formData.testMode,
        questionMode: mapQuestionMode(formData.questionMode),
        numQuestions: formData.numQuestions,
        selectedThemes: formData.selectedThemes as Id<'themes'>[],
        selectedSubthemes: formData.selectedSubthemes as Id<'subthemes'>[],
        selectedGroups: formData.selectedGroups as Id<'groups'>[],
      };

      // Create the custom quiz
      const result = await createCustomQuiz(formattedData);

      if (result.quizId) {
        setSubmissionState('success');
        setResultMessage({
          title: 'Quiz criado com sucesso!',
          description: `Seu quiz com ${result.questionCount} questões foi criado. Aguarde, você será redirecionado automaticamente...`,
        });

        // Navigate after a short delay to show success
        setTimeout(() => {
          router.push(`/criar-teste/${result.quizId}`);
          setIsSubmitting(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao criar quiz:', error);
      setSubmissionState('error');

      if (error instanceof ConvexError) {
        const errorMessage =
          typeof error.data === 'string'
            ? error.data
            : error.data?.message ||
              'Nenhuma questão encontrada com os critérios selecionados';

        setResultMessage({
          title: 'Erro ao criar quiz',
          description: errorMessage,
        });
      } else {
        setResultMessage({
          title: 'Erro ao criar quiz',
          description:
            error instanceof Error
              ? error.message
              : 'Ocorreu um erro ao criar o quiz.',
        });
      }
      setIsSubmitting(false);
    } finally {
      setShowNameModal(false);
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
      {/* Modal for entering quiz name */}
      <Dialog open={showNameModal} onOpenChange={setShowNameModal}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Nome do Teste</DialogTitle>
          <DialogDescription>
            Agora que você configurou seu teste, dê um nome a ele.
          </DialogDescription>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test-name">Nome do Teste</Label>
              <Input
                id="test-name"
                placeholder="Digite um nome para o teste"
                defaultValue="Personalizado"
                className="w-full"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget as HTMLInputElement;
                    if (input.value.length >= 3) {
                      submitWithName(input.value);
                    } else {
                      toast({
                        title: 'Nome muito curto',
                        description:
                          'O nome precisa ter pelo menos 3 caracteres',
                        variant: 'destructive',
                      });
                    }
                  }
                }}
              />
              <p className="text-muted-foreground text-xs">
                O nome deve ter pelo menos 3 caracteres.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNameModal(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={e => {
                  const input = document.querySelector(
                    '#test-name',
                  ) as HTMLInputElement;
                  if (input.value.length >= 3) {
                    submitWithName(input.value);
                  } else {
                    toast({
                      title: 'Nome muito curto',
                      description: 'O nome precisa ter pelo menos 3 caracteres',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                Criar Teste
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal for all feedback states */}
      <Dialog
        open={isSubmitting || submissionState === 'error'}
        onOpenChange={open => {
          if (!open) {
            setIsSubmitting(false);
            if (submissionState === 'error') {
              setSubmissionState('idle');
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            {submissionState === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <DialogTitle>Criando seu quiz...</DialogTitle>
                <DialogDescription>
                  Estamos preparando seu teste personalizado. Você será
                  redirecionado automaticamente assim que estiver pronto.
                </DialogDescription>
              </>
            )}

            {submissionState === 'success' && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <DialogTitle>{resultMessage.title}</DialogTitle>
                <DialogDescription>
                  {resultMessage.description}
                </DialogDescription>
              </>
            )}

            {submissionState === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-red-500" />
                <DialogTitle>{resultMessage.title}</DialogTitle>
                <DialogDescription>
                  {resultMessage.description}
                </DialogDescription>
                <Button
                  onClick={() => setSubmissionState('idle')}
                  variant="outline"
                >
                  Fechar
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
                  <TabsTrigger
                    value="exam"
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    Simulado
                  </TabsTrigger>
                  <TabsTrigger
                    value="study"
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    Estudo
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Questões */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium">Questões</h3>
            </div>
            <RadioGroup
              value={questionMode}
              onValueChange={value =>
                setValue(
                  'questionMode',
                  value as 'all' | 'incorrect' | 'unused' | 'marked',
                  { shouldValidate: true },
                )
              }
              className="flex flex-wrap gap-4"
            >
              {[
                { id: 'all', label: 'Todas', apiKey: 'all' },
                {
                  id: 'unused',
                  label: 'Não respondidas',
                  apiKey: 'unanswered',
                },
                { id: 'incorrect', label: 'Incorretas', apiKey: 'incorrect' },
                { id: 'marked', label: 'Marcadas', apiKey: 'bookmarked' },
              ].map(({ id, label, apiKey }) => {
                // Get count from our new API response
                const count =
                  questionModeCounts?.[
                    apiKey as keyof typeof questionModeCounts
                  ];

                return (
                  <div key={id} className="flex items-center gap-2">
                    <RadioGroupItem id={id} value={id} />
                    <Label htmlFor={id} className="flex items-center gap-2">
                      <span>{label}</span>
                      {count !== undefined && (
                        <span className="bg-secondary rounded px-1.5 py-0.5 text-xs">
                          {count}
                        </span>
                      )}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
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
              {themes?.map(theme => {
                // Get question count for this theme from our new API
                const themeCount =
                  themeQuestionCounts?.find(t => t.theme._id === theme._id)
                    ?.count || 0;

                return (
                  <Button
                    key={theme._id}
                    type="button"
                    onClick={() => toggleTheme(theme._id)}
                    variant={
                      selectedThemes.includes(theme._id) ? 'default' : 'outline'
                    }
                    className="h-auto w-full justify-start py-2 text-left"
                  >
                    <span className="flex-1 truncate text-sm">
                      {theme.name}
                    </span>
                    {themeCount > 0 && (
                      <span className="bg-secondary ml-1 rounded px-1.5 py-0.5 text-xs text-black">
                        {themeCount}
                      </span>
                    )}
                  </Button>
                );
              })}
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

          {/* Number of Questions */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">
                Quantidade Máxima de Questões
              </h3>
              <div className="w-24">
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={numQuestions}
                  onChange={e => {
                    const value = Number.parseInt(e.target.value);
                    if (!Number.isNaN(value)) {
                      setValue(
                        'numQuestions',
                        Math.min(Math.max(value, 1), 120),
                        { shouldValidate: true },
                      );
                    }
                  }}
                />
              </div>
            </div>
            {errors.numQuestions && (
              <p className="text-destructive text-sm">
                {errors.numQuestions.message}
              </p>
            )}
          </div>

          {/* Available Questions Count Display */}
          <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex items-center">
              <InfoCircle className="h-5 w-5 text-blue-400 dark:text-blue-300" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Questões Disponíveis
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  {isCountLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculando...
                    </div>
                  ) : availableQuestionCount === undefined ? (
                    <p>
                      Selecione pelo menos um tema para ver quantas questões
                      estão disponíveis.
                    </p>
                  ) : (
                    <p>
                      Há{' '}
                      <span className="font-bold">
                        {availableQuestionCount}
                      </span>{' '}
                      {availableQuestionCount === 1
                        ? 'questão disponível'
                        : 'questões disponíveis'}{' '}
                      com os critérios selecionados.
                      {numQuestions > (availableQuestionCount || 0) && (
                        <span className="mt-1 block text-amber-600 dark:text-amber-400">
                          Nota: Você solicitou {numQuestions} questões, mas
                          apenas {availableQuestionCount}{' '}
                          {availableQuestionCount === 1
                            ? 'está disponível'
                            : 'estão disponíveis'}
                          .
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Gerando seu teste...' : 'Gerar Teste'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
