'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useQuiz } from '@/hooks/useQuiz';
import { renderContent } from '@/lib/utils/render-content';

import { Id } from '../../../convex/_generated/dataModel';

interface QuizProps {
  quizId: Id<'presetQuizzes'> | Id<'customQuizzes'>;
}

export default function Quiz({ quizId }: QuizProps) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<number | undefined>();
  const { quizData, progress, submitAnswer } = useQuiz(quizId);

  if (!quizData || !progress) return <div>Loading...</div>;

  const currentQuestion = quizData.questions[progress.currentQuestionIndex];
  if (!currentQuestion) return <div>No question found</div>;

  const isAnswered = (progress.answers || []).includes(selectedOption || 0);

  const isLastQuestion =
    progress.currentQuestionIndex === quizData.questions.length - 1;

  const handleSubmit = async () => {
    if (selectedOption === undefined || isAnswered) return;
    await submitAnswer(selectedOption);
    setSelectedOption(undefined);
  };

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Question {progress.currentQuestionIndex + 1}
        </h1>
        <p className="text-muted-foreground text-sm">
          {progress.currentQuestionIndex + 1} of {quizData.questions.length}
        </p>
      </div>

      <div className="my-6">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: renderContent(currentQuestion.questionText),
          }}
        />
        <div className="mt-4 space-y-2">
          {currentQuestion.options?.map((option, i) => (
            <button
              key={i}
              onClick={() => setSelectedOption(i)}
              disabled={isAnswered}
              className={`w-full rounded-lg border p-4 text-left hover:bg-gray-50 ${
                selectedOption === i ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <Button variant="outline" onClick={() => router.push('/temas')}>
          Exit Quiz
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selectedOption === undefined || isAnswered}
        >
          Submit Answer
        </Button>
      </div>
    </div>
  );
}
