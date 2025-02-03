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

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
});

type FormData = z.infer<typeof formSchema>;

export function SubthemeDialog() {
  const { isSubthemeDialogOpen, activeThemeId, setSubthemeDialogOpen } =
    useThemeStore();
  const { addSubtheme } = useThemeActions();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: FormData) => {
    if (!activeThemeId) return;
    await addSubtheme(activeThemeId, data.name);
    form.reset();
  };

  return (
    <Dialog
      open={isSubthemeDialogOpen}
      onOpenChange={open => {
        if (!open) {
          form.reset();
        }
        setSubthemeDialogOpen(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Subtema</DialogTitle>
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
                    <Input {...field} placeholder="Nome do subtema" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Adicionar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
