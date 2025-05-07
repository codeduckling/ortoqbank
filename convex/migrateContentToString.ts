import { v } from 'convex/values';

import { api, internal } from './_generated/api';
import { Doc, Id } from './_generated/dataModel';
import { action, internalMutation, query } from './_generated/server';

// Helper function to apply migrations in batches to avoid timeout issues
export const migrateInBatches = action({
  args: {},
  handler: async ctx => {
    console.log('Starting migration of question content to strings');

    // Get all questions
    const allQuestions = await ctx.runQuery(api.questions.listAll);

    // Process in batches of 10 to avoid timeouts
    const batchSize = 10;
    const batches = Math.ceil(allQuestions.length / batchSize);

    let processed = 0;
    let updated = 0;

    for (let i = 0; i < batches; i++) {
      const startIndex = i * batchSize;
      const endIndex = Math.min(startIndex + batchSize, allQuestions.length);
      const batch = allQuestions.slice(startIndex, endIndex);

      console.log(
        `Processing batch ${i + 1}/${batches} (${batch.length} questions)`,
      );

      // Update each question in the batch
      const results = await Promise.all(
        batch.map(question =>
          ctx.runMutation(internal.migrateContentToString.migrateQuestion, {
            questionId: question._id,
          }),
        ),
      );

      // Count successful updates
      const batchUpdated = results.filter(Boolean).length;
      processed += batch.length;
      updated += batchUpdated;

      console.log(
        `Batch ${i + 1} complete. Updated ${batchUpdated}/${batch.length} questions.`,
      );
    }

    console.log(
      `Migration complete. Processed ${processed} questions, updated ${updated}.`,
    );
    return { processed, updated };
  },
});

// Helper function to migrate a single question
export const migrateQuestion = internalMutation({
  args: {
    questionId: v.id('questions'),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      console.warn(`Question not found: ${args.questionId}`);
      return false;
    }

    try {
      // Check if the content is already migrated
      if (question.contentMigrated) {
        // Already migrated
        return false;
      }

      // Convert content objects to strings using ternary expressions
      // For questionText - keep as string if already string, otherwise stringify
      const stringifiedQuestionText =
        typeof question.questionText === 'string'
          ? question.questionText
          : JSON.stringify(question.questionText);

      // For explanationText - keep as string if already string, otherwise stringify
      const stringifiedExplanationText =
        typeof question.explanationText === 'string'
          ? question.explanationText
          : JSON.stringify(question.explanationText);

      // IMPORTANT: Only write to the new string fields
      // DO NOT overwrite the original fields since they're still accessed as objects
      await ctx.db.patch(args.questionId, {
        // Do not overwrite the original fields:
        // questionText: stringifiedQuestionText,
        // explanationText: stringifiedExplanationText,

        // Only add to the new string fields
        questionTextString: stringifiedQuestionText,
        explanationTextString: stringifiedExplanationText,
        contentMigrated: true,
      });

      return true;
    } catch (error) {
      console.error(`Error migrating question ${args.questionId}:`, error);
      return false;
    }
  },
});

// Query to check migration progress
export const getMigrationProgress = query({
  args: {},
  handler: async ctx => {
    // Count migrated questions by collecting and counting
    const migratedQuestions = await ctx.db
      .query('questions')
      .filter(q => q.eq(q.field('contentMigrated'), true))
      .collect();
    const migratedCount = migratedQuestions.length;

    // Count total questions
    const allQuestions = await ctx.db.query('questions').collect();
    const totalCount = allQuestions.length;

    // Calculate percentage
    const percentage =
      totalCount > 0 ? Math.round((migratedCount / totalCount) * 100) : 0;

    return {
      migrated: migratedCount,
      total: totalCount,
      percentage,
      isComplete: migratedCount === totalCount && totalCount > 0,
    };
  },
});

// Migration to finalize the transition (to be run when ready to remove the old fields)
export const finalizeContentMigration = action({
  args: {},
  handler: async ctx => {
    console.log('Starting finalization of content migration');

    // This will be a separate migration to run when you're ready
    // to make the final switch to only using the string fields

    console.log(
      "This migration is a placeholder for when you're ready to complete the transition",
    );
    console.log('When ready, uncomment the code below and run this migration');

    // Placeholder for future implementation
    // const result = await ctx.runMutation(internal.migrateContentToString.finalizeAllQuestions);

    return { status: 'pending' };
  },
});

// Internal mutation to finalize migration (for future use)
export const finalizeAllQuestions = internalMutation({
  args: {},
  handler: async ctx => {
    // Placeholder for the future implementation
    // Will need to:
    // 1. Find all questions where contentMigrated = true
    // 2. Ensure questionTextString and explanationTextString are used as primary fields
    // 3. Update schema to only use string fields

    return { finalized: 0 };
  },
});
