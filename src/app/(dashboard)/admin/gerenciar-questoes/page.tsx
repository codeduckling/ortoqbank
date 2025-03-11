'use client';

import { usePaginatedQuery, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    results: questions,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.questions.list,
    {},
    { initialNumItems: ITEMS_PER_PAGE },
  );

  // Get all questions to perform client-side filtering
  const allQuestions = useQuery(api.questions.listAll) || [];
  // Fetch all themes
  const themes = useQuery(api.themes.list) || [];

  // Create a theme lookup map for quick access
  const themesMap = new Map(themes.map(theme => [theme._id, theme]));

  // Filter questions based on search query
  const filteredQuestions = searchQuery
    ? allQuestions
        .filter(
          q =>
            q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (q.questionCode &&
              q.questionCode.toLowerCase().includes(searchQuery.toLowerCase())),
        )
        .slice(0, ITEMS_PER_PAGE) // Limit to 10 items
    : questions;

  const handleView = (questionId: Id<'questions'>) => {
    router.push(`/admin/gerenciar-questoes/${questionId}`);
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Gerenciar Questões</h1>

      {/* Search Input */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar por código ou título..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        {searchQuery && (
          <Button variant="ghost" onClick={() => setSearchQuery('')}>
            Limpar
          </Button>
        )}
      </div>

      {/* Questions Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Código</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tema</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions?.map(question => (
              <TableRow key={question._id}>
                <TableCell className="font-medium">
                  {question.questionCode || 'Sem código'}
                </TableCell>
                <TableCell>{question.title}</TableCell>
                <TableCell>
                  {question.themeId
                    ? themesMap.get(question.themeId)?.name ||
                      'Tema não encontrado'
                    : 'Tema não encontrado'}
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
            {filteredQuestions?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-6 text-center"
                >
                  Nenhuma questão encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Load More Button - Only show when not searching */}
      {!searchQuery && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => loadMore(ITEMS_PER_PAGE)}
            disabled={status !== 'CanLoadMore'}
          >
            {getButtonText(status)}
          </Button>
        </div>
      )}
    </div>
  );
}
