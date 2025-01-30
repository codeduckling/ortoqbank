import {
  BookOpenIcon,
  FileClockIcon,
  FileTextIcon,
  HeadsetIcon,
  type LucideIcon,
  PenSquareIcon,
  UserCircleIcon,
} from 'lucide-react';
import Link from 'next/link';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

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
    title: 'Testes Prévios',
    url: '/testes-previos',
    icon: FileClockIcon,
  },
  {
    title: 'Suporte',
    url: '/suporte',
    icon: HeadsetIcon,
  },

  {
    title: 'Criar Questão',
    url: '/criar-questao',
    icon: PenSquareIcon,
  },
];

export default function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Home</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link href={item.url} className="flex items-center gap-3 py-5">
                <item.icon className="size-5" />
                <span className="text-base">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
