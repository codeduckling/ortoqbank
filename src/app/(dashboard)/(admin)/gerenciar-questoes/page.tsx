'use client';

import { usePaginatedQuery } from 'convex/react';
import { useRouter } from 'next/navigation';

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
import { Id } from '../../../../../convex/_generated/dataModel';

const ITEMS_PER_PAGE = 200;

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
  const router = useRouter();
  const {
    results: questions,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.questions.list,
    {},
    { initialNumItems: ITEMS_PER_PAGE },
  );

  const handleView = (questionId: Id<'questions'>) => {
    router.push(`/gerenciar-questoes/${questionId}`);
  };

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

                <TableCell className="space-x-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(question._id)}
                  >
                    Visualizar
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
