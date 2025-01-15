import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    clerkUserId: v.string(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  question_bank: defineTable({
    questionText: v.string(),
    questionImage: v.optional(v.string()),
    options: v.array(
      v.object({
        text: v.string(),
        image: v.optional(v.string()),
      })
    ),
    correctAnswer: v.number(),
    explanation: v.string(),
  }),

  // Many-to-many relationship between questions and tags
  question_tags: defineTable({
    questionId: v.id("question_bank"),
    tagId: v.id("tags"),
  })
    .index("by_question", ["questionId"])
    .index("by_tag", ["tagId"])
    .index("by_question_and_tag", ["questionId", "tagId"]),

  // Track user's question status
  user_questions: defineTable({
    userId: v.id("users"),
    questionId: v.id("question_bank"),
    status: v.union(
      v.literal("correct"),
      v.literal("incorrect"),
      v.literal("not_attempted")
    ),
  })
    .index("by_user", ["userId"])
    .index("by_question", ["questionId"])
    .index("by_user_and_question", ["userId", "questionId"]),

  // Materialized view of user progress by tag
  user_tag_progress: defineTable({
    userId: v.id("users"),
    tagId: v.id("tags"),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    incorrectAnswers: v.number(),
    lastUpdated: v.string(), // ISO date string
  })
    .index("by_user", ["userId"])
    .index("by_tag", ["tagId"])
    .index("by_user_and_tag", ["userId", "tagId"]),

  tags: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
  }).index("by_name", ["name"]),
});
