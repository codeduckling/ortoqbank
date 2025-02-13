'use client';

import { ExamMode } from './exam-mode';
import { StudyMode } from './study-mode';
import { ExamQuestion, QuizMode } from './types';

export interface QuizWrapperProps {
  questions: (ExamQuestion | null)[];
  name: string;
  mode: QuizMode;
}

export function QuizWrapper({ questions, name, mode }: QuizWrapperProps) {
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

  return mode === 'study' ? (
    <StudyMode questions={filteredQuestions} name={name} />
  ) : (
    <ExamMode questions={filteredQuestions} name={name} />
  );
}
