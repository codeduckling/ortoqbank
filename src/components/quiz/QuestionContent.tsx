import StructuredContentRenderer, {
  ContentNode,
} from '../common/StructuredContentRenderer';

interface QuestionContentProps {
  content: ContentNode | null | undefined; // Use the imported type and allow null/undefined
}

export default function QuestionContent({ content }: QuestionContentProps) {
  return (
    <div className="prose max-w-none">
      <StructuredContentRenderer node={content} />
    </div>
  );
}
