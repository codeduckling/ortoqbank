import { useMutation, useQuery } from 'convex/react';

import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { SafeQuestion } from '../../../convex/quiz';

export type SafeQuiz = {
  _id: Id<'presetQuizzes'>;
  title: string;
  description?: string;
  questions: SafeQuestion[];
};

export function useQuiz(quizId: Id<'presetQuizzes'> | Id<'customQuizzes'>) {
  const quizData = useQuery(api.quiz.getQuizData, { quizId });
  const progress = useQuery(api.quizSessions.getCurrentSession, { quizId });

  const startQuiz = useMutation(api.quizSessions.startQuizSession);
  //const submitAnswer = useMutation(api.quizSessions.updateProgress);

  return {
    quizData,
    progress,
    startQuiz: () => startQuiz({ quizId, mode: 'study' }),
    /* submitAnswer: (selectedOptionIndex: 0 | 1 | 2 | 3) =>
      submitAnswer({
        sessionId: progress?._id,
        answer: {
          questionId: quizData?.questions[progress?.currentQuestionIndex].id,
          selectedOption: selectedOptionIndex,
          isCorrect:
            quizData?.questions[progress?.currentQuestionIndex]
              .correctOptionIndex === selectedOptionIndex,
        },
        currentQuestionIndex: progress?.currentQuestionIndex,
      }), */
    isLoading: quizData === undefined || progress === undefined,
  };
}

export function useQuizzes() {
  const quizzes = useQuery(api.presetQuizzes.list);
  return quizzes;
}
