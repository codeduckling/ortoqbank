'use client';

import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { ExamMode } from './exam-mode';
import { useQuizStore } from './quiz-store';
import { StudyMode } from './study-mode';
import { ExamQuestion, QuestionStatus, QuizMode } from './types';

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
  const updateProgress = useMutation(api.quizSessions.updateProgress);
  const [isCompleting, setIsCompleting] = useState(false);

  // Get session from backend using sessionId
  const session = useQuery(
    api.quizSessions.getById,
    sessionId ? { sessionId: sessionId as Id<'quizSessions'> } : 'skip',
  );

  const filteredQuestions = questions.filter(
    (q): q is ExamQuestion => q !== null,
  );

  // Initialize quiz state if needed
  useEffect(() => {
    if (sessionId && !store.activeQuizzes[sessionId]) {
      store.actions.initQuiz(sessionId);
    }
  }, [sessionId, store]);

  // Sync state on mount and when session changes
  useEffect(() => {
    if (sessionId && session?.progress) {
      store.actions.syncQuizState(
        sessionId,
        session.progress,
        session.score ?? 0,
      );
    }
  }, [sessionId, session, store.actions]);

  // Show loading only if we're waiting for a session
  if (sessionId && (!store.activeQuizzes[sessionId] || !session)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">Loading quiz state...</div>
      </div>
    );
  }

  // If no sessionId, we can start a new quiz
  if (!sessionId) {
    // TODO: Create new session
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">Starting new quiz...</div>
      </div>
    );
  }

  const quizState = store.activeQuizzes[sessionId];
  if (!quizState) {
    return;
  }

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
    await updateProgress({
      sessionId,
      answer: {
        questionId,
        selectedOption: answer,
        isCorrect,
      },
      currentQuestionIndex: quizState.currentIndex,
    });

    store.actions.setAnswer(sessionId, quizState.currentIndex, answer);
    store.actions.setScore(sessionId, quizState.score + (isCorrect ? 1 : 0));
    store.actions.setQuestionStatus(
      sessionId,
      quizState.currentIndex,
      isCorrect ? 'correct' : 'incorrect',
    );
  };

  const handleComplete = async (results: {
    answers: Map<number, number>;
    bookmarks?: string[];
  }) => {
    if (isCompleting) return;

    setIsCompleting(true);
    try {
      await completeQuiz({ sessionId });
      // Get presetQuizId from session and redirect to correct results page
      if (session?.presetQuizId) {
        router.push(`/temas/${session.presetQuizId}/results`);
      }
    } catch (error) {
      console.error('Failed to complete quiz:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const getQuestionStatus = (index: number): QuestionStatus => {
    return quizState.questionStatuses.get(index) || 'unanswered';
  };

  const handleNextQuestion = () => {
    store.actions.nextQuestion(sessionId);
  };

  const handlePreviousQuestion = () => {
    store.actions.previousQuestion(sessionId);
  };

  const ModeComponent = mode === 'study' ? StudyMode : ExamMode;

  return (
    <ModeComponent
      questions={filteredQuestions}
      name={name}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
      currentIndex={quizState.currentIndex}
      getQuestionStatus={getQuestionStatus}
      onNext={handleNextQuestion}
      onPrevious={handlePreviousQuestion}
    />
  );
}
