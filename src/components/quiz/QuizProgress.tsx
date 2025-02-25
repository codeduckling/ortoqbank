import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface QuizProgressProps {
  currentIndex: number;
  totalQuestions: number;
  mode?: 'study' | 'exam';
  onNavigate?: (index: number) => void;
  answerFeedback?: Array<{ isCorrect: boolean } | undefined>;
  visibleCount?: number; // Number of questions to show at once
}

export default function QuizProgress({
  currentIndex,
  totalQuestions,
  mode = 'study',
  onNavigate,
  answerFeedback = [],
  visibleCount = 5, // Default to showing 5 questions at a time
}: QuizProgressProps) {
  // State to track the first visible question index
  const [startIndex, setStartIndex] = useState(0);

  // Find the furthest answered question index
  const furthestAnsweredIndex = answerFeedback.reduce(
    (maxIndex, feedback, index) =>
      feedback ? Math.max(maxIndex, index) : maxIndex,
    -1,
  );

  // Next allowed question is the one after the furthest answered
  const maxAllowedIndex = Math.min(
    furthestAnsweredIndex + 1,
    totalQuestions - 1,
  );

  // Ensure current question is always visible
  useEffect(() => {
    if (currentIndex < startIndex) {
      // Current question is before visible range
      setStartIndex(currentIndex);
    } else if (currentIndex >= startIndex + visibleCount) {
      // Current question is after visible range
      setStartIndex(currentIndex - visibleCount + 1);
    }
  }, [currentIndex, startIndex, visibleCount]);

  // Make sure start index is valid
  const validStartIndex = Math.max(
    0,
    Math.min(startIndex, totalQuestions - visibleCount),
  );

  // Check if we need navigation arrows
  const showLeftArrow = validStartIndex > 0;
  const showRightArrow = validStartIndex + visibleCount < totalQuestions;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Questão {currentIndex + 1}</h1>
        <p className="text-muted-foreground text-sm">
          {currentIndex + 1} de {totalQuestions}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Left arrow */}
        {showLeftArrow && (
          <button
            onClick={() =>
              setStartIndex(Math.max(0, validStartIndex - visibleCount))
            }
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            aria-label="Previous questions"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        )}

        {/* Indicator for more questions on the left */}
        {showLeftArrow && <span className="text-gray-400">...</span>}

        {/* Visible question buttons */}
        {Array.from(
          { length: Math.min(visibleCount, totalQuestions - validStartIndex) },
          (_, i) => {
            const questionIndex = validStartIndex + i;
            const isNavigable =
              mode === 'study' && questionIndex <= maxAllowedIndex;

            // Determine button color based on answer status
            let buttonColorClass = '';

            if (currentIndex === questionIndex) {
              buttonColorClass = 'bg-blue-500 text-white';
            } else if (mode === 'study' && answerFeedback[questionIndex]) {
              buttonColorClass = answerFeedback[questionIndex]?.isCorrect
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white';
            } else if (mode === 'exam' && answerFeedback[questionIndex]) {
              buttonColorClass = 'bg-gray-300 text-gray-800';
            } else if (isNavigable) {
              buttonColorClass = 'bg-gray-100 text-gray-700 hover:bg-gray-200';
            } else {
              buttonColorClass = 'bg-gray-100 text-gray-400'; // Disabled look
            }

            return (
              <button
                key={questionIndex}
                onClick={() => isNavigable && onNavigate?.(questionIndex)}
                disabled={!isNavigable || mode === 'exam'}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${buttonColorClass} ${
                  isNavigable && mode !== 'exam'
                    ? 'cursor-pointer'
                    : 'cursor-default'
                }`}
                aria-label={`Go to question ${questionIndex + 1}`}
              >
                {questionIndex + 1}
              </button>
            );
          },
        )}

        {/* Indicator for more questions on the right */}
        {showRightArrow && <span className="text-gray-400">...</span>}

        {/* Right arrow */}
        {showRightArrow && (
          <button
            onClick={() =>
              setStartIndex(
                Math.min(
                  totalQuestions - visibleCount,
                  validStartIndex + visibleCount,
                ),
              )
            }
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            aria-label="Next questions"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
