import { convexTest } from 'convex-test';
import { expect, describe, test } from 'vitest';
import { api } from './_generated/api';
import schema from './schema';

describe('Themes', () => {
  describe('CRUD Operations', () => {
    test('creates and retrieves a theme', async () => {
      const t = convexTest(schema);

      // Create a theme
      const themeId = await t.mutation(api.themes.create, {
        name: 'Test Theme',
      });

      // Retrieve the theme
      const theme = await t.query(api.themes.getById, { id: themeId });

      expect(theme).toMatchObject({
        name: 'Test Theme',
      });
    });

    test('updates a theme', async () => {
      const t = convexTest(schema);

      // Create initial theme
      const themeId = await t.mutation(api.themes.create, {
        name: 'Original Theme',
      });

      // Update the theme
      await t.mutation(api.themes.update, {
        id: themeId,
        name: 'Updated Theme',
      });

      // Verify the update
      const updatedTheme = await t.query(api.themes.getById, { id: themeId });
      expect(updatedTheme).toMatchObject({
        name: 'Updated Theme',
      });
    });

    test('deletes a theme', async () => {
      const t = convexTest(schema);

      // Create a theme
      const themeId = await t.mutation(api.themes.create, {
        name: 'Theme to Delete',
      });

      // Delete the theme
      await t.mutation(api.themes.remove, { id: themeId });

      // Verify the theme is deleted
      const deletedTheme = await t.query(api.themes.getById, { id: themeId });
      expect(deletedTheme).toBeNull();
    });
  });

  describe('Authorization', () => {
    test('prevents unauthorized access to themes', async () => {
      const t = convexTest(schema);

      // Create a theme as user-1
      const themeId = await t.mutation(api.themes.create, {
        name: 'Protected Theme',
        description: 'Protected Description',
        userId: 'user-1',
      });

      // Try to update the theme as a different user
      await expect(
        t.mutation(api.themes.update, {
          id: themeId,
          name: 'Unauthorized Update',
          description: 'Should Fail',
        }),
      ).rejects.toThrow();
    });
  });

  describe('Relationships', () => {
    test('retrieves themes with their questions', async () => {
      const t = convexTest(schema);

      // Create a theme
      const themeId = await t.mutation(api.themes.create, {
        name: 'Theme with Questions',
      });

      // Add some questions to the theme
      await t.mutation(api.questions.create, {
        title: 'Question 1',
        questionText: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Question 1?' }],
            },
          ],
        },
        explanationText: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Explanation 1' }],
            },
          ],
        },
        options: [{ text: 'Option A' }, { text: 'Option B' }],
        correctOptionIndex: 0,
        themeId,
      });

      await t.mutation(api.questions.create, {
        title: 'Question 2',
        questionText: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Question 2?' }],
            },
          ],
        },
        explanationText: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Explanation 2' }],
            },
          ],
        },
        options: [{ text: 'Option A' }, { text: 'Option B' }],
        correctOptionIndex: 1,
        themeId,
      });

      // Retrieve all themes and their hierarchical data
      const hierarchicalData = await t.query(
        api.themes.getHierarchicalData,
        {},
      );

      // Find our theme and verify its data
      const testTheme = hierarchicalData.themes.find(t => t._id === themeId);
      expect(testTheme).toMatchObject({
        name: 'Theme with Questions',
      });
    });
  });
});
