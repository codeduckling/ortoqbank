'use client';

import { useUser } from '@clerk/nextjs';
import {
  BookOpenIcon,
  FileClockIcon,
  FileTextIcon,
  HeadsetIcon,
  type LucideIcon,
  PenSquareIcon,
  UserCircleIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

import { NavUser } from './nav-user';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
    icon: UserCircleIcon,
  },
  {
    title: 'Temas',
    url: '/temas',
    icon: BookOpenIcon,
  },
  {
    title: 'Simulados',
    url: '/simulados',
    icon: FileTextIcon,
  },
  {
    title: 'Criar Teste',
    url: '/criar-teste',
    icon: PenSquareIcon,
  },
  {
    title: 'Testes Prévios',
    url: '/testes-previos',
    icon: FileClockIcon,
  },
  {
    title: 'Suporte',
    url: '/suporte',
    icon: HeadsetIcon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton variant="logo" size="lg" asChild>
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
                  <span className="font-sifonn text-xl font-medium">
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
      <SidebarFooter>
        <Card className="group-data-[collapsible=icon]:hidden">
          <CardHeader>
            <CardTitle className="truncate">Data de Validade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="truncate">21/01/2026</p>
          </CardContent>
        </Card>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
