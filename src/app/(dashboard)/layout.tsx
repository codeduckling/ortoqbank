import AccessCheck from '@/components/AccessCheck';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger />
        <div className="mx-auto max-w-5xl px-4">
          <AccessCheck>{children}</AccessCheck>
        </div>
      </main>
    </SidebarProvider>
  );
}
