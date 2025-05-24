import { TableAggregate } from '@convex-dev/aggregate';

import { components } from './_generated/api';
import { DataModel, Id } from './_generated/dataModel';

// This tracks the number of questions answered by each user
const answeredByUser = new TableAggregate<{
  Namespace: Id<'users'>;
  Key: Id<'questions'>;
  DataModel: DataModel;
  TableName: 'user_answers';
}>(components.answeredByUser, {
  namespace: (d: unknown) => (d as { userId: Id<'users'> }).userId,
  sortKey: (d: unknown) => (d as { questionId: Id<'questions'> }).questionId,
});

export default answeredByUser;
