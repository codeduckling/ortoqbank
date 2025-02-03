'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useThemeActions, useThemeStore } from './store';
import { ThemeList } from './theme-list';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
});

type FormData = z.infer<typeof formSchema>;

export function ThemeForm() {
  const { editingTheme, isDialogOpen, setDialogOpen } = useThemeStore();
  const { addTheme, updateTheme } = useThemeActions();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingTheme?.name ?? '',
    },
  });

  const onSubmit = (data: FormData) => {
    if (editingTheme) {
      updateTheme(editingTheme._id, data.name);
    } else {
      addTheme(data.name);
    }
    form.reset();
  };

  return (
    <>
      <ThemeList />

      <Dialog
        open={isDialogOpen}
        onOpenChange={open => {
          if (!open) {
            form.reset();
          }
          setDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTheme ? 'Editar Tema' : 'Novo Tema'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome do tema" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                {editingTheme ? 'Salvar' : 'Adicionar'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
