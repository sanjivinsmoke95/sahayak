import { Plus_Jakarta_Sans } from 'next/font/google';
import type { Metadata } from 'next';
import { WebNav } from '@/components/website/WebNav';
import { WebFooter } from '@/components/website/WebFooter';

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'Sahayak — Government Documents Made Clear',
    template: '%s · Sahayak',
  },
  description:
    'Sahayak helps citizens understand government documents in plain language — in English, Hindi, and Telugu. Upload any certificate, notice, or letter and know exactly what it means.',
  keywords: ['government documents', 'income certificate', 'sahayak', 'Telugu', 'citizen services', 'document reader'],
};

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${display.variable} bg-[#F8FAFC]`}
      style={{ fontFamily: 'var(--font-display), system-ui, -apple-system, sans-serif' }}
    >
      <WebNav />
      <main>{children}</main>
      <WebFooter />
    </div>
  );
}
