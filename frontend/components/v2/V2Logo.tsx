/* eslint-disable @next/next/no-img-element */

interface V2LogoProps {
  variant?: 'mark' | 'mark-white' | 'full';
  className?: string;
}

const SRC: Record<NonNullable<V2LogoProps['variant']>, string> = {
  mark: '/v2-assets/logo-mark.svg',
  'mark-white': '/v2-assets/logo-mark-white.svg',
  full: '/v2-assets/logo-full.svg',
};

export function V2Logo({ variant = 'mark', className }: V2LogoProps) {
  return <img src={SRC[variant]} alt="Sahayak" className={className} draggable={false} />;
}
