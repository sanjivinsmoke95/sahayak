/* eslint-disable @next/next/no-img-element */

type IllustrationName =
  | 'upload'
  | 'processing'
  | 'certificate'
  | 'success'
  | 'voice';

interface V2IllustrationProps {
  name: IllustrationName;
  className?: string;
}

export function V2Illustration({ name, className }: V2IllustrationProps) {
  return (
    <img
      src={`/v2-assets/illustration-${name}.svg`}
      alt=""
      aria-hidden="true"
      className={className}
      draggable={false}
    />
  );
}

export function V2IndiaRibbon({ className }: { className?: string }) {
  return (
    <img
      src="/v2-assets/india-ribbon.svg"
      alt=""
      aria-hidden="true"
      className={className}
      draggable={false}
    />
  );
}
