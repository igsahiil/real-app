import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RV Group Ltd — Your Partner in Property & Justice',
  description:
    'Discover verified residential apartments, luxury villas, commercial offices, prime investment land, and property advisory with RV Group Ltd.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', sizes: '128x128', type: 'image/png' },
      { url: '/logo-light.png', media: '(prefers-color-scheme: light)' },
      { url: '/logo-dark.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '128x128', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-[#0E1626] dark:text-slate-100`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
