'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { EditExamDialog } from './components/edit-exam-dialog';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  themeId: z.string().min(1, 'Tema é obrigatório'),
  subthemeId: z.string().optional(),
  groupId: z.string().optional(),
  isPublic: z.boolean().default(true),
});

export default function ManagePresetExams() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<
    | {
        id: string;
        name: string;
      }
    | undefined
  >();
  const themes = useQuery(api.themes.list) || [];
  const presetExams = useQuery(api.presetExams.list) || [];
  const questions = useQuery(api.questions.listAll) || [];
  const createPresetExam = useMutation(api.presetExams.create);
  const addQuestion = useMutation(api.presetExams.addQuestion);
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [questionSearch, setQuestionSearch] = useState('');
  const updateExamQuestions = useMutation(api.presetExams.updateQuestions);
  const updateExam = useMutation(api.presetExams.updateExam);
  const deleteExam = useMutation(api.presetExams.deleteExam);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isPublic: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createPresetExam({
        ...values,
        questions: [],
        themeId: values.themeId as Id<'themes'>,
        subthemeId: values.subthemeId as Id<'subthemes'>,
        groupId: values.groupId as Id<'groups'>,
      });
      toast({
        title: 'Sucesso',
        description: 'Teste criado com sucesso!',
      });
      setOpen(false);
      form.reset();
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o teste. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleAddQuestion = async (questionId: string) => {
    if (!editingExam) return;

    try {
      await addQuestion({
        examId: editingExam.id as Id<'presetExams'>,
        questionId: questionId as Id<'questions'>,
      });
      toast({
        title: 'Sucesso',
        description: 'Questão adicionada com sucesso!',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a questão.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateQuestions = async (questionIds: string[]) => {
    if (!editingExam) return;

    try {
      await updateExamQuestions({
        examId: editingExam.id as Id<'presetExams'>,
        questions: questionIds as Id<'questions'>[],
      });
      toast({
        title: 'Sucesso',
        description: 'Questões atualizadas com sucesso!',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as questões.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateExam = async (data: {
    name: string;
    description: string;
    questions: string[];
  }) => {
    if (!editingExam) return;

    try {
      await updateExam({
        examId: editingExam.id as Id<'presetExams'>,
        name: data.name,
        description: data.description,
        questions: data.questions as Id<'questions'>[],
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o teste.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteExam = async () => {
    if (!editingExam) return;

    try {
      await deleteExam({
        examId: editingExam.id as Id<'presetExams'>,
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o teste.',
        variant: 'destructive',
      });
    }
  };

  const filteredQuestions = questions.filter(
    question =>
      (selectedTheme === 'all' || question.themeId === selectedTheme) &&
      !presetExams
        .find(exam => exam._id === editingExam?.id)
        ?.questions.includes(question._id),
  );

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Testes</CardTitle>
          <CardDescription>
            Crie e gerencie testes predefinidos para seus alunos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Criar Novo Teste</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Teste</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
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
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="themeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tema</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um tema" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {themes.map(theme => (
                                <SelectItem key={theme._id} value={theme._id}>
                                  {theme.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Criar Teste</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Questões</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presetExams.map(exam => (
                <TableRow key={exam._id}>
                  <TableCell>{exam.name}</TableCell>
                  <TableCell>{exam.description}</TableCell>
                  <TableCell>{exam.questions.length} questões</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEditingExam({ id: exam._id, name: exam.name })
                      }
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingExam && (
        <EditExamDialog
          open={!!editingExam}
          onOpenChange={() => setEditingExam(undefined)}
          exam={{
            id: editingExam.id,
            name:
              presetExams.find(exam => exam._id === editingExam.id)?.name ?? '',
            description:
              presetExams.find(exam => exam._id === editingExam.id)
                ?.description ?? '',
          }}
          questions={questions}
          presetExams={presetExams}
          onUpdateExam={handleUpdateExam}
          onDeleteExam={handleDeleteExam}
        />
      )}
    </div>
  );
}
