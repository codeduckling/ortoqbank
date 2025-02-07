import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    questions: v.array(v.id('questions')),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
  },
  handler: async (context, arguments_) => {
    return await context.db.insert('presetExams', {
      ...arguments_,
      isPublic: false, // Default to private
    });
  },
});

export const getById = query({
  args: { id: v.id('presetExams') },
  handler: async (context, { id }) => {
    const exam = await context.db.get(id);
    if (!exam) {
      throw new Error('Exam not found');
    }

    // Fetch all questions and their image URLs
    const questions = await Promise.all(
      exam.questions.map(async questionId => {
        const question = await context.db.get(questionId);
        if (!question) return null;

        // Get URLs for any images
        const questionImageUrl = question.questionImageUrl
          ? await context.storage.getUrl(question.questionImageUrl)
          : undefined;

        const explanationImageUrl = question.explanationImageUrl
          ? await context.storage.getUrl(question.explanationImageUrl)
          : undefined;

        return {
          ...question,
          questionImageUrl,
          explanationImageUrl,
        };
      }),
    );

    return {
      ...exam,
      questions: questions.filter(Boolean),
    };
  },
});
