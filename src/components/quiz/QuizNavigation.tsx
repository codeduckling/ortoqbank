import { Button } from '@/components/ui/button';

interface QuizNavigationProps {
  mode: 'study' | 'exam';
  isFirst: boolean;
  isLast: boolean;
  hasAnswered: boolean;
  hasSelectedOption: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export default function QuizNavigation({
  mode,
  isFirst,
  isLast,
  hasAnswered,
  hasSelectedOption,
  onPrevious,
  onNext,
  onSubmit,
}: QuizNavigationProps) {
  return (
    <div className="mt-4 flex justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={mode === 'exam' || isFirst}
      >
        Voltar
      </Button>
      {mode === 'study' && hasAnswered ? (
        <Button onClick={onNext}>
          {isLast ? 'Finalizar' : 'Próxima Questão'}
        </Button>
      ) : (
        <Button onClick={onSubmit} disabled={!hasSelectedOption}>
          {mode === 'exam' && isLast ? 'Finalizar' : 'Confirmar'}
        </Button>
      )}
    </div>
  );
}
