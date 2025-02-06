'use client';

import { useQuery } from 'convex/react';
import { use } from 'react';

import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ThemePage({ params }: PageProps) {
  const { id } = use(params);
  const exam = useQuery(api.exams.getById, {
    id: id as Id<'presetExams'>,
  });

  if (!exam) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">{exam.name}</h1>
      <p className="mb-4 text-gray-600">{exam.description}</p>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Questions ({exam.questions.length})
        </h2>
        <div className="divide-y">
          {exam.questions.map((question, index) => (
            <div key={question._id} className="py-4">
              <div className="flex items-start gap-2">
                <span className="font-medium">{index + 1}.</span>
                <div>
                  <h3 className="font-medium">{question.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{question.text}</p>
                  <div className="mt-2 space-y-1">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={
                          optionIndex === question.correctOptionIndex
                            ? 'font-medium text-green-600'
                            : ''
                        }
                      >
                        {String.fromCharCode(65 + optionIndex)}. {option.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
