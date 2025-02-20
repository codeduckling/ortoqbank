import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Id } from '../../../convex/_generated/dataModel';
import { QuestionStatus } from './types';

interface SessionState {
  currentIndex: number;
  answers: Map<number, number>;
  questionStatuses: Map<number, QuestionStatus>;
  bookmarkedQuestions: Set<Id<'questions'>>;
  viewedQuestions: Set<Id<'questions'>>;
}

interface QuizState {
  sessions: Record<string, SessionState>;

  actions: {
    initSession: (sessionId: Id<'quizSessions'>) => void;
    setCurrentQuestion: (sessionId: Id<'quizSessions'>, index: number) => void;
    setAnswer: (
      sessionId: Id<'quizSessions'>,
      questionIndex: number,
      answer: number,
      isCorrect: boolean,
    ) => void;
    toggleBookmark: (
      sessionId: Id<'quizSessions'>,
      questionId: Id<'questions'>,
    ) => void;
    markQuestionViewed: (
      sessionId: Id<'quizSessions'>,
      questionId: Id<'questions'>,
    ) => void;
    syncWithServer: (
      sessionId: Id<'quizSessions'>,
      serverData: {
        currentQuestionIndex: number;
        answers: Array<{
          questionId: Id<'questions'>;
          selectedOption: number;
          isCorrect: boolean;
        }>;
      },
    ) => void;
    clearSession: (sessionId: Id<'quizSessions'>) => void;
  };
}

const createEmptySession = (): SessionState => ({
  currentIndex: 0,
  answers: new Map(),
  questionStatuses: new Map(),
  bookmarkedQuestions: new Set(),
  viewedQuestions: new Set(),
});

export const useQuizStore = create<QuizState>()(set => ({
  sessions: {},
  actions: {
    initSession: sessionId =>
      set(state => ({
        sessions: {
          ...state.sessions,
          [sessionId]: createEmptySession(),
        },
      })),

    setCurrentQuestion: (sessionId, index) =>
      set(state => {
        const session = state.sessions[sessionId];
        if (!session) return state;

        return {
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...session,
              currentIndex: index,
            },
          },
        };
      }),

    setAnswer: (sessionId, questionIndex, answer, isCorrect) =>
      set(state => {
        const session = state.sessions[sessionId];
        if (!session) return state;

        const newAnswers = new Map(session.answers);
        const newStatuses = new Map(session.questionStatuses);

        newAnswers.set(questionIndex, answer);
        newStatuses.set(questionIndex, isCorrect ? 'correct' : 'incorrect');

        return {
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...session,
              answers: newAnswers,
              questionStatuses: newStatuses,
            },
          },
        };
      }),

    toggleBookmark: (sessionId, questionId) =>
      set(state => {
        const session = state.sessions[sessionId];
        if (!session) return state;

        const newBookmarks = new Set(session.bookmarkedQuestions);
        if (newBookmarks.has(questionId)) {
          newBookmarks.delete(questionId);
        } else {
          newBookmarks.add(questionId);
        }

        return {
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...session,
              bookmarkedQuestions: newBookmarks,
            },
          },
        };
      }),

    markQuestionViewed: (sessionId, questionId) =>
      set(state => {
        const session = state.sessions[sessionId];
        if (!session) return state;

        const newViewed = new Set(session.viewedQuestions);
        newViewed.add(questionId);

        return {
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...session,
              viewedQuestions: newViewed,
            },
          },
        };
      }),

    syncWithServer: (sessionId, serverData) =>
      set(state => {
        const session = state.sessions[sessionId];
        if (!session) return state;

        const newAnswers = new Map<number, number>();
        const newStatuses = new Map<number, QuestionStatus>();

        serverData.answers.forEach((answer, index) => {
          newAnswers.set(index, answer.selectedOption);
          newStatuses.set(index, answer.isCorrect ? 'correct' : 'incorrect');
        });

        return {
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...session,
              currentIndex: serverData.currentQuestionIndex,
              answers: newAnswers,
              questionStatuses: newStatuses,
            },
          },
        };
      }),

    clearSession: sessionId =>
      set(state => ({
        sessions: {
          ...state.sessions,
          [sessionId]: createEmptySession(),
        },
      })),
  },
}));
