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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { EditExamDialog } from './components/edit-quiz-dialog';

const formSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    category: z.enum(['trilha', 'simulado']),
    themeId: z.string().optional(),
    subthemeId: z.string().optional(),
    groupId: z.string().optional(),
    isPublic: z.boolean().default(true),
    questions: z.array(z.string()).min(1, 'Selecione pelo menos uma questão'),
  })
  .refine(
    data => {
      // If category is 'trilha', themeId is required
      if (data.category === 'trilha' && !data.themeId) {
        return false;
      }
      return true;
    },
    {
      message: 'Tema é obrigatório para trilhas',
      path: ['themeId'],
    },
  );

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

  // For question filtering in create form
  const [searchValue, setSearchValue] = useState('');
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string>('all');

  // For storing selected questions during creation
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set(),
  );

  // Fetch data
  const themes = useQuery(api.themes.list) || [];
  const presetQuizzes = useQuery(api.presetQuizzes.list) || [];
  const questions = useQuery(api.questions.listAll) || [];

  // Mutations
  const createPresetQuiz = useMutation(api.presetQuizzes.create);
  const updateQuiz = useMutation(api.presetQuizzes.updateQuiz);
  const deleteQuiz = useMutation(api.presetQuizzes.deleteQuiz);

  // Setup form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'simulado',
      isPublic: true,
      questions: [],
    },
  });

  // Watch the theme ID to filter questions
  const watchedThemeId = form.watch('themeId');

  // Filter questions based on theme and search
  const filteredQuestions = questions.filter(
    question =>
      (selectedThemeFilter === 'all' ||
        question.themeId === selectedThemeFilter) &&
      question.title.toLowerCase().includes(searchValue.toLowerCase()),
  );

  // Handle question selection toggle
  const handleToggleQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);

    // Update form value
    form.setValue('questions', [...newSelected], {
      shouldValidate: true,
    });
  };

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Create properly typed object
      const quizData: {
        name: string;
        description: string;
        category: 'trilha' | 'simulado';
        questions: Id<'questions'>[];
        isPublic: boolean;
        themeId?: Id<'themes'>;
        subthemeId?: Id<'subthemes'>;
        groupId?: Id<'groups'>;
      } = {
        name: values.name,
        description: values.description,
        category: values.category,
        questions: values.questions as Id<'questions'>[],
        isPublic: values.isPublic,
      };

      // Only include theme-related fields if they have values
      if (values.themeId) {
        quizData.themeId = values.themeId as Id<'themes'>;
      }

      if (values.subthemeId) {
        quizData.subthemeId = values.subthemeId as Id<'subthemes'>;
      }

      if (values.groupId) {
        quizData.groupId = values.groupId as Id<'groups'>;
      }

      await createPresetQuiz(quizData);

      toast({
        title: 'Sucesso',
        description: 'Teste criado com sucesso!',
      });

      // Reset state and close dialog
      setOpen(false);
      form.reset();
      setSelectedQuestions(new Set());
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o teste. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Update quiz handler
  const handleUpdateExam = async (data: {
    name: string;
    description: string;
    category: 'trilha' | 'simulado';
    questions: string[];
  }) => {
    if (!editingExam) return;

    try {
      await updateQuiz({
        quizId: editingExam.id as Id<'presetQuizzes'>,
        name: data.name,
        description: data.description,
        category: data.category,
        questions: data.questions as Id<'questions'>[],
      });

      toast({
        title: 'Sucesso',
        description: 'Teste atualizado com sucesso!',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o teste.',
        variant: 'destructive',
      });
    }
  };

  // Delete quiz handler
  const handleDeleteExam = async () => {
    if (!editingExam) return;

    try {
      await deleteQuiz({
        quizId: editingExam.id as Id<'presetQuizzes'>,
      });

      toast({
        title: 'Sucesso',
        description: 'Teste excluído com sucesso!',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o teste.',
        variant: 'destructive',
      });
    }
  };

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
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Teste</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
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
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categoria</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="trilha">Trilha</SelectItem>
                                  <SelectItem value="simulado">
                                    Simulado
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="themeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Tema{' '}
                                {form.watch('category') === 'trilha' && (
                                  <span className="text-red-500">*</span>
                                )}
                              </FormLabel>
                              <Select
                                onValueChange={value => {
                                  field.onChange(value);
                                  setSelectedThemeFilter(value);
                                }}
                                defaultValue={field.value}
                                disabled={form.watch('category') !== 'trilha'}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um tema" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {themes.map(theme => (
                                    <SelectItem
                                      key={theme._id}
                                      value={theme._id}
                                    >
                                      {theme.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="questions"
                          render={() => (
                            <FormItem>
                              <FormLabel>Questões Selecionadas</FormLabel>
                              <FormControl>
                                <div className="rounded-md border p-2">
                                  <span className="text-muted-foreground text-sm">
                                    {selectedQuestions.size} questões
                                    selecionadas
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="searchQuestions">
                            Buscar Questões
                          </Label>
                          <Input
                            id="searchQuestions"
                            type="text"
                            placeholder="Buscar por título..."
                            value={searchValue}
                            onChange={e => setSearchValue(e.target.value)}
                          />
                        </div>

                        <ScrollArea className="h-[400px] rounded-md border p-4">
                          {filteredQuestions.length === 0 ? (
                            <div className="flex h-full items-center justify-center">
                              <p className="text-muted-foreground text-sm">
                                {watchedThemeId
                                  ? 'Nenhuma questão encontrada para este tema'
                                  : 'Selecione um tema para ver as questões'}
                              </p>
                            </div>
                          ) : (
                            filteredQuestions.map(question => (
                              <div
                                key={question._id}
                                className="mb-2 flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={question._id}
                                  checked={selectedQuestions.has(question._id)}
                                  onCheckedChange={() =>
                                    handleToggleQuestion(question._id)
                                  }
                                />
                                <Label htmlFor={question._id}>
                                  {question.title}
                                </Label>
                              </div>
                            ))
                          )}
                        </ScrollArea>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">Criar Teste</Button>
                    </DialogFooter>
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
                <TableHead>Categoria</TableHead>
                <TableHead>Questões</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presetQuizzes.map(quiz => (
                <TableRow key={quiz._id}>
                  <TableCell>{quiz.name}</TableCell>
                  <TableCell>{quiz.description}</TableCell>
                  <TableCell>
                    {quiz.category === 'trilha' ? 'Trilha' : 'Simulado'}
                  </TableCell>
                  <TableCell>{quiz.questions.length} questões</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEditingExam({ id: quiz._id, name: quiz.name })
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
          quiz={{
            id: editingExam.id,
            name:
              presetQuizzes.find(quiz => quiz._id === editingExam.id)?.name ??
              '',
            description:
              presetQuizzes.find(quiz => quiz._id === editingExam.id)
                ?.description ?? '',
            category: presetQuizzes.find(quiz => quiz._id === editingExam.id)
              ?.category,
          }}
          questions={questions}
          presetQuizzes={presetQuizzes}
          onUpdateQuiz={handleUpdateExam}
          onDeleteQuiz={handleDeleteExam}
        />
      )}
    </div>
  );
}
