'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';

import { THEMES } from '../../../../convex/constants';

const subjects = [
  { id: 'anatomia', label: 'Anatomia', count: 0 },
  { id: 'exame-fisico', label: 'Exame Físico', count: 0 },
  { id: 'ortopedia', label: 'Ortopedia', count: 0 },
  { id: 'trauma', label: 'Trauma', count: 0 },
];

const baseThemes = THEMES.map(theme => ({
  id: theme.name,
  label: theme.label,
  count: 0,
}));

export function CreateTestForm() {
  const [isSimulado, setIsSimulado] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [questionCount] = useState(0);

  const handleSubmit = () => {
    console.log({
      mode: isSimulado ? 'simulado' : 'tutor',
      subjects: selectedSubjects,
      themes: selectedThemes,
      questionCount,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold">Modo</h2>
        <Tabs
          defaultValue="simulado"
          value={isSimulado ? 'simulado' : 'tutor'}
          onValueChange={value => setIsSimulado(value === 'simulado')}
          className="w-full"
        >
          <TabsList className="grid w-52 grid-cols-2">
            <TabsTrigger value="simulado">Simulado</TabsTrigger>
            <TabsTrigger value="tutor">Tutor</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Matérias</h2>
        <div className="flex flex-wrap gap-2">
          {subjects.map(subject => (
            <Toggle
              key={subject.id}
              variant="outline"
              size="default"
              pressed={selectedSubjects.includes(subject.id)}
              onPressedChange={pressed => {
                if (pressed) {
                  setSelectedSubjects([...selectedSubjects, subject.id]);
                } else {
                  setSelectedSubjects(
                    selectedSubjects.filter(id => id !== subject.id),
                  );
                }
              }}
            >
              {subject.label}
              <span className="ml-2 text-xs opacity-70">({subject.count})</span>
            </Toggle>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Temas</h2>
        <div className="flex flex-wrap gap-2">
          {baseThemes.map(theme => (
            <Toggle
              key={theme.id}
              variant="outline"
              size="default"
              pressed={selectedThemes.includes(theme.id)}
              onPressedChange={pressed => {
                if (pressed) {
                  setSelectedThemes([...selectedThemes, theme.id]);
                } else {
                  setSelectedThemes(
                    selectedThemes.filter(id => id !== theme.id),
                  );
                }
              }}
            >
              {theme.label}
              <span className="ml-2 text-xs opacity-70">({theme.count})</span>
            </Toggle>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{questionCount}</span>
          <span className="text-gray-500">Questões</span>
        </div>
        <Button
          onClick={handleSubmit}
          className="bg-[hsl(var(--sidebar-background))] hover:bg-[hsl(var(--sidebar-background))/0.9]"
        >
          Gerar Teste
        </Button>
      </div>
    </div>
  );
}
