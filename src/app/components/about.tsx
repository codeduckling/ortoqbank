export default function About() {
  return (
    <section id="sobre" className="bg-gray-100 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-3xl font-bold text-[#2196F3] md:text-4xl">
          Sobre o OrtoQBank
        </h2>
        <p className="mb-4 text-lg text-gray-600">
          <span className="font-bold">NOSSA METODOLOGIA</span>
          <br />
          Criamos um método validado nas provas mais concorridas do universo
          médico e baseado na resolução de questões. Esqueça as apostilas e
          livros intermináveis. Com esse método, você vai otimizar o seu tempo
          de estudo sendo direcionado para tudo aquilo que importa! E vai
          otimizar o seu tempo de estudo sendo direcionado para tudo aquilo que
          importa! E vai treinar pra fazer o que fará no dia da prova:
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-[#2196F3]">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-bold">Banco de Questões Completo</h3>
            <p className="text-gray-600">
              Um banco de questões completo com gabaritos direcionados por
              especialistas da USP, baseados na bibliografia da SBOT mas com os
              insights diferenciais dos professores
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-[#2196F3]">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-bold">Trilhas de Estudo</h3>
            <p className="text-gray-600">
              Trilhas de estudo com questões inéditas, testes personalizados e
              simulados
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-[#2196F3]">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-bold">Programa Inteligente</h3>
            <p className="text-gray-600">
              Programa inteligente com feedback contínuo do desempenho
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-[#2196F3]">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-bold">Plataforma Responsiva</h3>
            <p className="text-gray-600">
              Plataforma responsiva para computador, tablet e celular
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-[#2196F3]">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-bold">Desempenho Garantido</h3>
            <p className="text-gray-600">
              Aprenda enquanto faz questões e alcance o desempenho de 80% na
              prova do TEOT 2026!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
