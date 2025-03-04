'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { BookOpen, Calendar, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';

import { api } from '../../../../convex/_generated/api';
import { Doc, Id } from '../../../../convex/_generated/dataModel';

// Format relative time helper
const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  if (diffInSeconds < 60) return 'Agora mesmo';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
  if (diffInSeconds < 86_400)
    return `${Math.floor(diffInSeconds / 3600)}h atrás`;
  if (diffInSeconds < 604_800)
    return `${Math.floor(diffInSeconds / 86_400)}d atrás`;

  return formatDate(timestamp);
};

export default function TestesPreviosPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<string>('all');

  // Fetch user's custom quizzes
  const customQuizzes = useQuery(api.customQuizzes.getCustomQuizzes, {}) || [];

  // Fetch theme, subtheme and group data for name lookups
  const themes = useQuery(api.themes.list, {}) || [];
  const subthemes = useQuery(api.subthemes.list, {}) || [];
  const groups = useQuery(api.groups.list, {}) || [];

  // Create lookup functions for resolving IDs to names
  const getThemeName = (id: string) => {
    const theme = themes.find(
      (t: { _id: string; name: string }) => t._id === id,
    );
    return theme ? theme.name : 'Tema';
  };

  const getSubthemeName = (id: string) => {
    const subtheme = subthemes.find(
      (s: { _id: string; name: string }) => s._id === id,
    );
    return subtheme ? subtheme.name : 'Subtema';
  };

  const getGroupName = (id: string) => {
    const group = groups.find(
      (g: { _id: string; name: string }) => g._id === id,
    );
    return group ? group.name : 'Grupo';
  };

  // Fetch completed quiz sessions to show results link when available
  const completedSessions =
    useQuery(api.quizSessions.getAllCompletedSessions, {}) || [];

  // Create a map of quiz IDs to check if they have completed sessions
  const completedQuizIds = new Set(
    completedSessions.map(
      (session: { quizId: Id<'presetQuizzes'> | Id<'customQuizzes'> }) =>
        session.quizId,
    ),
  );

  // Loading state
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Carregando...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (customQuizzes.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-2xl font-bold">Meus Testes</h1>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              Nenhum teste personalizado encontrado
            </h2>
            <p className="text-muted-foreground mt-2">
              Você ainda não criou nenhum teste personalizado.
            </p>
            <Link href="/criar-teste">
              <Button className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Criar Teste Personalizado
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Meus Testes</h1>
        <Link href="/criar-teste">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar Novo Teste
          </Button>
        </Link>
      </div>

      <Tabs
        defaultValue="all"
        className="mb-8"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="exam">Simulados</TabsTrigger>
          <TabsTrigger value="study">Estudo</TabsTrigger>
        </TabsList>
        <Separator className="mb-6" />

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customQuizzes.map(quiz => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                hasResults={completedQuizIds.has(quiz._id)}
                getThemeName={getThemeName}
                getSubthemeName={getSubthemeName}
                getGroupName={getGroupName}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exam" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customQuizzes
              .filter(quiz => quiz.testMode === 'exam')
              .map(quiz => (
                <QuizCard
                  key={quiz._id}
                  quiz={quiz}
                  hasResults={completedQuizIds.has(quiz._id)}
                  getThemeName={getThemeName}
                  getSubthemeName={getSubthemeName}
                  getGroupName={getGroupName}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="study" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customQuizzes
              .filter(quiz => quiz.testMode === 'study')
              .map(quiz => (
                <QuizCard
                  key={quiz._id}
                  quiz={quiz}
                  hasResults={completedQuizIds.has(quiz._id)}
                  getThemeName={getThemeName}
                  getSubthemeName={getSubthemeName}
                  getGroupName={getGroupName}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QuizCard({
  quiz,
  hasResults,
  getThemeName,
  getSubthemeName,
  getGroupName,
}: {
  quiz: {
    _id: Id<'customQuizzes'>;
    name: string;
    description: string;
    questions: Id<'questions'>[];
    testMode: 'study' | 'exam';
    questionMode?: string;
    _creationTime: number;
    // We'll keep these fields optional
    themes?: any;
    subthemes?: any;
    groups?: any;
    selectedThemes?: any;
    selectedSubthemes?: any;
    selectedGroups?: any;
  };
  hasResults: boolean;
  getThemeName: (id: string) => string;
  getSubthemeName: (id: string) => string;
  getGroupName: (id: string) => string;
}) {
  // Get access to the lookup maps from parent component
  const themes = useQuery(api.themes.list, {}) || [];
  const subthemes = useQuery(api.subthemes.list, {}) || [];
  const groups = useQuery(api.groups.list, {}) || [];

  // Create lookup maps for name resolution
  const themeMap: Record<string, string> = {};
  themes.forEach((theme: { _id: string; name: string }) => {
    themeMap[theme._id] = theme.name;
  });

  const subthemeMap: Record<string, string> = {};
  subthemes.forEach((subtheme: { _id: string; name: string }) => {
    subthemeMap[subtheme._id] = subtheme.name;
  });

  const groupMap: Record<string, string> = {};
  groups.forEach((group: { _id: string; name: string }) => {
    groupMap[group._id] = group.name;
  });

  // Simplified approach to get theme IDs
  let themeIds: string[] = [];
  if (quiz.themes && Array.isArray(quiz.themes)) {
    themeIds = quiz.themes;
  } else if (quiz.selectedThemes && Array.isArray(quiz.selectedThemes)) {
    themeIds = quiz.selectedThemes;
  }

  // Simplified approach to get subtheme IDs
  let subthemeIds: string[] = [];
  if (quiz.subthemes && Array.isArray(quiz.subthemes)) {
    subthemeIds = quiz.subthemes;
  } else if (quiz.selectedSubthemes && Array.isArray(quiz.selectedSubthemes)) {
    subthemeIds = quiz.selectedSubthemes;
  }

  // Simplified approach to get group IDs
  let groupIds: string[] = [];
  if (quiz.groups && Array.isArray(quiz.groups)) {
    groupIds = quiz.groups;
  } else if (quiz.selectedGroups && Array.isArray(quiz.selectedGroups)) {
    groupIds = quiz.selectedGroups;
  }

  // Map IDs to actual names using the lookup maps
  const themeNames = themeIds.map(id => themeMap[id] || 'Tema').filter(Boolean);
  const subthemeNames = subthemeIds
    .map(id => subthemeMap[id] || 'Subtema')
    .filter(Boolean);
  const groupNames = groupIds
    .map(id => groupMap[id] || 'Grupo')
    .filter(Boolean);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/40 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {quiz.testMode === 'exam' ? (
              <Clock className="h-4 w-4 text-amber-500" />
            ) : (
              <BookOpen className="h-4 w-4 text-emerald-500" />
            )}
            <span className="text-muted-foreground text-xs">
              Criado {formatRelativeTime(quiz._creationTime)}
            </span>
          </div>
          <div className="text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">{formatDate(quiz._creationTime)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <h3 className="line-clamp-1 text-lg font-bold">{quiz.name}</h3>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {quiz.description}
        </p>

        {/* Quiz Configuration Options */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span
            className={`rounded-full px-2 py-0.5 font-medium ${
              quiz.testMode === 'exam'
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            }`}
          >
            {quiz.testMode === 'exam' ? 'Simulado' : 'Estudo'}
          </span>

          {quiz.questionMode && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
              {quiz.questionMode === 'all' && 'Todas'}
              {quiz.questionMode === 'incorrect' && 'Incorretas'}
              {quiz.questionMode === 'bookmarked' && 'Favoritadas'}
              {quiz.questionMode === 'unanswered' && 'Não Respondidas'}
            </span>
          )}

          {themeNames.length > 0 && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {themeNames.length > 1
                ? `${themeNames.length} temas`
                : themeNames[0]}
            </span>
          )}

          {subthemeNames.length > 0 && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
              {subthemeNames.length > 1
                ? `${subthemeNames.length} subtemas`
                : subthemeNames[0]}
            </span>
          )}

          {groupNames.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              {groupNames.length > 1
                ? `${groupNames.length} grupos`
                : groupNames[0]}
            </span>
          )}

          <span className="bg-secondary rounded-full px-2 py-0.5 font-medium">
            {quiz.questions.length} questões
          </span>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 flex justify-between gap-2 pt-4">
        <Link href={`/criar-teste/${quiz._id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            Iniciar
          </Button>
        </Link>
        {hasResults && (
          <Link href={`/quiz-results/${quiz._id}`} className="flex-1">
            <Button className="w-full">Ver Resultados</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
