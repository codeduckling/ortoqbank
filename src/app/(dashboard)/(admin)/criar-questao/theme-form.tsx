'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { ThemeFormData, themeSchema } from './schema';

interface ThemeFormProps {
  showSubthemes?: boolean;
}

export function ThemeForm({ showSubthemes = false }: ThemeFormProps) {
  const createTheme = useMutation(api.themes.create);
  const createSubtheme = useMutation(api.themes.createSubtheme);
  const themes = useQuery(api.themes.list);
  const [selectedTheme, setSelectedTheme] = useState<
    Id<'themes'> | undefined
  >();
  const selectedThemeData = useQuery(
    api.themes.getWithSubthemes,
    selectedTheme ? { themeId: selectedTheme } : 'skip',
  );

  const form = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (data: ThemeFormData) => {
    try {
      await (selectedTheme
        ? createSubtheme({
            themeId: selectedTheme,
            name: data.name,
          })
        : createTheme({
            name: data.name,
          }));
      form.reset();
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedTheme ? 'Nome do Subtema' : 'Nome do Tema'}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {selectedTheme ? 'Criar Subtema' : 'Criar Tema'}
            </Button>
          </form>
        </Form>
      </div>

      {showSubthemes && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {themes?.map(theme => (
              <Button
                key={theme._id}
                variant={selectedTheme === theme._id ? 'default' : 'outline'}
                onClick={() =>
                  setSelectedTheme(
                    selectedTheme === theme._id ? undefined : theme._id,
                  )
                }
              >
                {theme.name}
                <span className="ml-2 text-xs opacity-70">
                  ({theme.subthemeCount})
                </span>
              </Button>
            ))}
          </div>

          {selectedThemeData && (
            <div className="rounded-md border p-4">
              <h3 className="mb-2 font-medium">
                Subtemas de {selectedThemeData.theme?.name}
              </h3>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {selectedThemeData.subthemes?.map(subtheme => (
                    <div
                      key={subtheme._id}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <span>{subtheme.name}</span>
                    </div>
                  ))}
                  {selectedThemeData.subthemes?.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhum subtema criado
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
