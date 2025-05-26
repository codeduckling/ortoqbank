'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { InfoIcon, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { type TestFormData, testFormSchema } from '../schema';

// Map UI question modes to API question modes
const mapQuestionMode = (
  mode: string,
): 'all' | 'unanswered' | 'incorrect' | 'bookmarked' => {
  switch (mode) {
    case 'bookmarked': {
      return 'bookmarked';
    }
    case 'unanswered': {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testName, setTestName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const form = useForm<TestFormData>({
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

  const { watch, handleSubmit, setValue } = form;
  const formValues = watch();

  // Fetch hierarchical data
  const hierarchicalData = useQuery(api.themes.getHierarchicalData, {});

  // Get live question count using new filtering logic
  const questionCount = useQuery(api.questionFiltering.getLiveQuestionCount, {
    questionMode: mapQuestionMode(formValues.questionMode),
    selectedThemes: formValues.selectedThemes,
    selectedSubthemes: formValues.selectedSubthemes,
    selectedGroups: formValues.selectedGroups,
  });

  const createCustomQuiz = useMutation(api.customQuizzes.create);

  // Helper functions for hierarchical display
  const getSubthemesForTheme = (themeId: string) => {
    return (
      hierarchicalData?.subthemes?.filter(sub => sub.themeId === themeId) || []
    );
  };

  const getGroupsForSubtheme = (subthemeId: string) => {
    return (
      hierarchicalData?.groups?.filter(
        group => group.subthemeId === subthemeId,
      ) || []
    );
  };

  const toggleSelection = (
    field: 'selectedThemes' | 'selectedSubthemes' | 'selectedGroups',
    id: string,
  ) => {
    const current = formValues[field] || [];
    setValue(
      field,
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id],
      { shouldValidate: true },
    );
  };

  const onSubmit = async (data: TestFormData) => {
    if (!testName.trim()) {
      setShowNameInput(true);
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await createCustomQuiz({
        name: testName,
        description: `Teste criado em ${new Date().toLocaleDateString()} (v2 - Nova Lógica)`,
        testMode: data.testMode,
        questionMode: mapQuestionMode(data.questionMode),
        numQuestions: data.numQuestions,
        selectedThemes: data.selectedThemes as Id<'themes'>[],
        selectedSubthemes: data.selectedSubthemes as Id<'subthemes'>[],
        selectedGroups: data.selectedGroups as Id<'groups'>[],
      });

      if (result.quizId) {
        router.push(`/criar-teste/${result.quizId}`);
      }
    } catch (error) {
      console.error('Erro ao criar quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Test Name Input Modal */}
      {showNameInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Nome do Teste</h3>
              <Input
                placeholder="Digite o nome do seu teste"
                value={testName}
                onChange={e => setTestName(e.target.value)}
                className="mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNameInput(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!testName.trim()}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  Criar Teste
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="space-y-12 p-4 sm:space-y-14 sm:p-6">
          {/* Test Mode Section */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium">Modo</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <InfoIcon className="text-muted-foreground h-4 w-4 cursor-pointer" />
                </PopoverTrigger>
                <PopoverContent className="max-w-xs border border-black">
                  <p>
                    Modo Simulado simula condições de prova, enquanto Modo
                    Estudo permite revisar respostas imediatamente.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-start">
              <Tabs
                value={formValues.testMode}
                onValueChange={value =>
                  setValue('testMode', value as 'study' | 'exam')
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

          {/* Question Mode Section */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium">Questões</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <InfoIcon className="text-muted-foreground h-4 w-4 cursor-pointer" />
                </PopoverTrigger>
                <PopoverContent className="max-w-xs border border-black">
                  <p>
                    Filtre as questões por status: Todas, Não respondidas,
                    Incorretas ou Marcadas (Nova Lógica).
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <RadioGroup
              value={formValues.questionMode}
              onValueChange={(
                value: 'all' | 'unanswered' | 'incorrect' | 'bookmarked',
              ) => setValue('questionMode', value)}
              className="flex flex-wrap gap-4"
            >
              {[
                { id: 'all', label: 'Todas' },
                { id: 'unanswered', label: 'Não respondidas' },
                { id: 'incorrect', label: 'Incorretas' },
                { id: 'bookmarked', label: 'Marcadas' },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center gap-2">
                  <RadioGroupItem id={id} value={id} />
                  <Label htmlFor={id} className="flex items-center gap-2">
                    <span>{label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Themes Section */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium">Temas</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <InfoIcon className="text-muted-foreground h-4 w-4 cursor-pointer" />
                </PopoverTrigger>
                <PopoverContent className="max-w-xs border border-black">
                  <p>
                    Selecione um ou mais temas para filtrar as questões. Clicar
                    em um tema mostra os subtemas e grupos relacionados.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="xs:grid-cols-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {hierarchicalData?.themes?.map(theme => (
                <Button
                  key={theme._id}
                  type="button"
                  onClick={() => toggleSelection('selectedThemes', theme._id)}
                  variant={
                    formValues.selectedThemes.includes(theme._id)
                      ? 'default'
                      : 'outline'
                  }
                  className="h-auto w-full justify-start py-2 text-left"
                >
                  <span className="flex-1 truncate text-sm">{theme.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Subthemes Section - only if themes are selected */}
          {formValues.selectedThemes.length > 0 && (
            <div className="space-y-4">
              {formValues.selectedThemes.map(themeId => {
                const theme = hierarchicalData?.themes?.find(
                  t => t._id === themeId,
                );
                const subthemes = getSubthemesForTheme(themeId);

                if (!theme || subthemes.length === 0) return;

                return (
                  <div key={themeId} className="space-y-3">
                    <h4 className="text-muted-foreground text-sm font-medium">
                      {theme.name}
                    </h4>

                    {/* Subthemes */}
                    <div className="ml-4 space-y-2">
                      {subthemes.map(subtheme => (
                        <div key={subtheme._id} className="space-y-2">
                          <Button
                            type="button"
                            onClick={() =>
                              toggleSelection('selectedSubthemes', subtheme._id)
                            }
                            variant={
                              formValues.selectedSubthemes.includes(
                                subtheme._id,
                              )
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            className="h-auto justify-start py-1 text-left"
                          >
                            <span className="text-xs">{subtheme.name}</span>
                          </Button>

                          {/* Groups for this subtheme */}
                          {formValues.selectedSubthemes.includes(
                            subtheme._id,
                          ) && (
                            <div className="ml-4 grid grid-cols-1 gap-1 sm:grid-cols-2">
                              {getGroupsForSubtheme(subtheme._id).map(group => (
                                <Button
                                  key={group._id}
                                  type="button"
                                  onClick={() =>
                                    toggleSelection('selectedGroups', group._id)
                                  }
                                  variant={
                                    formValues.selectedGroups.includes(
                                      group._id,
                                    )
                                      ? 'default'
                                      : 'outline'
                                  }
                                  size="sm"
                                  className="h-auto justify-start py-1 text-left"
                                >
                                  <span className="text-xs">{group.name}</span>
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Question Count Section */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium">
                Quantidade Máxima de Questões
              </h3>
              <Popover>
                <PopoverTrigger asChild>
                  <InfoIcon className="text-muted-foreground h-4 w-4 cursor-pointer" />
                </PopoverTrigger>
                <PopoverContent className="max-w-xs border border-black">
                  <p>
                    Defina quantas questões você quer no seu teste (máximo 120).
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <Input
              type="number"
              min="1"
              max="120"
              value={formValues.numQuestions}
              onChange={e =>
                setValue('numQuestions', Number.parseInt(e.target.value) || 30)
              }
              className="w-32"
            />
          </div>

          {/* Available Questions Info */}
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-700">
              Questões Disponíveis
            </h4>
            <div className="text-blue-600">
              Há{' '}
              <strong>
                {questionCount === undefined ? '...' : questionCount}
              </strong>{' '}
              questões disponíveis com os critérios selecionados.
              {questionCount !== undefined &&
                formValues.numQuestions > questionCount && (
                  <div className="mt-2 text-orange-600">
                    <strong>Nota:</strong> Você solicitou{' '}
                    {formValues.numQuestions} questões, mas apenas{' '}
                    {questionCount} estão disponíveis.
                  </div>
                )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={isSubmitting || !questionCount || questionCount === 0}
          >
            {isSubmitting ? 'Gerando seu teste...' : 'Gerar Teste'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
