import { Check, X } from 'lucide-react';
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
}

type OptionIndex = 0 | 1 | 2 | 3;

export function ExamMode({
  questions,
  name,
  onAnswer,
  sessionId,
  currentIndex,
}: ExamModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, OptionIndex>>(new Map());
  const [selectedOption, setSelectedOption] = useState<
    OptionIndex | undefined
  >();
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = answers.has(currentQuestionIndex);

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex as OptionIndex);
  };

  const handleNextQuestion = () => {
    if (selectedOption === undefined) return;

    setAnswers(previous =>
      new Map(previous).set(currentQuestionIndex, selectedOption),
    );

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(undefined);
    } else {
      setIsComplete(true);
    }
  };

  const getQuestionStatus = (index: number): QuestionStatus => {
    if (!answers.has(index)) return 'unanswered';
    const answer = answers.get(index);
    return answer === questions[index].correctOptionIndex
      ? 'correct'
      : 'incorrect';
  };

  if (isComplete) {
    const correctAnswers = [...answers.entries()].filter(
      ([index, answer]) => answer === questions[index].correctOptionIndex,
    ).length;

    return (
      <div className="container mx-auto max-w-3xl p-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-2xl font-bold">Fim do Simulado</h2>
            <div className="space-y-6">
              <p className="text-lg font-medium">
                Sua nota: {correctAnswers} de {questions.length} (
                {Math.round((correctAnswers / questions.length) * 100)}%)
              </p>

              <QuizResults
                questions={questions}
                answers={answers}
                correctAnswers={
                  new Map(
                    questions.map((q, index) => [index, q.correctOptionIndex]),
                  )
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              currentStep={currentQuestionIndex + 1}
              onStepClick={step => setCurrentQuestionIndex(step - 1)}
              getQuestionStatus={step => getQuestionStatus(step - 1)}
              showFeedback={false}
            />
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>

          <QuestionDisplay
            question={currentQuestion}
            selectedOption={selectedOption ?? undefined}
            isAnswered={isAnswered}
            currentAnswer={answers.get(currentQuestionIndex)}
            onOptionSelect={handleOptionSelect}
            showCorrect={false}
          />

          <div className="mt-4">
            <Button
              onClick={handleNextQuestion}
              disabled={selectedOption === undefined}
            >
              {currentQuestionIndex === questions.length - 1
                ? 'Finalizar'
                : 'Próxima Questão'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
