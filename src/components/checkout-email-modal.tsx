'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import useMercadoPago from '@/hooks/useMercadoPago';

const formSchema = z
  .object({
    email: z.string().email('Email inválido'),
    confirmEmail: z.string().email('Email inválido'),
  })
  .refine(data => data.email === data.confirmEmail, {
    message: 'Os emails não coincidem',
    path: ['confirmEmail'],
  });

type FormValues = z.infer<typeof formSchema>;

interface CheckoutEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CheckoutEmailModal({
  open,
  onOpenChange,
}: CheckoutEmailModalProps) {
  const { createMercadoPagoCheckout } = useMercadoPago();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      confirmEmail: '',
    },
  });

  const handlePurchase = (values: FormValues) => {
    createMercadoPagoCheckout({
      userEmail: values.email,
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Informe seu email para continuar</DialogTitle>
          <DialogDescription>
            Após a confirmação do pagamento, enviaremos um link de acesso para
            este email para que você possa completar seu cadastro e começar a
            usar a plataforma.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handlePurchase)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="seu.email@exemplo.com"
                      type="email"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirme seu email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="seu.email@exemplo.com"
                      type="email"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Continuar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
