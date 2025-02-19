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

const getStepContent = (stepNumber: number) => {
  return stepNumber;
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
  const [showExplanation, setShowExplanation] = useState(false);

  if (!questions?.length || !answers || !correctAnswers) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">No results available</div>
      </div>
    );
  }

  const isCorrect = (index: number) => {
    const answer = answers.get(index);
    const correctAnswer = correctAnswers.get(index);
    return answer === correctAnswer;
  };

  const getCorrectCount = () =>
    questions.reduce(
      (count, _, index) => count + (isCorrect(index) ? 1 : 0),
      0,
    );

  const getIncorrectCount = () =>
    questions.reduce(
      (count, _, index) => count + (isCorrect(index) ? 0 : 1),
      0,
    );

  const getFilteredQuestions = () => {
    switch (filter) {
      case 'all': {
        return questions.map((_, i) => i + 1);
      }
      case 'correct': {
        return questions.map((_, i) => i + 1).filter(isCorrect);
      }
      case 'incorrect': {
        return questions
          .map((_, i) => i + 1)
          .filter(index => !isCorrect(index));
      }
      // No default
    }
  };

  const getStepClassName = (stepNumber: number) => {
    const baseClasses =
      'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors';

    if (stepNumber === selectedQuestion) {
      return cn(
        baseClasses,
        'bg-primary text-primary-foreground border-primary',
      );
    }

    return cn(
      baseClasses,
      isCorrect(stepNumber - 1)
        ? 'border-green-500 bg-green-500 text-white'
        : 'border-red-500 bg-red-500 text-white',
    );
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
            Corretas ({getCorrectCount()})
          </Button>
          <Button
            size="sm"
            variant={filter === 'incorrect' ? 'default' : 'outline'}
            onClick={() => setFilter('incorrect')}
          >
            Incorretas ({getIncorrectCount()})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div
            ref={scrollRef}
            className="grid grid-cols-10 gap-2 sm:grid-cols-15 md:grid-cols-20"
          >
            {getFilteredQuestions().map(stepNumber => (
              <button
                key={stepNumber}
                onClick={() => setSelectedQuestion(stepNumber)}
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
          <div className="prose max-w-none text-sm">
            <div
              dangerouslySetInnerHTML={{
                __html: renderContent(
                  questions[selectedQuestion - 1].questionText,
                ),
              }}
            />
          </div>

          <div className="space-y-2">
            {questions[selectedQuestion - 1].options.map(
              (option, optionIndex) => (
                <div
                  key={optionIndex}
                  className={cn(
                    'rounded-lg border p-4',
                    optionIndex === answers.get(selectedQuestion) &&
                      'border-primary bg-primary/5 border-2',
                    optionIndex === correctAnswers.get(selectedQuestion) &&
                      'border-2 border-green-500 bg-green-50',
                  )}
                >
                  <div
                    className="prose max-w-none text-sm"
                    dangerouslySetInnerHTML={{
                      __html: renderContent({
                        type: 'doc',
                        content: [
                          {
                            type: 'paragraph',
                            content: [{ type: 'text', text: option.text }],
                          },
                        ],
                      }),
                    }}
                  />
                </div>
              ),
            )}
          </div>

          <div className="mt-4 space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowExplanation(!showExplanation)}
            >
              {showExplanation ? 'Esconder Explicação' : 'Mostrar Explicação'}
            </Button>

            {showExplanation && (
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h4 className="mb-2 font-medium">Gabarito</h4>
                <div
                  className="prose max-w-none text-sm text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: renderContent(
                      questions[selectedQuestion - 1].explanationText,
                    ),
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
