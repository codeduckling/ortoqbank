import { ConvexError, v } from 'convex/values';

import { Doc, Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

// Type definitions
type QuestionMode = 'all' | 'unanswered' | 'incorrect' | 'bookmarked';

// Constants
const MAX_QUESTIONS = 120;
const DEFAULT_LIMIT = 50;
const MAX_BATCH_SIZE = 100;

// Error messages - could be moved to a separate i18n module
const ERROR_MESSAGES = {
  NO_QUESTIONS_FOUND:
    'Nenhuma questão encontrada com os critérios selecionados',
  NOT_FOUND: 'Quiz não encontrado',
  UNAUTHORIZED: 'Você não tem autorização para acessar este quiz',
  UNAUTHORIZED_DELETE: 'Você não tem autorização para excluir este quiz',
  UNAUTHORIZED_UPDATE: 'Você não tem autorização para atualizar este quiz',
};

/**
 * Randomly shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  // Defensive programming - handle empty arrays
  if (array.length === 0) return [];

  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create a custom quiz based on user criteria
 */
export const create = mutation({
  args: {
    name: v.optional(v.string()), // Changed to optional to match implementation
    description: v.optional(v.string()), // Changed to optional to match implementation
    testMode: v.union(v.literal('study'), v.literal('exam')),
    questionMode: v.union(
      v.literal('all'),
      v.literal('unanswered'),
      v.literal('incorrect'),
      v.literal('bookmarked'),
    ),
    numQuestions: v.optional(v.number()),
    selectedThemes: v.optional(v.array(v.id('themes'))),
    selectedSubthemes: v.optional(v.array(v.id('subthemes'))),
    selectedGroups: v.optional(v.array(v.id('groups'))),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    // Use the requested number of questions or default to MAX_QUESTIONS
    const requestedQuestions = args.numQuestions
      ? Math.min(args.numQuestions, MAX_QUESTIONS)
      : MAX_QUESTIONS;

    // Step 1: Efficiently build a base query with filters for themes, subthemes, and groups
    let query = ctx.db.query('questions');

    // Apply theme filter if provided
    if (args.selectedThemes && args.selectedThemes.length > 0) {
      query = query.filter(q =>
        q.or(
          ...args.selectedThemes!.map(themeId =>
            q.eq(q.field('themeId'), themeId),
          ),
        ),
      );
    }

    // Apply subtheme filter if provided
    if (args.selectedSubthemes && args.selectedSubthemes.length > 0) {
      query = query.filter(q =>
        q.or(
          ...args.selectedSubthemes!.map(subthemeId =>
            q.eq(q.field('subthemeId'), subthemeId),
          ),
        ),
      );
    }

    // Apply group filter if provided
    if (args.selectedGroups && args.selectedGroups.length > 0) {
      query = query.filter(q =>
        q.or(
          ...args.selectedGroups!.map(groupId =>
            q.eq(q.field('groupId'), groupId),
          ),
        ),
      );
    }

    // Collect the filtered questions
    const filteredQuestions = await query.collect();

    if (filteredQuestions.length === 0) {
      throw new ConvexError(ERROR_MESSAGES.NO_QUESTIONS_FOUND);
    }

    // Step 2: Apply question mode filter
    let modeFilteredQuestionIds: Id<'questions'>[] = [];

    switch (args.questionMode) {
      case 'all': {
        // Keep all questions that matched the theme/subtheme/group filters
        modeFilteredQuestionIds = filteredQuestions.map(q => q._id);
        break;
      }

      case 'bookmarked': {
        // Get bookmarked questions using index
        const bookmarks = await ctx.db
          .query('userBookmarks')
          .withIndex('by_user', q => q.eq('userId', userId._id))
          .collect();

        // Create a Set of bookmarked question IDs for fast lookups
        const bookmarkedIds = new Set(bookmarks.map(b => b.questionId));

        // Filter to only include questions that are both in filtered list and bookmarked
        modeFilteredQuestionIds = filteredQuestions
          .filter(q => bookmarkedIds.has(q._id))
          .map(q => q._id);
        break;
      }

      case 'incorrect': {
        // Get incorrectly answered questions using index
        const incorrectStats = await ctx.db
          .query('userQuestionStats')
          .withIndex('by_user_incorrect', q =>
            q.eq('userId', userId._id).eq('isIncorrect', true),
          )
          .collect();

        // Create a Set of incorrectly answered question IDs for fast lookups
        const incorrectIds = new Set(
          incorrectStats.map(stat => stat.questionId),
        );

        // Filter to only include questions that are both in filtered list and incorrectly answered
        modeFilteredQuestionIds = filteredQuestions
          .filter(q => incorrectIds.has(q._id))
          .map(q => q._id);
        break;
      }

      case 'unanswered': {
        // Get all answered questions using index
        const answeredStats = await ctx.db
          .query('userQuestionStats')
          .withIndex('by_user_answered', q =>
            q.eq('userId', userId._id).eq('hasAnswered', true),
          )
          .collect();

        // Create a Set of answered question IDs for fast lookups
        const answeredIds = new Set(answeredStats.map(stat => stat.questionId));

        // Filter to only include questions that are in filtered list but not answered
        modeFilteredQuestionIds = filteredQuestions
          .filter(q => !answeredIds.has(q._id))
          .map(q => q._id);
        break;
      }
    }

    // If there are no questions after applying mode filter, throw an error
    if (modeFilteredQuestionIds.length === 0) {
      throw new ConvexError(
        `Nenhuma questão ${getQuestionModeLabel(args.questionMode)} encontrada com os critérios selecionados`,
      );
    }

    // Step 3: Randomly select questions up to the requested number
    let selectedQuestionIds = modeFilteredQuestionIds;
    if (selectedQuestionIds.length > requestedQuestions) {
      selectedQuestionIds = shuffleArray(selectedQuestionIds).slice(
        0,
        requestedQuestions,
      );
    }

    // Create name and description if not provided
    const quizName =
      args.name || `Custom Quiz - ${new Date().toLocaleDateString()}`;
    const quizDescription =
      args.description ||
      `Custom quiz with ${selectedQuestionIds.length} questions`;

    // Create the custom quiz and session in a series of operations
    // Using ctx.db for atomic operations
    const quizId = await ctx.db.insert('customQuizzes', {
      name: quizName,
      description: quizDescription,
      questions: selectedQuestionIds,
      authorId: userId._id,
      testMode: args.testMode,
      questionMode: args.questionMode,
      selectedThemes: args.selectedThemes,
      selectedSubthemes: args.selectedSubthemes,
      selectedGroups: args.selectedGroups,
    });

    // If the user selected study or exam mode, create a session immediately
    await ctx.db.insert('quizSessions', {
      userId: userId._id,
      quizId,
      mode: args.testMode,
      currentQuestionIndex: 0,
      answers: [],
      answerFeedback: [],
      isComplete: false,
    });

    return { quizId, questionCount: selectedQuestionIds.length };
  },
});

/**
 * Helper function to get a human-readable label for question modes
 */
function getQuestionModeLabel(mode: string): string {
  switch (mode) {
    case 'all': {
      return 'disponível';
    }
    case 'unanswered': {
      return 'não respondida';
    }
    case 'incorrect': {
      return 'incorreta';
    }
    case 'bookmarked': {
      return 'marcada';
    }
    default: {
      return '';
    }
  }
}

/**
 * Get all custom quizzes created by the current user
 * With proper pagination support
 */
export const getCustomQuizzes = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    // Use an index on authorId with proper pagination
    const limit = args.limit || DEFAULT_LIMIT;

    // Create the base query
    const baseQuery = ctx.db
      .query('customQuizzes')
      .filter(q => q.eq(q.field('authorId'), userId._id))
      .order('desc'); // Most recent first

    // Get results with pagination using cursor if provided
    let paginationOpts: { numItems: number; cursor?: string } = {
      numItems: limit,
    };
    if (args.cursor) {
      paginationOpts.cursor = args.cursor;
    }

    const paginationResult = await baseQuery.paginate(paginationOpts);

    // Return with pagination metadata
    return {
      quizzes: paginationResult.page,
      pagination: {
        hasMore: paginationResult.isDone === false,
        cursor: paginationResult.continueCursor,
      },
    };
  },
});

/**
 * Delete a custom quiz and associated sessions
 */
export const deleteCustomQuiz = mutation({
  args: {
    quizId: v.id('customQuizzes'),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    const quiz = await ctx.db.get(args.quizId);

    if (!quiz) {
      throw new ConvexError(ERROR_MESSAGES.NOT_FOUND);
    }

    if (quiz.authorId !== userId._id) {
      throw new ConvexError(ERROR_MESSAGES.UNAUTHORIZED_DELETE);
    }

    // Delete any active sessions for this quiz - using proper index
    const sessions = await ctx.db
      .query('quizSessions')
      .withIndex('by_user_quiz', q =>
        q.eq('userId', userId._id).eq('quizId', args.quizId),
      )
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Delete the quiz itself
    await ctx.db.delete(args.quizId);

    return { success: true };
  },
});

/**
 * Get a custom quiz by ID with all associated question data
 * Efficiently fetches questions in batches
 */
export const getById = query({
  args: { id: v.id('customQuizzes') },
  handler: async (ctx, { id }) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const quiz = await ctx.db.get(id);

    if (!quiz) {
      throw new ConvexError(ERROR_MESSAGES.NOT_FOUND);
    }

    // Verify that the user has access to this quiz
    if (quiz.authorId !== userId._id) {
      throw new ConvexError(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Fetch questions in batches to improve performance
    const questions: (Doc<'questions'> | null)[] = [];
    const questionIds = quiz.questions || [];

    // Process in batches of MAX_BATCH_SIZE
    for (let i = 0; i < questionIds.length; i += MAX_BATCH_SIZE) {
      const batch = questionIds.slice(i, i + MAX_BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(questionId => ctx.db.get(questionId)),
      );
      questions.push(...batchResults);
    }

    return {
      ...quiz,
      questions: questions.filter(Boolean), // Remove any null values
    };
  },
});

/**
 * Update a custom quiz's name
 */
export const updateName = mutation({
  args: {
    id: v.id('customQuizzes'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    const quiz = await ctx.db.get(args.id);

    if (!quiz) {
      throw new ConvexError(ERROR_MESSAGES.NOT_FOUND);
    }

    // Verify that the user has access to this quiz
    if (quiz.authorId !== userId._id) {
      throw new ConvexError(ERROR_MESSAGES.UNAUTHORIZED_UPDATE);
    }

    // Update the name
    await ctx.db.patch(args.id, {
      name: args.name,
    });

    return { success: true };
  },
});
