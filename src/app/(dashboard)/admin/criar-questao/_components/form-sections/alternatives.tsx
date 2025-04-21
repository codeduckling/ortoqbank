'use client';

import { type UseFormReturn } from 'react-hook-form';

import { Card, CardContent } from '@/components/ui/card';
import { FormLabel } from '@/components/ui/form';

import { QuestionOption } from '../question-option';
import { QuestionFormData } from '../schema';

interface AlternativesProps {
  form: UseFormReturn<QuestionFormData>;
  numberOfAlternatives: number;
}

export function Alternatives({
  form,
  numberOfAlternatives,
}: AlternativesProps) {
  return (
    <div className="space-y-2">
      <FormLabel>Alternativas</FormLabel>
      <Card>
        <CardContent className="space-y-2 p-2">
          {Array.from({ length: numberOfAlternatives }, (_, index) => (
            <QuestionOption
              key={index}
              control={form.control}
              index={index}
              isSelected={form.watch('correctAlternativeIndex') === index}
              onSelect={() => form.setValue('correctAlternativeIndex', index)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
