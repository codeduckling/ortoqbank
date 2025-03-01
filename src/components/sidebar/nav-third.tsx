'use client';

import { useUser } from '@clerk/nextjs';
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

type UserRole = 'admin' | 'moderator' | 'user';

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  requiredRoles?: UserRole[];
}

const items: MenuItem[] = [
  { title: 'Suporte', url: '/', icon: HeadsetIcon },
  { title: 'Logout', url: '/', icon: LogOutIcon },
  {
    title: 'Admin',
    url: '/admin',
    icon: UserCircleIcon,
    requiredRoles: ['admin'],
  },
  // Example of a future item that could be available to both admins and moderators
  // {
  //   title: 'Moderação',
  //   url: '/moderacao',
  //   icon: ShieldIcon,
  //   requiredRoles: ['admin', 'moderator']
  // },
];

export default function NavThird() {
  const { user } = useUser();

  // Get user's role from metadata
  const userRole = user?.publicMetadata?.role as UserRole | undefined;

  // Function to check if user has access to a menu item
  const hasAccess = (item: MenuItem) => {
    // If no required roles specified, everyone has access
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true;
    }

    // If roles are specified but user has no role, deny access
    if (!userRole) {
      return false;
    }

    // Check if user's role is in the list of required roles
    return item.requiredRoles.includes(userRole);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Usuário</SidebarGroupLabel>
      <SidebarMenu>
        {items.filter(hasAccess).map(item => (
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
