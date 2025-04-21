import { TableAggregate } from '@convex-dev/aggregate';

import { components } from './_generated/api';
import { DataModel, Doc, Id } from './_generated/dataModel';

export const questionCountByThemeAggregate = new TableAggregate<{
  // Group counts by theme ID
  Namespace: Id<'themes'>;
  // Use creation time as the key for uniqueness
  Key: number;
  DataModel: DataModel;
  TableName: 'questions';
}>(
  // Use the component functions defined via convex.config.ts
  components.questionCountByThemeAggregate,
  {
    // Define how to extract the theme ID (namespace) from a question document
    namespace: (doc: Doc<'questions'>) => doc.themeId,
    // Use creation time as the sort key
    sortKey: (doc: Doc<'questions'>) => doc._creationTime,
  },
);
