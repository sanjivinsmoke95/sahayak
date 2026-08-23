import type { StringKey } from '@/lib/i18n';

/** Human, localized label for each requirement tag used in scheme matching. */
export const TAG_LABEL: Record<string, StringKey> = {
  aadhaar: 'tagAadhaar',
  aadhar: 'tagAadhaar',
  income: 'tagIncome',
  caste: 'tagCaste',
  residence: 'tagResidence',
  domicile: 'tagResidence',
  bank: 'tagBank',
  passbook: 'tagBank',
  ration: 'tagRation',
  birth: 'tagBirth',
  death: 'tagDeath',
  disability: 'tagDisability',
  pan: 'tagPan',
};
