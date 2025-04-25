import AccessCheck from '@/components/AccessCheck';
import { MobileBottomNav } from '@/components/nav/mobile-bottom-nav';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { checkRole } from '@/utils/roles'; // Adjust path if necessary

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await checkRole('admin');

  const mainClassName = `w-full ${isAdmin ? '' : 'select-none'}`;

  return (
    <SidebarProvider>
      {/* Sidebar visible only on md and larger screens */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <main className={mainClassName.trim()}>
        {/* Sidebar trigger visible only on md and larger screens */}
        <div className="hidden md:block">
          <SidebarTrigger />
        </div>
        {/* Add padding-bottom for mobile nav, remove for desktop */}
        <div className="mx-auto max-w-5xl px-4 pb-20 md:pb-0">
          <AccessCheck>{children}</AccessCheck>
        </div>
      </main>
      {/* Mobile bottom nav visible only on screens smaller than md */}
      <MobileBottomNav />
    </SidebarProvider>
  );
}
