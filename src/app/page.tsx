"use client";

import Header from "./components/header";
import Hero from "./components/hero";
import About from "./components/about";
import Pricing from "./components/pricing";
import FAQ from "./components/faq";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <Hero />
        <About />
        <Pricing />
        <FAQ />
      </main>
      <footer className="bg-[#2196F3] text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 OrtoQBank. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
