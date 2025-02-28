"use client";

import { usePathname } from 'next/navigation';

export function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <main className={isAdminPage ? "min-h-screen" : "min-h-screen pt-24"}>
      {children}
    </main>
  );
} 