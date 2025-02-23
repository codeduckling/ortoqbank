'use client';

import { useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';

export default function ResultsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const session = useQuery(api.quizSessions.getCompletedSession, {
    presetQuizId: id as Id<'presetQuizzes'>,
  });

  if (!session) return <div>Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="bg-card rounded-lg border p-6">
        <h2 className="mb-4 text-2xl font-bold">Results</h2>
        <p className="text-lg">
          Score: {session.score} / {session.progress?.answers.length ?? 0}
        </p>
        <div className="mt-6">
          <Button onClick={() => router.push('/temas')}>Back to Themes</Button>
        </div>
      </div>
    </div>
  );
}
