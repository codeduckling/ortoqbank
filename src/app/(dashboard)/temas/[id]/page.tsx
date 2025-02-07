import { Id } from '../../../../../convex/_generated/dataModel';
import { QuizContent } from './quiz';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuizPage({ params }: PageProps) {
  const { id } = await params;
  return <QuizContent examId={id as Id<'presetExams'>} />;
}
