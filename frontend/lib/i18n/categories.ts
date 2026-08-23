import { L } from '@/types';
import type { Localized, DocumentCategory } from '@/types';

export const CATS: Record<DocumentCategory, Localized> = {
  pension:   L("Pension", "पेंशन", "పింఛను"),
  scheme:    L("Government schemes", "सरकारी योजनाएँ", "ప్రభుత్వ పథకాలు"),
  tax:       L("Tax", "कर", "పన్ను"),
  identity:  L("Identity", "पहचान", "గుర్తింపు"),
  property:  L("Property", "संपत्ति", "ఆస్తి"),
  education: L("Education", "शिक्षा", "విద్య"),
  other:     L("Other", "अन्य", "ఇతర")
};
