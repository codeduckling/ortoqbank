'use client';

import { BookOpen, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

import { Id } from '../../../../../convex/_generated/dataModel';

interface QuizCardProps {
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
  themeMap: Record<string, string>;
  subthemeMap: Record<string, string>;
  groupMap: Record<string, string>;
  formatRelativeTime: (timestamp: number) => string;
}

export function QuizCard({
  quiz,
  hasResults,
  themeMap,
  subthemeMap,
  groupMap,
  formatRelativeTime,
}: QuizCardProps) {
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
