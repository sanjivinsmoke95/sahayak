/* eslint-disable @next/next/no-img-element */

interface V2LogoProps {
  variant?: 'mark' | 'mark-white' | 'full';
  className?: string;
}

const SRC: Record<NonNullable<V2LogoProps['variant']>, string> = {
  // Clean vector of the exact Sahayak mark (navy hands + saffron figure).
  // The reference pack's PNG crop carries a stray notch corner, so we use the
  // matching vector, which reproduces the reference's clean logo appearance.
  mark: '/v2-assets/logo-mark.svg',
  'mark-white': '/v2-assets/logo-mark-white.svg',
  // The user's supplied horizontal lockup (icon + "Sahayak" wordmark). Derived
  // from user-supplied-logo.svg: C2PA metadata stripped, the opaque white
  // background removed, and the viewBox cropped tight to the artwork.
  full: '/v2-assets/logo-full.svg',
};

export function V2Logo({ variant = 'mark', className }: V2LogoProps) {
  return <img src={SRC[variant]} alt="Sahayak" className={className} draggable={false} />;
}
