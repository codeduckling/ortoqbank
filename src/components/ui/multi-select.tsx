'use client';

import { Command as CommandPrimitive } from 'cmdk';
import { X } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Selecione...',
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (value: string) => {
    onChange(selected.filter(s => s !== value));
  };

  return (
    <Command className="overflow-visible bg-transparent">
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map(value => {
            const option = options.find(o => o.value === value);
            return (
              <Badge key={value} variant="secondary">
                {option?.label}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleUnselect(value);
                    }
                  }}
                  onMouseDown={e => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(value)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder={placeholder}
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {options.map(option => {
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      onChange(
                        selected.includes(option.value)
                          ? selected.filter(s => s !== option.value)
                          : [...selected, option.value],
                      );
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  );
}
