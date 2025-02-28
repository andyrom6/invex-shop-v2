"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import dynamic from 'next/dynamic';

// Dynamically import non-critical components
const SaleBanner = dynamic(() => import('@/components/sale-banner').then(mod => mod.SaleBanner), {
  ssr: true,
  loading: () => <div className="h-10 bg-gradient-to-r from-blue-600 to-purple-600"></div>
});

export function ConditionalNavbar() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    return null;
  }

  return (
    <>
      <SaleBanner />
      <Navbar />
    </>
  );
} 