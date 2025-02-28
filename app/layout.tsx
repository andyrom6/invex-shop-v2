import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/contexts/cart-context';
import { AuthProvider } from '@/contexts/auth-context';
import { ConditionalNavbar } from '@/components/conditional-navbar';
import { ConditionalMain } from '@/components/conditional-main';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
});

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
        <AuthProvider>
          <CartProvider>
            <ConditionalNavbar />
            <ConditionalMain>
              {children}
            </ConditionalMain>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}