import { ConvexError, v } from 'convex/values';

import { Doc, Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

type QuestionMode = 'all' | 'unanswered' | 'incorrect' | 'bookmarked';

// Maximum number of questions allowed in a custom quiz
const MAX_QUESTIONS = 120;

/**
 * Randomly shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    testMode: v.union(v.literal('study'), v.literal('exam')),
    questionMode: v.array(
      v.union(
        v.literal('all'),
        v.literal('unanswered'),
        v.literal('incorrect'),
        v.literal('bookmarked'),
      ),
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

    // Process themes one at a time to avoid large scans
    const allQuestions: Doc<'questions'>[] = [];

    // Define a helper function to check if a question matches subtheme and group filters
    const matchesFilters = (question: Doc<'questions'>) => {
      // Check subtheme filter
      if (
        args.selectedSubthemes &&
        args.selectedSubthemes.length > 0 &&
        (!question.subthemeId ||
          !args.selectedSubthemes.includes(question.subthemeId))
      ) {
        return false;
      }

      // Check group filter
      if (
        args.selectedGroups &&
        args.selectedGroups.length > 0 &&
        (!question.groupId || !args.selectedGroups.includes(question.groupId))
      ) {
        return false;
      }

      return true;
    };

    // If no themes are selected, get all available themes
    let themesToProcess: Id<'themes'>[] = [];

    if (!args.selectedThemes || args.selectedThemes.length === 0) {
      // Fetch all themes from the database
      const allThemes = await ctx.db.query('themes').collect();
      themesToProcess = allThemes.map(theme => theme._id);
    } else {
      themesToProcess = args.selectedThemes;
    }

    // Process each theme
    for (const themeId of themesToProcess) {
      // Use take() to avoid full table scans if there are too many questions
      // We'll collect more than MAX_QUESTIONS initially to ensure we have enough after filtering
      const maxInitialQuestions = MAX_QUESTIONS * 3;

      // Filter by theme ID - using regular query since withIndex for 'by_theme' isn't available
      const themeQuestions = await ctx.db
        .query('questions')
        .filter(q => q.eq(q.field('themeId'), themeId))
        .take(maxInitialQuestions);

      // Apply additional filters to the fetched questions
      const filteredThemeQuestions = themeQuestions.filter(matchesFilters);

      allQuestions.push(...filteredThemeQuestions);

      // If we already have enough questions across all themes, stop querying
      if (allQuestions.length >= MAX_QUESTIONS * 2) {
        break;
      }
    }

    // If there are no questions matching the criteria, throw an error
    if (allQuestions.length === 0) {
      throw new ConvexError(
        'Nenhuma questão encontrada com os critérios selecionados',
      );
    }

    // Apply different filters based on question modes
    const filteredQuestionIds: Id<'questions'>[] = [];

    // Process each question mode
    for (const mode of args.questionMode) {
      let modeQuestions: Id<'questions'>[] = [];

      switch (mode) {
        case 'all': {
          // Include all questions matching theme/subtheme/group criteria
          modeQuestions = allQuestions.map(q => q._id);
          break;
        }

        case 'bookmarked': {
          // Get bookmarked questions - use the by_user index to limit scanning
          const bookmarks = await ctx.db
            .query('userBookmarks')
            .withIndex('by_user', q => q.eq('userId', userId._id))
            .collect();

          // Create a Set for faster lookups
          const bookmarkedIds = new Set(bookmarks.map(b => b.questionId));

          // Filter questions to only include those that are bookmarked
          modeQuestions = allQuestions
            .filter(q => bookmarkedIds.has(q._id))
            .map(q => q._id);
          break;
        }

        case 'incorrect':
        case 'unanswered': {
          // Create a map to track question status
          const answeredQuestions = new Map<Id<'questions'>, boolean>();

          // First get the IDs of all questions we're interested in
          const questionIdsSet = new Set(allQuestions.map(q => q._id));
          const questionIds = [...questionIdsSet];

          // Only query completed sessions - use take instead of pagination to avoid cursor issues
          const completedSessions = await ctx.db
            .query('quizSessions')
            .withIndex('by_user_quiz', q => q.eq('userId', userId._id))
            .filter(q => q.eq(q.field('isComplete'), true))
            .take(100); // Limit to most recent 100 sessions for performance

          // Process each session
          for (const session of completedSessions) {
            // Get the quiz to access questions
            const quiz = await ctx.db.get(session.quizId);
            if (!quiz || !quiz.questions) continue;

            // Only process questions that are in our filtered set
            const relevantQuestions = quiz.questions.filter(qId =>
              questionIdsSet.has(qId),
            );

            // Process each relevant question in this quiz
            for (const questionId of relevantQuestions) {
              const questionIndex = quiz.questions.indexOf(questionId);

              // Skip if the question wasn't found in the quiz
              if (questionIndex === -1) continue;

              const wasAnswered = questionIndex < session.answers.length;

              // For incorrectly answered questions
              if (wasAnswered && session.answerFeedback[questionIndex]) {
                const wasCorrect =
                  session.answerFeedback[questionIndex].isCorrect;
                // If this is the first time seeing this question or we're updating from correct to incorrect
                if (
                  !answeredQuestions.has(questionId) ||
                  (answeredQuestions.get(questionId) && !wasCorrect)
                ) {
                  answeredQuestions.set(questionId, wasCorrect);
                }
              } else if (wasAnswered) {
                // Question was answered but no feedback available (shouldn't happen)
                answeredQuestions.set(questionId, true);
              } else if (!answeredQuestions.has(questionId)) {
                // Question wasn't answered in this session and no previous record
                answeredQuestions.set(questionId, false);
              }
            }
          }

          // Use ternary instead of if/else for better code style
          modeQuestions = allQuestions
            .filter(q =>
              mode === 'incorrect'
                ? answeredQuestions.has(q._id) && !answeredQuestions.get(q._id)
                : !answeredQuestions.has(q._id),
            )
            .map(q => q._id);
          break;
        }
        // No default
      }

      // Add questions from this mode to the overall filtered list
      filteredQuestionIds.push(...modeQuestions);
    }

    // Remove duplicates
    let uniqueQuestionIds = [...new Set(filteredQuestionIds)];

    // If we have more than the requested number of questions, randomly select the desired amount
    if (uniqueQuestionIds.length > requestedQuestions) {
      // Randomly shuffle the array and take the first requestedQuestions elements
      uniqueQuestionIds = shuffleArray(uniqueQuestionIds).slice(
        0,
        requestedQuestions,
      );
    }

    // Create name and description if not provided
    const quizName =
      args.name || `Custom Quiz - ${new Date().toLocaleDateString()}`;
    const quizDescription =
      args.description ||
      `Custom quiz with ${uniqueQuestionIds.length} questions`;

    // Create the custom quiz
    const quizId = await ctx.db.insert('customQuizzes', {
      name: quizName,
      description: quizDescription,
      questions: uniqueQuestionIds,
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

    return { quizId, questionCount: uniqueQuestionIds.length };
  },
});

export const getCustomQuizzes = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    // Use an index on authorId if available or limit the number of results
    // to avoid a full table scan
    const limit = args.limit || 50; // Default to 50 if not specified

    // Get custom quizzes created by this user with pagination
    const quizzes = await ctx.db
      .query('customQuizzes')
      .filter(q => q.eq(q.field('authorId'), userId._id))
      .order('desc') // Most recent first
      .take(limit);

    return quizzes;
  },
});

export const deleteCustomQuiz = mutation({
  args: {
    quizId: v.id('customQuizzes'),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);

    const quiz = await ctx.db.get(args.quizId);

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    if (quiz.authorId !== userId._id) {
      throw new Error('You are not authorized to delete this quiz');
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

export const getById = query({
  args: { id: v.id('customQuizzes') },
  handler: async (ctx, { id }) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const quiz = await ctx.db.get(id);

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Verify that the user has access to this quiz
    if (quiz.authorId !== userId._id) {
      throw new Error('Not authorized to access this quiz');
    }

    // Fetch all questions data
    const questions = await Promise.all(
      quiz.questions.map(questionId => ctx.db.get(questionId)),
    );

    return {
      ...quiz,
      questions: questions.filter(Boolean), // Remove any null values
    };
  },
});
