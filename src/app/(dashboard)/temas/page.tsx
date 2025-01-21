'use client';

import { BarChart2, ChevronDown, Play, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const categories = [
  {
    title: 'Ciências Básicas',
    topics: [
      {
        title: 'Amputação e Discrepância de Membros',
        id: 'amp-disc-membros',
      },
      {
        title: 'Infecção na Ortopedia',
        id: 'infec-orto',
      },
      'Osteoporose e Medicina Esportiva',
      'Politraumatismo e Fraturas Expostas',
      'Princípios de Osteossíntese',
      'Pseudartrose',
      'Síndrome Compartimental',
    ],
  },
  {
    title: 'Coluna',
    topics: ['Cervicalgia', 'Lombalgia', 'Trauma Raquimedular'],
  },
  {
    title: 'Joelho',
    topics: ['Artrose', 'Lesões Ligamentares', 'Lesões Meniscais'],
  },
  {
    title: 'Mão',
    topics: ['Lesões Tendíneas', 'Síndrome do Túnel do Carpo', 'Trauma'],
  },
  {
    title: 'Ombro e Cotovelo',
    topics: [
      'Lesão do Manguito Rotador',
      'Instabilidade Glenoumeral',
      'Epicondilite',
    ],
  },
  {
    title: 'Ortopedia Pediátrica',
    topics: [
      'Displasia do Desenvolvimento do Quadril',
      'Pé Torto Congênito',
      'Escoliose',
    ],
  },
  {
    title: 'Pé e Tornozelo',
    topics: ['Fasceíte Plantar', 'Hallux Valgus', 'Lesões Ligamentares'],
  },
  {
    title: 'Quadril',
    topics: ['Artrose', 'Fraturas do Fêmur Proximal', 'Necrose Avascular'],
  },
  {
    title: 'Tumores',
    topics: [
      'Tumores Ósseos Benignos',
      'Tumores Ósseos Malignos',
      'Lesões Metastáticas',
    ],
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Temas</h1>
      <div className="space-y-2">
        {categories.map(category => (
          <Collapsible key={category.title} className="w-full">
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-gray-100 bg-white p-4 text-left text-lg shadow-sm hover:bg-gray-50">
              {category.title}
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent className="rounded-b-lg bg-white px-4 py-2">
              <div className="space-y-4">
                {category.topics.map(topic => (
                  <div
                    key={typeof topic === 'string' ? topic : topic.id}
                    className="border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Search className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-1 text-base font-medium">
                          {typeof topic === 'string' ? topic : topic.title}
                        </h3>
                        <p className="mb-2 text-sm text-gray-600">
                          Sua nota: 0,0
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              typeof topic !== 'string' &&
                              router.push(`/dashboard/simulation/${topic.id}`)
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
                          <Button variant="outline" size="sm">
                            Refazer simulado
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
