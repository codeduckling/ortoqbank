import { Menu } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white hover:text-[#2196F3]"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] border-l-[#2196F3] bg-white p-6"
      >
        <SheetHeader>
          <SheetTitle className="text-[#2196F3]">Menu de Navegação</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-4">
          <Link
            href="#sobre"
            className="text-lg font-medium text-[#2196F3] transition-opacity hover:opacity-80"
          >
            Sobre
          </Link>
          <Link
            href="#precos"
            className="text-lg font-medium text-[#2196F3] transition-opacity hover:opacity-80"
          >
            Preços
          </Link>
          <Link
            href="#faq"
            className="text-lg font-medium text-[#2196F3] transition-opacity hover:opacity-80"
          >
            FAQ
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
