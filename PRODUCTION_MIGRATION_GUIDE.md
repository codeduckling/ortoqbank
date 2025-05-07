# Safe Production Migration Guide

This guide explains how to safely migrate your TipTap content to string format
in a production environment without breaking existing code.

## Migration Strategy Overview

We're using a **parallel fields approach** with these key principles:

1. **Preserve Original Fields**: We never modify the original `questionText` and
   `explanationText` object fields
2. **Add New String Fields**: We create separate `questionTextString` and
   `explanationTextString` fields
3. **Gradual Adoption**: Code can be updated to use the new fields at your own
   pace
4. **Zero Downtime**: The migration process is non-disruptive to your
   application

## Step 1: Prepare Your Codebase

Before running the migration:

1. Deploy the updated schema that supports both object and string formats
2. Deploy the renderer component updates
3. Deploy the migration script
4. Verify that existing code still works with the updated schema

## Step 2: Create a Backup

Always back up your production data before migration:

```bash
# Create a timestamped backup
npx convex export --prod --path ortoqbank_backup_$(date +%Y%m%d).zip
```

## Step 3: Run the Migration in Small Batches

The migration script processes questions in batches of 10, which helps prevent
timeouts and reduces the impact if something goes wrong.

```bash
# Run on production deployment
npx convex run --prod migrateContentToString:migrateInBatches
```

## Step 4: Monitor Progress

Monitor the migration process:

```bash
# Check progress periodically
npx convex run --prod migrateContentToString:getMigrationProgress
```

You should see output like:

```json
{
  "migrated": 42,
  "total": 100,
  "percentage": 42,
  "isComplete": false
}
```

## Step 5: Verify Successful Migration

After the migration completes:

1. Check that the migration status shows 100% complete
2. Verify your application still functions correctly
3. Verify both the string fields and object fields are populated correctly

## Step 6: Update Code Gradually

After the migration is complete, you can start updating your code to use the new
string fields at your own pace:

1. Update components to read from both formats (examples in
   `MIGRATION_CODE_EXAMPLES.md`)
2. Update CRUD operations to write to both formats (already done in
   `questions.ts`)
3. Test each update thoroughly before deploying

## Step 7: Handle New Content Creation

All new content created after the changes to `create` and `update` will
automatically:

1. Store the original object format for backward compatibility
2. Store the stringified version in the new string fields
3. Set the `contentMigrated` flag to true

## Rollback Plan

If something goes wrong:

1. Stop the migration by terminating the script
2. Your application will continue to function normally since we didn't modify
   original fields
3. If necessary, restore from backup:
   ```bash
   npx convex import --prod ortoqbank_backup_YYYYMMDD.zip
   ```

## Final Step: Complete Migration (Future)

Once all your code has been updated to use the string fields:

1. Run the finalization step (to be implemented when ready)
2. Update the schema to make the string fields primary
3. Optionally remove the original object fields if no longer needed

This approach ensures your production data migration is safe, reversible, and
non-disruptive to users.
