import { Button } from "@/components/ui/button";

export default function Pricing() {
  return (
    <section id="precos" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-[#2196F3] mb-8 text-center">
          Planos e Preços
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {["Básico", "Padrão", "Premium"].map((plan) => (
            <div key={plan} className="border rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">{plan}</h3>
              <p className="text-3xl font-bold mb-4">
                R$ XX,XX<span className="text-sm font-normal">/mês</span>
              </p>
              <ul className="mb-6">
                <li className="mb-2">Recurso 1</li>
                <li className="mb-2">Recurso 2</li>
                <li className="mb-2">Recurso 3</li>
              </ul>
              <Button className="w-full bg-[#2196F3] text-white hover:bg-opacity-90">
                Escolher Plano
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
