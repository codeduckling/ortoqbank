# Migration Code Examples

This document provides examples of how to update your code to work with the new
string content fields while maintaining backward compatibility.

## 1. Reading Content in Components

### Before Migration

```tsx
import { StructuredContentRenderer } from '@/components/common/StructuredContentRenderer';

function QuestionDisplay({ question }) {
  return (
    <div>
      <h2>{question.title}</h2>
      <div className="question-content">
        <StructuredContentRenderer node={question.questionText} />
      </div>
      <div className="explanation-content">
        <StructuredContentRenderer node={question.explanationText} />
      </div>
    </div>
  );
}
```

### After Migration - Compatible with Both Formats

```tsx
import { StructuredContentRenderer } from '@/components/common/StructuredContentRenderer';

function QuestionDisplay({ question }) {
  return (
    <div>
      <h2>{question.title}</h2>
      <div className="question-content">
        <StructuredContentRenderer
          node={question.questionText}
          stringContent={question.questionTextString}
        />
      </div>
      <div className="explanation-content">
        <StructuredContentRenderer
          node={question.explanationText}
          stringContent={question.explanationTextString}
        />
      </div>
    </div>
  );
}
```

## 2. Updating Convex Functions

### Before Migration

```typescript
export const getQuestion = query({
  args: { id: v.id('questions') },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.id);
    if (!question) {
      throw new Error('Question not found');
    }

    // Use questionText directly as an object
    return {
      ...question,
      content: question.questionText.content,
    };
  },
});
```

### After Migration - Compatible with Both Formats

```typescript
export const getQuestion = query({
  args: { id: v.id('questions') },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.id);
    if (!question) {
      throw new Error('Question not found');
    }

    // Try the string field first, fallback to the object
    let content;
    if (question.questionTextString) {
      // Parse the string field
      const parsedText = JSON.parse(question.questionTextString);
      content = parsedText.content;
    } else {
      // Fallback to the object field
      content = question.questionText.content;
    }

    return {
      ...question,
      content,
    };
  },
});
```

## 3. Updating Form Submission

### Before Migration

```typescript
const handleSubmit = async data => {
  await api.questions.create({
    title: data.title,
    questionText: data.questionText, // Object format
    explanationText: data.explanationText, // Object format
    // Other fields...
  });
};
```

### After Migration - Writing to Both Fields

```typescript
const handleSubmit = async data => {
  // Stringify the content for the new fields
  const questionTextString = JSON.stringify(data.questionText);
  const explanationTextString = JSON.stringify(data.explanationText);

  await api.questions.create({
    title: data.title,
    // Maintain backward compatibility with objects
    questionText: data.questionText,
    explanationText: data.explanationText,
    // Also include the string versions
    questionTextString,
    explanationTextString,
    // Other fields...
  });
};
```

## 4. Final Migration - After All Code is Updated

Once you've updated all components to use the string fields, you can simplify
your data model:

```typescript
// Example of a fully migrated function
export const getQuestion = query({
  args: { id: v.id('questions') },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.id);
    if (!question) {
      throw new Error('Question not found');
    }

    // Only use the string field now that all code is updated
    const parsedText = JSON.parse(question.questionTextString);

    return {
      ...question,
      content: parsedText.content,
    };
  },
});
```

## Handling Edge Cases

### Missing String Fields in Old Records

```typescript
function getQuestionContent(question) {
  if (question.questionTextString) {
    return JSON.parse(question.questionTextString);
  }

  // Fallback for unmigrated records
  return question.questionText;
}
```

### Manual Content Conversion Helper

```typescript
// Utility function to get content in consistent format
function getContent(question, field) {
  // Field is either 'questionText' or 'explanationText'
  const stringField = `${field}String`;

  if (question[stringField]) {
    // If string field exists, parse it
    return JSON.parse(question[stringField]);
  } else if (typeof question[field] === 'string') {
    // If the original field is already a string, parse it
    return JSON.parse(question[field]);
  } else {
    // Original field is still an object
    return question[field];
  }
}
```
