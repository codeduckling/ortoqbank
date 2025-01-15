export default function FAQ() {
  const faqs = [
    {
      question: "O que é o OrtoQBank?",
      answer:
        "O OrtoQBank é um banco de quest��es abrangente para estudos em ortopedia.",
    },
    {
      question: "Como posso acessar o OrtoQBank?",
      answer:
        "Você pode acessar o OrtoQBank através do nosso site após criar uma conta e escolher um plano.",
    },
    {
      question: "As questões são atualizadas regularmente?",
      answer:
        "Sim, nossas questões são atualizadas regularmente para refletir as últimas tendências e conhecimentos em ortopedia.",
    },
  ];

  return (
    <section id="faq" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-[#2196F3] mb-8 text-center">
          Perguntas Frequentes
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
