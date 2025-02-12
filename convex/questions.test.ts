import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, test } from 'vitest';

import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import schema from './schema';

describe('Questions', () => {
  // Common test data
  const createTestQuestion = {
    title: 'Test question?',
    questionText: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Test question?' }],
        },
      ],
    },
    options: [
      { text: 'Option A' },
      { text: 'Option B' },
      { text: 'Option C' },
      { text: 'Option D' },
    ],
    correctOptionIndex: 0,
    explanationText: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Explanation' }] },
      ],
    },
  };

  describe('CRUD Operations', () => {
    test('creates and retrieves a question', async () => {
      const t = convexTest(schema);

      // Create a theme first since questions need a theme
      const themeId = await t.run(async context => {
        return await context.db.insert('themes', { name: 'Test Theme' });
      });

      // Create a question
      const questionId = await t.mutation(api.questions.create, {
        ...createTestQuestion,
        themeId,
      });

      // Retrieve the question
      const question = await t.query(api.questions.getById, { id: questionId });

      expect(question).toMatchObject({
        title: createTestQuestion.title,
        questionText: createTestQuestion.questionText,
        options: createTestQuestion.options,
        correctOptionIndex: createTestQuestion.correctOptionIndex,
      });
    });

    test('updates a question', async () => {
      const t = convexTest(schema);

      // Create initial data
      const themeId = await t.run(async context => {
        return await context.db.insert('themes', { name: 'Test Theme' });
      });

      // Create initial question
      const questionId = await t.mutation(api.questions.create, {
        ...createTestQuestion,
        themeId,
      });

      // Updated question data
      const updatedData = {
        title: 'Updated question?',
        questionText: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Updated question?' }],
            },
          ],
        },
        options: [
          { text: 'New Option A' },
          { text: 'New Option B' },
          { text: 'New Option C' },
          { text: 'New Option D' },
        ],
        correctOptionIndex: 1,
        explanationText: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Updated explanation' }],
            },
          ],
        },
      };

      // Update the question
      await t.mutation(api.questions.update, {
        id: questionId,
        themeId,
        ...updatedData,
      });

      // Verify the update
      const updatedQuestion = await t.query(api.questions.getById, {
        id: questionId,
      });
      expect(updatedQuestion).toMatchObject(updatedData);
    });

    test('updates question visibility', async () => {
      const t = convexTest(schema);

      // Create initial data
      const themeId = await t.run(async context => {
        return await context.db.insert('themes', { name: 'Test Theme' });
      });

      // Create a question (defaults to private)
      const questionId = await t.mutation(api.questions.create, {
        ...createTestQuestion,
        themeId,
      });

      // Make the question public
      await t.mutation(api.questions.update, {
        id: questionId,
        themeId,
        title: createTestQuestion.title,
        questionText: createTestQuestion.questionText,
        explanationText: createTestQuestion.explanationText,
        options: createTestQuestion.options,
        correctOptionIndex: createTestQuestion.correctOptionIndex,
        isPublic: true,
      });

      // Verify the question is now public
      const updatedQuestion = await t.query(api.questions.getById, {
        id: questionId,
      });
      expect(updatedQuestion?.isPublic).toBe(true);
    });
  });

  describe('Validation', () => {
    test('validates required fields', async () => {
      const t = convexTest(schema);

      // Create a theme
      const themeId = await t.run(async context => {
        return await context.db.insert('themes', { name: 'Test Theme' });
      });

      // Attempt to create a question without required fields
      await expect(
        t.mutation(api.questions.create, {
          themeId,
          title: '', // Empty title
          questionText: {
            type: 'doc',
            content: [], // Empty content
          },
          options: [], // No options
          correctOptionIndex: 0,
          explanationText: {
            type: 'doc',
            content: [],
          },
        }),
      ).rejects.toThrow();
    });

    test('validates correctOptionIndex is within bounds', async () => {
      const t = convexTest(schema);

      // Create a theme
      const themeId = await t.run(async context => {
        return await context.db.insert('themes', { name: 'Test Theme' });
      });

      // Attempt to create a question with invalid correctOptionIndex
      await expect(
        t.mutation(api.questions.create, {
          ...createTestQuestion,
          themeId,
          correctOptionIndex: 5, // Out of bounds
        }),
      ).rejects.toThrow();
    });
  });

  describe('Querying', () => {
    test('lists questions with pagination', async () => {
      const t = convexTest(schema);

      // Create a theme
      const themeId = await t.run(async context => {
        return await context.db.insert('themes', { name: 'Test Theme' });
      });

      // Create multiple questions
      await Promise.all([
        t.mutation(api.questions.create, {
          ...createTestQuestion,
          title: 'Question 1',
          themeId,
        }),
        t.mutation(api.questions.create, {
          ...createTestQuestion,
          title: 'Question 2',
          themeId,
        }),
      ]);

      // Query with pagination
      const result = await t.query(api.questions.list, {
        paginationOpts: {
          numItems: 1,
          // eslint-disable-next-line unicorn/no-null
          cursor: null,
        },
      });

      expect(result.page).toHaveLength(1);
      expect(result.isDone).toBe(false);
    });

    test('lists questions by theme', async () => {
      const t = convexTest(schema);

      // Create two themes
      const [themeId1, themeId2] = await Promise.all([
        t.run(async context =>
          context.db.insert('themes', { name: 'Theme 1' }),
        ),
        t.run(async context =>
          context.db.insert('themes', { name: 'Theme 2' }),
        ),
      ]);

      // Create questions in different themes
      await Promise.all([
        t.mutation(api.questions.create, {
          ...createTestQuestion,
          title: 'Question in Theme 1',
          themeId: themeId1,
        }),
        t.mutation(api.questions.create, {
          ...createTestQuestion,
          title: 'Question in Theme 2',
          themeId: themeId2,
        }),
      ]);

      // Query questions by theme
      const questionsInTheme1 = await t.query(api.questions.list, {
        paginationOpts: {
          numItems: 10,
          // eslint-disable-next-line unicorn/no-null
          cursor: null,
        },
      });

      const themeQuestions = questionsInTheme1.page.filter(
        question => question.themeId === themeId1,
      );
      expect(themeQuestions.length).toBeGreaterThan(0);
    });
  });
});
