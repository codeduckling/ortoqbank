import { useQuery } from 'convex/react';

import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

export default function useSession(
  quizId: Id<'presetQuizzes'> | Id<'customQuizzes'>,
) {
  const progress = useQuery(api.quizSessions.getCurrentSession, { quizId });
  return progress;
}
