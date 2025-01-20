'use client';

import { useState } from 'react';

import About from './components/about';
import FAQ from './components/faq';
import Header from './components/header';
import Hero from './components/hero';
import Pricing from './components/pricing';
import StaffSection from './components/staff-section';

export default function Home() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleEmailRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    // Add your email registration logic here
    setMessage('Thank you for joining the waitlist!');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <Hero />
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-3xl font-bold text-[#2196F3]">
              Join Our Waitlist
            </h2>
            <form onSubmit={handleEmailRegistration} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-md border border-gray-300 p-2"
                required
              />
              <button
                type="submit"
                className="bg-[#2196F3] text-white py-2 px-4 rounded-md hover:bg-opacity-90"
              >
                Join Waitlist
              </button>
            </form>
            {message && <p className="mt-4 text-green-500">{message}</p>}
          </div>
        </section>
        <About />
        <StaffSection />
        <Pricing />
        <FAQ />
      </main>
      <footer className="mt-auto bg-[#2196F3] py-4 text-white">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 OrtoQBank. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
