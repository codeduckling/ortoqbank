'use client';

import { useQuery } from 'convex/react';
import { useEffect } from 'react';

import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { useQuizStore } from './quiz-store';
import { QuizView } from './quiz-view';
import { ExamQuestion } from './types';

export interface QuizWrapperProps {
  sessionId: Id<'quizSessions'>;
  mode: 'study' | 'exam';
  name: string;
  questions: ExamQuestion[];
}

export function QuizWrapper({
  questions,
  name,
  mode,
  sessionId,
}: QuizWrapperProps) {
  return (
    <QuizView
      questions={questions}
      name={name}
      mode={mode}
      sessionId={sessionId}
    />
  );
}
