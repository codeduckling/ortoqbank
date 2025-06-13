'use client';

import { InfoIcon as InfoCircle } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TestModeSelectorProps = {
  value: string;
  onChange: (value: 'study' | 'exam') => void;
};

export function TestModeSelector({ value, onChange }: TestModeSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium">Modo</h3>
        <Popover>
          <PopoverTrigger asChild>
            <InfoCircle className="text-muted-foreground h-4 w-4 cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent className="max-w-xs border border-black">
            <p>
              Modo Simulado simula condições de prova, enquanto Modo Estudo
              permite revisar respostas imediatamente.
            </p>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-start">
        <Tabs value={value} onValueChange={onChange as (value: string) => void}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger
              value="exam"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Simulado
            </TabsTrigger>
            <TabsTrigger
              value="study"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Estudo
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
