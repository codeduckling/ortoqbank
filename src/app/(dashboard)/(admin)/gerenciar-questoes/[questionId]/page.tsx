'use client';

import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { renderContent } from '@/lib/utils/render-content';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { QuestionForm } from '../../criar-questao/_components/question-form';

export default function ViewQuestion() {
  const params = useParams();
  const questionId = params.questionId as Id<'questions'>;
  const [isEditing, setIsEditing] = useState(false);

  const question = useQuery(api.questions.getById, { id: questionId });

  if (!question) {
    return <div className="p-6">Carregando...</div>;
  }

  if (isEditing) {
    return (
      <div className="p-6">
        <div className="mb-6 flex justify-between">
          <h1 className="text-2xl font-bold">Editar Questão</h1>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancelar
          </Button>
        </div>
        <QuestionForm defaultValues={question} mode="edit" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{question.title}</h1>
        <div className="space-x-2">
          <Button onClick={() => setIsEditing(true)}>Editar</Button>
          <Button variant="outline" onClick={() => globalThis.history.back()}>
            Voltar
          </Button>
        </div>
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
            {question.alternatives?.map((alternative, index) => (
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
