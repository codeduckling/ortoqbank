'use client';

import QuestionContent from '@/components/quiz/QuestionContent';
import { Button } from '@/components/ui/button';

interface QuestionDisplayProps {
  question: any; // Replace with proper type when available
  onEdit: () => void;
  onBack: () => void;
}

export function QuestionDisplay({
  question,
  onEdit,
  onBack,
}: QuestionDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{question.title}</h1>
        <div className="space-x-2">
          <Button onClick={onEdit}>Editar</Button>
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Pergunta:</h2>
          <QuestionContent content={question.questionText} />
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Opções:</h2>
          <ul className="space-y-2">
            {question.alternatives?.map(
              (alternative: string, index: number) => (
                <li
                  key={index}
                  className={
                    index === question.correctAlternativeIndex
                      ? 'font-medium text-green-600'
                      : ''
                  }
                >
                  {index + 1}. {alternative}
                  {index === question.correctAlternativeIndex && ' (Correta)'}
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Explicação:</h2>
          <QuestionContent content={question.explanationText} />
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Informações Adicionais:</h2>
          <p>Tema: {question.theme?.name}</p>
          {question.subtheme && <p>Subtema: {question.subtheme.name}</p>}
          <p>Status: {question.isPublic ? 'Publicada' : 'Rascunho'}</p>
        </div>
      </div>
    </div>
  );
}
