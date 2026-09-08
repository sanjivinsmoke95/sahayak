import type { Metadata } from 'next';
import './globals.css';
import { WebNav } from '@/components/WebNav';
import { WebFooter } from '@/components/WebFooter';

export const metadata: Metadata = {
  title: {
    default: 'Sahayak — Government Documents Made Clear',
    template: '%s · Sahayak',
  },
  description:
    'Sahayak helps citizens understand government documents in plain language — in English, Hindi, and Telugu. Upload any certificate, notice, or letter and know exactly what it means.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", backgroundColor: '#F8FAFC' }}>
        <WebNav />
        <main>{children}</main>
        <WebFooter />
      </body>
    </html>
  );
}
