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
  isAnswered,
  selectedOption,
  onConfirm,
  onNext,
  onFinish,
}: {
  mode: 'study' | 'exam';
  isLastQuestion: boolean;
  isAnswered: boolean;
  selectedOption?: OptionIndex;
  onConfirm: () => void;
  onNext: () => void;
  onFinish: () => void;
}) {
  if (mode === 'study') {
    return (
      <>
        <Button onClick={onConfirm} disabled={!selectedOption || isAnswered}>
          Confirm Answer
        </Button>
        {isLastQuestion ? (
          <Button onClick={onFinish} disabled={!isAnswered}>
            Finish Quiz
          </Button>
        ) : (
          <Button onClick={onNext} disabled={!isAnswered}>
            Next Question
          </Button>
        )}
      </>
    );
  }

  if (isLastQuestion) {
    return (
      <Button onClick={onFinish} disabled={!isAnswered}>
        Finish Quiz
      </Button>
    );
  }

  return (
    <Button onClick={onNext} disabled={!isAnswered}>
      Next Question
    </Button>
  );
}

export function QuizView({ questions, name, mode, sessionId }: QuizViewProps) {
  const store = useQuizStore();
  const [selectedOption, setSelectedOption] = useState<OptionIndex>();
  const [showExplanation, setShowExplanation] = useState(false);
  const updateProgress = useMutation(api.quizSessions.updateProgress);
  const completeQuiz = useMutation(api.quizSessions.completeSession);
  const router = useRouter();
  const session = useQuery(api.quizSessions.getById, { sessionId });

  // Initialize store session if needed
  useEffect(() => {
    if (sessionId) {
      store.actions.initSession(sessionId);
    }
  }, [sessionId, store.actions]);

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
    store.sessions[sessionId]?.bookmarkedQuestions?.has(currentQuestion._id) ??
    false;

  const handleAnswer = (optionIndex: OptionIndex) => {
    if (isAnswered) return;
    // Just set the selected option, don't submit
    setSelectedOption(optionIndex);
  };

  const handleConfirmAnswer = async () => {
    if (!selectedOption || isAnswered) return;
    await submitAnswer(selectedOption);
    setShowExplanation(true);
  };

  const submitAnswer = async (optionIndex: OptionIndex) => {
    await updateProgress({
      sessionId,
      answer: {
        questionId: currentQuestion._id,
        selectedOption: optionIndex,
        isCorrect: optionIndex === currentQuestion.correctOptionIndex,
      },
      currentQuestionIndex: currentIndex,
    });
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      // In exam mode, submit answer before moving to next question
      if (mode === 'exam' && selectedOption && !isAnswered) {
        await submitAnswer(selectedOption);
      }

      // Update server state
      await updateProgress({
        sessionId,
        currentQuestionIndex: currentIndex + 1,
        answer: session.progress?.answers.at(-1) || null,
      });

      // Update local state
      store.actions.setCurrentQuestion(sessionId, currentIndex + 1);
      setSelectedOption(undefined);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      store.actions.setCurrentQuestion(sessionId, currentIndex - 1);
      setSelectedOption(undefined);
      setShowExplanation(false);
    }
  };

  const handleBookmark = () => {
    store.actions.toggleBookmark(sessionId, currentQuestion._id);
  };

  const handleFinish = async () => {
    try {
      await completeQuiz({
        sessionId,
      });

      if (session.presetQuizId) {
        router.push(`/temas/${session.presetQuizId}/results`);
      } else {
        router.push('/temas');
      }
    } catch (error) {
      console.error('Failed to complete quiz:', error);
    }
  };

  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="container mx-auto max-w-3xl p-6">
      {/* Quiz navigation */}
      <QuizStepper
        steps={Array.from({ length: questions.length }, (_, i) => i + 1)}
        currentStep={currentIndex + 1}
        onStepClick={step =>
          store.actions.setCurrentQuestion(sessionId, step - 1)
        }
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
        showFeedback={mode === 'study'}
      />

      {/* Question display */}
      <QuestionDisplay
        question={currentQuestion}
        selectedOption={selectedOption}
        isAnswered={isAnswered}
        showExplanation={showExplanation}
        onOptionSelect={handleAnswer}
        showCorrect={mode === 'study'}
        currentAnswer={selectedOption}
      />

      {/* Navigation buttons */}
      <div className="mt-4 flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={handleBookmark}
          variant="outline"
          className={isBookmarked ? 'bg-yellow-100' : ''}
        >
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </Button>
        <NavigationButtons
          mode={mode}
          isLastQuestion={isLastQuestion}
          isAnswered={isAnswered}
          selectedOption={selectedOption}
          onConfirm={handleConfirmAnswer}
          onNext={handleNext}
          onFinish={handleFinish}
        />
      </div>
    </div>
  );
}
