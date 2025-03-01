import { SignInButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-[#2196F3] text-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.webp"
            alt="OrtoQBank Logo"
            width={40}
            height={40}
            className="rounded-sm"
          />
          <span className="font-sifonn text-2xl font-bold">OrtoQBank</span>
        </Link>
        <div className="flex items-center gap-8">
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link
                  href="#sobre"
                  className="text-base transition-opacity hover:opacity-80"
                >
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="#precos" className="hover:text-opacity-80">
                  Preços
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-opacity-80">
                  FAQ
                </Link>
              </li>
            </ul>
          </nav>
          <SignInButton forceRedirectUrl="/criar-teste">
            <Button className="rounded-full border border-white px-4 py-1.5 text-sm font-medium transition-colors hover:bg-white hover:text-[#2196F3]">
              Entrar
            </Button>
          </SignInButton>
        </div>
      </div>
    </header>
  );
}
