'use client';

import { BarChart2, ChevronDown, Play, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { THEMES } from '../../../../convex/constants';

// Mock data for exams with Convex-like IDs
const mockExams = THEMES.reduce<
  Record<string, Array<{ _id: string; title: string; description?: string }>>
>((accumulator, theme) => {
  accumulator[theme.name] = [
    {
      _id: 'mn7f8b3s46kakfxcah56n2d781797g6e',
      title: `Simulado ${theme.label} - Básico`,
      description: '10 questões sobre conceitos básicos',
    },
    {
      _id: 'xn9g8c4t57lbmgydbi67n3e892898h7f',
      title: `Simulado ${theme.label} - Avançado`,
      description: '20 questões sobre casos complexos',
    },
  ];
  return accumulator;
}, {});

export default function ThemesPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Temas</h1>
      <div className="space-y-2">
        {THEMES.map(theme => (
          <Collapsible key={theme.name} className="w-full">
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-gray-100 bg-white p-4 text-left text-lg shadow-sm hover:bg-gray-50">
              {theme.label}
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent className="rounded-b-lg bg-white px-4 py-2">
              <div className="space-y-4">
                {mockExams[theme.name]?.map(exam => (
                  <div
                    key={exam._id}
                    className="border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Search className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-1 text-base font-medium">
                          {exam.title}
                        </h3>
                        {exam.description && (
                          <p className="mb-2 text-sm text-gray-600">
                            {exam.description}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              router.push(`/simulados/${exam._id}`)
                            }
                            className="bg-[#2196F3] text-white hover:bg-[#1976D2]"
                          >
                            <Play className="mr-1 h-4 w-4" />
                            Iniciar Simulado
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-zinc-900 text-white hover:bg-zinc-800"
                          >
                            <BarChart2 className="mr-1 h-4 w-4" />
                            Ver resultados
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
