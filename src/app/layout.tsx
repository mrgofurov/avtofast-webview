import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';
import { TelegramProvider } from '@/context/TelegramContext';
import { AppProvider } from '@/context/AppContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Avtofast — Aqlli o'rgan. Tez natija.",
  description: "Yodlash emas. Tushunish. O'zbekiston haydovchilik guvohnomasi imtihoniga tayyorlovchi AI platforma.",
  icons: {
    icon: '/brand/app-icon.png',
    apple: '/brand/app-icon.png',
  },
  applicationName: 'Avtofast',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Avtofast',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0F19' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={`${inter.variable} h-full antialiased suppressHydrationWarning`}>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <TelegramProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}
