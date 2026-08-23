import { L } from '@/types';
import type { Localized } from '@/types';

/**
 * Display label + plain-language explanation for each form field the assistant
 * can detect. Keyed by the backend field key, localized here.
 */
export const FORM_FIELD_INFO: Record<string, { label: Localized; explanation: Localized }> = {
  name: {
    label: L('Name', 'नाम', 'పేరు'),
    explanation: L('Your full name as printed on your ID.', 'आपका पूरा नाम, जैसा आपकी आईडी पर छपा है।', 'మీ ఐడీపై ఉన్నట్లు మీ పూర్తి పేరు.'),
  },
  father: {
    label: L("Father's / guardian's name", 'पिता / अभिभावक का नाम', 'తండ్రి / సంరక్షకుని పేరు'),
    explanation: L("Your father's or guardian's name.", 'आपके पिता या अभिभावक का नाम।', 'మీ తండ్రి లేదా సంరక్షకుని పేరు.'),
  },
  dob: {
    label: L('Date of birth', 'जन्म तिथि', 'పుట్టిన తేదీ'),
    explanation: L('Your date of birth as on your certificate.', 'आपकी जन्म तिथि, जैसा प्रमाणपत्र पर है।', 'మీ ధృవీకరణ పత్రంపై ఉన్న పుట్టిన తేదీ.'),
  },
  annualIncome: {
    label: L('Annual family income', 'वार्षिक पारिवारिक आय', 'వార్షిక కుటుంబ ఆదాయం'),
    explanation: L('Your family income for the year, as on your income certificate.', 'साल की आपकी पारिवारिक आय, जैसा आय प्रमाणपत्र पर है।', 'ఆదాయ ధృవీకరణ పత్రంపై ఉన్న సంవత్సర కుటుంబ ఆదాయం.'),
  },
  aadhaar: {
    label: L('Aadhaar number', 'आधार संख्या', 'ఆధార్ నంబర్'),
    explanation: L('Your 12-digit Aadhaar number.', 'आपका 12 अंकों का आधार नंबर।', 'మీ 12-అంకెల ఆధార్ నంబర్.'),
  },
  pan: {
    label: L('PAN', 'पैन', 'పాన్'),
    explanation: L('Your Permanent Account Number.', 'आपका स्थायी खाता संख्या।', 'మీ శాశ్వత ఖాతా సంఖ్య.'),
  },
  mobile: {
    label: L('Mobile number', 'मोबाइल नंबर', 'మొబైల్ నంబర్'),
    explanation: L('A phone number where you can be reached.', 'एक फ़ोन नंबर जहाँ आपसे संपर्क हो सके।', 'మిమ్మల్ని సంప్రదించగల ఫోన్ నంబర్.'),
  },
  address: {
    label: L('Address', 'पता', 'చిరునామా'),
    explanation: L('Your residential address.', 'आपका आवासीय पता।', 'మీ నివాస చిరునామా.'),
  },
};
