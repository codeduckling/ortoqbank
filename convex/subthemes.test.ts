import { v } from 'convex/values';
import { convexTest } from 'convex-test';
import { describe, expect, test } from 'vitest';

import { api } from './_generated/api';
import { Doc, Id } from './_generated/dataModel';
import schema from './schema';

describe('Subthemes', () => {
  describe('CRUD Operations', () => {
    test('creates and retrieves a subtheme', async () => {
      const t = convexTest(schema);

      // Create a parent theme first
      const themeId = await t.mutation(api.themes.create, {
        name: 'Parent Theme',
      });

      // Create a subtheme
      const subthemeId = await t.mutation(api.subthemes.create, {
        name: 'Test Subtheme',
        themeId,
      });

      // Retrieve all themes and their hierarchical data
      const hierarchicalData = await t.query(
        api.themes.getHierarchicalData,
        {},
      );

      // Find our subtheme
      const testSubtheme = hierarchicalData.subthemes.find(
        (s: Doc<'subthemes'>) => s._id === subthemeId,
      );
      expect(testSubtheme).toMatchObject({
        name: 'Test Subtheme',
        themeId,
      });
    });

    test('updates a subtheme', async () => {
      const t = convexTest(schema);

      // Create a parent theme
      const themeId = await t.mutation(api.themes.create, {
        name: 'Parent Theme',
      });

      // Create initial subtheme
      const subthemeId = await t.mutation(api.subthemes.create, {
        name: 'Original Subtheme',
        themeId,
      });

      // Update the subtheme
      await t.mutation(api.subthemes.update, {
        id: subthemeId,
        name: 'Updated Subtheme',
        themeId,
      });

      // Verify the update
      const hierarchicalData = await t.query(
        api.themes.getHierarchicalData,
        {},
      );
      const updatedSubtheme = hierarchicalData.subthemes.find(
        (s: Doc<'subthemes'>) => s._id === subthemeId,
      );
      expect(updatedSubtheme).toMatchObject({
        name: 'Updated Subtheme',
        themeId,
      });
    });

    test('deletes a subtheme', async () => {
      const t = convexTest(schema);

      // Create a parent theme
      const themeId = await t.mutation(api.themes.create, {
        name: 'Parent Theme',
      });

      // Create a subtheme
      const subthemeId = await t.mutation(api.subthemes.create, {
        name: 'Subtheme to Delete',
        themeId,
      });

      // Delete the subtheme
      await t.mutation(api.subthemes.remove, { id: subthemeId });

      // Verify the subtheme is deleted
      const hierarchicalData = await t.query(
        api.themes.getHierarchicalData,
        {},
      );
      const deletedSubtheme = hierarchicalData.subthemes.find(
        (s: Doc<'subthemes'>) => s._id === subthemeId,
      );
      expect(deletedSubtheme).toBeUndefined();
    });
  });

  describe('Relationships', () => {
    test('maintains relationship with parent theme', async () => {
      const t = convexTest(schema);

      // Create a parent theme
      const themeId = await t.mutation(api.themes.create, {
        name: 'Parent Theme',
      });

      // Create multiple subthemes
      const subthemeId1 = await t.mutation(api.subthemes.create, {
        name: 'Subtheme 1',
        themeId,
      });

      const subthemeId2 = await t.mutation(api.subthemes.create, {
        name: 'Subtheme 2',
        themeId,
      });

      // Verify hierarchical data
      const hierarchicalData = await t.query(
        api.themes.getHierarchicalData,
        {},
      );

      const theme = hierarchicalData.themes.find(
        (t: Doc<'themes'>) => t._id === themeId,
      );
      const subthemes = hierarchicalData.subthemes.filter(
        (s: Doc<'subthemes'>) => s.themeId === themeId,
      );

      expect(theme).toMatchObject({
        name: 'Parent Theme',
      });

      expect(subthemes).toHaveLength(2);
      expect(subthemes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Subtheme 1', themeId }),
          expect.objectContaining({ name: 'Subtheme 2', themeId }),
        ]),
      );
    });
  });
});
