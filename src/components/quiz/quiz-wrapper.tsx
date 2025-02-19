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

  // Get session from backend using sessionId
  const session = useQuery(api.quizSessions.getById, {
    sessionId: sessionId as Id<'quizSessions'>,
  });

  // Sync state on mount and when session changes
  useEffect(() => {
    if (sessionId && session?.progress) {
      store.actions.syncQuizState(sessionId, session.progress, session.score);
    }
  }, [sessionId, session, store.actions]);

  // Initialize quiz state if needed
  useEffect(() => {
    if (sessionId && !store.activeQuizzes[sessionId]) {
      store.actions.initQuiz(sessionId);
    }
  }, [sessionId, store]);

  const quizState = sessionId ? store.activeQuizzes[sessionId] : undefined;

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
    if (!sessionId || !quizState) return;

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

  const handleComplete = async () => {
    if (!sessionId) return;

    await completeQuiz({ sessionId });
    store.actions.setIsCompleted(sessionId, true);
  };

  // Pass getQuestionStatus to StudyMode
  const getQuestionStatus = (index: number): QuestionStatus => {
    return quizState.questionStatuses.get(index) || 'unanswered';
  };

  const handleNextQuestion = () => {
    if (!sessionId) return;
    store.actions.nextQuestion(sessionId);
  };

  const handlePreviousQuestion = () => {
    if (!sessionId) return;
    store.actions.previousQuestion(sessionId);
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
      getQuestionStatus={getQuestionStatus}
      onNext={handleNextQuestion}
      onPrevious={handlePreviousQuestion}
    />
  ) : (
    <ExamMode
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
