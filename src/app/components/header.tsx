import { SignInButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

import { MobileMenu } from './mobile-menu';

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

        <div className="flex items-center space-x-6">
          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList className="gap-4">
              <NavigationMenuItem>
                <Link href="#sobre">
                  <NavigationMenuLink
                    className={
                      navigationMenuTriggerStyle() +
                      ' h-9 bg-transparent px-3 text-lg leading-none font-medium text-white hover:bg-white hover:text-[#2196F3]'
                    }
                  >
                    Sobre
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="#precos">
                  <NavigationMenuLink
                    className={
                      navigationMenuTriggerStyle() +
                      ' h-9 bg-transparent px-3 text-lg leading-none font-medium text-white hover:bg-white hover:text-[#2196F3]'
                    }
                  >
                    Preços
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="#faq">
                  <NavigationMenuLink
                    className={
                      navigationMenuTriggerStyle() +
                      ' h-9 bg-transparent px-3 text-lg leading-none font-medium text-white hover:bg-white hover:text-[#2196F3]'
                    }
                  >
                    FAQ
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <SignInButton forceRedirectUrl="/criar-teste">
            <Button className="rounded-full border border-white px-4 py-1.5 text-sm font-medium transition-colors hover:bg-white hover:text-[#2196F3]">
              Entrar
            </Button>
          </SignInButton>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
