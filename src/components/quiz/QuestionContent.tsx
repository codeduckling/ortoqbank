import { renderContent } from '@/lib/utils/render-content';

interface QuestionContentProps {
  content: any; // Use a more specific type if available
}

export default function QuestionContent({ content }: QuestionContentProps) {
  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{
        __html: renderContent(content),
      }}
    />
  );
}
