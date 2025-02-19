'use client';

import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Button } from '../ui/button';
import { ExamMode } from './exam-mode';
import { useQuizStore } from './quiz-store';
import { StudyMode } from './study-mode';
import { ExamQuestion, QuizMode } from './types';

export interface QuizWrapperProps {
  questions: (ExamQuestion | null)[];
  name: string;
  mode: QuizMode;
  sessionId?: Id<'quizSessions'>;
}

export function QuizWrapper({
  questions,
  name,
  mode,
  sessionId,
}: QuizWrapperProps) {
  const router = useRouter();
  const store = useQuizStore();
  const completeQuiz = useMutation(api.quizSessions.completeSession);

  // Initialize quiz state if needed
  useEffect(() => {
    if (sessionId && !store.activeQuizzes[sessionId]) {
      store.actions.initQuiz(sessionId);
    }
  }, [sessionId, store]);

  const quizState = sessionId ? store.activeQuizzes[sessionId] : null;

  // Add early return if no quiz state
  if (!quizState) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">Loading quiz state...</div>
      </div>
    );
  }

  const filteredQuestions = questions.filter(
    (q): q is ExamQuestion => q !== null,
  );

  if (filteredQuestions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">No questions found</div>
      </div>
    );
  }

  const handleAnswer = async (
    questionId: Id<'questions'>,
    answer: number,
    isCorrect: boolean,
  ) => {
    if (!sessionId) return;

    store.actions.setCurrentIndex(sessionId, quizState.currentIndex + 1);
    store.actions.setAnswer(sessionId, quizState.currentIndex, answer);
    store.actions.setScore(sessionId, quizState.score + (isCorrect ? 1 : 0));
  };

  const handleComplete = async () => {
    if (!sessionId) return;

    await completeQuiz({ sessionId });
    store.actions.setIsCompleted(sessionId, true);
  };

  if (quizState.isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <h1 className="text-2xl font-bold">Quiz Completed!</h1>
        <p className="text-xl">
          Your score: {quizState.score} out of {filteredQuestions.length} (
          {Math.round((quizState.score / filteredQuestions.length) * 100)}%)
        </p>
        <Button onClick={() => router.push('/temas')}>Back to Themes</Button>
      </div>
    );
  }

  return mode === 'study' ? (
    <StudyMode
      questions={filteredQuestions}
      name={name}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
      currentIndex={quizState.currentIndex}
    />
  ) : (
    <ExamMode
      questions={filteredQuestions}
      name={name}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
      currentIndex={quizState.currentIndex}
    />
  );
}
