'use client';

import { defineStepper } from '@stepperize/react';
import { BookmarkCheckIcon, BookmarkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import BookmarkButton from '@/components/common/BookmarkButton';
import { useQuiz } from '@/components/hooks/useQuiz';
import { Button } from '@/components/ui/button';
import { renderContent } from '@/lib/utils/render-content';

import { Id } from '../../../convex/_generated/dataModel';
import QuestionContent from './QuestionContent';
import QuizAlternatives from './QuizAlternatives';
import QuizFeedback from './QuizFeedback';
import QuizNavigation from './QuizNavigation';
import QuizProgress from './QuizProgress';
import { AlternativeIndex } from './types';

interface QuizProps {
  quizId: Id<'presetQuizzes'> | Id<'customQuizzes'>;
  mode: 'study' | 'exam';
}

export default function Quiz({ quizId, mode }: QuizProps) {
  const {
    quizData,
    progress,
    submitAnswer,
    completeQuiz,
    bookmarkStatuses,
    toggleBookmark,
  } = useQuiz(quizId, mode);

  if (!quizData || !progress) return <div>Loading...</div>;

  return (
    <QuizStepper
      quizData={quizData}
      progress={progress}
      onSubmitAnswer={submitAnswer}
      mode={mode}
      completeQuiz={completeQuiz}
      bookmarkStatuses={bookmarkStatuses}
      toggleBookmark={toggleBookmark}
    />
  );
}

function QuizStepper({
  quizData,
  progress,
  onSubmitAnswer,
  mode,
  completeQuiz,
  bookmarkStatuses,
  toggleBookmark,
}: {
  quizData: NonNullable<ReturnType<typeof useQuiz>['quizData']>;
  progress: NonNullable<ReturnType<typeof useQuiz>['progress']>;
  onSubmitAnswer: ReturnType<typeof useQuiz>['submitAnswer'];
  mode: 'study' | 'exam';
  completeQuiz: ReturnType<typeof useQuiz>['completeQuiz'];
  bookmarkStatuses: ReturnType<typeof useQuiz>['bookmarkStatuses'];
  toggleBookmark: ReturnType<typeof useQuiz>['toggleBookmark'];
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState<
    AlternativeIndex | undefined
  >();
  const [feedback, setFeedback] = useState<
    | {
        isCorrect: boolean;
        message: string;
        explanation?: string;
        answered: boolean;
      }
    | undefined
  >();

  const { useStepper } = defineStepper(
    ...quizData.questions.map((q, index) => ({
      id: `question-${index}`,
      questionText: q.questionText,
      alternatives: q.alternatives || [],
    })),
  );

  const stepper = useStepper();

  // Only sync with Convex in exam mode
  useEffect(() => {
    if (
      mode === 'exam' &&
      !progress.isComplete &&
      progress.currentQuestionIndex < quizData.questions.length
    ) {
      const questionId = `question-${progress.currentQuestionIndex}`;
      stepper.goTo(questionId);
    }
  }, [
    mode,
    stepper,
    progress.currentQuestionIndex,
    progress.isComplete,
    quizData.questions.length,
  ]);

  // Use local state for current question in study mode
  const currentStepIndex = Math.min(
    mode === 'exam'
      ? progress.currentQuestionIndex
      : stepper.all.indexOf(stepper.current),
    quizData.questions.length - 1,
  );

  useEffect(() => {
    const historicalAnswer = progress.answers[currentStepIndex];
    const historicalFeedback = progress.answerFeedback?.[currentStepIndex];

    if (historicalAnswer !== undefined && historicalFeedback) {
      setSelectedAlternative(historicalAnswer as AlternativeIndex);
      setFeedback({
        isCorrect: historicalFeedback.isCorrect,
        message: historicalFeedback.isCorrect ? 'Correto!' : 'Incorreto',
        explanation: JSON.stringify(historicalFeedback.explanation),
        answered: true,
      });
    } else {
      setSelectedAlternative(undefined);
      setFeedback(undefined);
    }
  }, [currentStepIndex, progress.answers, progress.answerFeedback]);

  const handleAnswerSubmit = async () => {
    if (selectedAlternative === undefined) return;

    setIsLoading(true);
    try {
      await onSubmitAnswer(selectedAlternative);

      // Check if this was the last question in exam mode
      if (
        mode === 'exam' &&
        currentStepIndex === quizData.questions.length - 1
      ) {
        await handleComplete();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation only allowed in study mode
  const handlePrevious = () => {
    if (mode === 'exam') return;
    stepper.prev();
  };

  const handleNext = async () => {
    if (mode === 'exam') return;

    setIsLoading(true);
    try {
      if (stepper.isLast) {
        // Handle quiz completion
        await handleComplete();
      } else {
        stepper.next();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = quizData.questions[currentStepIndex];

  const handleComplete = async () => {
    try {
      await completeQuiz();
      // Use a generic route for all quiz results instead of the theme-specific route
      router.push(`/quiz-results/${quizData._id}`);
    } catch (error) {
      console.error('Error completing quiz:', error);
      // Error handling is managed by the caller functions through finally blocks
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-6">
      {stepper.switch({
        ...Object.fromEntries(
          quizData.questions.map((_, index) => [
            `question-${index}`,
            step => (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <QuizProgress
                    currentIndex={currentStepIndex}
                    totalQuestions={quizData.questions.length}
                    mode={mode}
                    answerFeedback={progress.answerFeedback}
                    onNavigate={index => {
                      if (mode === 'study') {
                        stepper.goTo(`question-${index}`);
                      }
                    }}
                  />

                  <BookmarkButton
                    questionId={currentQuestion._id}
                    isBookmarked={
                      bookmarkStatuses[currentQuestion._id] || false
                    }
                  />
                </div>

                <div className="my-6">
                  <QuestionContent content={step.questionText} />

                  <QuizAlternatives
                    alternatives={step.alternatives || []}
                    selectedAlternative={selectedAlternative}
                    onSelect={i => setSelectedAlternative(i)}
                    disabled={!!feedback?.answered}
                  />
                </div>

                {feedback && mode !== 'exam' && (
                  <QuizFeedback
                    isCorrect={feedback.isCorrect}
                    message={feedback.message}
                    explanationHtml={
                      feedback.explanation
                        ? renderContent(JSON.parse(feedback.explanation))
                        : ''
                    }
                  />
                )}

                <QuizNavigation
                  mode={mode}
                  isFirst={stepper.isFirst}
                  isLast={stepper.isLast}
                  hasAnswered={!!feedback?.answered}
                  hasSelectedOption={selectedAlternative !== undefined}
                  isLoading={isLoading}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onSubmit={handleAnswerSubmit}
                />
              </>
            ),
          ]),
        ),
      })}
    </div>
  );
}
