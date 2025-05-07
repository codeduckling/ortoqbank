# Content Migration Guide

This document explains the process for migrating TipTap JSON content to a string
format in the database.

## Migration Strategy

We're using a multi-phase approach to safely migrate content:

### Phase 1: Schema Update (Current)

- Updated the schema to accept both object and string formats for `questionText`
  and `explanationText`
- Added dedicated string fields `questionTextString` and `explanationTextString`
  for the final migration
- Added a `contentMigrated` boolean flag to track migration status

### Phase 2: Data Migration

- Run the migration script to convert existing content to strings
- **IMPORTANT**: The migration preserves the original object fields
  (`questionText` and `explanationText`)
- The string versions are stored in the new dedicated fields
  (`questionTextString` and `explanationTextString`)
- This dual approach maintains backward compatibility with existing code

### Phase 3: Code Updates

- Modified the `StructuredContentRenderer` component to handle both formats
- New code will be updated to use the new string fields
- Legacy code continues to work by accessing the original object fields

### Phase 4: Finalization (Future)

- After confirming all code has been updated to use the new string fields
- Run a final migration to clean up if needed
- Optionally remove the original object fields if no longer needed

## How to Run the Migration

1. Make sure your environment variables are set up correctly:

   ```
   NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
   ```

2. Run the migration script:

   ```bash
   npm run migrate:content
   ```

   This script uses Convex's CLI to execute the
   `migrateContentToString:migrateInBatches` action on your deployment.

3. After running the script, check the logs to verify all content was migrated
   successfully.

## Alternative Migration Methods

You can also run the migration directly using the Convex CLI:

```bash
npx convex run migrateContentToString:migrateInBatches
```

Or from the Convex Dashboard by:

1. Going to your deployment dashboard
2. Opening the Functions tab
3. Finding the `migrateContentToString:migrateInBatches` action
4. Running it with an empty object `{}` as the argument

## Technical Implementation

### Data Format

The content objects from TipTap are being stored as JSON strings in the new
fields:

```javascript
// Original object format (preserved)
questionText: {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ text: "Sample text", type: "text" }]
    }
  ]
}

// New string fields
questionTextString: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"text\":\"Sample text\",\"type\":\"text\"}]}]}"
```

### Required Code Updates

After running the migration, you should gradually update code that accesses
these fields:

```typescript
// BEFORE: Accessing object directly
const questionContent = question.questionText;

// AFTER: Using string field and parsing when needed
const questionContent = question.questionTextString
  ? JSON.parse(question.questionTextString)
  : question.questionText;
```

### Renderer Compatibility

The `StructuredContentRenderer` component has been updated to handle both
formats:

1. It first checks for the new `stringContent` field
2. If that's not available, it falls back to the original `node` field
3. It automatically parses string content back to JSON objects for rendering

## Monitoring and Troubleshooting

### Check Migration Progress

You can check the migration progress using the built-in query:

```bash
# From CLI
npx convex run migrateContentToString:getMigrationProgress

# This returns a JSON object with:
# {
#   "migrated": 42,       // Number of migrated questions
#   "total": 100,         // Total number of questions
#   "percentage": 42,     // Percentage complete
#   "isComplete": false   // Whether migration is complete
# }
```

Or in your application code:

```typescript
// In a React component with useQuery
const progress = useQuery(api.migrateContentToString.getMigrationProgress);

if (progress) {
  console.log(`Migration progress: ${progress.percentage}%`);
  console.log(`${progress.migrated}/${progress.total} questions migrated`);
}
```

### Running a Custom Query

You can also check the migration status with a custom query:

```typescript
// Run in a Convex function
const migratedQuestions = await ctx.db
  .query('questions')
  .filter(q => q.eq(q.field('contentMigrated'), true))
  .collect();

const totalQuestions = await ctx.db.query('questions').collect();

console.log(
  `Migration progress: ${migratedQuestions.length}/${totalQuestions.length}`,
);
```

If you encounter any issues with the migration, please contact the development
team.
