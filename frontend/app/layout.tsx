import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import './globals.css';

/**
 * No webfont on purpose.
 *
 * The audience is often on a weak rural connection, and a font fetch is a
 * poor thing to spend it on. Indian Android and iOS both ship Devanagari and
 * Telugu system faces, so the three languages render correctly offline and on
 * first paint. The stack is declared in tailwind.config.ts.
 */

export const metadata: Metadata = {
  title: 'SAHAYAK — Government information, made simple.',
  description:
    'SAHAYAK explains government documents in simple language, shrinks your files for upload, and tells you exactly what to do next.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Sahayak',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#1B4B8F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper font-sans text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
