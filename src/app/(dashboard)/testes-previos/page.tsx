'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { BookOpen, Calendar, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
}: {
  quiz: {
    _id: Id<'customQuizzes'>;
    name: string;
    description: string;
    questions: Id<'questions'>[];
    testMode: 'study' | 'exam';
    _creationTime: number;
  };
  hasResults: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/40 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {quiz.testMode === 'exam' ? (
              <Clock className="h-4 w-4 text-amber-500" />
            ) : (
              <BookOpen className="h-4 w-4 text-emerald-500" />
            )}
            <span className="text-sm font-medium capitalize">
              {quiz.testMode === 'exam' ? 'Simulado' : 'Estudo'}
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
        <div className="mt-2 flex items-center gap-2">
          <span className="bg-secondary rounded-full px-2 py-0.5 text-xs font-medium">
            {quiz.questions.length} questões
          </span>
          <span className="text-muted-foreground text-xs">
            {formatRelativeTime(quiz._creationTime)}
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
            <Button variant="secondary" className="w-full">
              Resultados
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
