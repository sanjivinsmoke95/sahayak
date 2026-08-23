/**
 * Mask sensitive identification numbers in free text before it is shown.
 *
 * The original file stays available through the secure file viewer, but the
 * user-facing extracted-text view should not spill an Aadhaar, PAN, phone or
 * account number in plain sight. Dates (which use separators) are preserved;
 * only long unbroken identifier-like runs are masked.
 */

const AADHAAR = /\b\d{4}\s\d{4}\s\d{4}\b/g;
const PAN = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;
const PHONE = /\b(?:\+91[\s-]?)?[6-9]\d{9}\b/g;
// A long unbroken run of digits — account/certificate/application numbers.
const LONG_NUMBER = /\b\d{6,}\b/g;

function keepTail(match: string, visible = 3): string {
  const digits = match.replace(/\s/g, '');
  const tail = digits.slice(-visible);
  return '•'.repeat(Math.max(4, digits.length - visible)) + tail;
}

/** Return `text` with Aadhaar/PAN/phone/long-ID numbers masked. */
export function redactSensitive(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(AADHAAR, (m) => keepTail(m))
    .replace(PAN, (m) => keepTail(m))
    .replace(PHONE, (m) => keepTail(m))
    .replace(LONG_NUMBER, (m) => keepTail(m));
}
