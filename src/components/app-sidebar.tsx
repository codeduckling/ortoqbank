import {
  BookOpen,
  FileText,
  type LucideIcon,
  PenSquare,
  UserCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { Separator } from './ui/separator';

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

// Menu items.
const items: MenuItem[] = [
  {
    title: 'Meu Perfil',
    url: '/perfil',
    icon: UserCircle,
  },
  {
    title: 'Temas',
    url: '/temas',
    icon: BookOpen,
  },
  {
    title: 'Simulados',
    url: '/simulados',
    icon: FileText,
  },
  {
    title: 'Criar Teste',
    url: '/criar-teste',
    icon: PenSquare,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/logo.webp"
                    alt="OrtoQBank Logo"
                    width={32}
                    height={32}
                    className="rounded-sm"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-xl font-medium text-[#2196F3]">
                    OrtoQBank
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Separator />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 py-5"
                    >
                      <item.icon className="size-5" />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
