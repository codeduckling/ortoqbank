import { create } from 'zustand';

import { Id } from '../../../convex/_generated/dataModel';
import { ExamQuestion, QuestionStatus } from './types';

interface QuizProgress {
  currentIndex: number;
  answers: Map<number, number>;
  score: number;
  isCompleted: boolean;
  questionStatuses: Map<number, QuestionStatus>;
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
    setQuestionStatus: (
      sessionId: Id<'quizSessions'>,
      questionIndex: number,
      status: QuestionStatus,
    ) => void;
    nextQuestion: (sessionId: Id<'quizSessions'>) => void;
    previousQuestion: (sessionId: Id<'quizSessions'>) => void;
    syncQuizState: (
      sessionId: Id<'quizSessions'>,
      progress: {
        currentQuestionIndex: number;
        answers: Array<{
          questionId: Id<'questions'>;
          selectedOption: number;
          isCorrect: boolean;
        }>;
      },
      score: number,
    ) => void;
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
            questionStatuses: new Map(),
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
    setQuestionStatus: (
      sessionId: Id<'quizSessions'>,
      questionIndex: number,
      status: QuestionStatus,
    ) =>
      set(state => {
        const newStatuses = new Map(
          state.activeQuizzes[sessionId].questionStatuses,
        );
        newStatuses.set(questionIndex, status);
        return {
          activeQuizzes: {
            ...state.activeQuizzes,
            [sessionId]: {
              ...state.activeQuizzes[sessionId],
              questionStatuses: newStatuses,
            },
          },
        };
      }),
    nextQuestion: sessionId =>
      set(state => ({
        activeQuizzes: {
          ...state.activeQuizzes,
          [sessionId]: {
            ...state.activeQuizzes[sessionId],
            currentIndex: state.activeQuizzes[sessionId].currentIndex + 1,
          },
        },
      })),
    previousQuestion: sessionId =>
      set(state => ({
        activeQuizzes: {
          ...state.activeQuizzes,
          [sessionId]: {
            ...state.activeQuizzes[sessionId],
            currentIndex: Math.max(
              0,
              state.activeQuizzes[sessionId].currentIndex - 1,
            ),
          },
        },
      })),
    syncQuizState: (sessionId, progress, score) =>
      set(state => {
        const questionStatuses = new Map<number, QuestionStatus>();
        progress.answers.forEach((answer, index) => {
          questionStatuses.set(
            index,
            answer.isCorrect ? 'correct' : 'incorrect',
          );
        });

        return {
          activeQuizzes: {
            ...state.activeQuizzes,
            [sessionId]: {
              currentIndex: progress.currentQuestionIndex,
              answers: new Map(
                progress.answers.map((a, i) => [i, a.selectedOption]),
              ),
              score,
              isCompleted: false,
              questionStatuses,
            },
          },
        };
      }),
  },
}));
