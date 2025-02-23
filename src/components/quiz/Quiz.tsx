'use client';

import { defineStepper } from '@stepperize/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useQuiz } from '@/components/hooks/useQuiz';
import { Button } from '@/components/ui/button';
import { renderContent } from '@/lib/utils/render-content';

import { Id } from '../../../convex/_generated/dataModel';

interface QuizProps {
  quizId: Id<'presetQuizzes'> | Id<'customQuizzes'>;
  mode: 'study' | 'exam';
}

const handleFinish = () => {
  console.log('finished');
};

export default function Quiz({ quizId, mode }: QuizProps) {
  const { quizData, progress, submitAnswer } = useQuiz(quizId, mode);

  if (!quizData || !progress) return <div>Loading...</div>;

  return (
    <QuizStepper
      quizData={quizData}
      progress={progress}
      onSubmitAnswer={submitAnswer}
      mode={mode}
    />
  );
}

function QuizStepper({
  quizData,
  progress,
  onSubmitAnswer,
  mode,
}: {
  quizData: NonNullable<ReturnType<typeof useQuiz>['quizData']>;
  progress: NonNullable<ReturnType<typeof useQuiz>['progress']>;
  onSubmitAnswer: ReturnType<typeof useQuiz>['submitAnswer'];
  mode: 'study' | 'exam';
}) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<
    0 | 1 | 2 | 3 | undefined
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
      options: q.options || [],
    })),
  );

  const stepper = useStepper();

  // Only sync with Convex in exam mode
  useEffect(() => {
    if (mode === 'exam') {
      const questionId = `question-${progress.currentQuestionIndex}`;
      stepper.goTo(questionId);
    }
  }, [mode, progress.currentQuestionIndex, stepper]);

  // Use local state for current question in study mode
  const currentStepIndex =
    mode === 'exam'
      ? progress.currentQuestionIndex
      : stepper.all.indexOf(stepper.current);

  useEffect(() => {
    const historicalAnswer = progress.answers[currentStepIndex];
    const historicalFeedback = progress.answerFeedback?.[currentStepIndex];

    if (historicalAnswer !== undefined && historicalFeedback) {
      setSelectedOption(historicalAnswer as 0 | 1 | 2 | 3);
      setFeedback({
        isCorrect: historicalFeedback.isCorrect,
        message: historicalFeedback.isCorrect ? 'Correto!' : 'Incorreto',
        explanation: JSON.stringify(historicalFeedback.explanation),
        answered: true,
      });
    } else {
      setSelectedOption(undefined);
      setFeedback(undefined);
    }
  }, [currentStepIndex, progress.answers, progress.answerFeedback]);

  const handleAnswerSubmit = async () => {
    if (selectedOption === undefined) return;
    await onSubmitAnswer(selectedOption);
  };

  // Navigation only allowed in study mode
  const handlePrevious = () => {
    if (mode === 'exam') return;
    stepper.prev();
  };

  const handleNext = () => {
    if (mode === 'exam') return;
    stepper.next();
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
                    {step.options?.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedOption(i as 0 | 1 | 2 | 3)}
                        disabled={feedback?.answered}
                        className={`w-full rounded-lg border p-4 text-left hover:bg-gray-50 ${
                          selectedOption === i
                            ? 'border-blue-500 bg-blue-50'
                            : ''
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {feedback && (
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
                    Previous
                  </Button>
                  {feedback?.answered ? (
                    <Button
                      onClick={stepper.isLast ? handleFinish : handleNext}
                      disabled={false}
                    >
                      {stepper.isLast ? 'Finish Quiz' : 'Next Question'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAnswerSubmit}
                      disabled={selectedOption === undefined}
                    >
                      Submit Answer
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
