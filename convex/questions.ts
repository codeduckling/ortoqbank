import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

const validateNoBlobs = (content: any[]) => {
  for (const node of content) {
    if (node.type === 'image' && node.attrs?.src?.startsWith('blob:')) {
      throw new Error('Invalid image URL detected');
    }
  }
};

export const create = mutation({
  args: {
    questionText: v.object({ type: v.string(), content: v.array(v.any()) }),
    title: v.string(),
    explanationText: v.object({ type: v.string(), content: v.array(v.any()) }),
    alternatives: v.array(v.string()),
    correctAlternativeIndex: v.number(),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
  },
  handler: async (context, arguments_) => {
    // Validate both text fields
    validateNoBlobs(arguments_.questionText.content);
    validateNoBlobs(arguments_.explanationText.content);

    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await context.db
      .query('users')
      .withIndex('by_clerkUserId', q => q.eq('clerkUserId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    return await context.db.insert('questions', {
      ...arguments_,
      normalizedTitle: arguments_.title.trim().toLowerCase(),
      authorId: user._id,
      isPublic: false,
      alternatives: arguments_.alternatives,
    });
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (context, arguments_) => {
    const questions = await context.db
      .query('questions')
      .order('desc')
      .paginate(arguments_.paginationOpts);

    // Fetch themes for all questions in the current page
    const themes = await Promise.all(
      questions.page.map(question => context.db.get(question.themeId)),
    );

    // Combine questions with theme data
    return {
      ...questions,
      page: questions.page.map((question, index) => ({
        ...question,
        theme: themes[index],
      })),
    };
  },
});

export const getById = query({
  args: { id: v.id('questions') },
  handler: async (context, arguments_) => {
    const question = await context.db.get(arguments_.id);
    if (!question) {
      throw new Error('Question not found');
    }

    // Fetch the associated theme
    const theme = await context.db.get(question.themeId);

    // Fetch the subtheme if it exists
    const subtheme = question.subthemeId
      ? await context.db.get(question.subthemeId)
      : undefined;

    return { ...question, theme, subtheme };
  },
});

export const update = mutation({
  args: {
    id: v.id('questions'),
    questionText: v.object({ type: v.string(), content: v.array(v.any()) }),
    title: v.string(),
    explanationText: v.object({ type: v.string(), content: v.array(v.any()) }),
    alternatives: v.array(v.string()),
    correctAlternativeIndex: v.number(),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (context, arguments_) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const question = await context.db.get(arguments_.id);
    if (!question) {
      throw new Error('Question not found');
    }

    const { id, ...updateData } = arguments_;
    return await context.db.patch(arguments_.id, {
      ...updateData,
      normalizedTitle: arguments_.title.trim().toLowerCase(),
      alternatives: arguments_.alternatives,
    });
  },
});

export const listAll = query({
  handler: async context => {
    return await context.db.query('questions').collect();
  },
});

export const getMany = query({
  args: { ids: v.array(v.id('questions')) },
  handler: async (ctx, args) => {
    const questions = await Promise.all(args.ids.map(id => ctx.db.get(id)));
    return questions;
  },
});

export const countAvailableQuestions = query({
  args: {
    questionMode: v.union(
      v.literal('all'),
      v.literal('unanswered'),
      v.literal('incorrect'),
      v.literal('bookmarked'),
    ),
    selectedThemes: v.optional(v.array(v.id('themes'))),
    selectedSubthemes: v.optional(v.array(v.id('subthemes'))),
    selectedGroups: v.optional(v.array(v.id('groups'))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkUserId', q => q.eq('clerkUserId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    // Define a helper function to check if a question matches subtheme and group filters
    const matchesFilters = (question: any) => {
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

    // If no themes are selected, use all themes
    let themesToProcess: any[] = [];
    if (!args.selectedThemes || args.selectedThemes.length === 0) {
      // Fetch all themes from the database
      const allThemes = await ctx.db.query('themes').collect();
      themesToProcess = allThemes.map(theme => theme._id);
    } else {
      themesToProcess = args.selectedThemes;
    }

    let questionsCount = 0;

    // Process each theme
    for (const themeId of themesToProcess) {
      // Filter by theme ID
      const themeQuestions = await ctx.db
        .query('questions')
        .filter(q => q.eq(q.field('themeId'), themeId))
        .collect();

      // Apply additional filters to the fetched questions
      const filteredThemeQuestions = themeQuestions.filter(matchesFilters);
      questionsCount += filteredThemeQuestions.length;
    }

    // If we need to filter by question mode
    switch (args.questionMode) {
      case 'all': {
        // Already counted above, no additional filtering needed
        break;
      }
      case 'bookmarked': {
        // Get bookmarked questions
        const bookmarks = await ctx.db
          .query('userBookmarks')
          .withIndex('by_user', q => q.eq('userId', user._id))
          .collect();

        // Create an array of bookmarked question IDs
        const bookmarkedIds = bookmarks.map(b => b.questionId);

        // Count only questions that are both in filtered set and bookmarked
        // We need to do this in memory since we can't efficiently filter with has()
        const questions = await ctx.db.query('questions').collect();
        const bookmarkedQuestions = questions.filter(q =>
          bookmarkedIds.some(id => id === q._id),
        );

        questionsCount = bookmarkedQuestions.length;
        break;
      }
      case 'unanswered': {
        // Get all answered questions
        const answeredQuestionIds = new Set();

        // Query completed sessions
        const completedSessions = await ctx.db
          .query('quizSessions')
          .withIndex('by_user_quiz', q => q.eq('userId', user._id))
          .filter(q => q.eq(q.field('isComplete'), true))
          .collect();

        // Collect all answered question IDs
        for (const session of completedSessions) {
          if (session.answers && session.answers.length > 0) {
            for (let i = 0; i < session.answers.length; i++) {
              if (session.answers[i] !== null) {
                // Get the question ID from the quiz
                const quiz = await ctx.db.get(session.quizId);
                if (quiz && quiz.questions && i < quiz.questions.length) {
                  answeredQuestionIds.add(quiz.questions[i]);
                }
              }
            }
          }
        }

        // Calculate unanswered count (total - answered)
        const unansweredCount = questionsCount - answeredQuestionIds.size;
        questionsCount = unansweredCount > 0 ? unansweredCount : 0;
        break;
      }
      case 'incorrect': {
        // Similar to unanswered, but tracking incorrect answers
        const incorrectQuestionIds = new Set();

        // Query completed sessions
        const completedSessions = await ctx.db
          .query('quizSessions')
          .withIndex('by_user_quiz', q => q.eq('userId', user._id))
          .filter(q => q.eq(q.field('isComplete'), true))
          .collect();

        // Collect incorrect question IDs
        for (const session of completedSessions) {
          if (session.answerFeedback && session.answerFeedback.length > 0) {
            for (let i = 0; i < session.answerFeedback.length; i++) {
              const feedback = session.answerFeedback[i];
              if (feedback && !feedback.isCorrect) {
                // Get the question ID from the quiz
                const quiz = await ctx.db.get(session.quizId);
                if (quiz && quiz.questions && i < quiz.questions.length) {
                  incorrectQuestionIds.add(quiz.questions[i]);
                }
              }
            }
          }
        }

        // For incorrect, the count is the size of the set
        questionsCount = incorrectQuestionIds.size;
        break;
      }
    }

    return { count: questionsCount };
  },
});
