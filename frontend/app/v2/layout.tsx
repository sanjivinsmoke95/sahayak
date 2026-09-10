import { Plus_Jakarta_Sans } from 'next/font/google';
import { V2Shell } from '@/components/v2';
import { V2ErrorBoundary } from '@/components/v2/V2ErrorBoundary';
import './v2.css';

const heading = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-v2-heading',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={heading.variable}>
      <V2ErrorBoundary>
        <V2Shell>{children}</V2Shell>
      </V2ErrorBoundary>
    </div>
  );
}
