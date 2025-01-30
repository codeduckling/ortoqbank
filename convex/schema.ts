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

  themes: defineTable({
    name: v.string(), // URL-friendly name
    label: v.string(), // Display name
    order: v.number(),
  }).index('by_name', ['name']),

  questions: defineTable({
    friendlyId: v.string(), // e.g., "Q001", "Q002", etc.
    text: v.string(),
    imageUrl: v.optional(v.string()),
    options: v.array(v.string()),
    correctOptionIndex: v.number(),
    explanation: v.string(),
    themeId: v.id('themes'),
    subthemes: v.array(v.string()),
  })
    .index('by_theme', ['themeId'])
    .index('by_subthemes', ['subthemes'])
    .index('by_friendlyId', ['friendlyId']),

  exams: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    themeId: v.id('themes'),
    subthemes: v.array(v.string()),
    questionIds: v.array(v.id('questions')),
    isPublished: v.boolean(),
    updatedAt: v.number(),
  })
    .index('by_theme', ['themeId'])
    .index('by_subthemes', ['subthemes']),

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
