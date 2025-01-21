'use client';

import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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

function SimuladoList({
  title,
  items,
}: {
  title: string;
  items: SimuladoItem[];
}) {
  return (
    <Collapsible className="mb-4 w-full">
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">{title}</CardTitle>
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="divide-y">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {item.name} {item.year}
                    </span>
                    {item.completion !== undefined && (
                      <span className="text-sm text-gray-500">
                        {item.completion}% acerto
                      </span>
                    )}
                    {item.completion === undefined && (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {item.status === 'completed' && (
                      <>
                        <Button variant="outline" size="sm">
                          Respostas
                        </Button>
                        <Button variant="outline" size="sm">
                          Refazer
                        </Button>
                      </>
                    )}
                    {item.status === 'not_started' && (
                      <Button variant="outline" size="sm">
                        Fazer
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function SimuladoPage() {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Simulados</h1>
      <div className="space-y-4">
        <SimuladoList title="TEOT" items={teotSimulados} />
        <SimuladoList title="TARO" items={taroSimulados} />
        <SimuladoList title="Simulados OrtoQBank" items={ortoqbankSimulados} />
      </div>
    </div>
  );
}
