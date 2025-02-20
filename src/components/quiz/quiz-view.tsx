/* eslint-disable unicorn/no-nested-ternary */

import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { QuestionDisplay } from './question-display';
import QuizStepper from './quiz-stepper';
import { useQuizStore } from './quiz-store';
import { ExamQuestion, OptionIndex } from './types';

interface QuizViewProps {
  questions: ExamQuestion[];
  name: string;
  mode: 'study' | 'exam';
  sessionId: Id<'quizSessions'>;
}

function NavigationButtons({
  mode,
  isLastQuestion,
  isFirstQuestion,
  isAnswered,
  selectedOption,
  onConfirm,
  onPrevious,
  onNext,
  onFinish,
}: {
  mode: 'study' | 'exam';
  isLastQuestion: boolean;
  isFirstQuestion: boolean;
  isAnswered: boolean;
  selectedOption?: OptionIndex;
  onConfirm: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}) {
  if (mode === 'study') {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstQuestion}
        >
          Previous
        </Button>

        {!isAnswered && (
          <Button onClick={onConfirm} disabled={!selectedOption}>
            Confirm Answer
          </Button>
        )}

        {isLastQuestion ? (
          <Button onClick={onFinish} disabled={!isAnswered}>
            Finish Quiz
          </Button>
        ) : (
          <Button onClick={onNext} disabled={!isAnswered}>
            Next Question
          </Button>
        )}
      </div>
    );
  }

  // Exam mode - only show Next/Finish button that acts as submit
  if (isLastQuestion) {
    return (
      <Button onClick={onFinish} disabled={!selectedOption && !isAnswered}>
        Submit and Finish
      </Button>
    );
  }

  return (
    <Button onClick={onNext} disabled={!selectedOption && !isAnswered}>
      Submit and Continue
    </Button>
  );
}

export function QuizView({ questions, name, mode, sessionId }: QuizViewProps) {
  const store = useQuizStore();
  const [selectedOption, setSelectedOption] = useState<OptionIndex>();
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateProgress = useMutation(api.quizSessions.updateProgress);
  const completeQuiz = useMutation(api.quizSessions.completeSession);
  const router = useRouter();
  const session = useQuery(api.quizSessions.getById, { sessionId });

  // Initialize store session if needed
  useEffect(() => {
    if (sessionId && store.actions?.initSession) {
      store.actions.initSession(sessionId);
    }
  }, [sessionId, store.actions]);

  // Sync local state with server state when session changes
  useEffect(() => {
    if (session?.progress) {
      const currentIndex = session.progress.currentQuestionIndex;

      // Check if this question was already answered
      const currentQuestionId = questions[currentIndex]?._id;
      if (currentQuestionId) {
        const answer = session.progress.answers.find(
          a => a.questionId === currentQuestionId,
        );

        if (answer) {
          setSelectedOption(answer.selectedOption as OptionIndex);
          if (mode === 'study') {
            setShowExplanation(true);
          }
        } else {
          setSelectedOption(undefined);
          setShowExplanation(false);
        }
      }
    }
  }, [session?.progress, questions, mode]);

  if (!session) {
    return <div>Loading...</div>;
  }

  const currentIndex = session.progress?.currentQuestionIndex ?? 0;
  const currentQuestion = questions[currentIndex];

  // Get answer status from session progress
  const isAnswered =
    session.progress?.answers.some(
      answer => answer.questionId === currentQuestion._id,
    ) ?? false;

  // Add null check for store session access
  const isBookmarked =
    store.sessions?.[sessionId]?.bookmarkedQuestions?.has(
      currentQuestion._id,
    ) ?? false;

  const handleAnswer = (optionIndex: OptionIndex) => {
    if (isAnswered || isSubmitting) return;
    // Just set the selected option, don't submit
    setSelectedOption(optionIndex);

    // In exam mode, auto-submit when selecting an option
    if (mode === 'exam') {
      submitAnswer(optionIndex);
    }
  };

  const handleConfirmAnswer = async () => {
    if (!selectedOption || isAnswered || isSubmitting) return;
    await submitAnswer(selectedOption);
    setShowExplanation(true);
  };

  const submitAnswer = async (optionIndex: OptionIndex) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateProgress({
        sessionId,
        answer: {
          questionId: currentQuestion._id,
          selectedOption: optionIndex,
          isCorrect: optionIndex === currentQuestion.correctOptionIndex,
        },
        currentQuestionIndex: currentIndex,
      });

      // Store answer in local store if needed
      if (store.actions?.setAnswer) {
        store.actions.setAnswer(
          sessionId,
          currentIndex,
          optionIndex,
          optionIndex === currentQuestion.correctOptionIndex,
        );
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (currentIndex >= questions.length - 1 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // In exam mode, submit current answer if not already submitted
      if (mode === 'exam' && !isAnswered && selectedOption !== undefined) {
        await submitAnswer(selectedOption);
      }

      // Update server state with new index
      await updateProgress({
        sessionId,
        currentQuestionIndex: currentIndex + 1,
        answer: {
          questionId: currentQuestion._id,
          selectedOption: (selectedOption as number) ?? 0,
          isCorrect:
            ((selectedOption as number) ?? 0) ===
            currentQuestion.correctOptionIndex,
        },
      });

      // Update local state if store has the method
      if (store.actions?.setCurrentQuestion) {
        store.actions.setCurrentQuestion(sessionId, currentIndex + 1);
      }

      // Reset local UI state
      setSelectedOption(undefined);
      setShowExplanation(false);
    } catch (error) {
      console.error('Failed to navigate to next question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = async () => {
    if (currentIndex <= 0 || isSubmitting) return;

    // In exam mode, navigation is not allowed
    if (mode === 'exam') return;

    setIsSubmitting(true);
    try {
      // Update server state
      await updateProgress({
        sessionId,
        currentQuestionIndex: currentIndex - 1,
        answer: {
          questionId: currentQuestion._id,
          selectedOption: (selectedOption as number) ?? 0,
          isCorrect:
            ((selectedOption as number) ?? 0) ===
            currentQuestion.correctOptionIndex,
        },
      });

      // Update local state if store has the method
      if (store.actions?.setCurrentQuestion) {
        store.actions.setCurrentQuestion(sessionId, currentIndex - 1);
      }

      // Reset UI state, but keep explanation for answered questions in study mode
      setSelectedOption(undefined);

      // In study mode, check if previous question was answered
      if (mode === 'study') {
        const isPreviousQuestionAnswered = session.progress?.answers.some(
          answer => answer.questionId === questions[currentIndex - 1]._id,
        );
        setShowExplanation(isPreviousQuestionAnswered ?? false);
      } else {
        setShowExplanation(false);
      }
    } catch (error) {
      console.error('Failed to navigate to previous question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookmark = () => {
    if (store.actions?.toggleBookmark) {
      store.actions.toggleBookmark(sessionId, currentQuestion._id);
    }
  };

  const handleFinish = async () => {
    if (isSubmitting) return;

    // For exam mode, submit final answer if not already submitted
    if (mode === 'exam' && !isAnswered && selectedOption !== undefined) {
      await submitAnswer(selectedOption);
    }

    setIsSubmitting(true);
    try {
      await completeQuiz({
        sessionId,
      });

      if (session.presetQuizId) {
        router.push(`/temas/${session.presetQuizId}/results`);
      } else if (session.customQuizId) {
        router.push(`/custom-quizzes/${session.customQuizId}/results`);
      } else {
        router.push('/temas');
      }
    } catch (error) {
      console.error('Failed to complete quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  return (
    <div className="container mx-auto max-w-3xl p-6">
      {/* Quiz header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{name}</h1>
        <p className="text-muted-foreground text-sm">
          Question {currentIndex + 1} of {questions.length} | Mode:{' '}
          {mode === 'study' ? 'Study' : 'Exam'}
        </p>
      </div>

      {/* Quiz navigation - only show in study mode */}
      {mode === 'study' && (
        <QuizStepper
          steps={Array.from({ length: questions.length }, (_, i) => i + 1)}
          currentStep={currentIndex + 1}
          onStepClick={step => {
            if (store.actions?.setCurrentQuestion) {
              // Only allow navigation in study mode
              store.actions.setCurrentQuestion(sessionId, step - 1);
              // Update server state
              updateProgress({
                sessionId,
                currentQuestionIndex: step - 1,
                answer: {
                  questionId: currentQuestion._id,
                  selectedOption: (selectedOption as number) ?? 0,
                  isCorrect:
                    ((selectedOption as number) ?? 0) ===
                    currentQuestion.correctOptionIndex,
                },
              });
            }
          }}
          getQuestionStatus={index => {
            const answer = session.progress?.answers.find(
              answer => answer.questionId === questions[index]._id,
            );

            return answer?.isCorrect
              ? 'correct'
              : answer
                ? 'incorrect'
                : 'unanswered';
          }}
          showFeedback={true}
          mode={mode}
        />
      )}

      {/* Question display */}
      <div className="my-6">
        <QuestionDisplay
          question={currentQuestion}
          selectedOption={selectedOption}
          isAnswered={isAnswered}
          showExplanation={showExplanation}
          onOptionSelect={handleAnswer}
          showCorrect={mode === 'study'}
          currentAnswer={selectedOption}
        />
      </div>

      {/* Navigation buttons and actions */}
      <div className="mt-4 flex justify-between">
        <NavigationButtons
          mode={mode}
          isLastQuestion={isLastQuestion}
          isFirstQuestion={isFirstQuestion}
          isAnswered={isAnswered}
          selectedOption={selectedOption}
          onConfirm={handleConfirmAnswer}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onFinish={handleFinish}
        />

        {mode === 'study' && (
          <Button
            onClick={handleBookmark}
            variant="outline"
            className={isBookmarked ? 'bg-yellow-100' : ''}
            disabled={isSubmitting}
          >
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
        )}
      </div>
    </div>
  );
}
