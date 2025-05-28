import { Migrations } from '@convex-dev/migrations';

import { components, internal } from './_generated/api.js';
import { DataModel } from './_generated/dataModel.js';

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();

// Migration to clear questionText field
export const clearQuestionText = migrations.define({
  table: 'questions',
  migrateOne: () => ({ questionText: undefined }),
});

// Migration to clear explanationText field
export const clearExplanationText = migrations.define({
  table: 'questions',
  migrateOne: () => ({ explanationText: undefined }),
});

// Migration to clear contentMigrated field
export const clearContentMigrated = migrations.define({
  table: 'questions',
  migrateOne: () => ({ contentMigrated: undefined }),
});

// Run all cleanup migrations in sequence
export const runCleanupMigrations = migrations.runner([
  internal.migrations.clearQuestionText,
  internal.migrations.clearExplanationText,
  internal.migrations.clearContentMigrated,
]);

// Step 1: Populate taxonomy table with themes
export const populateTaxonomyWithThemes = migrations.define({
  table: 'themes',
  migrateOne: async (ctx, theme) => {
    // Check if this theme already exists in taxonomy
    const existingTaxonomy = await ctx.db
      .query('taxonomy')
      .withIndex('by_name', q => q.eq('name', theme.name))
      .filter(q => q.eq(q.field('type'), 'theme'))
      .first();

    if (!existingTaxonomy) {
      await ctx.db.insert('taxonomy', {
        name: theme.name,
        type: 'theme',
        parentId: undefined,
        pathIds: [],
        pathNames: [theme.name],
      });
      console.log(`Created taxonomy theme: ${theme.name}`);
    }
  },
});

// Step 2: Populate taxonomy table with subthemes
export const populateTaxonomyWithSubthemes = migrations.define({
  table: 'subthemes',
  migrateOne: async (ctx, subtheme) => {
    // Find the parent theme in taxonomy
    const theme = await ctx.db.get(subtheme.themeId);
    if (!theme) {
      console.error(`Theme not found for subtheme: ${subtheme.name}`);
      return;
    }

    const parentTaxonomy = await ctx.db
      .query('taxonomy')
      .withIndex('by_name', q => q.eq('name', theme.name))
      .filter(q => q.eq(q.field('type'), 'theme'))
      .first();

    if (!parentTaxonomy) {
      console.error(`Parent taxonomy not found for theme: ${theme.name}`);
      return;
    }

    // Check if this subtheme already exists in taxonomy
    const existingTaxonomy = await ctx.db
      .query('taxonomy')
      .withIndex('by_name', q => q.eq('name', subtheme.name))
      .filter(q => q.eq(q.field('type'), 'subtheme'))
      .filter(q => q.eq(q.field('parentId'), parentTaxonomy._id))
      .first();

    if (!existingTaxonomy) {
      await ctx.db.insert('taxonomy', {
        name: subtheme.name,
        type: 'subtheme',
        parentId: parentTaxonomy._id,
        pathIds: [parentTaxonomy._id],
        pathNames: [theme.name, subtheme.name],
      });
      console.log(
        `Created taxonomy subtheme: ${subtheme.name} under ${theme.name}`,
      );
    }
  },
});

// Step 3: Populate taxonomy table with groups
export const populateTaxonomyWithGroups = migrations.define({
  table: 'groups',
  migrateOne: async (ctx, group) => {
    // Find the parent subtheme in taxonomy
    const subtheme = await ctx.db.get(group.subthemeId);
    if (!subtheme) {
      console.error(`Subtheme not found for group: ${group.name}`);
      return;
    }

    const theme = await ctx.db.get(subtheme.themeId);
    if (!theme) {
      console.error(`Theme not found for group: ${group.name}`);
      return;
    }

    const parentTaxonomy = await ctx.db
      .query('taxonomy')
      .withIndex('by_name', q => q.eq('name', subtheme.name))
      .filter(q => q.eq(q.field('type'), 'subtheme'))
      .first();

    if (!parentTaxonomy) {
      console.error(`Parent taxonomy not found for subtheme: ${subtheme.name}`);
      return;
    }

    const themeTaxonomy = await ctx.db
      .query('taxonomy')
      .withIndex('by_name', q => q.eq('name', theme.name))
      .filter(q => q.eq(q.field('type'), 'theme'))
      .first();

    if (!themeTaxonomy) {
      console.error(`Theme taxonomy not found for: ${theme.name}`);
      return;
    }

    // Check if this group already exists in taxonomy
    const existingTaxonomy = await ctx.db
      .query('taxonomy')
      .withIndex('by_name', q => q.eq('name', group.name))
      .filter(q => q.eq(q.field('type'), 'group'))
      .filter(q => q.eq(q.field('parentId'), parentTaxonomy._id))
      .first();

    if (!existingTaxonomy) {
      await ctx.db.insert('taxonomy', {
        name: group.name,
        type: 'group',
        parentId: parentTaxonomy._id,
        pathIds: [themeTaxonomy._id, parentTaxonomy._id],
        pathNames: [theme.name, subtheme.name, group.name],
      });
      console.log(
        `Created taxonomy group: ${group.name} under ${subtheme.name}`,
      );
    }
  },
});

// Step 4: Update questions with taxonomy references and names
export const updateQuestionsWithTaxonomyReferences = migrations.define({
  table: 'questions',
  migrateOne: async (ctx, question) => {
    // Skip if already migrated
    if (question.TaxThemeId || question.TaxSubthemeId || question.TaxGroupId) {
      return;
    }

    let updates: any = {};

    // Find theme and theme taxonomy
    const theme = await ctx.db.get(question.themeId);
    if (theme) {
      const themeTaxonomy = await ctx.db
        .query('taxonomy')
        .withIndex('by_name', q => q.eq('name', theme.name))
        .filter(q => q.eq(q.field('type'), 'theme'))
        .first();

      if (themeTaxonomy) {
        updates.TaxThemeId = themeTaxonomy._id;
        updates.TaxThemeName = theme.name;
      }
    }

    // Find subtheme and subtheme taxonomy
    if (question.subthemeId) {
      const subtheme = await ctx.db.get(question.subthemeId);
      if (subtheme) {
        const subthemeTaxonomy = await ctx.db
          .query('taxonomy')
          .withIndex('by_name', q => q.eq('name', subtheme.name))
          .filter(q => q.eq(q.field('type'), 'subtheme'))
          .first();

        if (subthemeTaxonomy) {
          updates.TaxSubthemeId = subthemeTaxonomy._id;
          updates.TaxSubthemeName = subtheme.name;
        }
      }
    }

    // Find group and group taxonomy
    if (question.groupId) {
      const group = await ctx.db.get(question.groupId);
      if (group) {
        const groupTaxonomy = await ctx.db
          .query('taxonomy')
          .withIndex('by_name', q => q.eq('name', group.name))
          .filter(q => q.eq(q.field('type'), 'group'))
          .first();

        if (groupTaxonomy) {
          updates.TaxGroupId = groupTaxonomy._id;
          updates.TaxGroupName = group.name;
        }
      }
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      console.log(
        `Updating question ${question._id} with taxonomy references and names:`,
        updates,
      );
      return updates;
    }
  },
});

// Complete taxonomy migration runner - runs all steps in sequence
export const runTaxonomyMigration = migrations.runner([
  internal.migrations.populateTaxonomyWithThemes,
  internal.migrations.populateTaxonomyWithSubthemes,
  internal.migrations.populateTaxonomyWithGroups,
  internal.migrations.updateQuestionsWithTaxonomyReferences,
]);

// Individual step runners for testing
export const runPopulateTaxonomyWithThemes = migrations.runner(
  internal.migrations.populateTaxonomyWithThemes,
);
export const runPopulateTaxonomyWithSubthemes = migrations.runner(
  internal.migrations.populateTaxonomyWithSubthemes,
);
export const runPopulateTaxonomyWithGroups = migrations.runner(
  internal.migrations.populateTaxonomyWithGroups,
);
export const runUpdateQuestionsWithTaxonomyReferences = migrations.runner(
  internal.migrations.updateQuestionsWithTaxonomyReferences,
);
