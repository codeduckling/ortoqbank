import { redirect } from 'next/navigation';

import { AdminNav } from '@/components/admin/admin-nav';
import { checkRole } from '@/utils/roles';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user has admin role
  if (!checkRole('admin')) {
    redirect('/');
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Área do Admin</h1>
      </div>

      {/* Admin Navigation */}
      <AdminNav />

      {/* Page content */}
      {children}
    </div>
  );
}
