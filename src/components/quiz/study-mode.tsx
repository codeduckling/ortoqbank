// StudyMode.tsx
'use client';

import { useMutation } from 'convex/react';
import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { renderContent } from '@/lib/utils/render-content';

import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { QuestionDisplay } from './question-display';
import QuizStepper, { QuestionStatus } from './quiz-stepper';
import { ExamQuestion } from './types';

interface StudyModeProps {
  questions: ExamQuestion[];
  name: string;
  onAnswer: (
    questionId: Id<'questions'>,
    answer: number,
    isCorrect: boolean,
  ) => Promise<void>;
  onComplete: (data: {
    answers: Map<number, number>;
    bookmarks: string[];
  }) => void;
  currentIndex: number;
  getQuestionStatus: (index: number) => QuestionStatus;
  onNext: () => void;
  onPrevious: () => void;
}

type OptionIndex = 0 | 1 | 2 | 3;

export function StudyMode({
  questions,
  name,
  onAnswer,
  onComplete,
  currentIndex,
  getQuestionStatus,
  onNext,
  onPrevious,
}: StudyModeProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    OptionIndex | undefined
  >();
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);

  const currentQuestion = questions[currentIndex];
  const isAnswered = getQuestionStatus(currentIndex) !== 'unanswered';

  const handleConfirmAnswer = async () => {
    if (selectedOption === undefined || isAnswered) return;
    setShowExplanation(true);
    await onAnswer(
      currentQuestion._id,
      selectedOption,
      selectedOption === currentQuestion.correctOptionIndex,
    );
  };

  const handleOptionSelect = (optionIndex: OptionIndex) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setShowExplanation(false);
      setSelectedOption(undefined);
      onNext();
    } else {
      onComplete({
        answers: new Map(),
        bookmarks: bookmarkedQuestions,
      });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      setShowExplanation(false);
      setSelectedOption(undefined);
      onPrevious();
    }
  };

  const toggleBookmark = () => {
    const questionId = currentQuestion._id;
    setBookmarkedQuestions(previous =>
      previous.includes(questionId)
        ? previous.filter(id => id !== questionId)
        : [...previous, questionId],
    );
  };

  const getStudyStats = () => {
    const status = getQuestionStatus(currentIndex);
    const totalAnswered = status === 'unanswered' ? 0 : 1;
    const correctAnswers = status === 'correct' ? 1 : 0;

    return {
      totalAnswered,
      correctAnswers,
      accuracy: totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0,
    };
  };

  const stats = getStudyStats();

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{name}</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="mb-6 space-y-4">
            <div className="flex justify-between">
              <QuizStepper
                steps={Array.from(
                  { length: questions.length },
                  (_, index) => index + 1,
                )}
                currentStep={currentIndex + 1}
                onStepClick={handlePreviousQuestion}
                getQuestionStatus={getQuestionStatus}
                showFeedback={true}
              />
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {Math.round(((currentIndex + 1) / questions.length) * 100)}%
                  Complete
                </span>
                <button
                  onClick={toggleBookmark}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Bookmark
                    className={`h-8 w-8 ${
                      bookmarkedQuestions.includes(currentQuestion._id)
                        ? 'fill-red-500 text-red-500'
                        : 'fill-none'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <span className="text-sm text-gray-600">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <QuestionDisplay
            question={currentQuestion}
            selectedOption={selectedOption ?? undefined}
            isAnswered={isAnswered}
            currentAnswer={selectedOption}
            onOptionSelect={handleOptionSelect}
            showCorrect={true}
          />

          {!isAnswered && selectedOption !== null && (
            <div className="mt-4">
              <Button onClick={handleConfirmAnswer}>Verificar Resposta</Button>
            </div>
          )}

          {isAnswered && (
            <div className="mt-4 space-y-4">
              <Button
                variant="outline"
                onClick={() => setShowExplanation(!showExplanation)}
              >
                {showExplanation ? 'Esconder Explicação' : 'Mostrar Explicação'}
              </Button>

              {showExplanation && (
                <div className="rounded-lg border bg-gray-50 p-4">
                  <div
                    className="prose max-w-none text-sm text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: renderContent(currentQuestion.explanationText),
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleNextQuestion} disabled={!isAnswered}>
          {currentIndex === questions.length - 1
            ? 'Finalizar'
            : 'Próxima Questão'}
        </Button>
      </div>
    </div>
  );
}
