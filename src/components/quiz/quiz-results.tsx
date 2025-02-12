import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { renderContent } from '@/lib/utils/render-content';

import { ExamQuestion } from './types';

interface QuizResultsProps {
  questions: ExamQuestion[];
  answers: Map<number, number>;
  correctAnswers: Map<number, number>;
}

type FilterType = 'all' | 'correct' | 'incorrect';

const getOptionClassName = (
  isCorrectAnswer: boolean,
  isUserAnswer: boolean,
): string => {
  if (isCorrectAnswer) {
    return 'border-green-500 bg-green-50';
  }
  if (isUserAnswer) {
    return 'border-red-500 bg-red-50';
  }
  return 'border-gray-200';
};

export function QuizResults({
  questions,
  answers,
  correctAnswers,
}: QuizResultsProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<
    number | undefined
  >();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isCorrect = (index: number) => {
    const answer = answers.get(index);
    const correctAnswer = correctAnswers.get(index);
    return answer === correctAnswer;
  };

  const getFilteredQuestions = () => {
    return Array.from({ length: questions.length }, (_, index) => index).filter(
      index => {
        if (filter === 'all') return true;
        if (filter === 'correct') return isCorrect(index);
        return !isCorrect(index);
      },
    );
  };

  const filteredQuestions = getFilteredQuestions();

  const getStepClassName = (stepNumber: number) => {
    const baseClasses =
      'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors';

    if (stepNumber === selectedQuestion) {
      return cn(
        baseClasses,
        'bg-primary text-primary-foreground border-primary',
      );
    }

    const correct = isCorrect(stepNumber);
    return cn(
      baseClasses,
      correct
        ? 'border border-green-500 bg-green-50'
        : 'border border-red-500 bg-red-50',
    );
  };

  const getStepContent = (stepNumber: number) => {
    return <span>{stepNumber + 1}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Todas ({questions.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'correct' ? 'default' : 'outline'}
            onClick={() => setFilter('correct')}
          >
            Corretas (
            {
              Array.from(
                { length: questions.length },
                (_, index) => index,
              ).filter(index => isCorrect(index)).length
            }
            )
          </Button>
          <Button
            size="sm"
            variant={filter === 'incorrect' ? 'default' : 'outline'}
            onClick={() => setFilter('incorrect')}
          >
            Incorretas (
            {
              Array.from(
                { length: questions.length },
                (_, index) => index,
              ).filter(index => !isCorrect(index)).length
            }
            )
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div
            ref={scrollRef}
            className="grid grid-cols-10 gap-2 sm:grid-cols-15 md:grid-cols-20"
          >
            {filteredQuestions.map(stepNumber => (
              <button
                key={stepNumber}
                onClick={() => {
                  setSelectedQuestion(stepNumber);
                }}
                className={getStepClassName(stepNumber)}
              >
                {getStepContent(stepNumber)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedQuestion !== undefined && (
        <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
          <div className="prose max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: renderContent(questions[selectedQuestion].questionText),
              }}
            />
          </div>

          <div className="space-y-2">
            {questions[selectedQuestion].options.map((option, optionIndex) => {
              const isUserAnswer =
                answers.get(selectedQuestion) === optionIndex;
              const isCorrectAnswer =
                correctAnswers.get(selectedQuestion) === optionIndex;

              return (
                <div
                  key={optionIndex}
                  className={cn(
                    'rounded-lg border p-3',
                    getOptionClassName(isCorrectAnswer, isUserAnswer),
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {String.fromCodePoint(65 + optionIndex)}
                      </span>
                      <span>{option.text}</span>
                    </div>
                    {isCorrectAnswer && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                    {isUserAnswer && !isCorrectAnswer && (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h4 className="mb-2 font-medium">Gabarito</h4>
            <div
              className="prose max-w-none text-sm text-gray-700"
              dangerouslySetInnerHTML={{
                __html: renderContent(
                  questions[selectedQuestion].explanationText,
                ),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
