'use client';

import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { Book, BookOpen, CheckCircle, Clock, FileText } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';

import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

function getStatusBadge(status: 'not_started' | 'in_progress' | 'completed') {
  switch (status) {
    case 'completed': {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="mr-1 h-3 w-3" />
          Concluído
        </Badge>
      );
    }
    case 'in_progress': {
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          <Clock className="mr-1 h-3 w-3" />
          Em andamento
        </Badge>
      );
    }
    case 'not_started': {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          <BookOpen className="mr-1 h-3 w-3" />
          Não iniciado
        </Badge>
      );
    }
  }
}

export default function SimuladoPage() {
  const { user } = useUser();
  const router = useRouter();

  // Fetch all presetQuizzes
  const presetQuizzes = useQuery(api.presetQuizzes.list) || [];

  // Filter to only show simulados (category = "simulado")
  const simulados = presetQuizzes.filter(quiz => quiz.category === 'simulado');

  // Get themes to organize simulados
  const themes = useQuery(api.themes.list) || [];

  // Query to get incomplete sessions for the current user
  const incompleteSessions =
    useQuery(api.quizSessions.listIncompleteSessions) || [];

  // Start session mutation
  const startSession = useMutation(api.quizSessions.startQuizSession);

  // Create a map of quizId to sessionId for incomplete sessions
  const incompleteSessionMap = incompleteSessions.reduce(
    (map: Record<string, Id<'quizSessions'>>, session) => {
      map[session.quizId] = session._id;
      return map;
    },
    {} as Record<string, Id<'quizSessions'>>,
  );

  // Group simulados by theme (if they have a theme)
  const simuladosByTheme: Record<string, typeof simulados> = {};

  // First, separate simulados with themes
  simulados.forEach(simulado => {
    if (simulado.themeId) {
      // If it has a theme, add to that theme's group
      const themeId = simulado.themeId;
      if (!simuladosByTheme[themeId]) {
        simuladosByTheme[themeId] = [];
      }
      simuladosByTheme[themeId].push(simulado);
    } else {
      // If it doesn't have a theme, add to a special "general" group
      if (!simuladosByTheme['general']) {
        simuladosByTheme['general'] = [];
      }
      simuladosByTheme['general'].push(simulado);
    }
  });

  // Handle quiz start/resume
  const handleExamClick = async (quizId: Id<'presetQuizzes'>) => {
    // Check if there's an incomplete session for this quiz
    if (incompleteSessionMap[quizId]) {
      // Navigate to the simulado quiz instead of preset-quiz
      router.push(`/simulados/${quizId}`);
    } else {
      // Start a new session
      const { sessionId } = await startSession({
        quizId,
        mode: 'exam',
      });
      router.push(`/simulados/${quizId}`);
    }
  };

  if (!themes || !user) {
    return <div>Carregando simulados...</div>;
  }

  // If there are no simulados
  if (Object.keys(simuladosByTheme).length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-2xl font-bold">Simulados</h1>
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum simulado disponível no momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        Simulados
      </h1>
      <Accordion type="single" collapsible className="space-y-4">
        {Object.entries(simuladosByTheme).map(([themeId, simulados]) => {
          // Special handling for general (themeless) simulados
          let title = 'Simulados Gerais';

          // If it's not the general group, find the theme name
          if (themeId !== 'general') {
            const theme = themes.find(t => t._id === themeId);
            title = theme?.name || 'Simulados';
          }

          return (
            <AccordionItem
              key={themeId}
              value={themeId}
              className="overflow-hidden"
            >
              <AccordionTrigger className="hover:bg-muted/20 py-3 hover:no-underline md:px-4">
                <div className="flex items-center gap-3">
                  <Book className="h-6 w-6 md:h-8 md:w-8" />
                  <span className="font-medium md:text-xl">{title}</span>
                  <span className="text-muted-foreground text-md">
                    ({simulados.length} simulados)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="divide-y">
                  {simulados.map(simulado => {
                    // Check if there's an incomplete session for this quiz
                    const hasIncompleteSession =
                      !!incompleteSessionMap[simulado._id];
                    const status = hasIncompleteSession
                      ? 'in_progress'
                      : 'not_started';

                    return (
                      <div
                        key={simulado._id}
                        className="flex flex-col space-y-3 px-4 py-4"
                      >
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                          <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-medium">{simulado.name}</h3>
                              {getStatusBadge(status)}
                            </div>
                            <p className="text-muted-foreground text-md">
                              {simulado.description}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <FileText className="text-muted-foreground h-3 w-3" />
                              <span className="text-muted-foreground text-md">
                                {simulado.questions.length} questões
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex w-full flex-wrap gap-2 md:mt-0 md:w-auto">
                            <Button
                              className="flex-1 md:flex-none"
                              onClick={() => handleExamClick(simulado._id)}
                            >
                              {hasIncompleteSession
                                ? 'Continuar Simulado'
                                : 'Iniciar Simulado'}
                            </Button>

                            <Link href={`/quiz-results/${simulado._id}`}>
                              <Button
                                variant="outline"
                                className="flex-1 md:flex-none"
                              >
                                Ver Resultados
                              </Button>
                            </Link>
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
