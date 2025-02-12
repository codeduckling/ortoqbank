import {
  BookOpenIcon,
  FileClockIcon,
  FileTextIcon,
  HeadsetIcon,
  LogOutIcon,
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
  { title: 'Suporte', url: '/', icon: HeadsetIcon },
  { title: 'Logout', url: '/', icon: LogOutIcon },
];

export default function NavThird() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Usuário</SidebarGroupLabel>
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
