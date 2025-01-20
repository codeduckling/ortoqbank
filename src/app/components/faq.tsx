import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQ() {
  const faqs = [
    {
      question: 'Quanto tempo dura a consulta?',
      answer:
        'A primeira consulta tem duração média de 40 minutos, tempo necessário para uma avaliação completa e detalhada.',
    },
    {
      question: 'Preciso trazer exames anteriores?',
      answer:
        'Sim, é importante trazer todos os exames relacionados ao problema, incluindo raio-x, ressonância magnética ou tomografia, para uma avaliação mais precisa.',
    },
    {
      question: 'O plano de saúde é aceito?',
      answer:
        'Sim, trabalhamos com os principais planos de saúde. Entre em contato conosco para verificar se o seu plano está na nossa lista de convênios.',
    },
    {
      question: 'Qual o prazo para retorno?',
      answer:
        'O retorno geralmente é agendado em 30 dias após a primeira consulta, mas pode variar de acordo com o tratamento específico.',
    },
    {
      question: 'Realizam cirurgias?',
      answer:
        'Sim, realizamos diversos procedimentos cirúrgicos ortopédicos. O tipo de cirurgia será determinado após avaliação completa do seu caso.',
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
