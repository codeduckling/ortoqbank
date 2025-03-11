import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import EmailCollectionForm from './email-collection-form';

export default function Hero() {
  return (
    <section className="bg-white py-12 text-[#2196F3] md:py-16">
      <div className="container mx-auto flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <h1 className="font-sifonn mb-6 text-4xl font-bold text-[#2196F3] md:text-6xl">
            OrtoQBank
          </h1>
          <p className="mb-8 font-sans text-lg text-gray-600">
            Esteja pronto para enfrentar o TEOT 2026 e conquiste o seu título de
            especialista!
          </p>
          <EmailCollectionForm />
        </div>
      </div>
    </section>
  );
}
