'use client';

import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

// Debounce helper function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function GerenciarQuestoes() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearchQuery = useDebounce(searchInput, 500); // 500ms debounce delay

  // Use the searchByCode query when search is provided, otherwise show nothing
  const searchResults =
    useQuery(
      api.questions.searchByCode,
      debouncedSearchQuery.trim() ? { code: debouncedSearchQuery } : 'skip',
    ) || [];

  const handleView = (questionId: Id<'questions'>) => {
    router.push(`/admin/gerenciar-questoes/${questionId}`);
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Gerenciar Questões</h1>

      {/* Search Input */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar por código da questão..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="max-w-md"
        />
        {searchInput && (
          <Button variant="ghost" onClick={() => setSearchInput('')}>
            Limpar
          </Button>
        )}
      </div>

      {/* Search Instructions */}
      <p className="text-muted-foreground text-sm">
        Digite o código da questão para pesquisar. A busca será realizada após
        uma breve pausa na digitação.
      </p>

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
            {debouncedSearchQuery.trim() ? (
              searchResults.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground py-6 text-center"
                  >
                    Nenhuma questão encontrada com este código
                  </TableCell>
                </TableRow>
              ) : (
                searchResults.map(question => (
                  <TableRow key={question._id}>
                    <TableCell className="font-medium">
                      {question.questionCode || 'Sem código'}
                    </TableCell>
                    <TableCell>{question.title}</TableCell>
                    <TableCell>
                      {question.theme
                        ? question.theme.name
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
                ))
              )
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-6 text-center"
                >
                  Digite um código para pesquisar questões
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
