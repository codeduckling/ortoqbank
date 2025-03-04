'use client';

import { Book, BookOpen, CheckCircle, Clock } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface SimuladoItem {
  id: string;
  name: string;
  year: number;
  completion: number | undefined;
  status: 'not_started' | 'in_progress' | 'completed';
}

const teotSimulados: SimuladoItem[] = [
  { id: '1', name: 'TEOT', year: 2025, completion: 80, status: 'completed' },
  {
    id: '2',
    name: 'TEOT',
    year: 2024,
    completion: undefined,
    status: 'not_started',
  },
  {
    id: '3',
    name: 'TEOT',
    year: 2023,
    completion: undefined,
    status: 'not_started',
  },
];

const taroSimulados: SimuladoItem[] = [
  {
    id: '4',
    name: 'TARO',
    year: 2024,
    completion: undefined,
    status: 'not_started',
  },
  {
    id: '5',
    name: 'TARO',
    year: 2023,
    completion: undefined,
    status: 'not_started',
  },
  {
    id: '6',
    name: 'TARO',
    year: 2022,
    completion: undefined,
    status: 'not_started',
  },
];

const ortoqbankSimulados: SimuladoItem[] = [
  {
    id: '7',
    name: 'Simulado',
    year: 1,
    completion: undefined,
    status: 'not_started',
  },
  {
    id: '8',
    name: 'Simulado',
    year: 2,
    completion: undefined,
    status: 'not_started',
  },
];

function getStatusBadge(status: SimuladoItem['status']) {
  switch (status) {
    case 'completed': {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="mr-1 h-3 w-3" />
          Concluído
        </Badge>
      );
    }
    case 'in_progress': {
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          <Clock className="mr-1 h-3 w-3" />
          Em andamento
        </Badge>
      );
    }
    case 'not_started': {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          <BookOpen className="mr-1 h-3 w-3" />
          Não iniciado
        </Badge>
      );
    }
  }
}

function SimuladoList({
  title,
  items,
}: {
  title: string;
  items: SimuladoItem[];
}) {
  return (
    <AccordionItem value={title} className="overflow-hidde">
      <AccordionTrigger className="hover:bg-muted/20 px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-3">
          <Book className="h-5 w-5" />
          <span className="font-medium">{title}</span>
          <span className="text-muted-foreground text-sm">
            ({items.length} simulados)
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="divide-y">
          {items.map(simulado => (
            <div
              key={simulado.id}
              className="flex flex-col space-y-3 px-4 py-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {simulado.name} {simulado.year}
                    </h3>
                    {getStatusBadge(simulado.status)}
                  </div>

                  {simulado.completion !== undefined && (
                    <div className="mt-2 w-full max-w-md">
                      <div className="mb-1 flex justify-between">
                        <span className="text-xs">Aproveitamento</span>
                        <span className="text-xs font-medium">
                          {simulado.completion}%
                        </span>
                      </div>
                      <Progress value={simulado.completion} className="h-1.5" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {simulado.status === 'not_started' && (
                    <Button>Iniciar Simulado</Button>
                  )}

                  {simulado.status === 'in_progress' && (
                    <Button>Continuar Simulado</Button>
                  )}

                  {simulado.status === 'completed' && (
                    <>
                      <Button variant="outline">Refazer</Button>
                      <Button>Ver Resultados</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function SimuladoPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Simulados</h1>
      <Accordion type="single" collapsible className="space-y-4">
        <SimuladoList title="TEOT" items={teotSimulados} />
        <SimuladoList title="TARO" items={taroSimulados} />
        <SimuladoList title="OrtoQBank" items={ortoqbankSimulados} />
      </Accordion>
    </div>
  );
}
