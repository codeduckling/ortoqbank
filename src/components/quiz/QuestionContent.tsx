import StructuredContentRenderer, {
  ContentNode,
} from '../common/StructuredContentRenderer';

interface QuestionContentProps {
  content: ContentNode | string | null | undefined; // Updated to accept string format as well
  stringContent?: string | null | undefined; // Support for the new stringContent field
}

export default function QuestionContent({
  content,
  stringContent,
}: QuestionContentProps) {
  return (
    <div className="prose max-w-none">
      <StructuredContentRenderer node={content} stringContent={stringContent} />
    </div>
  );
}
