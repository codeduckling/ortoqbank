import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQ() {
  const faqs = [
    {
      question: 'Como é organizado o banco de questões?',
      answer: (
        <div className="space-y-2">
          <p>O banco de questões possui 3 áreas:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Trilhas de estudo: questões inéditas feitas por especialistas da
              USP para sedimentar seu aprendizado
            </li>
            <li>
              Simulados: tenha acesso à provas antigas do TARO, TEOT e simulados
              inéditos com gabaritos diferenciados
            </li>
            <li>
              Testes personalizados: utilize nossa plataforma inteligente para
              filtrar e criar testes de acordo com suas necessidades
            </li>
          </ol>
          <p>
            Além disso, você terá acesso à uma área de feedback contínuo
            adaptada para o seu perfil
          </p>
        </div>
      ),
    },
    {
      question: 'O que é um modelo QBANK?',
      answer: (
        <div className="space-y-2">
          <p>
            O qBank, ou banco de questões, é um sistema diferente do tradicional
            que utiliza as questões da prova e questões inéditas para ensinar
            conceitos fundamentais ao estudante. Com gabaritos diferenciados,
            nosso objetivo é ter um banco de questões diferente dos disponíveis
            no mercado. A cada questão, você vai aprender detalhadamente sobre
            os temas.
          </p>
          <p>
            Esse método é validado nas provas mais importantes da medicina no
            mundo, como o USMLE e as provas de residência médica.
          </p>
        </div>
      ),
    },
    {
      question: 'As questões são atualizadas com que frequência?',
      answer: (
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Temos um cronograma de lançamento mensal de trilhas de estudo
            baseado em áreas do conhecimento
          </li>
          <li>Questões atualizadas semanalmente com gabaritos completos</li>
        </ul>
      ),
    },
    {
      question: 'Qual o público alvo?',
      answer: (
        <div className="space-y-2">
          <p>
            O OrtoQBank é para todos os residentes de ortopedia que desejam uma
            preparação diferenciada e com método validado para o TEOT.
          </p>
          <p>Direcionado para R1, R2 e R3.</p>
        </div>
      ),
    },
    {
      question: 'Como funciona a garantia?',
      answer:
        'Se por algum motivo você não gostar do curso, envie um e-mail para o suporte e devolvemos seu investimento.',
    },
    {
      question: 'Onde tiro minhas dúvidas?',
      answer: (
        <ul className="list-disc space-y-1 pl-5">
          <li>Pelo nosso perfil oficial do instagram</li>
          <li>Suporte via e-mail</li>
        </ul>
      ),
    },
    {
      question: 'Qual a duração do acesso?',
      answer:
        'A duração do acesso é da data de aquisição até a data da 2ª fase do TEOT 2026.',
    },
    {
      question: 'Posso dividir meu acesso?',
      answer:
        'O OrtoQBank é um curso individual. A plataforma dá feedback baseado no desempenho do aluno, e portanto não é recomendado ou permitido o compartilhamento de acesso.',
    },
    {
      question: 'Grupos de residentes têm desconto?',
      answer:
        'Sim, junte seus colegas e entre em contato conosco pelo instagram (@) ou e-mail oficial para adquirir condições especiais.',
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
                <AccordionTrigger className="text-left hover:text-[#2196F3]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
