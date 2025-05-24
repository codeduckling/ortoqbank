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
