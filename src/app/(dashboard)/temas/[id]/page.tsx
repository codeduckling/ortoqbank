'use client';

import { useQuery } from 'convex/react';
import { use } from 'react';

import { QuizContent } from '@/components/quiz/quiz';

import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuizPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const exam = useQuery(api.exams.getById, {
    id: resolvedParams.id as Id<'presetExams'>,
  });

  if (!exam) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return <QuizContent questions={exam.questions} name={exam.name} />;
}
