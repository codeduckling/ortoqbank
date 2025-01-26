'use client';

import { QuestionForm } from './question-form';

export default function CreateQuestion() {
  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Criar Nova Questão</h1>
      <QuestionForm />
    </div>
  );
}
