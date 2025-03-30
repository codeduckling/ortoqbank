import Image from 'next/image';
import Link from 'next/link';

import { Separator } from '../ui/separator';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';

export default function NavLogo() {
  return (
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
              <span className="font-sifonn text-xl font-medium">OrtoQBank</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <Separator />
    </SidebarMenu>
  );
}
