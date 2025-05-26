# 📊 Question Filter and Selection System (Convex DB – Final Model)

This document outlines the complete strategy for filtering and selecting
questions efficiently using Convex DB. It includes a normalized model with
`themes`, `subthemes`, and `groups`, supports dynamic filtering, and uses
scalable techniques like random selection and aggregation for counting.

---

## 🧠 Concept Overview

The system has two main responsibilities:

1. **Provide a live count of how many questions match the user’s current
   filters.**
2. **Randomly select up to `numQuestions` from that filtered set for the user’s
   test** (executed only after clicking **Create Test**).

---

## 📌 Optimization with JavaScript `Set`

### Why It Matters

When resolving filters across multiple levels (`themes` → `subthemes` →
`groups`), using a `Set` instead of an `Array` offers:

- **Automatic deduplication** — avoids duplicates across levels
- **Faster lookup** — `Set.has()` is faster than `Array.includes()`
- **Simplified merging** — no need to check for duplicates manually

### Example Usage

```ts
const finalGroupIds = new Set<string>();

// Add directly selected groups
selectedGroups.forEach(id => finalGroupIds.add(id));

// Add groups under subthemes
for (const subthemeId of selectedSubthemes) {
  const groups = await db
    .query('groups')
    .withIndex('by_subtheme', q => q.eq('subthemeId', subthemeId))
    .collect();
  groups.forEach(group => finalGroupIds.add(group.groupId));
}

// Add groups under themes
for (const themeId of selectedThemes) {
  const subthemes = await db
    .query('subthemes')
    .withIndex('by_theme', q => q.eq('themeId', themeId))
    .collect();

  for (const sub of subthemes) {
    const groups = await db
      .query('groups')
      .withIndex('by_subtheme', q => q.eq('subthemeId', sub.subthemeId))
      .collect();
    groups.forEach(group => finalGroupIds.add(group.groupId));
  }
}

const groupArray = Array.from(finalGroupIds); // ready for aggregation/filtering
```

✅ Clean, fast, and scalable across large filter sets.

---

## ✅ Summary of Set Benefits

| Use Case                    | Benefit                           |
| --------------------------- | --------------------------------- |
| Deduplicating groupIds      | Automatic via `.add()`            |
| Checking existence          | Fast with `.has()` (O(1))         |
| Merging multi-level filters | Easy loop + `.add()`              |
| Passing to Convex filters   | Use `Array.from(set)` when needed |

---

## 📝 Example: User Form Data

```ts
export const testFormSchema = z.object({
  name: z.string().min(3).default('Personalizado'), // unrelated to filtering
  testMode: z.enum(['study', 'exam']), // unrelated to filtering
  questionMode: z.enum(['unanswered', 'incorrect', 'bookmarked', 'all']), // primary filter
  numQuestions: z.number().min(1).max(120).default(30), // how many questions to select
  selectedThemes: z.array(z.string()), // secondary filter
  selectedSubthemes: z.array(z.string()), // secondary filter
  selectedGroups: z.array(z.string()), // secondary filter
});
```

**Live count is updated in real time**, but **questions are only retrieved when
the user clicks “Create Test.”**

---

## 🔢 Count Matching Questions

```ts
const totalCount = await count(ctx, {
  table: 'questions',
  filter: q => q.or(groupArray.map(id => q.eq('groupId', id))),
});
```

**Note**: The live count implementation handles the full hierarchy (themes →
subthemes → groups) and respects that `groupId` is optional in questions. See
`convex/questionFiltering.ts` for the complete implementation.

**⚠️ CRITICAL PERFORMANCE FIXES**:

1. When no hierarchy filters are selected, the system uses aggregation queries
   instead of full table scans to avoid performance issues with large datasets
   (100k+ questions).
2. Filter resolution uses single queries with `.or()` filters instead of
   multiple individual queries in loops for better performance.
3. Question retrieval uses a single `.filter()` query with `.or()` instead of
   multiple indexed queries per group.

---

## 🎲 Select `numQuestions` Randomly

```ts
const rand = Math.random();
let questions = await db
  .query('questions')
  .withIndex('by_group', q => q.eq('groupId', oneGroupId))
  .filter(q => q.gt(q.field('randomKey'), rand))
  .take(numQuestions);
```

Loop through `finalGroupIds` as needed.

---

## ✅ Summary

| Task                | Approach                                   |
| ------------------- | ------------------------------------------ |
| Normalize taxonomy  | Use `themes`, `subthemes`, `groups` tables |
| Filter consistently | Resolve all filters to `groupId`           |
| Efficient counting  | Use `@convex-dev/aggregate` with `.or()`   |
| Efficient selection | Use `randomKey`, `.filter()`, `.take(n)`   |
| Indexing            | Index `groupId`, `subthemeId`, `themeId`   |
| Filter merging      | Use `Set` to deduplicate groupIds          |

---

## 🧠 Concise Summary: Filter Logic Resolution

This system supports filtering questions by `themeId`, `subthemeId`, and
`groupId`. To ensure specificity and avoid overlaps, we apply the following
rules:

1. **User selects from any level** (theme, subtheme, or group).
2. **More specific filters override broader ones**:
   - If a group is selected → its subtheme and theme are ignored.
   - If a subtheme is selected → its parent theme is ignored.
3. **All filters are resolved to groupIds** before querying the `questions`
   table.
4. **Final query** uses only `groupId` field with an `.or()` filter for
   performance and simplicity.
5. **Set** is used to deduplicate groupIds and simplify merging across selection
   levels.
6. **Live count** is shown dynamically, but questions are only fetched after the
   user clicks **Create Test**.

**Example Resolution**: User selects:

```ts
{
  selectedThemes: ["themeC"],
  selectedSubthemes: ["subthemeAB"],
  selectedGroups: ["groupB4A", "groupBB2", "groupBCB"]
}
```

Final result includes:

- All questions with `groupId` in the selected group list.
- All questions under `subthemeAB` (resolved to its groups).
- All questions under `themeC` (resolved to all groups under it).

This ensures correctness, deduplication, and efficient querying with minimal
Convex index use.
