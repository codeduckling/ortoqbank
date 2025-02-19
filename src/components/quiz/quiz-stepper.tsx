import { CheckIcon, ChevronLeft, ChevronRight, XIcon } from 'lucide-react';
import { useRef } from 'react';

import { cn } from '@/lib/utils';

export type QuestionStatus = 'correct' | 'incorrect' | 'unanswered';

const STEPPER_CONFIG = {
  VISIBLE_STEPS: 6, // Total steps visible at once
  JUMP_SIZE: 1, // Number of steps to jump with arrows
} as const;

interface QuizStepperProps {
  steps: number[];
  currentStep: number;
  onStepClick: (step: number) => void;
  getQuestionStatus: (step: number) => QuestionStatus;
  showFeedback?: boolean;
}

export default function QuizStepper({
  steps,
  currentStep,
  onStepClick,
  getQuestionStatus,
  showFeedback = true,
}: QuizStepperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getVisibleSteps = () => {
    const totalSteps = steps.length;
    const halfVisible = Math.floor(STEPPER_CONFIG.VISIBLE_STEPS / 2);

    let start = currentStep - halfVisible - 1;
    let end = currentStep + halfVisible;

    // Adjust start and end to maintain VISIBLE_STEPS count
    if (start < 0) {
      end = Math.min(STEPPER_CONFIG.VISIBLE_STEPS, totalSteps);
      start = 0;
    } else if (end > totalSteps) {
      start = Math.max(0, totalSteps - STEPPER_CONFIG.VISIBLE_STEPS);
      end = totalSteps;
    }

    return steps.slice(start, end);
  };

  const handleStepClick = (stepNumber: number) => {
    // Convert from 1-based to 0-based index
    onStepClick(stepNumber - 1);
  };

  const getStepClassName = (stepNumber: number, status: QuestionStatus) => {
    const baseClasses =
      'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors';

    if (stepNumber === currentStep) {
      return cn(
        baseClasses,
        'bg-primary text-primary-foreground border-primary',
      );
    }

    if (showFeedback) {
      if (status === 'correct') {
        return cn(baseClasses, 'border-green-500 bg-green-500 text-white');
      }

      if (status === 'incorrect') {
        return cn(baseClasses, 'border-red-500 bg-red-500 text-white');
      }
    } else if (status !== 'unanswered') {
      // Show gray border for answered questions when feedback is disabled
      return cn(
        baseClasses,
        'bg-background bg-gray-300 text-foreground border-gray-400',
      );
    }

    return cn(
      baseClasses,
      'bg-background text-foreground border-gray-300 hover:border-gray-400',
    );
  };

  const getStepContent = (status: QuestionStatus, stepNumber: number) => {
    if (showFeedback) {
      if (status === 'correct') {
        return <CheckIcon className="h-4 w-4" />;
      }

      if (status === 'incorrect') {
        return <XIcon className="h-4 w-4" />;
      }
    }

    return stepNumber;
  };

  return (
    <div className="flex items-center gap-2">
      {currentStep > 1 && (
        <button
          onClick={() => handleStepClick(currentStep - 1)}
          className="text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-2 overflow-x-auto"
      >
        {getVisibleSteps().map(stepNumber => {
          const status = getQuestionStatus(stepNumber - 1); // Convert to 0-based index
          return (
            <button
              key={stepNumber}
              onClick={() => handleStepClick(stepNumber)}
              className={getStepClassName(stepNumber, status)}
              aria-current={stepNumber === currentStep ? 'step' : undefined}
            >
              {getStepContent(status, stepNumber)}
            </button>
          );
        })}
      </div>

      {currentStep < steps.length && (
        <button
          onClick={() => handleStepClick(currentStep + 1)}
          className="text-gray-500 hover:text-gray-700"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
