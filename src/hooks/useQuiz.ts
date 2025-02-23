import { useMutation, useQuery } from 'convex/react';

import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

export function useQuiz(quizId: Id<'presetQuizzes'> | Id<'customQuizzes'>) {
  const quizData = useQuery(api.quiz.getQuizData, { quizId });
  const session = useQuery(api.quizSessions.getCurrentSession, { quizId });

  //const updateProgress = useMutation(api.quizSessions.updateProgress);

  const submitAnswer = async (selectedOptionIndex: number) => {
    if (!quizData || !session) return;

    const currentQuestion = quizData.questions[session.currentQuestionIndex];
    if (!currentQuestion) return;

    console.log('selectedOptionIndex', selectedOptionIndex);
    /* await updateProgress({
      sessionId: session._id,
      answer: {
        questionId: currentQuestion._id,
        selectedOption: selectedOptionIndex,
        isCorrect: selectedOptionIndex === currentQuestion.correctOptionIndex,
      },
      currentQuestionIndex: session.currentQuestionIndex,
    }); */
  };

  return {
    quizData,
    progress: session,
    submitAnswer,
  };
}
