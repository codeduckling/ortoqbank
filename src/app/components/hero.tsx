import { Button } from "@/components/ui/button";
import QuizCard from "./quiz-card";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-white text-[#2196F3] py-12 md:py-16">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-start justify-between gap-6">
        <div className="lg:w-1/2">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#2196F3]">
            OrtoQBank
          </h1>
          <p className="text-xl mb-8 text-[#2196F3]">
            Seu banco de questões abrangente para estudos em ortopedia
          </p>
          <Link href="/ortoqbank">
            <Button className="bg-[#2196F3] text-white hover:bg-opacity-90">
              Comece Agora
            </Button>
          </Link>
        </div>
        <div className="lg:w-1/2 w-full">
          <QuizCard />
        </div>
      </div>
    </section>
  );
}
