'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

const questions = [
  {
    question: 'Quantos ossos tem o corpo humano adulto?',
    options: ['206', '208', '212', '200'],
    correctAnswer: 0,
  },
  {
    question: 'Qual é a articulação mais móvel do corpo humano?',
    options: ['Ombro', 'Quadril', 'Joelho', 'Cotovelo'],
    correctAnswer: 0,
  },
  {
    question: 'Qual é o osso mais longo do corpo humano?',
    options: ['Fêmur', 'Tíbia', 'Fíbula', 'Úmero'],
    correctAnswer: 0,
  },
];

const getButtonStyle = (isActive: boolean, isCorrect: boolean | undefined) => {
  if (!isActive) return 'bg-white text-[#2196F3] hover:bg-gray-100';
  if (isCorrect) return 'bg-green-500 text-white hover:bg-green-600';
  return 'bg-red-500 text-white hover:bg-red-600';
};

export default function QuizCard() {
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>();
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>();

  const remainingQuestions = questions.filter(
    (_, index) => !answeredQuestions.includes(index),
  );
  const isCompleted = remainingQuestions.length === 0;

  const handleAnswer = (index: number) => {
    const currentQuestion = remainingQuestions[0];
    const correct = index === currentQuestion.correctAnswer;
    setSelectedAnswer(index);
    setIsCorrect(correct);

    if (correct) {
      const questionIndex = questions.indexOf(currentQuestion);
      setAnsweredQuestions([...answeredQuestions, questionIndex]);
      setSelectedAnswer(undefined);
      setIsCorrect(undefined);
    }
  };

  if (isCompleted) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center rounded-3xl border border-[#2196F3] bg-white p-4 shadow-lg">
        <div className="text-center">
          <h3 className="mb-3 text-xl font-bold text-[#2196F3]">
            Excelente trabalho! 🎉
          </h3>
          <p className="mb-4 text-base text-gray-600">
            Você demonstrou um ótimo conhecimento em ortopedia.
          </p>
          <div className="space-y-3 text-sm text-gray-600">
            <p>No OrtoQBank, você encontrará:</p>
            <ul className="mb-4 space-y-2">
              <li>✓ Mais de 1.000 questões especializadas</li>
              <li>✓ Análise detalhada do seu desempenho</li>
              <li>✓ Simulados personalizados</li>
              <li>✓ Explicações completas de cada questão</li>
            </ul>
            <p className="text-[#2196F3]">
              Cadastre-se agora para elevar seus estudos ao próximo nível!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[300px] w-full">
      {remainingQuestions.slice(0, 3).map((question, index) => {
        return (
          <div
            key={questions.indexOf(question)}
            className={`absolute inset-0 w-full rounded-3xl border border-[#2196F3] bg-white p-4 shadow-lg transition-all duration-300 ${
              {
                0: 'z-20',
                1: 'z-10 translate-y-2',
                2: 'z-0 translate-y-4',
              }[index] || ''
            }`}
          >
            <h3 className="mb-3 text-xl font-semibold text-[#2196F3]">
              {question.question}
            </h3>
            <div className="space-y-1.5">
              {question.options.map((option, optionIndex) => (
                <Button
                  key={optionIndex}
                  className={`w-full justify-start ${getButtonStyle(
                    index === 0 && selectedAnswer === optionIndex,
                    isCorrect,
                  )} border border-[#2196F3]`}
                  onClick={() => index === 0 && handleAnswer(optionIndex)}
                  disabled={
                    index !== 0 || (selectedAnswer === optionIndex && isCorrect)
                  }
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
