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

export interface QuizModeProps {
  questions: ExamQuestion[];
  name: string;
  onAnswer: (
    questionId: Id<'questions'>,
    answer: number,
    isCorrect: boolean,
  ) => Promise<void>;
  onComplete: () => Promise<void>;
  currentIndex: number;
}

export type StudyModeProps = QuizModeProps;
export type ExamModeProps = QuizModeProps;
