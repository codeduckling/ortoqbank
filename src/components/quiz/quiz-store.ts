import { create } from 'zustand';

import { Id } from '../../../convex/_generated/dataModel';
import { ExamQuestion } from './types';

interface QuizProgress {
  currentIndex: number;
  answers: Map<number, number>;
  score: number;
  isCompleted: boolean;
}

interface QuizState {
  activeQuizzes: Record<Id<'quizSessions'>, QuizProgress>;
  actions: {
    initQuiz: (sessionId: Id<'quizSessions'>) => void;
    setCurrentIndex: (sessionId: Id<'quizSessions'>, index: number) => void;
    setAnswer: (
      sessionId: Id<'quizSessions'>,
      index: number,
      answer: number,
    ) => void;
    setScore: (sessionId: Id<'quizSessions'>, score: number) => void;
    setIsCompleted: (
      sessionId: Id<'quizSessions'>,
      isCompleted: boolean,
    ) => void;
    removeQuiz: (sessionId: Id<'quizSessions'>) => void;
  };
}

export const useQuizStore = create<QuizState>(set => ({
  activeQuizzes: {},
  actions: {
    initQuiz: sessionId =>
      set(state => ({
        activeQuizzes: {
          ...state.activeQuizzes,
          [sessionId]: {
            currentIndex: 0,
            answers: new Map(),
            score: 0,
            isCompleted: false,
          },
        },
      })),
    setCurrentIndex: (sessionId, index) =>
      set(state => ({
        activeQuizzes: {
          ...state.activeQuizzes,
          [sessionId]: {
            ...state.activeQuizzes[sessionId],
            currentIndex: index,
          },
        },
      })),
    setAnswer: (sessionId, index, answer) =>
      set(state => {
        const newAnswers = new Map(state.activeQuizzes[sessionId].answers);
        newAnswers.set(index, answer);
        return {
          activeQuizzes: {
            ...state.activeQuizzes,
            [sessionId]: {
              ...state.activeQuizzes[sessionId],
              answers: newAnswers,
            },
          },
        };
      }),
    setScore: (sessionId, score) =>
      set(state => ({
        activeQuizzes: {
          ...state.activeQuizzes,
          [sessionId]: {
            ...state.activeQuizzes[sessionId],
            score,
          },
        },
      })),
    setIsCompleted: (sessionId, isCompleted) =>
      set(state => ({
        activeQuizzes: {
          ...state.activeQuizzes,
          [sessionId]: {
            ...state.activeQuizzes[sessionId],
            isCompleted,
          },
        },
      })),
    removeQuiz: sessionId =>
      set(state => {
        const { [sessionId]: _, ...rest } = state.activeQuizzes;
        return { activeQuizzes: rest };
      }),
  },
}));
