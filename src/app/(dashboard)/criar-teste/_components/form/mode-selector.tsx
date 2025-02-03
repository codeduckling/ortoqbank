'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ModeSelectorProps {
  isSimulado: boolean;
  onModeChange: (isSimulado: boolean) => void;
}

export function ModeSelector({ isSimulado, onModeChange }: ModeSelectorProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Modo</h2>
      <Tabs
        value={isSimulado ? 'simulado' : 'tutor'}
        onValueChange={value => onModeChange(value === 'simulado')}
      >
        <TabsList>
          <TabsTrigger value="simulado">Simulado</TabsTrigger>
          <TabsTrigger value="tutor">Tutor</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
