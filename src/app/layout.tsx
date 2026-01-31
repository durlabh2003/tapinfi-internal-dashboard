import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // <--- THIS LINE IS CRITICAL

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WhatsApp Campaign Manager',
  description: 'Nexus System V2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}