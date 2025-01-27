import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    clerkUserId: v.string(),
  }).index('by_clerkUserId', ['clerkUserId']),

  questions: defineTable({
    text: v.string(),
    imageUrl: v.optional(v.string()),
    options: v.array(
      v.object({
        text: v.string(),
        imageUrl: v.optional(v.string()),
      }),
    ),
    correctOptionIndex: v.number(),
    explanation: v.string(),
    theme: v.string(),
    subjects: v.array(v.string()),
  }).index('by_theme', ['theme']),

  // Content/Admin side - Predefined exams
  exams: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    theme: v.string(), // matches theme name from THEMES constant
    questionIds: v.array(v.id('questions')),
    isPublished: v.boolean(),
    updatedAt: v.number(),
  }).index('by_theme', ['theme']),

  // User side - Tracks ongoing exam sessions
  examSessions: defineTable({
    userId: v.id('users'),
    examId: v.id('exams'),
    mode: v.string(), // 'simulado' or 'tutor'
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    currentQuestionIndex: v.number(),
    answers: v.array(v.number()),
    score: v.optional(v.number()),
  })
    .index('by_user', ['userId'])
    .index('by_exam', ['examId']),
});
