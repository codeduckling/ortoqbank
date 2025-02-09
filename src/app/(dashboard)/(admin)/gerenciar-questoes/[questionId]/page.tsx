'use client';

import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { renderContent } from '@/lib/utils/render-content';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';

export default function ViewQuestion() {
  const params = useParams();
  const questionId = params.questionId as Id<'questions'>;

  const question = useQuery(api.questions.getById, { id: questionId });

  if (!question) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{question.title}</h1>
        <Button variant="outline" onClick={() => globalThis.history.back()}>
          Voltar
        </Button>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Pergunta:</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: renderContent(question.questionText),
            }}
          />
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Opções:</h2>
          <ul className="space-y-2">
            {question.options.map((option, index) => (
              <li
                key={index}
                className={
                  index === question.correctOptionIndex
                    ? 'font-medium text-green-600'
                    : ''
                }
              >
                {index + 1}. {option.text}
                {index === question.correctOptionIndex && ' (Correta)'}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Explicação:</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: renderContent(question.explanationText),
            }}
          />
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
