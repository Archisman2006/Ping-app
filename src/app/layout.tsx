import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import AuthProvider from '../context/AuthProvider';
import { cn } from "@/lib/utils";
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/navbar'
const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ping',
  description: 'Real feedback from real people.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} >
      <AuthProvider>
        <body className={inter.className}>
          <Navbar />
          {children}
          <Toaster />
        </body>
      </AuthProvider>
    </html>
  );
}
