'use client';

import { useQuery } from 'convex/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

import { api } from '../../../../convex/_generated/api';

export function CreateTestForm() {
  const [isSimulado, setIsSimulado] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedSubtheme, setSelectedSubtheme] = useState<string | null>(null);

  // Fetch data from Convex
  const themes = useQuery(api.themes.list);
  const subthemes = useQuery(
    api.themes.getWithSubthemes,
    selectedTheme ? { themeId: selectedTheme } : 'skip',
  );
  const questionCounts = useQuery(api.questions.getThemeCounts);

  const handleSubmit = () => {
    if (!selectedTheme || !selectedSubtheme) return;

    console.log({
      mode: isSimulado ? 'simulado' : 'tutor',
      themeId: selectedTheme,
      subthemeId: selectedSubtheme,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold">Modo</h2>
        <Tabs
          value={isSimulado ? 'simulado' : 'tutor'}
          onValueChange={value => setIsSimulado(value === 'simulado')}
        >
          <TabsList>
            <TabsTrigger value="simulado">Simulado</TabsTrigger>
            <TabsTrigger value="tutor">Tutor</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Temas</h2>
        <div className="flex flex-wrap gap-2">
          {themes?.map(theme => (
            <Toggle
              key={theme._id}
              variant="primary"
              size="default"
              pressed={selectedTheme === theme._id}
              onPressedChange={pressed => {
                setSelectedTheme(pressed ? theme._id : null);
                setSelectedSubtheme(null);
              }}
            >
              {theme.name}
              <span className="ml-2 text-xs opacity-70">
                ({questionCounts?.[theme.name] ?? 0})
              </span>
            </Toggle>
          ))}
        </div>
      </div>

      {selectedTheme && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Subtemas</h2>
          <div className="flex flex-wrap gap-2">
            {subthemes?.subthemes?.map(subtheme => (
              <Toggle
                key={subtheme._id}
                variant="primary"
                size="default"
                pressed={selectedSubtheme === subtheme._id}
                onPressedChange={pressed => {
                  setSelectedSubtheme(pressed ? subtheme._id : null);
                }}
              >
                {subtheme.name}
              </Toggle>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          onClick={handleSubmit}
          disabled={!selectedTheme || !selectedSubtheme}
          className={cn(
            'bg-[hsl(var(--sidebar-background))]',
            'hover:bg-[hsl(var(--sidebar-background))/0.9]',
          )}
        >
          Gerar Teste
        </Button>
      </div>
    </div>
  );
}
