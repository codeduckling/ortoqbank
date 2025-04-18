import AccessCheck from '@/components/AccessCheck';
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
      <AppSidebar />
      {/* Apply conditional class */}
      <main className={mainClassName.trim()}>
        {' '}
        {/* Use trim to remove trailing space if isAdmin */}
        <SidebarTrigger />
        <div className="mx-auto max-w-5xl px-4">
          <AccessCheck>{children}</AccessCheck>
        </div>
      </main>
    </SidebarProvider>
  );
}
