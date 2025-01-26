'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';

import { PieChartDemo } from './pie-chart-demo';
import { ThemeBarChart } from './theme-bar-chart';

const subjects = [
  { id: 'anatomia', label: 'Anatomia', count: 0, selected: false },
  { id: 'exame-fisico', label: 'Exame Físico', count: 0, selected: false },
  { id: 'ortopedia', label: 'Ortopedia', count: 0, selected: false },
  { id: 'trauma', label: 'Trauma', count: 0, selected: false },
];

const topics = [
  { id: 'basicas', label: 'Básicas', count: 0, progress: 0 },
  { id: 'tumor', label: 'Tumor', count: 0, progress: 0 },
  { id: 'coluna', label: 'Coluna', count: 0, progress: 0 },
  { id: 'mao', label: 'Mão', count: 0, progress: 0 },
  { id: 'ombro', label: 'Ombro', count: 0, progress: 0 },
  { id: 'joelho', label: 'Joelho', count: 0, progress: 0 },
  { id: 'quadril', label: 'Quadril', count: 0, progress: 0 },
  { id: 'pe', label: 'Pé', count: 0, progress: 0 },
];

export default function CriarTestePage() {
  const isMobile = useIsMobile();
  const [isSimulado, setIsSimulado] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(0);

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Criar Teste</h1>

      <div
        className={`mb-8 grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}
      >
        <PieChartDemo />

        <div className="row-span-1">
          <ThemeBarChart />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Modo</h2>
        <div className="flex items-center gap-4">
          <span
            className={`text-sm ${isSimulado ? 'text-blue-600' : 'text-gray-500'}`}
          >
            Simulado
          </span>
          <Switch
            checked={!isSimulado}
            onCheckedChange={checked => setIsSimulado(!checked)}
          />
          <span
            className={`text-sm ${isSimulado ? 'text-gray-500' : 'text-blue-600'}`}
          >
            Tutor
          </span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Matérias</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {subjects.map(subject => (
            <div key={subject.id} className="flex items-center space-x-2">
              <Checkbox
                id={subject.id}
                checked={selectedSubjects.includes(subject.id)}
                onCheckedChange={checked => {
                  if (checked) {
                    setSelectedSubjects([...selectedSubjects, subject.id]);
                  } else {
                    setSelectedSubjects(
                      selectedSubjects.filter(id => id !== subject.id),
                    );
                  }
                }}
              />
              <label htmlFor={subject.id} className="flex-1 text-sm">
                {subject.label}
                <span className="ml-2 text-gray-500">({subject.count})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Temas</h2>
        <div className="space-y-4">
          {topics.map(topic => (
            <div key={topic.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={topic.id}
                    checked={selectedTopics.includes(topic.id)}
                    onCheckedChange={checked => {
                      if (checked) {
                        setSelectedTopics([...selectedTopics, topic.id]);
                      } else {
                        setSelectedTopics(
                          selectedTopics.filter(id => id !== topic.id),
                        );
                      }
                    }}
                  />
                  <label htmlFor={topic.id} className="text-sm">
                    {topic.label}
                    <span className="ml-2 text-gray-500">({topic.count})</span>
                  </label>
                </div>
                <Progress value={topic.progress} className="w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{questionCount}</span>
          <span className="text-gray-500">Questões</span>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">Gerar Teste</Button>
      </div>
    </div>
  );
}
