'use client';

import { usePathname } from 'next/navigation';
import Navbar from '../components/Navbar';
import AdminLayout from '@/components/admin/AdminLayout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <AdminLayout>
        {children}
      </AdminLayout>
    );
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}