import { L } from '@/types';
import type { CitizenService } from '@/types';

/**
 * The citizen-service directory.
 *
 * Data, not layout — the cards render whatever is listed here, so a new service
 * is one entry, written in English, Hindi and Telugu. The document lists are
 * the papers these services commonly ask for; the cards tell the reader to
 * confirm the exact list at the office, so nothing here is presented as an
 * official rule.
 */
export const GOV_SERVICES: CitizenService[] = [
  {
    id: 'pension-registration',
    icon: 'user',
    title: L('Pension Registration', 'पेंशन पंजीकरण', 'పింఛను నమోదు'),
    forWhom: L(
      'Older people, widows and persons with disability applying for a monthly pension.',
      'मासिक पेंशन के लिए आवेदन करने वाले बुज़ुर्ग, विधवा और दिव्यांग व्यक्ति।',
      'నెలవారీ పింఛను కోసం దరఖాస్తు చేసే వృద్ధులు, వితంతువులు మరియు దివ్యాంగులు.',
    ),
    documents: [
      L('Aadhaar card', 'आधार कार्ड', 'ఆధార్ కార్డు'),
      L('Bank account details', 'बैंक खाता विवरण', 'బ్యాంకు ఖాతా వివరాలు'),
      L('Age proof', 'आयु प्रमाण', 'వయస్సు రుజువు'),
      L('Passport size photo', 'पासपोर्ट साइज़ फ़ोटो', 'పాస్‌పోర్ట్ సైజు ఫోటో'),
    ],
    steps: [
      L('Fill the pension application form.', 'पेंशन आवेदन फ़ॉर्म भरिए।', 'పింఛను దరఖాస్తు ఫారమ్ నింపండి.'),
      L('Attach the required documents.', 'ज़रूरी दस्तावेज़ लगाइए।', 'అవసరమైన పత్రాలను జతచేయండి.'),
      L('Submit at your Mee Seva centre.', 'अपने मी सेवा केंद्र पर जमा कीजिए।', 'మీ మీ‌సేవా కేంద్రంలో సమర్పించండి.'),
    ],
    where: L(
      'Your nearest Mee Seva centre or the local welfare office.',
      'आपका नज़दीकी मी सेवा केंद्र या स्थानीय कल्याण कार्यालय।',
      'మీకు దగ్గరలోని మీ‌సేవా కేంద్రం లేదా స్థానిక సంక్షేమ కార్యాలయం.',
    ),
    deadline: null,
    meeSeva: true,
  },
  {
    id: 'pension-renewal',
    icon: 'calendar',
    title: L('Pension Renewal', 'पेंशन नवीनीकरण', 'పింఛను పునరుద్ధరణ'),
    forWhom: L(
      'Existing pensioners who must renew their record each year to keep receiving payments.',
      'मौजूदा पेंशनधारक जिन्हें भुगतान जारी रखने के लिए हर साल अपना रिकॉर्ड नवीनीकृत करना होता है।',
      'చెల్లింపులు కొనసాగించడానికి ప్రతి సంవత్సరం తమ రికార్డును పునరుద్ధరించవలసిన ప్రస్తుత పింఛనుదారులు.',
    ),
    documents: [
      L('Life certificate', 'जीवन प्रमाण पत्र', 'జీవన్ ప్రమాణ్ పత్రం'),
      L('Aadhaar card', 'आधार कार्ड', 'ఆధార్ కార్డు'),
      L('Bank passbook', 'बैंक पासबुक', 'బ్యాంకు పాస్‌బుక్'),
      L('Filled renewal form', 'भरा हुआ नवीनीकरण फ़ॉर्म', 'నింపిన పునరుద్ధరణ ఫారమ్'),
    ],
    steps: [
      L('Get your life certificate.', 'अपना जीवन प्रमाण पत्र प्राप्त कीजिए।', 'మీ జీవన్ ప్రమాణ్ పత్రాన్ని పొందండి.'),
      L('Fill the renewal form.', 'नवीनीकरण फ़ॉर्म भरिए।', 'పునరుద్ధరణ ఫారమ్ నింపండి.'),
      L('Submit before the last date.', 'अंतिम तारीख से पहले जमा कीजिए।', 'చివరి తేదీలోపు సమర్పించండి.'),
    ],
    where: L(
      'Your bank, the pension office, or a Mee Seva centre.',
      'आपका बैंक, पेंशन कार्यालय, या मी सेवा केंद्र।',
      'మీ బ్యాంకు, పింఛను కార్యాలయం, లేదా మీ‌సేవా కేంద్రం.',
    ),
    deadline: L(
      'Usually renewed once a year — check the date on your notice.',
      'आमतौर पर साल में एक बार — अपनी सूचना पर तारीख देखिए।',
      'సాధారణంగా సంవత్సరానికి ఒకసారి — మీ నోటీసుపై తేదీని చూడండి.',
    ),
    meeSeva: true,
  },
  {
    id: 'income-certificate',
    icon: 'doc',
    title: L('Income Certificate', 'आय प्रमाण पत्र', 'ఆదాయ ధృవీకరణ పత్రం'),
    forWhom: L(
      'People who need proof of family income for scholarships, fee waivers or welfare schemes.',
      'जिन्हें छात्रवृत्ति, फ़ीस माफ़ी या कल्याण योजनाओं के लिए पारिवारिक आय का प्रमाण चाहिए।',
      'ఉపకారవేతనాలు, ఫీజు మినహాయింపు లేదా సంక్షేమ పథకాల కోసం కుటుంబ ఆదాయ రుజువు అవసరమైన వారు.',
    ),
    documents: [
      L('Aadhaar card', 'आधार कार्ड', 'ఆధార్ కార్డు'),
      L('Ration card', 'राशन कार्ड', 'రేషన్ కార్డు'),
      L('Proof of income', 'आय का प्रमाण', 'ఆదాయ రుజువు'),
      L('Address proof', 'पते का प्रमाण', 'చిరునామా రుజువు'),
    ],
    steps: [
      L('Fill the income certificate application.', 'आय प्रमाण पत्र आवेदन भरिए।', 'ఆదాయ ధృవీకరణ దరఖాస్తును నింపండి.'),
      L('Attach income and address proof.', 'आय और पते का प्रमाण लगाइए।', 'ఆదాయం, చిరునామా రుజువును జతచేయండి.'),
      L('Submit at a Mee Seva centre.', 'मी सेवा केंद्र पर जमा कीजिए।', 'మీ‌సేవా కేంద్రంలో సమర్పించండి.'),
    ],
    where: L(
      'Your nearest Mee Seva centre or the Tahsildar office.',
      'आपका नज़दीकी मी सेवा केंद्र या तहसीलदार कार्यालय।',
      'మీకు దగ్గరలోని మీ‌సేవా కేంద్రం లేదా తహసీల్దార్ కార్యాలయం.',
    ),
    deadline: null,
    meeSeva: true,
  },
  {
    id: 'caste-certificate',
    icon: 'user',
    title: L('Caste Certificate', 'जाति प्रमाण पत्र', 'కుల ధృవీకరణ పత్రం'),
    forWhom: L(
      'People from SC, ST or OBC communities who need proof of caste for reservations and schemes.',
      'एससी, एसटी या ओबीसी समुदाय के लोग जिन्हें आरक्षण और योजनाओं के लिए जाति का प्रमाण चाहिए।',
      'రిజర్వేషన్లు, పథకాల కోసం కుల రుజువు అవసరమైన SC, ST లేదా OBC వర్గాల ప్రజలు.',
    ),
    documents: [
      L('Aadhaar card', 'आधार कार्ड', 'ఆధార్ కార్డు'),
      L('Ration card', 'राशन कार्ड', 'రేషన్ కార్డు'),
      L("Parent's caste certificate, if any", 'माता-पिता का जाति प्रमाण पत्र, यदि हो', 'తల్లిదండ్రుల కుల ధృవీకరణ పత్రం, ఉంటే'),
      L('Address proof', 'पते का प्रमाण', 'చిరునామా రుజువు'),
    ],
    steps: [
      L('Fill the caste certificate application.', 'जाति प्रमाण पत्र आवेदन भरिए।', 'కుల ధృవీకరణ దరఖాస్తును నింపండి.'),
      L('Attach the supporting documents.', 'सहायक दस्तावेज़ लगाइए।', 'సహాయక పత్రాలను జతచేయండి.'),
      L('Submit at a Mee Seva centre.', 'मी सेवा केंद्र पर जमा कीजिए।', 'మీ‌సేవా కేంద్రంలో సమర్పించండి.'),
    ],
    where: L(
      'Your nearest Mee Seva centre or the Tahsildar office.',
      'आपका नज़दीकी मी सेवा केंद्र या तहसीलदार कार्यालय।',
      'మీకు దగ్గరలోని మీ‌సేవా కేంద్రం లేదా తహసీల్దార్ కార్యాలయం.',
    ),
    deadline: null,
    meeSeva: true,
  },
  {
    id: 'residence-certificate',
    icon: 'folder',
    title: L('Residence Certificate', 'निवास प्रमाण पत्र', 'నివాస ధృవీకరణ పత్రం'),
    forWhom: L(
      'People who need proof that they live in a particular state or district.',
      'जिन्हें प्रमाण चाहिए कि वे किसी राज्य या ज़िले में रहते हैं।',
      'ఒక రాష్ట్రం లేదా జిల్లాలో నివసిస్తున్నట్లు రుజువు అవసరమైన వారు.',
    ),
    documents: [
      L('Aadhaar card', 'आधार कार्ड', 'ఆధార్ కార్డు'),
      L('Ration card', 'राशन कार्ड', 'రేషన్ కార్డు'),
      L('Electricity or water bill', 'बिजली या पानी का बिल', 'విద్యుత్ లేదా నీటి బిల్లు'),
      L('Address proof', 'पते का प्रमाण', 'చిరునామా రుజువు'),
    ],
    steps: [
      L('Fill the residence certificate application.', 'निवास प्रमाण पत्र आवेदन भरिए।', 'నివాస ధృవీకరణ దరఖాస్తును నింపండి.'),
      L('Attach proof of address.', 'पते का प्रमाण लगाइए।', 'చిరునామా రుజువును జతచేయండి.'),
      L('Submit at a Mee Seva centre.', 'मी सेवा केंद्र पर जमा कीजिए।', 'మీ‌సేవా కేంద్రంలో సమర్పించండి.'),
    ],
    where: L(
      'Your nearest Mee Seva centre or the Tahsildar office.',
      'आपका नज़दीकी मी सेवा केंद्र या तहसीलदार कार्यालय।',
      'మీకు దగ్గరలోని మీ‌సేవా కేంద్రం లేదా తహసీల్దార్ కార్యాలయం.',
    ),
    deadline: null,
    meeSeva: true,
  },
];
