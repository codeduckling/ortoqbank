import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Users table
  users: defineTable({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    clerkUserId: v.string(),
  }).index('by_clerkUserId', ['clerkUserId']),

  // Themes table - optimized for listing with subthemes
  themes: defineTable({
    name: v.string(),
    subthemeCount: v.number(),
  }).index('by_name', ['name']),

  // Subthemes table - optimized for bulk loading with themes
  subthemes: defineTable({
    name: v.string(),
    themeId: v.id('themes'),
    themeName: v.string(),
  }).index('by_theme_name', ['themeId', 'name']),

  // Questions table - optimized for exam creation
  questions: defineTable({
    friendlyId: v.string(),
    text: v.string(),
    imageUrl: v.optional(v.string()),
    options: v.array(v.string()),
    correctOptionIndex: v.number(),
    explanation: v.string(),
    themeId: v.id('themes'),
    subthemeId: v.id('subthemes'),
    // Cache names for better performance
    themeName: v.string(),
    subthemeName: v.string(),
  })
    // Compound indexes for efficient filtering
    .index('by_theme_subtheme', ['themeId', 'subthemeId'])
    .index('by_friendly', ['friendlyId'])
    // Search index for question text with theme/subtheme filters
    .searchIndex('search_questions', {
      searchField: 'text',
      filterFields: ['themeId', 'subthemeId'],
    }),

  // Exams table
  exams: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    themeId: v.id('themes'),
    subthemeId: v.id('subthemes'), // Fixed: Changed from string to proper id type
    questionIds: v.array(v.id('questions')),
    isPublished: v.boolean(),
    updatedAt: v.number(),
    // Cache names for better performance
    themeName: v.string(),
    subthemeName: v.string(),
  })
    // Compound index for filtering published exams by theme
    .index('by_theme_published', ['themeId', 'isPublished']),

  // Exam sessions table
  examSessions: defineTable({
    userId: v.id('users'),
    examId: v.id('exams'),
    mode: v.string(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    currentQuestionIndex: v.number(),
    answers: v.array(v.number()),
    score: v.optional(v.number()),
  })
    // Compound indexes for efficient queries
    .index('by_user_completed', ['userId', 'completedAt'])
    .index('by_exam_completed', ['examId', 'completedAt']),

  // Zaude table

  zaude: defineTable({
    name: v.string(),
  }),
});
