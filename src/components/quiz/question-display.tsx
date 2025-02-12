import { Check, X } from 'lucide-react';

import { renderContent } from '@/lib/utils/render-content';

import { ExamQuestion, OptionIndex } from './types';

function getOptionClassName(
  optionIndex: OptionIndex,
  question: ExamQuestion,
  isAnswered: boolean,
  showCorrect: boolean,
  currentAnswer?: OptionIndex,
  selectedOption?: OptionIndex,
): string {
  const baseClasses = 'p-4 rounded-lg border cursor-pointer transition-colors';

  if (isAnswered && showCorrect) {
    if (optionIndex === question.correctOptionIndex) {
      return `${baseClasses} border-green-500 bg-green-50`;
    }
    if (optionIndex === currentAnswer) {
      return `${baseClasses} border-red-500 bg-red-50`;
    }
  }

  if (optionIndex === selectedOption) {
    return `${baseClasses} border-blue-500 bg-blue-50`;
  }

  return `${baseClasses} hover:bg-gray-50`;
}

interface QuestionDisplayProps {
  question: ExamQuestion;
  selectedOption?: OptionIndex;
  isAnswered: boolean;
  currentAnswer?: OptionIndex;
  onOptionSelect: (optionIndex: OptionIndex) => void;
  showCorrect: boolean;
}

export function QuestionDisplay({
  question,
  selectedOption,
  isAnswered,
  currentAnswer,
  onOptionSelect,
  showCorrect,
}: QuestionDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="prose max-w-none">
        <div
          dangerouslySetInnerHTML={{
            __html: renderContent(question.questionText),
          }}
        />
      </div>

      <div className="space-y-2">
        {question.options.map((option, optionIndex) => (
          <div
            key={optionIndex}
            className={getOptionClassName(
              optionIndex as OptionIndex,
              question,
              isAnswered,
              showCorrect,
              currentAnswer,
              selectedOption,
            )}
            onClick={() => onOptionSelect(optionIndex as OptionIndex)}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">
                {String.fromCodePoint(65 + optionIndex)}
              </span>
              <span>{option.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
