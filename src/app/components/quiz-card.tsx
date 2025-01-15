"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const questions = [
  {
    question: "Quantos ossos tem o corpo humano adulto?",
    options: ["206", "208", "212", "200"],
    correctAnswer: 0,
  },
  {
    question: "Qual é a articulação mais móvel do corpo humano?",
    options: ["Ombro", "Quadril", "Joelho", "Cotovelo"],
    correctAnswer: 0,
  },
  {
    question: "Qual é o osso mais longo do corpo humano?",
    options: ["Fêmur", "Tíbia", "Fíbula", "Úmero"],
    correctAnswer: 0,
  },
];

export default function QuizCard() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setIsCorrect(index === questions[currentQuestionIndex].correctAnswer);
  };

  const cycleToNextCard = () => {
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  return (
    <div className="w-full min-h-[300px] relative">
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          {questions.map((question, index) => {
            const offset =
              (index - currentQuestionIndex + questions.length) %
              questions.length;
            if (offset > 2) return null;

            return (
              <motion.div
                key={index}
                className="absolute inset-0 bg-white border border-[#2196F3] p-4 rounded-3xl shadow-lg cursor-grab active:cursor-grabbing"
                style={{
                  zIndex: questions.length - offset,
                }}
                initial={{
                  opacity: 1,
                  x: offset * 8,
                  y: offset * 8,
                }}
                animate={{
                  opacity: 1 - offset * 0.15,
                  x: offset * 8,
                  y: offset * 8,
                }}
                exit={{
                  x: -250,
                  opacity: 0,
                  transition: { duration: 0.2 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (Math.abs(swipe) > 10000) {
                    cycleToNextCard();
                  }
                }}
              >
                <h3 className="text-lg font-semibold mb-3 text-[#2196F3]">
                  {question.question}
                </h3>
                <div className="space-y-1.5">
                  {question.options.map((option, optionIndex) => (
                    <Button
                      key={optionIndex}
                      className={`w-full justify-start ${
                        index === currentQuestionIndex &&
                        selectedAnswer === optionIndex
                          ? isCorrect
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                          : "bg-white hover:bg-gray-100"
                      } ${index === currentQuestionIndex && selectedAnswer === optionIndex ? "text-white" : "text-[#2196F3]"} border border-[#2196F3]`}
                      onClick={() =>
                        index === currentQuestionIndex &&
                        handleAnswer(optionIndex)
                      }
                      disabled={index !== currentQuestionIndex}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
