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
  {
    id: 'ews-certificate',
    icon: 'doc',
    title: L('EWS Certificate', 'EWS प्रमाण पत्र', 'EWS ధృవీకరణ పత్రం'),
    forWhom: L(
      'People from the general (unreserved) category with annual family income below ₹8 lakh, who need proof to claim 10% EWS reservation in government jobs and education.',
      'सामान्य वर्ग के लोग जिनकी वार्षिक पारिवारिक आय ₹8 लाख से कम है, और जिन्हें सरकारी नौकरी व शिक्षा में 10% EWS आरक्षण के लिए प्रमाण चाहिए।',
      'వార్షిక కుటుంబ ఆదాయం ₹8 లక్షల కంటే తక్కువగా ఉన్న సాధారణ (అనారక్షిత) వర్గానికి చెందిన వ్యక్తులు, ప్రభుత్వ ఉద్యోగాలు మరియు విద్యలో 10% EWS రిజర్వేషన్ పొందడానికి.',
    ),
    documents: [
      L('Aadhaar card', 'आधार कार्ड', 'ఆధార్ కార్డు'),
      L('Income certificate (family income ≤ ₹8 lakh/year)', 'आय प्रमाण पत्र (पारिवारिक आय ≤ ₹8 लाख/वर्ष)', 'ఆదాయ ధృవీకరణ పత్రం (కుటుంబ ఆదాయం ≤ ₹8 లక్షలు/సంవత్సరం)'),
      L('Ration card or address proof', 'राशन कार्ड या पते का प्रमाण', 'రేషన్ కార్డు లేదా చిరునామా రుజువు'),
      L('Land / property record (if applicable)', 'भूमि / संपत्ति रिकॉर्ड (यदि लागू हो)', 'భూమి / ఆస్తి రికార్డు (వర్తించినట్లైతే)'),
      L('Affidavit on stamp paper declaring non-SC/ST/OBC status', 'स्टांप पेपर पर शपथ पत्र: SC/ST/OBC नहीं हैं', 'స్టాంప్ పేపర్‌పై అఫిడవిట్: SC/ST/OBC కాదు అని'),
      L('Passport size photo', 'पासपोर्ट साइज़ फ़ोटो', 'పాస్‌పోర్ట్ సైజు ఫోటో'),
    ],
    steps: [
      L('Get an income certificate from Mee Seva if you do not have one already.', 'यदि आपके पास आय प्रमाण पत्र नहीं है तो मी सेवा से लीजिए।', 'ఆదాయ ధృవీకరణ పత్రం లేకపోతే మీ‌సేవా నుండి పొందండి.'),
      L('Prepare an affidavit on ₹10 stamp paper stating your category.', '₹10 के स्टांप पेपर पर अपनी जाति घोषणा का शपथ पत्र तैयार करें।', '₹10 స్టాంప్ పేపర్‌పై మీ కులం ప్రకటన అఫిడవిట్ తయారు చేయండి.'),
      L('Fill EWS certificate application form at Mee Seva or Tahsildar office.', 'मी सेवा या तहसीलदार कार्यालय में EWS प्रमाण पत्र आवेदन फ़ॉर्म भरें।', 'మీ‌సేవా లేదా తహసీల్దార్ కార్యాలయంలో EWS ధృవీకరణ దరఖాస్తు ఫారమ్ నింపండి.'),
      L('Attach all documents and submit.', 'सभी दस्तावेज़ लगाएं और जमा करें।', 'అన్ని పత్రాలను జతచేసి సమర్పించండి.'),
      L('Certificate is usually issued within 7–15 working days.', 'प्रमाण पत्र आमतौर पर 7–15 कार्य दिवसों में जारी होता है।', 'ధృవీకరణ పత్రం సాధారణంగా 7–15 పని దినాలలో జారీ అవుతుంది.'),
    ],
    where: L(
      'Your nearest Mee Seva centre or Tahsildar / Revenue office.',
      'आपका नज़दीकी मी सेवा केंद्र या तहसीलदार / राजस्व कार्यालय।',
      'మీకు దగ్గరలోని మీ‌సేవా కేంద్రం లేదా తహసీల్దార్ / రెవెన్యూ కార్యాలయం.',
    ),
    deadline: null,
    meeSeva: true,
  },
  {
    id: 'birth-certificate',
    icon: 'doc',
    title: L('Birth Certificate', 'जन्म प्रमाण पत्र', 'జన్మ ధృవీకరణ పత్రం'),
    forWhom: L(
      'Anyone who needs official proof of date and place of birth — required for school admission, passport, Aadhaar, and most government services.',
      'जिसे जन्म तिथि और जन्म स्थान का आधिकारिक प्रमाण चाहिए — स्कूल प्रवेश, पासपोर्ट, आधार और अधिकांश सरकारी सेवाओं के लिए ज़रूरी।',
      'పాఠశాల చేరిక, పాస్‌పోర్ట్, ఆధార్ మరియు చాలా ప్రభుత్వ సేవలకు అవసరమైన జన్మ తేదీ మరియు స్థలం యొక్క అధికారిక రుజువు అవసరమైన వారికి.',
    ),
    documents: [
      L('Hospital discharge summary or delivery record', 'अस्पताल डिस्चार्ज सारांश या प्रसव रिकॉर्ड', 'ఆసుపత్రి డిశ్చార్జ్ సారాంశం లేదా ప్రసవ రికార్డు'),
      L('Parents\' Aadhaar card', 'माता-पिता का आधार कार्ड', 'తల్లిదండ్రుల ఆధార్ కార్డు'),
      L('Marriage certificate of parents (if applicable)', 'माता-पिता का विवाह प्रमाण पत्र (यदि लागू हो)', 'తల్లిదండ్రుల వివాహ ధృవీకరణ పత్రం (వర్తించినట్లైతే)'),
      L('Address proof', 'पते का प्रमाण', 'చిరునామా రుజువు'),
    ],
    steps: [
      L('Register the birth at the municipal office within 21 days of birth.', 'जन्म के 21 दिन के भीतर नगर पालिका में जन्म पंजीकरण करें।', 'పుట్టిన 21 రోజులలోపు మున్సిపల్ కార్యాలయంలో జన్మ నమోదు చేయండి.'),
      L('If delayed, apply at the Registrar of Births with an affidavit.', 'देरी होने पर शपथ पत्र के साथ जन्म रजिस्ट्रार के पास आवेदन करें।', 'ఆలస్యమైతే అఫిడవిట్‌తో జన్మ నమోదుదారు వద్ద దరఖాస్తు చేయండి.'),
      L('Pay the fee and collect the certificate.', 'शुल्क जमा करें और प्रमाण पत्र लें।', 'రుసుము చెల్లించి ధృవీకరణ పత్రం తీసుకోండి.'),
    ],
    where: L(
      'Municipal office, Gram Panchayat, or Mee Seva centre.',
      'नगर पालिका, ग्राम पंचायत, या मी सेवा केंद्र।',
      'మున్సిపల్ కార్యాలయం, గ్రామ పంచాయతీ, లేదా మీ‌సేవా కేంద్రం.',
    ),
    deadline: L(
      'Must be registered within 21 days of birth. A late fee applies after that.',
      'जन्म के 21 दिन के भीतर पंजीकरण अनिवार्य है। इसके बाद विलंब शुल्क लगता है।',
      'పుట్టిన 21 రోజులలోపు నమోదు తప్పనిసరి. ఆ తర్వాత ఆలస్య రుసుము వర్తిస్తుంది.',
    ),
    meeSeva: true,
  },
  {
    id: 'disability-certificate',
    icon: 'doc',
    title: L('Disability Certificate', 'दिव्यांगता प्रमाण पत्र', 'వికలాంగుల ధృవీకరణ పత్రం'),
    forWhom: L(
      'Persons with physical, intellectual, or sensory disabilities who need official certification to claim reservations, concessions, and welfare schemes.',
      'शारीरिक, बौद्धिक या संवेदी अक्षमता वाले व्यक्ति जिन्हें आरक्षण, रियायत और कल्याण योजनाओं का लाभ उठाने के लिए आधिकारिक प्रमाण पत्र चाहिए।',
      'రిజర్వేషన్లు, రాయితీలు మరియు సంక్షేమ పథకాలను పొందడానికి అధికారిక ధృవీకరణ అవసరమైన శారీరక, మేధో లేదా ఇంద్రియ వికలాంగులు.',
    ),
    documents: [
      L('Aadhaar card', 'आधार कार्ड', 'ఆధార్ కార్డు'),
      L('Medical records / doctor\'s report stating disability', 'चिकित्सा रिकॉर्ड / विकलांगता बताने वाली डॉक्टर की रिपोर्ट', 'వికలాంగతను పేర్కొనే వైద్య రికార్డులు / డాక్టర్ నివేదిక'),
      L('Passport size photo', 'पासपोर्ट साइज़ फ़ोटो', 'పాస్‌పోర్ట్ సైజు ఫోటో'),
      L('Address proof', 'पते का प्रमाण', 'చిరునామా రుజువు'),
    ],
    steps: [
      L('Visit a government hospital for a medical board assessment.', 'चिकित्सा बोर्ड मूल्यांकन के लिए सरकारी अस्पताल जाएं।', 'మెడికల్ బోర్డ్ అంచనా కోసం ప్రభుత్వ ఆసుపత్రిని సందర్శించండి.'),
      L('The board issues a disability percentage certificate.', 'बोर्ड विकलांगता प्रतिशत प्रमाण पत्र जारी करता है।', 'బోర్డు వికలాంగత శాతం ధృవీకరణ పత్రాన్ని జారీ చేస్తుంది.'),
      L('Apply for the official certificate at the District Social Welfare Office.', 'जिला समाज कल्याण कार्यालय में आधिकारिक प्रमाण पत्र के लिए आवेदन करें।', 'జిల్లా సామాజిక సంక్షేమ కార్యాలయంలో అధికారిక ధృవీకరణ పత్రానికి దరఖాస్తు చేయండి.'),
    ],
    where: L(
      'District Social Welfare Office or government hospital medical board.',
      'जिला समाज कल्याण कार्यालय या सरकारी अस्पताल का चिकित्सा बोर्ड।',
      'జిల్లా సామాజిక సంక్షేమ కార్యాలయం లేదా ప్రభుత్వ ఆసుపత్రి మెడికల్ బోర్డు.',
    ),
    deadline: null,
    meeSeva: false,
  },
];
