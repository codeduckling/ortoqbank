# TipTap Content Migration Summary

## Implementation Overview

We've implemented a comprehensive solution to migrate TipTap JSON content to
string format while maintaining backward compatibility:

### 1. Schema Changes

- Updated `questions` table schema to support both object and string formats
- Added new fields for the transition:
  - `questionTextString`
  - `explanationTextString`
  - `contentMigrated` flag

### 2. Migration Script

- Created `migrateContentToString.ts` with a batch-processing approach
- Implemented an action to process questions in groups of 10
- Added validation and error handling for safe migration

### 3. Component Updates

- Enhanced `StructuredContentRenderer` to handle multiple formats
- Added priority order: first try dedicated string field, then fall back to
  original
- Preserved parsing logic for both formats

### 4. Create/Update Mutations

- Updated question creation and updates to store content as strings
- Added a utility function `stringifyContent` to handle conversion

### 5. Documentation

- Created detailed migration guide in `MIGRATION.md`
- Added a migration script to `package.json`

## Usage

To run the migration:

```bash
npm run migrate:content
```

## Future Steps

1. After successful migration:

   - Verify all content displays correctly
   - Run the finalization script (to be implemented)
   - Update the schema to only use string fields

2. Final cleanup:
   - Remove legacy field support
   - Update all components to use only string fields
   - Remove migration-specific code

## Files Modified

1. `convex/schema.ts` - Schema updates
2. `convex/migrateContentToString.ts` - Migration script
3. `convex/questions.ts` - CRUD operations update
4. `src/components/common/StructuredContentRenderer.tsx` - Renderer updates
5. `scripts/migrate-content-to-string.ts` - CLI runner
6. `package.json` - Added migration script
7. `MIGRATION.md` - Added documentation
