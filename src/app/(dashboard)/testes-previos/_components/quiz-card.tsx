'use client';

import { useMutation } from 'convex/react';
import { BookOpen, Calendar, Check, Clock, Edit, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

import { api } from '../../../../../convex/_generated/api';
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
  // Add state for editing mode and new name
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(quiz.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get the update mutation from Convex
  const updateQuizName = useMutation(api.customQuizzes.updateName);

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Handle save changes
  const handleSave = async () => {
    if (newName.trim() === '') {
      toast({
        title: 'Nome inválido',
        description: 'O nome do teste não pode estar vazio.',
        variant: 'destructive',
      });
      return;
    }

    if (newName !== quiz.name) {
      try {
        await updateQuizName({
          id: quiz._id,
          name: newName,
        });
        toast({
          title: 'Nome atualizado',
          description: 'O nome do teste foi atualizado com sucesso.',
        });
      } catch (error) {
        console.error('Error updating quiz name:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar o nome do teste.',
          variant: 'destructive',
        });
        // Reset to original name on error
        setNewName(quiz.name);
      }
    }

    setIsEditing(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setNewName(quiz.name);
    setIsEditing(false);
  };

  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

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
    <Card className="group overflow-hidden">
      <CardHeader className="bg-muted/40 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {quiz.testMode === 'exam' ? (
              <Clock className="h-4 w-4 text-amber-500" />
            ) : (
              <BookOpen className="h-4 w-4 text-emerald-500" />
            )}
            <span className="text-muted-foreground text-xs">
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
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8 text-lg font-bold"
            />
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="line-clamp-1 text-lg font-bold">{quiz.name}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="ml-1 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100"
              title="Editar nome"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {quiz.description}
        </p>

        {/* Quiz Configuration Options */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
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
