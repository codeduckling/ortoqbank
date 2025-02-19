'use client';

import { useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation';

import { QuizResults } from '@/components/quiz/quiz-results';
import { ExamQuestion } from '@/components/quiz/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';

export default function QuizResultsPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const quiz = useQuery(api.presetQuizzes.get, {
    id: id as Id<'presetQuizzes'>,
  });
  const session = useQuery(api.quizSessions.getCompletedSession, {
    presetQuizId: id as Id<'presetQuizzes'>,
  });

  // Fetch full questions
  const questions = useQuery(api.questions.getMany, {
    ids: quiz?.questions ?? [],
  });

  if (!quiz || !session || !session.progress || !questions) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">Loading results...</div>
      </div>
    );
  }

  if (session.status !== 'completed') {
    router.push(`/temas/${id}`);
    return;
  }

  const filteredQuestions = (questions as ExamQuestion[]).filter(
    q => q !== null,
  );

  // Add logging to see what data we have
  console.log('Quiz:', quiz);
  console.log('Session:', session);
  console.log('Filtered Questions:', filteredQuestions);
  console.log('Session Progress:', session?.progress);
  console.log('Answers:', session?.progress?.answers);

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-2xl font-bold">Quiz Results</h2>
          <div className="space-y-6">
            <p className="text-lg font-medium">
              Your score: {session.score ?? 0} of {filteredQuestions.length} (
              {Math.round(
                ((session.score ?? 0) / filteredQuestions.length) * 100,
              )}
              %)
            </p>

            {session.progress?.answers && filteredQuestions.length > 0 && (
              <QuizResults
                questions={filteredQuestions}
                answers={
                  new Map(
                    session.progress.answers.map(a => [
                      filteredQuestions.findIndex(q => q._id === a.questionId),
                      a.selectedOption,
                    ]),
                  )
                }
                correctAnswers={
                  new Map(
                    filteredQuestions.map((q, index) => [
                      index,
                      q.correctOptionIndex,
                    ]),
                  )
                }
              />
            )}

            <div className="flex justify-end">
              <Button onClick={() => router.push('/temas')}>
                Back to Themes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
