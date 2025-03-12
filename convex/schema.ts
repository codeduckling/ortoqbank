import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Users table
  users: defineTable({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    clerkUserId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  })
    .index('by_clerkUserId', ['clerkUserId'])
    .index('by_stripeCustomerId', ['stripeCustomerId']),

  themes: defineTable({
    name: v.string(),
    prefix: v.optional(v.string()),
  }).index('by_name', ['name']),

  subthemes: defineTable({
    name: v.string(),
    themeId: v.id('themes'),
    prefix: v.optional(v.string()),
  }).index('by_theme', ['themeId']),

  groups: defineTable({
    name: v.string(),
    subthemeId: v.id('subthemes'),
    prefix: v.optional(v.string()),
  }).index('by_subtheme', ['subthemeId']),

  // Tags table
  tags: defineTable({ name: v.string() }),

  questions: defineTable({
    title: v.string(),
    normalizedTitle: v.string(),
    questionCode: v.optional(v.string()),
    questionText: v.object({ type: v.string(), content: v.array(v.any()) }),
    explanationText: v.object({ type: v.string(), content: v.array(v.any()) }),
    alternatives: v.array(v.string()),
    correctAlternativeIndex: v.number(),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
    authorId: v.optional(v.id('users')),
    isPublic: v.optional(v.boolean()),
  })
    .index('by_title', ['normalizedTitle'])
    .searchIndex('search_by_title', { searchField: 'title' }),

  presetQuizzes: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.union(v.literal('trilha'), v.literal('simulado')),
    questions: v.array(v.id('questions')),
    themeId: v.optional(v.id('themes')),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
    isPublic: v.boolean(),
  }),

  customQuizzes: defineTable({
    name: v.string(),
    description: v.string(),
    questions: v.array(v.id('questions')),
    authorId: v.id('users'),
    testMode: v.union(v.literal('exam'), v.literal('study')),
    questionMode: v.union(
      v.literal('all'),
      v.literal('unanswered'),
      v.literal('incorrect'),
      v.literal('bookmarked'),
    ),
    selectedThemes: v.optional(v.array(v.id('themes'))),
    selectedSubthemes: v.optional(v.array(v.id('subthemes'))),
    selectedGroups: v.optional(v.array(v.id('groups'))),
  }),

  quizSessions: defineTable({
    userId: v.id('users'),
    quizId: v.union(v.id('presetQuizzes'), v.id('customQuizzes')),
    mode: v.union(v.literal('exam'), v.literal('study')),
    currentQuestionIndex: v.number(),
    answers: v.array(v.number()),
    answerFeedback: v.array(
      v.object({
        isCorrect: v.boolean(),
        explanation: v.object({ type: v.string(), content: v.array(v.any()) }),
        correctAlternative: v.optional(v.number()),
      }),
    ),
    isComplete: v.boolean(),
  }).index('by_user_quiz', ['userId', 'quizId', 'isComplete']),

  userBookmarks: defineTable({
    userId: v.id('users'),
    questionId: v.id('questions'),
  })
    .index('by_user_question', ['userId', 'questionId'])
    .index('by_user', ['userId'])
    .index('by_question', ['questionId']),

  // Table to track user statistics for questions
  userQuestionStats: defineTable({
    userId: v.id('users'),
    questionId: v.id('questions'),
    hasAnswered: v.boolean(), // Track if user has answered at least once
    isIncorrect: v.boolean(), // Track if the most recent answer was incorrect
    answeredAt: v.number(), // Timestamp for when the question was last answered
  })
    .index('by_user_question', ['userId', 'questionId'])
    .index('by_user', ['userId'])
    .index('by_user_incorrect', ['userId', 'isIncorrect'])
    .index('by_user_answered', ['userId', 'hasAnswered']),

  purchases: defineTable({
    userId: v.id('users'),
    stripeProductId: v.string(),
    stripePurchaseId: v.string(),
    stripePurchaseDate: v.number(),
    stripePurchaseStatus: v.string(),
  })
    .index('by_user_stripePurchaseId', ['userId', 'stripePurchaseId'])
    .index('by_user', ['userId']),
});
