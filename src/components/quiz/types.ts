import { Id } from '../../../convex/_generated/dataModel';

export interface ExamQuestion {
  _id: Id<'questions'>;
  title: string;
  questionText: {
    type: string;
    content: any[];
  };
  options: { text: string }[];
  correctOptionIndex: number;
  explanationText: {
    type: string;
    content: any[];
  };
}

export type QuizMode = 'study' | 'exam';

export type OptionIndex = 0 | 1 | 2 | 3;
