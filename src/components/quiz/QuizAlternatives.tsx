import { AlternativeIndex } from './types';

interface QuizAlternativesProps {
  alternatives: string[];
  selectedAlternative: AlternativeIndex | undefined;
  onSelect: (index: AlternativeIndex) => void;
  disabled: boolean;
}

export default function QuizAlternatives({
  alternatives,
  selectedAlternative,
  onSelect,
  disabled,
}: QuizAlternativesProps) {
  return (
    <div className="mt-4 space-y-2">
      {alternatives.map((alternative, i) => (
        <button
          key={i}
          onClick={() => onSelect(i as AlternativeIndex)}
          disabled={disabled}
          className={`w-full rounded-lg border p-4 text-left hover:bg-gray-50 ${
            selectedAlternative === i ? 'border-blue-500 bg-blue-50' : ''
          }`}
        >
          {alternative}
        </button>
      ))}
    </div>
  );
}
