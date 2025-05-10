'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
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

// CPF validation helper function
const isCPFValid = (cpf: string) => {
  // Remove non-digits
  cpf = cpf.replaceAll(/\D/g, '');

  // Check if it has 11 digits
  if (cpf.length !== 11) return false;

  // Check if all digits are the same
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Calculate verification digits
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += Number.parseInt(cpf.slice(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number.parseInt(cpf.slice(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += Number.parseInt(cpf.slice(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number.parseInt(cpf.slice(10, 11))) return false;

  return true;
};

const formSchema = z
  .object({
    firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    confirmEmail: z.string().email('Email inválido'),
    cpf: z
      .string()
      .min(11, 'CPF deve ter 11 dígitos')
      .max(14, 'CPF não pode ter mais que 14 caracteres')
      .refine(val => isCPFValid(val), { message: 'CPF inválido' }),
    phone: z
      .string()
      .min(10, 'Telefone deve ter pelo menos 10 dígitos')
      .max(15, 'Telefone não pode ter mais que 15 caracteres')
      .regex(
        /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/,
        'Telefone inválido',
      ),
    street: z.string().min(3, 'Endereço deve ter pelo menos 3 caracteres'),
    number: z.string().min(1, 'Número é obrigatório'),
    zipcode: z
      .string()
      .min(8, 'CEP deve ter 8 dígitos')
      .max(9, 'CEP não pode ter mais que 9 caracteres')
      .regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
    city: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
    state: z.string().length(2, 'Estado deve ter 2 caracteres'),
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
      firstName: '',
      lastName: '',
      email: '',
      confirmEmail: '',
      cpf: '',
      phone: '',
      street: '',
      number: '',
      zipcode: '',
      city: '',
      state: '',
    },
  });

  const handlePurchase = (values: FormValues) => {
    // Generate a unique ID for this purchase
    const testeId = uuidv4();

    // Clean phone number for proper formatting
    const cleanPhone = values.phone.replaceAll(/\D/g, '');
    const areaCode = cleanPhone.slice(0, 2);
    const phoneNumber = cleanPhone.slice(2);

    createMercadoPagoCheckout({
      userEmail: values.email,
      userName: values.firstName,
      userLastName: values.lastName,
      testeId: testeId,
      userAddress: {
        street: values.street,
        number: values.number,
        zipcode: values.zipcode,
        city: values.city,
        state: values.state,
      },
      userIdentification: {
        type: 'CPF',
        number: values.cpf.replaceAll(/\D/g, ''), // Remove non-digits
      },
      userPhone: {
        area_code: areaCode,
        number: phoneNumber,
      },
    });

    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Informe seus dados para continuar</DialogTitle>
          <DialogDescription>
            Após a confirmação do pagamento, enviaremos um link de acesso para o
            email informado para que você possa completar seu cadastro e começar
            a usar a plataforma.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handlePurchase)}
            className="space-y-4 py-4"
          >
            <h3 className="text-base font-semibold">Dados pessoais</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Seu nome"
                        autoComplete="given-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Seu sobrenome"
                        autoComplete="family-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={e => {
                          // Auto-format CPF as user types
                          let value = e.target.value.replaceAll(/\D/g, '');
                          if (value.length > 3) {
                            value = value.replace(/^(\d{3})/, '$1.');
                          }
                          if (value.length > 7) {
                            value = value.replace(
                              /^(\d{3})\.(\d{3})/,
                              '$1.$2.',
                            );
                          }
                          if (value.length > 11) {
                            value = value.replace(
                              /^(\d{3})\.(\d{3})\.(\d{3})/,
                              '$1.$2.$3-',
                            );
                          }
                          field.onChange(value);
                        }}
                        maxLength={14}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        onChange={e => {
                          // Auto-format phone as user types
                          let value = e.target.value.replaceAll(/\D/g, '');
                          if (value.length > 2) {
                            value =
                              '(' + value.slice(0, 2) + ') ' + value.slice(2);
                          }
                          if (value.length > 10) {
                            value = value.slice(0, 10) + '-' + value.slice(10);
                          }
                          field.onChange(value);
                        }}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <h3 className="pt-2 text-base font-semibold">Endereço</h3>
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rua</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome da rua"
                      autoComplete="street-address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00000-000"
                        {...field}
                        onChange={e => {
                          // Auto-format CEP as user types
                          let value = e.target.value.replaceAll(/\D/g, '');
                          if (value.length > 5) {
                            value = value.slice(0, 5) + '-' + value.slice(5);
                          }
                          field.onChange(value);
                        }}
                        maxLength={9}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Sua cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado (UF)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SP"
                        {...field}
                        onChange={e => {
                          field.onChange(
                            e.target.value.toUpperCase().slice(0, 2),
                          );
                        }}
                        maxLength={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
