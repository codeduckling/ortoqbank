import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import QuizCard from './quiz-card';

export default function Hero() {
  return (
    <section className="bg-white py-12 text-[#2196F3] md:py-16">
      <div className="container mx-auto flex flex-col items-start justify-between gap-6 px-4 lg:flex-row">
        <div className="lg:w-1/2">
          <h1 className="mb-6 text-4xl font-bold text-[#2196F3] md:text-6xl">
            OrtoQBank
          </h1>
          <p className="mb-8 text-xl text-[#2196F3]">
            Seu banco de questões abrangente para estudos em ortopedia
          </p>
          <div className="flex flex-col gap-4">
            <Input type="email" placeholder="Enter your email" />
            <Button className="bg-[#2196F3] text-white hover:bg-opacity-90">
              Join Waitlist
            </Button>
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <QuizCard />
        </div>
      </div>
    </section>
  );
}
