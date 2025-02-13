'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

import { Id } from '../../../../../../convex/_generated/dataModel';

interface EditExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: {
    id: string;
    name: string;
    description: string;
  };
  questions: Array<{ _id: Id<'questions'>; title: string; themeId: string }>;
  presetExams: Array<{
    _id: Id<'presetExams'>;
    name: string;
    description: string;
    questions: string[];
  }>;
  onUpdateExam: (data: {
    name: string;
    description: string;
    questions: string[];
  }) => Promise<void>;
  onDeleteExam: () => Promise<void>;
}

export function EditExamDialog({
  open,
  onOpenChange,
  exam,
  questions,
  presetExams,
  onUpdateExam,
  onDeleteExam,
}: EditExamDialogProps) {
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState('');
  const [name, setName] = useState(exam.name);
  const [description, setDescription] = useState(exam.description);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set(presetExams.find(exam_ => exam_._id === exam.id)?.questions ?? []),
  );

  const handleToggleQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSave = async () => {
    try {
      await onUpdateExam({
        name,
        description,
        questions: [...selectedQuestions],
      });
      toast({
        title: 'Sucesso',
        description: 'Teste atualizado com sucesso!',
      });
      onOpenChange(false);
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o teste.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este teste?')) return;

    try {
      await onDeleteExam();
      toast({
        title: 'Sucesso',
        description: 'Teste excluído com sucesso!',
      });
      onOpenChange(false);
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o teste.',
        variant: 'destructive',
      });
    }
  };

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Teste</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={event => setDescription(event.target.value)}
            />
          </div>
          <Input
            type="text"
            placeholder="Buscar questões..."
            value={searchValue}
            onChange={event => setSearchValue(event.target.value)}
          />
          <ScrollArea className="h-[400px] rounded-md border p-4">
            {filteredQuestions.map(question => (
              <div
                key={question._id}
                className="mb-2 flex items-center space-x-2"
              >
                <Checkbox
                  id={question._id}
                  checked={selectedQuestions.has(question._id)}
                  onCheckedChange={() => handleToggleQuestion(question._id)}
                />
                <Label htmlFor={question._id}>{question.title}</Label>
              </div>
            ))}
          </ScrollArea>
        </div>
        <DialogFooter>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Excluir Teste
              </Button>
              <span className="text-sm text-gray-500">
                {selectedQuestions.size} questões selecionadas
              </span>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar Alterações</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
