'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import Link from 'next/link';
import { useParams as useNextParams } from 'next/navigation';

import { QuizWrapper } from '@/components/quiz/quiz-wrapper';
import { ExamQuestion, QuizMode } from '@/components/quiz/types';
import { Button } from '@/components/ui/button';

import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

export default function QuizPage() {
  const { id } = useNextParams<{ id: string }>();
  const { user } = useUser();

  const quiz = useQuery(api.presetQuizzes.getWithQuestions, {
    id: id as Id<'presetQuizzes'>,
  });

  const inProgressSession = useQuery(api.quizSessions.get, {
    presetQuizId: id as Id<'presetQuizzes'>,
  });

  const completedSession = useQuery(api.quizSessions.getCompletedSession, {
    presetQuizId: id as Id<'presetQuizzes'>,
  });

  if (!id || !quiz || !user) {
    return <div>Loading...</div>;
  }

  const validQuestions = quiz.questions.filter(
    (q): q is NonNullable<typeof q> => q !== null,
  );

  const mode: QuizMode = 'study';

  // Handle different states
  if (inProgressSession) {
    return (
      <QuizWrapper
        questions={validQuestions}
        name={quiz.name}
        mode={mode}
        sessionId={inProgressSession._id}
      />
    );
  }

  if (completedSession) {
    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <h2 className="text-2xl font-bold">Quiz Completed</h2>
        <div className="flex gap-4">
          <Link href={`/temas/${id}/results`}>
            <Button variant="default">View Results</Button>
          </Link>
          <Link href={`/temas/${id}/new`}>
            <Button variant="outline">Start New Attempt</Button>
          </Link>
        </div>
      </div>
    );
  }

  // New quiz - this is an edge case that shouldn't happen in normal flow
  console.error('No active or completed session found for quiz:', id);
  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h2 className="text-2xl font-bold">Session Error</h2>
      <p className="text-gray-600">Unable to find or start quiz session.</p>
      <Link href="/temas">
        <Button variant="default">Back to Themes</Button>
      </Link>
    </div>
  );
}
