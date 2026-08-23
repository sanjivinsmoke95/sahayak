import type { StringKey } from '@/lib/i18n';

export const RELATIONSHIPS: { value: string; key: StringKey }[] = [
  { value: 'mother', key: 'relMother' },
  { value: 'father', key: 'relFather' },
  { value: 'spouse', key: 'relSpouse' },
  { value: 'child', key: 'relChild' },
  { value: 'other', key: 'relOther' },
];

const KEYS: Record<string, StringKey> = {
  mother: 'relMother',
  father: 'relFather',
  spouse: 'relSpouse',
  child: 'relChild',
  other: 'relOther',
};

export const relationshipKey = (value: string): StringKey => KEYS[value] ?? 'relOther';
