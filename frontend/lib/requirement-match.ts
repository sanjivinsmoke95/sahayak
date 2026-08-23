import type { SahayakDocument } from '@/types';

/**
 * Match a service requirement line to an uploaded document by its detected
 * type — never by filename. The backend classifies each upload into a docType
 * ("Aadhaar Card", "Income Certificate", …); here we decide which requirement
 * that type satisfies, so one stored document can complete a slot in any
 * service without being uploaded again.
 */
const REQUIREMENT_ALIASES: [RegExp, string[]][] = [
  [/aadhaar|aadhar/i, ['aadhaar', 'aadhar']],
  [/\bpan\b/i, ['pan']],
  [/passbook|bank/i, ['passbook', 'bank']],
  [/life certificate|jeevan/i, ['life certificate', 'jeevan']],
  [/pension|ppo/i, ['pension']],
  [/income/i, ['income']],
  [/caste|community/i, ['caste', 'community']],
  [/residence|domicile|address proof/i, ['residence', 'domicile']],
  [/ration/i, ['ration']],
  [/voter/i, ['voter']],
  [/passport(?!\s*size)/i, ['passport']],
  [/licen[cs]e/i, ['licence', 'license']],
  [/birth certificate/i, ['birth']],
  [/death certificate/i, ['death']],
];

function tokensFor(requirementEn: string): string[] {
  const req = requirementEn.toLowerCase();
  return REQUIREMENT_ALIASES.filter(([re]) => re.test(req)).flatMap(([, tokens]) => tokens);
}

/** The uploaded document that satisfies this requirement, or null. */
export function matchRequirement(
  requirementEn: string,
  docs: SahayakDocument[],
): SahayakDocument | null {
  const tokens = tokensFor(requirementEn);
  if (!tokens.length) return null;
  for (const doc of docs) {
    const docType = (doc.docType ?? '').toLowerCase();
    if (docType && tokens.some((token) => docType.includes(token))) return doc;
  }
  return null;
}

/** Whether an analysed document would satisfy the given requirement line. */
export function documentSatisfies(requirementEn: string, doc: SahayakDocument): boolean {
  const tokens = tokensFor(requirementEn);
  const docType = (doc.docType ?? '').toLowerCase();
  return !!docType && tokens.some((token) => docType.includes(token));
}
