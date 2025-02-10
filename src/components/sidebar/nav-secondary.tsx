import {
  BookOpenIcon,
  FileTextIcon,
  type LucideIcon,
  PenSquareIcon,
} from 'lucide-react';
import Link from 'next/link';

import {
  SidebarGroup,
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
  { title: 'Temas', url: '/temas', icon: BookOpenIcon },

  { title: 'Simulados', url: '/simulados', icon: FileTextIcon },
];

export default function NavSecondary() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Modos</SidebarGroupLabel>
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
