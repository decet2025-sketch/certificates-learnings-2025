import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sharon Decet - Certificate Management System',
  description:
    'A comprehensive certificate management system for educational institutions and organizations',
  keywords: [
    'certificates',
    'education',
    'management',
    'learning',
    'credentials',
  ],
  authors: [{ name: 'Sharon Decet Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Sharon Decet - Certificate Management System',
    description:
      'A comprehensive certificate management system for educational institutions and organizations',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sharon Decet - Certificate Management System',
    description:
      'A comprehensive certificate management system for educational institutions and organizations',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta
          name="apple-mobile-web-app-title"
          content="Sharon Decet"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <ToastProvider>
          <div className="min-h-full">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
