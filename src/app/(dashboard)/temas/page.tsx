'use client';

import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import {
  Baby,
  Bone,
  BookOpen,
  CircleArrowOutDownRight,
  Clock,
  Dna,
  FileText,
  Footprints,
  Hand,
  Rotate3d,
  TrainTrack,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

const THEME_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Tumores: Dna,
  Mão: Hand,
  Coluna: TrainTrack,
  'Ombro e Cotovelo': Rotate3d,
  Joelho: Bone,
  Quadril: CircleArrowOutDownRight,
  'Ortopedia Pediátrica': Baby,
  'Pé e Tornozelo': Footprints,
  'Ciências Básicas': Wrench,
};

export default function ThemesPage() {
  const themes = useQuery(api.themes.list) || [];
  const presetQuizzes = useQuery(api.presetQuizzes.list) || [];
  const startSession = useMutation(api.quizSessions.startQuizSession);
  const { user } = useUser();
  const router = useRouter();

  // Filter quizzes to only show those with category = "trilha"
  const trilhasQuizzes = presetQuizzes.filter(
    quiz => quiz.category === 'trilha',
  );

  // Query to get incomplete sessions for the current user
  const incompleteSessions =
    useQuery(api.quizSessions.listIncompleteSessions) || [];

  // Query to get all completed sessions for the current user
  const completedSessions =
    useQuery(api.quizSessions.getAllCompletedSessions) || [];

  // Create a map of quizId to sessionId for incomplete sessions
  const incompleteSessionMap = incompleteSessions.reduce(
    (map: Record<string, Id<'quizSessions'>>, session) => {
      map[session.quizId] = session._id;
      return map;
    },
    {} as Record<string, Id<'quizSessions'>>,
  );

  // Create a map to track which quizzes have completed sessions
  const hasCompletedSessionMap = completedSessions.reduce(
    (map: Record<string, boolean>, session) => {
      map[session.quizId] = true;
      return map;
    },
    {} as Record<string, boolean>,
  );

  // Group trilhas by theme
  const trilhasByTheme = themes.reduce(
    (accumulator, theme) => {
      const themeTrilhas = trilhasQuizzes.filter(
        quiz => quiz.themeId === theme._id,
      );

      if (themeTrilhas.length > 0) {
        accumulator[theme._id] = themeTrilhas;
      }

      return accumulator;
    },
    {} as Record<string, typeof trilhasQuizzes>,
  );

  const handleExamClick = async (quizId: Id<'presetQuizzes'>) => {
    // Check if there's an incomplete session for this quiz
    if (incompleteSessionMap[quizId]) {
      // Navigate to the tema quiz instead of preset-quiz
      router.push(`/temas/${quizId}`);
    } else {
      // Start a new session
      const { sessionId } = await startSession({
        quizId,
        mode: 'study',
      });
      router.push(`/temas/${quizId}`);
    }
  };

  if (!themes || !user) {
    return <div>Carregando temas...</div>;
  }

  // If there are no trilhas for any theme
  if (Object.keys(trilhasByTheme).length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-2xl font-bold">Temas</h1>
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma trilha disponível no momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Temas</h1>
      <Accordion type="single" collapsible className="space-y-4">
        {Object.entries(trilhasByTheme).map(([themeId, trilhas]) => {
          const theme = themes.find(t => t._id === themeId);
          const Icon = theme ? THEME_ICONS[theme.name] || Dna : Dna;

          return (
            <AccordionItem
              key={themeId}
              value={themeId}
              className="overflow-hidden"
            >
              <AccordionTrigger className="hover:bg-muted/20 px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Icon className="h-8 w-8" />
                  <span className="text-2xl font-medium">
                    {theme?.name || 'Trilha'}
                  </span>
                  <span className="text-muted-foreground text-md">
                    ({trilhas.length} testes)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="divide-y">
                  {trilhas.map(exam => {
                    // Check if there's an incomplete session for this quiz
                    const hasIncompleteSession =
                      !!incompleteSessionMap[exam._id];

                    return (
                      <div
                        key={exam._id}
                        className="flex flex-col space-y-3 px-4 py-4"
                      >
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                          <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-medium">{exam.name}</h3>
                              {hasIncompleteSession ? (
                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Em andamento
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                  <BookOpen className="mr-1 h-3 w-3" />
                                  Não iniciado
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <FileText className="text-muted-foreground h-3 w-3" />
                              <span className="text-muted-foreground text-md">
                                {exam.questions.length} questões
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 flex w-full flex-wrap gap-2 md:mt-0 md:w-auto">
                            <Button
                              onClick={() => handleExamClick(exam._id)}
                              className="flex-1 md:flex-none"
                            >
                              {hasIncompleteSession
                                ? 'Retomar Teste'
                                : 'Iniciar Teste'}
                            </Button>
                            {hasCompletedSessionMap[exam._id] && (
                              <Link
                                href={`/quiz-results/${exam._id}`}
                                className="flex-1 md:flex-none"
                              >
                                <Button variant="outline" className="w-full">
                                  Ver Resultados
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
