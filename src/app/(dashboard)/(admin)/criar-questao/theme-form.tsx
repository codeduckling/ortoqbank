'use client';

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

import { api } from '../../../../../convex/_generated/api';

interface ThemeFormProps {
  showSubthemes?: boolean;
}

export function ThemeForm({ showSubthemes = false }: ThemeFormProps) {
  const createTheme = useMutation(api.themes.create);
  const createSubtheme = useMutation(api.themes.createSubtheme);
  const themes = useQuery(api.themes.list);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (data: { name: string }) => {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showSubthemes && (
          <div className="flex flex-wrap gap-2">
            {themes?.map(theme => (
              <Button
                key={theme._id}
                variant={selectedTheme === theme._id ? 'default' : 'outline'}
                onClick={() =>
                  setSelectedTheme(
                    selectedTheme === theme._id ? null : theme._id,
                  )
                }
              >
                {theme.name}
              </Button>
            ))}
          </div>
        )}

        <Button type="submit" className="w-full">
          {selectedTheme ? 'Criar Subtema' : 'Criar Tema'}
        </Button>
      </form>
    </Form>
  );
}
