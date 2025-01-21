import { BookOpen, FileText, PenSquare, UserCircle } from 'lucide-react';
import Image from 'next/image';

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

// Menu items.
const items = [
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
              <a href="#">
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
              </a>
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
                    <a href={item.url} className="flex items-center gap-3 py-5">
                      <item.icon className="size-5" />
                      <span className="text-base">{item.title}</span>
                    </a>
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
