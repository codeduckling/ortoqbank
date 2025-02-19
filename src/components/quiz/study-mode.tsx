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
  onComplete?: (results: {
    answers: Map<number, number>;
    bookmarks: string[];
  }) => void;
  sessionId?: Id<'quizSessions'>;
  onAnswer: (
    questionId: Id<'questions'>,
    answer: number,
    isCorrect: boolean,
  ) => Promise<void>;
  currentIndex: number;
}

type OptionIndex = 0 | 1 | 2 | 3;

export function StudyMode({
  questions,
  name,
  onComplete,
  sessionId,
  onAnswer,
  currentIndex,
}: StudyModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, OptionIndex>>(new Map());
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<
    OptionIndex | undefined
  >();

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = answeredQuestions.includes(currentQuestionIndex);
  const currentAnswer = answers.get(currentQuestionIndex);
  const progress = (answeredQuestions.length / questions.length) * 100;

  const updateProgress = useMutation(api.quizSessions.updateProgress);

  const handleOptionSelect = (optionIndex: OptionIndex) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
  };

  const handleConfirmAnswer = async () => {
    if (selectedOption === undefined || isAnswered) return;

    setAnswers(previous =>
      new Map(previous).set(currentQuestionIndex, selectedOption),
    );
    setAnsweredQuestions([...answeredQuestions, currentQuestionIndex]);
    setSelectedOption(undefined);
    setShowExplanation(true);

    // Save progress when answer is confirmed
    if (sessionId) {
      console.log('Updating progress:', {
        sessionId,
        currentQuestionIndex,
        answer: {
          questionId: currentQuestion._id,
          selectedOption,
          isCorrect: selectedOption === currentQuestion.correctOptionIndex,
        },
      });

      await updateProgress({
        sessionId,
        currentQuestionIndex,
        answer: {
          questionId: currentQuestion._id,
          selectedOption,
          isCorrect: selectedOption === currentQuestion.correctOptionIndex,
        },
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
      setSelectedOption(undefined);
    } else if (onComplete) {
      onComplete({ answers, bookmarks: bookmarkedQuestions });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
      setSelectedOption(undefined);
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

  const getQuestionStatus = (index: number): QuestionStatus => {
    if (!answeredQuestions.includes(index)) return 'unanswered';
    const answer = answers.get(index);
    return answer === questions[index].correctOptionIndex
      ? 'correct'
      : 'incorrect';
  };

  const getStudyStats = () => {
    const totalAnswered = answeredQuestions.length;
    const correctAnswers = [...answers.entries()].filter(
      ([index, answer]) => answer === questions[index].correctOptionIndex,
    ).length;

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
                currentStep={currentQuestionIndex + 1}
                onStepClick={step => setCurrentQuestionIndex(step - 1)}
                getQuestionStatus={step => getQuestionStatus(step - 1)}
                showFeedback={true}
              />
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {Math.round(
                    (answeredQuestions.length / questions.length) * 100,
                  )}
                  % Complete
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
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>

          <QuestionDisplay
            question={currentQuestion}
            selectedOption={selectedOption ?? undefined}
            isAnswered={isAnswered}
            currentAnswer={currentAnswer}
            onOptionSelect={handleOptionSelect}
            showCorrect={true}
          />

          {!isAnswered && selectedOption !== null && (
            <div className="mt-4">
              <Button onClick={handleConfirmAnswer}>Verificar Resposta</Button>
            </div>
          )}

          {isAnswered && showExplanation && (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg border bg-gray-50 p-4">
                <div
                  className="prose max-w-none text-sm text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: renderContent(currentQuestion.explanationText),
                  }}
                />
              </div>
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
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleNextQuestion} disabled={!isAnswered}>
          {currentQuestionIndex === questions.length - 1
            ? 'Finalizar'
            : 'Próxima Questão'}
          {currentQuestionIndex < questions.length - 1 && (
            <ChevronRight className="ml-2 h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
