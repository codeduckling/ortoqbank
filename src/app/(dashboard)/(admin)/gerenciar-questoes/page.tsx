'use client';

import { usePaginatedQuery } from 'convex/react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { api } from '../../../../../convex/_generated/api';

const ITEMS_PER_PAGE = 10;

const getButtonText = (status: string) => {
  switch (status) {
    case 'LoadingMore': {
      return 'Carregando...';
    }
    case 'CanLoadMore': {
      return 'Carregar Mais';
    }
    default: {
      return 'Não há mais questões';
    }
  }
};

export default function GerenciarQuestoes() {
  const {
    results: questions,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.questions.list,
    {},
    { initialNumItems: ITEMS_PER_PAGE },
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Gerenciar Questões</h1>

      {/* Questions Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tema</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions?.map(question => (
              <TableRow key={question._id}>
                <TableCell className="font-medium">{question.title}</TableCell>
                <TableCell>
                  {question.theme?.name ?? 'Tema não encontrado'}
                </TableCell>
                <TableCell>
                  {question.isPublic ? 'Publicada' : 'Rascunho'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Load More Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => loadMore(ITEMS_PER_PAGE)}
          disabled={status !== 'CanLoadMore'}
        >
          {getButtonText(status)}
        </Button>
      </div>
    </div>
  );
}
