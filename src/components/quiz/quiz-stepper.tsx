import { CheckIcon, ChevronLeft, ChevronRight, XIcon } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

export type QuestionStatus = 'correct' | 'incorrect' | 'unanswered';

const STEPPER_CONFIG = {
  VISIBLE_BEFORE: 1, // Steps visible before current step
  VISIBLE_AFTER: 7, // Steps visible after current step
  JUMP_SIZE: 15, // Number of steps to jump with arrows
  ARROW_THRESHOLD: 8, // When to show arrows
} as const;

interface QuizStepperProps {
  steps: number[];
  currentStep: number;
  onStepClick: (step: number) => void;
  getQuestionStatus: (step: number) => QuestionStatus;
}

export default function QuizStepper({
  steps,
  currentStep,
  onStepClick,
  getQuestionStatus,
}: QuizStepperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getVisibleSteps = () => {
    const start = Math.max(0, currentStep - STEPPER_CONFIG.VISIBLE_BEFORE);
    const end = Math.min(
      steps.length,
      currentStep + STEPPER_CONFIG.VISIBLE_AFTER,
    );
    return steps.slice(start, end);
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

    if (status === 'correct') {
      return cn(baseClasses, 'border-green-500 bg-green-500 text-white');
    }

    if (status === 'incorrect') {
      return cn(baseClasses, 'border-red-500 bg-red-500 text-white');
    }

    return cn(
      baseClasses,
      'bg-background text-foreground border-gray-300 hover:border-gray-400',
    );
  };

  const getStepContent = (status: QuestionStatus, stepNumber: number) => {
    if (status === 'correct') {
      return <CheckIcon className="h-4 w-4" />;
    }

    if (status === 'incorrect') {
      return <XIcon className="h-4 w-4" />;
    }

    return stepNumber;
  };

  const visibleSteps = getVisibleSteps();
  const showLeftArrow = currentStep > STEPPER_CONFIG.ARROW_THRESHOLD;
  const showRightArrow =
    currentStep < steps.length - STEPPER_CONFIG.VISIBLE_AFTER;

  return (
    <div className="flex items-center gap-2">
      {showLeftArrow && (
        <button
          onClick={() =>
            onStepClick(Math.max(1, currentStep - STEPPER_CONFIG.JUMP_SIZE))
          }
          className="text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-2 overflow-x-auto"
      >
        {visibleSteps.map(stepNumber => {
          const status = getQuestionStatus(stepNumber);
          return (
            <button
              key={stepNumber}
              onClick={() => onStepClick(stepNumber)}
              className={getStepClassName(stepNumber, status)}
              aria-current={stepNumber === currentStep ? 'step' : undefined}
            >
              {getStepContent(status, stepNumber)}
            </button>
          );
        })}
      </div>

      {showRightArrow && (
        <button
          onClick={() =>
            onStepClick(
              Math.min(steps.length, currentStep + STEPPER_CONFIG.JUMP_SIZE),
            )
          }
          className="text-gray-500 hover:text-gray-700"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
