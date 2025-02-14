'use client';

import { useMutation } from 'convex/react';
import { useState } from 'react';

import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Button } from '../ui/button';
import { ExamMode } from './exam-mode';
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
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const completeSession = useMutation(api.quizSessions.completeSession);

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

  const handleComplete = async (results: { answers: Map<number, number> }) => {
    setIsCompleted(true);
    if (sessionId) {
      const correctAnswers = [...results.answers.entries()].filter(
        ([index, answer]) =>
          answer === filteredQuestions[index].correctOptionIndex,
      ).length;

      const score = (correctAnswers / filteredQuestions.length) * 100;

      await completeSession({
        sessionId,
        score,
      });
    }
  };

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <h1 className="text-2xl font-bold">Quiz Completed!</h1>
        <p className="text-xl">
          Your score: {score} out of {filteredQuestions.length} (
          {Math.round((score / filteredQuestions.length) * 100)}%)
        </p>
        <Button onClick={() => globalThis.location.reload()}>Start Over</Button>
      </div>
    );
  }

  return mode === 'study' ? (
    <StudyMode
      questions={filteredQuestions}
      name={name}
      onComplete={handleComplete}
      sessionId={sessionId}
    />
  ) : (
    <ExamMode
      questions={filteredQuestions}
      name={name}
      onComplete={handleComplete}
    />
  );
}
