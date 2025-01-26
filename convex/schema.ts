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
    subject: v.string(),
    tags: v.array(v.string()),
  }).index('by_subject', ['subject']),

  examSessions: defineTable({
    userId: v.id('users'),
    startedAt: v.number(), // timestamp
    completedAt: v.optional(v.number()),
    questionIds: v.array(v.id('questions')),
    currentQuestionIndex: v.number(),
    answers: v.array(v.number()), // Array of selected option indices
  }).index('by_user', ['userId']),
});
