import { Inter } from 'next/font/google';
import { V2Shell } from '@/components/v2';
import './v2.css';

const heading = Inter({
  subsets: ['latin'],
  variable: '--font-v2-heading',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={heading.variable}>
      <V2Shell>{children}</V2Shell>
    </div>
  );
}
