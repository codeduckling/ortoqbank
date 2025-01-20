import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQ() {
  const faqs = [
    {
      question: 'Como funciona o OrtoQBank?',
      answer:
        'O OrtoQBank é uma plataforma de estudos com milhares de questões em ortopedia, permitindo que você pratique com questões específicas, faça simulados e acompanhe seu progresso através de análises detalhadas.',
    },
    {
      question: 'As questões são atualizadas com frequência?',
      answer:
        'Sim, nossa equipe de especialistas adiciona novas questões mensalmente, mantendo o conteúdo atualizado com as últimas diretrizes e tendências em ortopedia.',
    },
    {
      question: 'Posso acessar em diferentes dispositivos?',
      answer:
        'Sim, o OrtoQBank é totalmente responsivo e pode ser acessado em qualquer dispositivo - computador, tablet ou smartphone, mantendo seu progresso sincronizado.',
    },
    {
      question: 'Como são elaboradas as questões?',
      answer:
        'Nossas questões são elaboradas por uma equipe de especialistas em ortopedia, seguindo o padrão das principais provas de residência, títulos de especialista e concursos da área.',
    },
    {
      question: 'Existe suporte para dúvidas?',
      answer:
        'Sim, além das explicações detalhadas para cada questão, oferecemos suporte técnico e acadêmico para esclarecer suas dúvidas sobre o conteúdo.',
    },
  ];

  return (
    <section id="faq" className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold text-[#2196F3] md:text-4xl">
          Perguntas Frequentes
        </h2>
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-blue-100"
              >
                <AccordionTrigger className="hover:text-[#2196F3]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
