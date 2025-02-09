'use client';
import { useQuery } from 'convex/react';
import Image from 'next/image';
import React, { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { renderContent } from '@/lib/utils/render-content';

import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

interface ExamQuestion {
  _id: Id<'questions'>;
  title: string;
  questionText: {
    type: string;
    content: any[];
  };
  options: { text: string }[];
  correctOptionIndex: number;
  explanationText: {
    type: string;
    content: any[];
  };
}

interface QuizContentProps {
  examId: Id<'presetExams'>;
}

export function QuizContent({ examId }: QuizContentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>();
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);

  const exam = useQuery(api.exams.getById, { id: examId }) as {
    name: string;
    questions: ExamQuestion[];
  } | null;

  if (!exam) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (exam.questions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">No questions found</div>
      </div>
    );
  }

  const currentQuestion = exam.questions[
    currentQuestionIndex
  ] as unknown as ExamQuestion;
  const isAnswered = answeredQuestions.includes(currentQuestionIndex);
  const isCorrect = selectedAnswer === currentQuestion.correctOptionIndex;

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
    setAnsweredQuestions([...answeredQuestions, currentQuestionIndex]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(undefined);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(undefined);
      setShowExplanation(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{exam.name}</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="mb-4 flex justify-between">
            <span className="text-sm text-gray-600">
              Questão {currentQuestionIndex + 1} de {exam.questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(
                (answeredQuestions.length / exam.questions.length) * 100,
              )}
              % Completo
            </span>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 text-xl font-medium">
              {currentQuestion.title}
            </h3>
            <div
              className="prose max-w-none text-gray-600"
              dangerouslySetInnerHTML={{
                __html: renderContent(currentQuestion.questionText),
              }}
            />
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => {
              let optionClass =
                'p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors';

              if (isAnswered) {
                if (optionIndex === currentQuestion.correctOptionIndex) {
                  optionClass =
                    'p-4 rounded-lg border border-green-500 bg-green-50';
                } else if (optionIndex === selectedAnswer) {
                  optionClass =
                    'p-4 rounded-lg border border-red-500 bg-red-50';
                }
              } else if (optionIndex === selectedAnswer) {
                optionClass =
                  'p-4 rounded-lg border border-blue-500 bg-blue-50';
              }

              return (
                <div
                  key={optionIndex}
                  className={optionClass}
                  onClick={() => handleOptionSelect(optionIndex)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {String.fromCodePoint(65 + optionIndex)}
                    </span>
                    <span>{option.text}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-6">
              <Alert className={isCorrect ? 'bg-green-50' : 'bg-red-50'}>
                <AlertDescription>
                  {isCorrect
                    ? 'Correto! Muito bem!'
                    : 'Incorreto. Tente revisar a explicação.'}
                </AlertDescription>
              </Alert>

              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="mr-2"
                >
                  {showExplanation ? 'Ocultar' : 'Mostrar'} Explicação
                </Button>
              </div>

              {showExplanation && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
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
          disabled={currentQuestionIndex === 0}
        >
          Questão Anterior
        </Button>
        <Button
          variant="outline"
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === exam.questions.length - 1}
        >
          Próxima Questão
        </Button>
      </div>
    </div>
  );
}
