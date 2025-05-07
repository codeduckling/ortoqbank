# TipTap Content Migration Completion

## Overview

The migration of TipTap JSON content from object format to string format has
been completed successfully. All components now prefer string-based content,
with legacy object support maintained for backward compatibility. This document
outlines the completed changes and provides guidance for future development.

## Completed Changes

1. **Component Updates**:

   - Updated `QuestionContent` component to prefer `stringContent` over
     `content`
   - Added JSDoc comments to mark `content` prop as deprecated
   - Modified `Quiz.tsx` to stringify content objects before passing to
     components
   - Updated `quiz-results/[id]/page.tsx` to use string content exclusively

2. **Documentation**:

   - Added clear comments in the `getById` function explaining the preference
     for string fields
   - Updated component interfaces with deprecation notices
   - Made all components gracefully handle both formats but prefer string format

3. **Type Safety**:

   - Maintained proper TypeScript interfaces throughout
   - Added fallback mechanisms to stringify objects when needed

4. **Schema Updates**:

   - Updated the database schema to make `questionTextString` and
     `explanationTextString` required fields
   - Made the legacy `questionText` and `explanationText` fields optional
   - Updated the `explanation` field in quiz sessions to maintain consistent
     formatting

5. **Database Operations**:
   - Modified the `create` and `update` mutations to no longer store legacy
     object fields
   - New questions now only save the stringified content in the required fields
   - Existing questions still maintain backward compatibility with both formats
   - Updated `quizSessions.ts` to use `explanationTextString` for storing and
     returning explanations
   - Updated question creation form service to only send string fields to the
     API

## Going Forward

All new code should:

1. **Use String Fields Exclusively**:

   ```typescript
   // Correct - use only string fields
   <QuestionContent stringContent={question.questionTextString} />

   // Avoid - legacy format
   <QuestionContent content={question.questionText} />
   ```

2. **Access Data in Queries**: When retrieving question data from Convex,
   prefer:

   - `questionTextString` instead of `questionText`
   - `explanationTextString` instead of `explanationText`

3. **Database Updates**: When creating or updating questions, always include:

   ```typescript
   const stringifiedContent = JSON.stringify(contentObject);

   // Include in your mutation
   questionTextString: stringifiedContent,
   explanationTextString: stringifiedExplanation,
   ```

## Benefits of Migration

- **Performance**: Storing JSON as strings is more efficient in the database
- **Consistency**: All content now follows the same pattern
- **Serialization**: No need to handle serialization/deserialization in multiple
  places
- **Future-Proofing**: Better positioned for any future content structure
  changes
- **Schema Enforcement**: The schema now enforces the use of string fields,
  preventing accidental use of object fields
- **Storage Optimization**: New questions no longer duplicate content in both
  formats

## Backward Compatibility

All components maintain backward compatibility with the original object format:

1. Components first check for `stringContent`
2. If not found, they fall back to `content`
3. If `content` is an object, it gets stringified automatically

This ensures a smooth transition while maintaining support for any older code or
data that hasn't been updated yet.

## Future Considerations

1. **Complete Legacy Field Removal**: Once all components and queries fully
   adopt the string format, the legacy object fields could be safely removed
   from the schema entirely.

2. **Migration Script Removal**: The migration scripts can be safely removed
   once all content has been migrated and verified.

3. **Type Updates**: Consider updating TypeScript interfaces to remove the
   deprecated object fields from types.
