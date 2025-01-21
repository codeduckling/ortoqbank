'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Option {
  id: string;
  text: string;
  imageUrl?: string;
}

interface Question {
  id: string;
  statement: string;
  statementImageUrl?: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  explanationImageUrl?: string;
  tags: string[];
}

// Example question data
const question: Question = {
  id: '1',
  statement:
    'Em um paciente com fratura exposta de tíbia, qual é a primeira conduta a ser tomada no atendimento inicial?',
  options: [
    { id: 'a', text: 'Limpeza e desbridamento cirúrgico' },
    { id: 'b', text: 'Antibioticoterapia endovenosa' },
    { id: 'c', text: 'Fixação externa' },
    { id: 'd', text: 'Redução fechada e imobilização' },
  ],
  correctAnswer: 'b',
  explanation:
    'A antibioticoterapia endovenosa deve ser iniciada o mais precocemente possível, idealmente na primeira hora após o trauma, para prevenir infecção. O desbridamento cirúrgico, embora fundamental, é realizado após a estabilização inicial do paciente.',
  tags: ['Trauma', 'Urgência', 'Antibioticoterapia', 'Fratura Exposta'],
};

export default function SimulationPage({
  params,
}: {
  params: { topicId: string };
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button variant="outline" className="gap-2">
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Question Statement */}
        <Card>
          <CardHeader>
            <CardTitle>Questão 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-lg">{question.statement}</p>
            {question.statementImageUrl && (
              <div className="relative mb-4 h-64 w-full">
                <Image
                  src={question.statementImageUrl || '/placeholder.svg'}
                  alt="Imagem da questão"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardContent className="pt-6">
            <RadioGroup
              value={selectedAnswer}
              onValueChange={setSelectedAnswer}
              className="space-y-4"
            >
              {question.options.map(option => (
                <div
                  key={option.id}
                  className={`flex items-start space-x-3 rounded-lg border p-4 ${
                    showAnswer && option.id === question.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <div className="flex-1">
                    <Label htmlFor={option.id} className="text-base">
                      {option.text}
                    </Label>
                    {option.imageUrl && (
                      <div className="relative mt-2 h-48 w-full">
                        <Image
                          src={option.imageUrl || '/placeholder.svg'}
                          alt={`Imagem da opção ${option.id}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Answer Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => setShowAnswer(true)}
            disabled={!selectedAnswer || showAnswer}
          >
            Responder
          </Button>
        </div>

        {/* Answer Key and Explanation */}
        {showAnswer && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Resposta Correta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-lg">{question.explanation}</p>
              {question.explanationImageUrl && (
                <div className="relative mb-4 h-64 w-full">
                  <Image
                    src={question.explanationImageUrl || '/placeholder.svg'}
                    alt="Imagem da explicação"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {question.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
