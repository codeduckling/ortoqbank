interface QuizFeedbackProps {
  isCorrect: boolean;
  explanationHtml: string;
  message?: string;
}

export default function QuizFeedback({
  isCorrect,
  explanationHtml,
  message,
}: QuizFeedbackProps) {
  // This component only handles the text feedback and explanation,
  // not the visual feedback for the alternatives
  return (
    <div
      className={`mt-6 rounded-lg border p-4 ${
        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
      }`}
    >
      <p className="font-semibold">
        {message || (isCorrect ? 'Correto! ✓' : 'Incorreto! ✗')}
      </p>
      <div
        className="prose mt-2 max-w-none"
        dangerouslySetInnerHTML={{ __html: explanationHtml }}
      />
    </div>
  );
}
