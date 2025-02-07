import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/navbar';
import { Toaster } from "sonner";
import { CartProvider } from '@/contexts/cart-context';
import { SaleBanner } from '@/components/sale-banner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'InvexShop - Premium Tech Gadgets',
  description: 'Your one-stop shop for premium tech gadgets and accessories',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <SaleBanner />
          <Navbar />
          <main className="min-h-screen pt-24">
            {children}
          </main>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}