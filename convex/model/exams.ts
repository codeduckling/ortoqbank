import { Id } from '../_generated/dataModel';
import {
  type MutationCtx as MutationContext,
  type QueryCtx as QueryContext,
} from '../_generated/server';

export type ExamInput = {
  title: string;
  description?: string;
  theme: string;
  questionIds: Id<'questions'>[];
  isPublished: boolean;
};

export async function createExam(
  context: MutationContext,
  examData: ExamInput,
) {
  const timestamp = Date.now();

  return await context.db.insert('exams', {
    ...examData,
    updatedAt: timestamp,
  });
}

export async function getExamById(context: QueryContext, examId: Id<'exams'>) {
  return await context.db.get(examId);
}
