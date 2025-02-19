import { Check, ChevronLeft, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { Id } from '../../../convex/_generated/dataModel';
import { QuestionDisplay } from './question-display';
import { QuizResults } from './quiz-results';
import QuizStepper, { type QuestionStatus } from './quiz-stepper';
import { ExamQuestion } from './types';

interface ExamModeProps {
  questions: ExamQuestion[];
  name: string;
  onComplete?: (results: {
    answers: Map<number, number>;
    bookmarks?: string[];
  }) => void;
  onAnswer: (
    questionId: Id<'questions'>,
    answer: number,
    isCorrect: boolean,
  ) => Promise<void>;
  sessionId?: Id<'quizSessions'>;
  currentIndex: number;
  getQuestionStatus: (index: number) => QuestionStatus;
  onNext: () => void;
  onPrevious: () => void;
}

type OptionIndex = 0 | 1 | 2 | 3;

export function ExamMode({
  questions,
  name,
  onAnswer,
  onComplete,
  currentIndex,
  getQuestionStatus,
  onNext,
  onPrevious,
}: ExamModeProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    OptionIndex | undefined
  >();

  const currentQuestion = questions[currentIndex];
  const isAnswered = getQuestionStatus(currentIndex) !== 'unanswered';

  const handleOptionSelect = (optionIndex: OptionIndex) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
  };

  const handleConfirmAnswer = async () => {
    if (selectedOption === undefined || isAnswered) return;
    setShowExplanation(true);
    await onAnswer(
      currentQuestion._id,
      selectedOption,
      selectedOption === currentQuestion.correctOptionIndex,
    );
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setShowExplanation(false);
      setSelectedOption(undefined);
      onNext();
    } else {
      onComplete({
        answers: new Map(),
        bookmarks: [],
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

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Card>
        <CardContent className="p-6">
          <h1 className="mb-6 text-2xl font-bold">{name}</h1>

          <div className="mb-6 space-y-4">
            <QuizStepper
              steps={Array.from(
                { length: questions.length },
                (_, index) => index + 1,
              )}
              currentStep={currentIndex + 1}
              onStepClick={handlePreviousQuestion}
              getQuestionStatus={getQuestionStatus}
              showFeedback={false}
            />
            <div className="text-sm text-gray-600">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>

          <QuestionDisplay
            question={currentQuestion}
            selectedOption={selectedOption}
            isAnswered={isAnswered}
            currentAnswer={selectedOption}
            onOptionSelect={handleOptionSelect}
            showCorrect={false}
          />

          <div className="mt-4">
            <Button
              onClick={handleConfirmAnswer}
              disabled={selectedOption === undefined}
            >
              Verificar Resposta
            </Button>
          </div>

          <div className="mt-4 flex justify-between">
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
        </CardContent>
      </Card>
    </div>
  );
}
