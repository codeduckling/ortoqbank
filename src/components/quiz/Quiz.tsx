'use client';

import { defineStepper } from '@stepperize/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useQuiz } from '@/components/hooks/useQuiz';
import { Button } from '@/components/ui/button';
import { renderContent } from '@/lib/utils/render-content';

import { Id } from '../../../convex/_generated/dataModel';
import { AlternativeIndex } from './types';

interface QuizProps {
  quizId: Id<'presetQuizzes'> | Id<'customQuizzes'>;
  mode: 'study' | 'exam';
}

export default function Quiz({ quizId, mode }: QuizProps) {
  const { quizData, progress, submitAnswer, completeQuiz } = useQuiz(
    quizId,
    mode,
  );

  if (!quizData || !progress) return <div>Loading...</div>;

  return (
    <QuizStepper
      quizData={quizData}
      progress={progress}
      onSubmitAnswer={submitAnswer}
      mode={mode}
      completeQuiz={completeQuiz}
    />
  );
}

function QuizStepper({
  quizData,
  progress,
  onSubmitAnswer,
  mode,
  completeQuiz,
}: {
  quizData: NonNullable<ReturnType<typeof useQuiz>['quizData']>;
  progress: NonNullable<ReturnType<typeof useQuiz>['progress']>;
  onSubmitAnswer: ReturnType<typeof useQuiz>['submitAnswer'];
  mode: 'study' | 'exam';
  completeQuiz: ReturnType<typeof useQuiz>['completeQuiz'];
}) {
  const router = useRouter();
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

    await onSubmitAnswer(selectedAlternative);

    // Check if this was the last question in exam mode
    if (mode === 'exam' && currentStepIndex === quizData.questions.length - 1) {
      await completeQuiz();
      router.push('/temas');
    }
  };

  // Navigation only allowed in study mode
  const handlePrevious = () => {
    if (mode === 'exam') return;
    stepper.prev();
  };

  const handleNext = async () => {
    if (mode === 'exam') return;

    if (stepper.isLast) {
      // Handle quiz completion
      await completeQuiz();
      router.push('/temas'); // or wherever you want to redirect
    } else {
      stepper.next();
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
                <div className="mb-6">
                  <h1 className="text-2xl font-bold">
                    Questão {currentStepIndex + 1}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {currentStepIndex + 1} de {quizData.questions.length}
                  </p>
                </div>

                <div className="my-6">
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: renderContent(step.questionText),
                    }}
                  />
                  <div className="mt-4 space-y-2">
                    {step.alternatives?.map((alternative, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          setSelectedAlternative(i as AlternativeIndex)
                        }
                        disabled={feedback?.answered}
                        className={`w-full rounded-lg border p-4 text-left hover:bg-gray-50 ${
                          selectedAlternative === i
                            ? 'border-blue-500 bg-blue-50'
                            : ''
                        }`}
                      >
                        {alternative}
                      </button>
                    ))}
                  </div>

                  {feedback && mode !== 'exam' && (
                    <div
                      className={`mt-4 rounded-md p-4 ${
                        feedback.isCorrect ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <p className="font-medium">{feedback.message}</p>
                      {feedback.explanation && (
                        <div
                          className="prose mt-2 text-sm"
                          dangerouslySetInnerHTML={{
                            __html: renderContent(
                              JSON.parse(feedback.explanation),
                            ),
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={mode === 'exam' || stepper.isFirst}
                  >
                    Voltar
                  </Button>
                  {mode === 'study' && feedback?.answered ? (
                    <Button onClick={handleNext}>
                      {stepper.isLast ? 'Finalizar' : 'Próxima Questão'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAnswerSubmit}
                      disabled={selectedAlternative === undefined}
                    >
                      {mode === 'exam' &&
                      currentStepIndex === quizData.questions.length - 1
                        ? 'Finalizar'
                        : 'Confirmar'}
                    </Button>
                  )}
                </div>
              </>
            ),
          ]),
        ),
      })}
    </div>
  );
}
