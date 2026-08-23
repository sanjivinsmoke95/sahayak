import { L } from '@/types';
import type { SahayakDocument } from '@/types';

/**
 * Demonstration notices. They stand in for real uploads so the app can be
 * shown end to end without sending anyone's Aadhaar card anywhere, and they
 * are what the backend seeds into a brand new account.
 */
export const SAMPLE_DOCUMENTS: SahayakDocument[] = [
{
  id: 'pension', cat: 'pension', seeded: false, status: 'action',
  title: L("Pension Renewal Notice", "पेंशन नवीनीकरण सूचना", "పింఛను పునరుద్ధరణ నోటీసు"),
  issuer: L("Office of the Pension Disbursing Authority (demo)", "पेंशन वितरण कार्यालय (डेमो)", "పింఛను పంపిణీ కార్యాలయం (డెమో)"),
  refNo: "PDA/RNW/2026/44871",
  received: "2026-08-02", deadline: "2026-09-30",
  what: L("This is a pension renewal notice.",
          "यह एक पेंशन नवीनीकरण सूचना है।",
          "ఇది పింఛను పునరుద్ధరణ నోటీసు."),
  why:  L("Your pension record has to be renewed once every year. This letter is reminding you to finish that renewal before the last date.",
          "आपका पेंशन रिकॉर्ड हर साल एक बार नया कराना होता है। यह पत्र याद दिला रहा है कि अंतिम तारीख से पहले यह काम पूरा कर लीजिए।",
          "మీ పింఛను రికార్డును ప్రతి సంవత్సరం ఒకసారి పునరుద్ధరించాలి. చివరి తేదీలోపు ఆ పని పూర్తి చేయమని ఈ లేఖ గుర్తు చేస్తోంది."),
  steps: [
    L("Get your life certificate from your bank or the pension office.",
      "अपने बैंक या पेंशन कार्यालय से जीवन प्रमाण पत्र बनवाइए।",
      "మీ బ్యాంకు లేదా పింఛను కార్యాలయంలో జీవన ధ్రువీకరణ పత్రం తీసుకోండి."),
    L("Fill the renewal form that came with this notice.",
      "इस सूचना के साथ आया नवीनीकरण फ़ॉर्म भरिए।",
      "ఈ నోటీసుతో వచ్చిన పునరుద్ధరణ ఫారాన్ని నింపండి."),
    L("Attach one copy each of your Aadhaar and your bank passbook.",
      "अपने आधार और बैंक पासबुक की एक-एक कॉपी लगाइए।",
      "మీ ఆధార్, బ్యాంకు పాస్‌బుక్ కాపీలను ఒక్కొక్కటి జత చేయండి."),
    L("Submit everything at the pension office named in the notice, before 30 September.",
      "सारे कागज़ 30 सितंबर से पहले सूचना में लिखे पेंशन कार्यालय में जमा कीजिए।",
      "అన్ని పత్రాలను సెప్టెంబర్ 30లోపు నోటీసులో పేర్కొన్న పింఛను కార్యాలయంలో సమర్పించండి.")
  ],
  need: [
    L("Aadhaar card", "आधार कार्ड", "ఆధార్ కార్డు"),
    L("Bank passbook", "बैंक पासबुक", "బ్యాంకు పాస్‌బుక్"),
    L("Life certificate", "जीवन प्रमाण पत्र", "జీవన ధ్రువీకరణ పత్రం"),
    L("Filled renewal form", "भरा हुआ नवीनीकरण फ़ॉर्म", "నింపిన పునరుద్ధరణ ఫారం"),
    L("Copy of your pension order (PPO)", "पेंशन आदेश (PPO) की कॉपी", "పింఛను ఉత్తర్వు (PPO) కాపీ")
  ],
  needDone: [true, true, false, false, true],
  where: L("Submit at the pension office written on your notice, or through the official portal printed on it. Carry the original papers with you so they can be checked.",
           "अपनी सूचना में लिखे पेंशन कार्यालय में, या उस पर छपे आधिकारिक पोर्टल पर जमा कीजिए। जाँच के लिए मूल कागज़ साथ ले जाइए।",
           "మీ నోటీసులో రాసి ఉన్న పింఛను కార్యాలయంలో, లేదా దానిపై ముద్రించిన అధికారిక పోర్టల్‌లో సమర్పించండి. తనిఖీ కోసం అసలు పత్రాలను వెంట తీసుకెళ్లండి."),
  ifNot: L("If the renewal is not done before the last date, your monthly pension payment can be paused until you complete it.",
           "अगर अंतिम तारीख से पहले नवीनीकरण नहीं हुआ, तो आपकी मासिक पेंशन तब तक रुक सकती है जब तक आप यह पूरा नहीं करते।",
           "చివరి తేదీలోపు పునరుద్ధరణ చేయకపోతే, మీరు పూర్తి చేసే వరకు మీ నెలవారీ పింఛను నిలిపివేయబడవచ్చు."),
  explain: L("This letter is about your pension. You need to renew your pension record before 30 September 2026. For that you will need your Aadhaar, your bank passbook and a life certificate. You do not have to understand the rest of the letter right now. I will take you through it, one step at a time.",
             "यह पत्र आपकी पेंशन के बारे में है। आपको 30 सितंबर 2026 से पहले अपना पेंशन रिकॉर्ड नया कराना है। इसके लिए आपको आधार, बैंक पासबुक और जीवन प्रमाण पत्र चाहिए होगा। बाकी पत्र अभी समझने की ज़रूरत नहीं है। मैं आपको एक-एक कदम करके ले चलूँगा।",
             "ఈ లేఖ మీ పింఛను గురించి. 2026 సెప్టెంబర్ 30లోపు మీ పింఛను రికార్డును పునరుద్ధరించాలి. దాని కోసం మీకు ఆధార్, బ్యాంకు పాస్‌బుక్, జీవన ధ్రువీకరణ పత్రం కావాలి. మిగతా లేఖను ఇప్పుడే అర్థం చేసుకోవాల్సిన అవసరం లేదు. నేను మిమ్మల్ని ఒక్కో దశలో తీసుకెళ్తాను."),
  gov: {
    what: "Sub: Annual verification and renewal of pension records in respect of beneficiaries drawing monthly pension — reg.",
    why:  "In pursuance of the extant guidelines governing pension disbursement, all beneficiaries are hereby directed to undergo annual verification for the purpose of continuance of disbursement.",
    doIt: "Beneficiaries are required to furnish a life certificate, duly attested, together with the prescribed renewal proforma and self-attested photocopies of the Aadhaar card and the first page of the bank passbook reflecting the account particulars, to the sanctioning authority on or before 30.09.2026.",
    where:"The requisite documentation shall be submitted to the sanctioning authority at the office of the Pension Disbursing Authority, or through the designated official portal, along with originals for verification."
  },
  original: "OFFICE OF THE PENSION DISBURSING AUTHORITY\nNo. PDA/RNW/2026/44871\nDated: 02.08.2026\n\nSub: Annual verification and renewal of pension records in respect of beneficiaries drawing monthly pension — reg.\n\nIn pursuance of the extant guidelines governing pension disbursement, all beneficiaries are hereby directed to undergo annual verification for the purpose of continuance of disbursement. Beneficiaries are required to furnish a life certificate, duly attested, together with the prescribed renewal proforma appended hereto as Annexure-I, and self-attested photocopies of the Aadhaar card and the first page of the bank passbook reflecting the account particulars into which the pension is being credited, to the sanctioning authority on or before 30.09.2026.\n\nIt may be noted that non-furnishing of the aforesaid documentation within the stipulated timeline shall render the pension liable to be kept in abeyance until such time as the requisite compliance is effected. Beneficiaries are further advised to quote the Pension Payment Order number in all correspondence. Any change in the account particulars must be intimated forthwith to the sanctioning authority.\n\nThis notice is issued without prejudice to any other action as may be warranted under the applicable rules.",
  pairs: [
    { gov: "Beneficiaries are required to furnish a life certificate on or before the stipulated date.",
      simple: L("You need to give a life certificate before the last date.", "आपको अंतिम तारीख से पहले जीवन प्रमाण पत्र देना है।", "చివరి తేదీలోపు మీరు జీవన ధ్రువీకరణ పత్రం ఇవ్వాలి.") },
    { gov: "Non-furnishing shall render the pension liable to be kept in abeyance.",
      simple: L("If you do not give these papers, your pension money may stop for a while.", "अगर आपने ये कागज़ नहीं दिए, तो कुछ समय के लिए आपकी पेंशन रुक सकती है।", "ఈ పత్రాలు ఇవ్వకపోతే, కొంతకాలం మీ పింఛను ఆగిపోవచ్చు.") },
    { gov: "Submit to the sanctioning authority along with originals for verification.",
      simple: L("Give the papers to the pension office, and take the originals along to show them.", "कागज़ पेंशन कार्यालय में दीजिए, और दिखाने के लिए मूल कागज़ साथ ले जाइए।", "పత్రాలను పింఛను కార్యాలయంలో ఇవ్వండి, చూపించడానికి అసలు పత్రాలను వెంట తీసుకెళ్లండి.") }
  ],
  elig: { minAge: 60, work: ['retired'], note: L("This notice is meant for people who already receive a monthly pension.", "यह सूचना उन लोगों के लिए है जिन्हें पहले से मासिक पेंशन मिलती है।", "ఇప్పటికే నెలవారీ పింఛను పొందుతున్న వారి కోసం ఈ నోటీసు.") }
},
{
  id: 'scheme', cat: 'scheme', seeded: true, status: 'action',
  title: L("Senior Citizen Support Scheme — Notification", "वरिष्ठ नागरिक सहायता योजना — अधिसूचना", "వృద్ధుల సహాయ పథకం — నోటిఫికేషన్"),
  issuer: L("District Welfare Office (demo)", "जिला कल्याण कार्यालय (डेमो)", "జిల్లా సంక్షేమ కార్యాలయం (డెమో)"),
  refNo: "DWO/SCS/2026/1109",
  received: "2026-07-28", deadline: "2026-10-14",
  what: L("This is a notification about a support scheme for senior citizens.",
          "यह वरिष्ठ नागरिकों के लिए एक सहायता योजना की अधिसूचना है।",
          "ఇది వృద్ధుల కోసం ఒక సహాయ పథకం నోటిఫికేషన్."),
  why:  L("It tells you that applications are open, who can apply, and the last date. You received it because your area office sends it to all senior citizens on its list.",
          "यह बताती है कि आवेदन शुरू हैं, कौन आवेदन कर सकता है, और अंतिम तारीख क्या है। यह आपको इसलिए मिली क्योंकि आपका क्षेत्रीय कार्यालय अपनी सूची के सभी वरिष्ठ नागरिकों को यह भेजता है।",
          "దరఖాస్తులు ప్రారంభమయ్యాయని, ఎవరు దరఖాస్తు చేయవచ్చో, చివరి తేదీ ఏమిటో ఇది తెలియజేస్తుంది. మీ ప్రాంత కార్యాలయం తన జాబితాలోని వృద్ధులందరికీ దీన్ని పంపుతుంది కాబట్టి మీకు వచ్చింది."),
  steps: [
    L("Check whether you meet the conditions given in the notice.", "देखिए कि आप सूचना में दी गई शर्तें पूरी करते हैं या नहीं।", "నోటీసులో ఇచ్చిన షరతులను మీరు తీరుస్తున్నారో లేదో చూడండి."),
    L("Collect your age proof, income certificate and bank details.", "अपना आयु प्रमाण, आय प्रमाण पत्र और बैंक विवरण इकट्ठा कीजिए।", "మీ వయస్సు ధ్రువీకరణ, ఆదాయ ధ్రువీకరణ పత్రం, బ్యాంకు వివరాలు సేకరించండి."),
    L("Fill the application at the welfare office or on the official portal named in the notice.", "कल्याण कार्यालय में या सूचना में लिखे आधिकारिक पोर्टल पर आवेदन भरिए।", "సంక్షేమ కార్యాలయంలో లేదా నోటీసులో పేర్కొన్న అధికారిక పోర్టల్‌లో దరఖాస్తు నింపండి."),
    L("Ask for a receipt after applying and keep it safely.", "आवेदन के बाद रसीद ज़रूर लीजिए और संभालकर रखिए।", "దరఖాస్తు తర్వాత రసీదు తీసుకుని భద్రంగా ఉంచుకోండి.")
  ],
  need: [
    L("Aadhaar card", "आधार कार्ड", "ఆధార్ కార్డు"),
    L("Age proof", "आयु प्रमाण", "వయస్సు ధ్రువీకరణ"),
    L("Income certificate", "आय प्रमाण पत्र", "ఆదాయ ధ్రువీకరణ పత్రం"),
    L("Bank passbook", "बैंक पासबुक", "బ్యాంకు పాస్‌బుక్"),
    L("Two passport size photos", "पासपोर्ट साइज़ की दो फ़ोटो", "రెండు పాస్‌పోర్ట్ సైజ్ ఫోటోలు")
  ],
  needDone: [true, false, false, true, false],
  where: L("Apply at the district welfare office named in the notification, or on the official portal mentioned in it. Always ask for a receipt.",
           "अधिसूचना में लिखे जिला कल्याण कार्यालय में, या उसमें बताए आधिकारिक पोर्टल पर आवेदन कीजिए। रसीद हमेशा लीजिए।",
           "నోటిఫికేషన్‌లో పేర్కొన్న జిల్లా సంక్షేమ కార్యాలయంలో, లేదా అందులో తెలిపిన అధికారిక పోర్టల్‌లో దరఖాస్తు చేయండి. ఎప్పుడూ రసీదు తీసుకోండి."),
  ifNot: L("If you do not apply before the last date, you will have to wait for the next round of applications.",
           "अगर अंतिम तारीख से पहले आवेदन नहीं किया, तो अगले दौर का इंतज़ार करना पड़ेगा।",
           "చివరి తేదీలోపు దరఖాస్తు చేయకపోతే, తదుపరి విడత కోసం వేచి ఉండాలి."),
  explain: L("This is an announcement, not a bill. It says a support scheme for senior citizens is open for applications until 14 October 2026. If your age and income match the conditions, you can apply at the welfare office with your Aadhaar, an income certificate and your bank passbook. There is no penalty if you choose not to apply.",
             "यह कोई बिल नहीं, एक घोषणा है। इसमें लिखा है कि वरिष्ठ नागरिकों के लिए एक सहायता योजना के आवेदन 14 अक्टूबर 2026 तक खुले हैं। अगर आपकी उम्र और आय शर्तों से मेल खाती है, तो आधार, आय प्रमाण पत्र और बैंक पासबुक लेकर कल्याण कार्यालय में आवेदन कर सकते हैं। आवेदन न करने पर कोई जुर्माना नहीं है।",
             "ఇది బిల్లు కాదు, ఒక ప్రకటన. వృద్ధుల సహాయ పథకానికి 2026 అక్టోబర్ 14 వరకు దరఖాస్తులు తెరిచి ఉన్నాయని ఇది చెబుతోంది. మీ వయస్సు, ఆదాయం షరతులకు సరిపోతే, ఆధార్, ఆదాయ ధ్రువీకరణ పత్రం, బ్యాంకు పాస్‌బుక్‌తో సంక్షేమ కార్యాలయంలో దరఖాస్తు చేయవచ్చు. దరఖాస్తు చేయకపోతే ఎలాంటి జరిమానా లేదు."),
  gov: {
    what: "Notification inviting applications from eligible senior citizens under the district welfare support scheme for the financial year.",
    why:  "Applications are hereby invited from persons who have attained the age of sixty years and whose annual family income does not exceed the prescribed ceiling.",
    doIt: "Eligible applicants shall submit the duly filled application in the prescribed proforma along with documentary evidence of age, income and bank particulars on or before 14.10.2026.",
    where:"Applications shall be received at the office of the District Welfare Officer during working hours, or through the designated online facility."
  },
  original: "DISTRICT WELFARE OFFICE\nNotification No. DWO/SCS/2026/1109\nDated: 28.07.2026\n\nNotification inviting applications from eligible senior citizens under the district welfare support scheme for the financial year.\n\nApplications are hereby invited from persons who have attained the age of sixty years as on the date of application and whose annual family income from all sources does not exceed the prescribed ceiling of ₹3,00,000. Eligible applicants shall submit the duly filled application in the prescribed proforma along with documentary evidence of age, income and bank particulars on or before 14.10.2026.\n\nApplications received after the aforesaid date shall not be entertained under any circumstances. Incomplete applications, or applications unaccompanied by the requisite enclosures, are liable to be rejected without further intimation. The decision of the competent authority with regard to eligibility shall be final.",
  pairs: [
    { gov: "Persons who have attained the age of sixty years as on the date of application.",
      simple: L("People who are 60 years or older on the day they apply.", "जो लोग आवेदन के दिन 60 साल या उससे ज़्यादा के हैं।", "దరఖాస్తు చేసే రోజున 60 సంవత్సరాలు లేదా అంతకంటే ఎక్కువ వయస్సు ఉన్నవారు.") },
    { gov: "Applications received after the aforesaid date shall not be entertained.",
      simple: L("Applications given after the last date will not be taken.", "अंतिम तारीख के बाद दिए गए आवेदन नहीं लिए जाएंगे।", "చివరి తేదీ తర్వాత ఇచ్చిన దరఖాస్తులు స్వీకరించబడవు.") }
  ],
  elig: { minAge: 60, maxIncome: 300000, note: L("This scheme is for senior citizens whose yearly family income is within the limit given in the notice.", "यह योजना उन वरिष्ठ नागरिकों के लिए है जिनकी सालाना पारिवारिक आय सूचना में दी गई सीमा के भीतर है।", "నోటీసులో ఇచ్చిన పరిమితిలోపు సంవత్సర కుటుంబ ఆదాయం ఉన్న వృద్ధుల కోసం ఈ పథకం.") }
},
{
  id: 'income', cat: 'identity', seeded: true, status: 'action',
  title: L("Income Certificate — Document Requirement Notice", "आय प्रमाण पत्र — दस्तावेज़ माँग सूचना", "ఆదాయ ధ్రువీకరణ పత్రం — పత్రాల అవసర నోటీసు"),
  issuer: L("Tahsildar Office (demo)", "तहसीलदार कार्यालय (डेमो)", "తహసీల్దార్ కార్యాలయం (డెమో)"),
  refNo: "TSL/IC/2026/7732",
  received: "2026-08-06", deadline: "2026-08-22",
  what: L("This is a notice asking you to submit papers for an income certificate.",
          "यह सूचना आपसे आय प्रमाण पत्र के लिए कागज़ जमा करने को कह रही है।",
          "ఇది ఆదాయ ధ్రువీకరణ పత్రం కోసం పత్రాలు సమర్పించమని కోరుతున్న నోటీసు."),
  why:  L("Your earlier application is on hold because some papers are missing. The office cannot move ahead until they receive them.",
          "आपका पहले का आवेदन रुका हुआ है क्योंकि कुछ कागज़ नहीं मिले। कागज़ मिलने तक कार्यालय आगे नहीं बढ़ सकता।",
          "కొన్ని పత్రాలు లేనందున మీ మునుపటి దరఖాస్తు నిలిచిపోయింది. అవి అందేవరకు కార్యాలయం ముందుకు సాగలేదు."),
  steps: [
    L("Collect proof of your income, such as a pension slip, salary slip or land record.", "अपनी आय का प्रमाण इकट्ठा कीजिए, जैसे पेंशन पर्ची, वेतन पर्ची या ज़मीन का कागज़।", "పింఛను స్లిప్, జీతం స్లిప్ లేదా భూమి పత్రం వంటి మీ ఆదాయ ధ్రువీకరణను సేకరించండి."),
    L("Fill the application form for the income certificate.", "आय प्रमाण पत्र का आवेदन फ़ॉर्म भरिए।", "ఆదాయ ధ్రువీకరణ పత్రం దరఖాస్తు ఫారాన్ని నింపండి."),
    L("Get it signed by your village or ward officer.", "इसे अपने गाँव या वार्ड अधिकारी से हस्ताक्षर करवाइए।", "మీ గ్రామ లేదా వార్డు అధికారి సంతకం తీసుకోండి."),
    L("Submit it at the tahsildar office before 22 August.", "22 अगस्त से पहले तहसीलदार कार्यालय में जमा कीजिए।", "ఆగస్టు 22లోపు తహసీల్దార్ కార్యాలయంలో సమర్పించండి.")
  ],
  need: [
    L("Aadhaar card", "आधार कार्ड", "ఆధార్ కార్డు"),
    L("Ration card", "राशन कार्ड", "రేషన్ కార్డు"),
    L("Proof of income", "आय का प्रमाण", "ఆదాయ ధ్రువీకరణ"),
    L("Address proof", "पते का प्रमाण", "చిరునామా ధ్రువీకరణ"),
    L("Filled application form", "भरा हुआ आवेदन फ़ॉर्म", "నింపిన దరఖాస్తు ఫారం")
  ],
  needDone: [true, true, false, true, false],
  where: L("Submit at the tahsildar office mentioned in the notice, or through the official portal printed on it.",
           "सूचना में लिखे तहसीलदार कार्यालय में, या उस पर छपे आधिकारिक पोर्टल पर जमा कीजिए।",
           "నోటీసులో పేర్కొన్న తహసీల్దార్ కార్యాలయంలో, లేదా దానిపై ముద్రించిన అధికారిక పోర్టల్‌లో సమర్పించండి."),
  ifNot: L("If the papers are not given before the last date, your application may be closed and you may have to apply again from the beginning.",
           "अगर अंतिम तारीख से पहले कागज़ नहीं दिए, तो आपका आवेदन बंद हो सकता है और शुरू से आवेदन करना पड़ सकता है।",
           "చివరి తేదీలోపు పత్రాలు ఇవ్వకపోతే, మీ దరఖాస్తు మూసివేయబడవచ్చు, మళ్లీ మొదటి నుండి దరఖాస్తు చేయాల్సి రావచ్చు."),
  explain: L("This is the most urgent of your papers. The office needs proof of your income before 22 August, otherwise the application you already made will be closed. You need three things you may not have yet: an income proof, the filled form, and the signature of your village or ward officer. Everything else you already have.",
             "आपके कागज़ों में यह सबसे ज़रूरी है। कार्यालय को 22 अगस्त से पहले आपकी आय का प्रमाण चाहिए, वरना आपका पहले किया आवेदन बंद हो जाएगा। तीन चीज़ें चाहिए जो शायद अभी आपके पास नहीं हैं: आय का प्रमाण, भरा हुआ फ़ॉर्म, और गाँव या वार्ड अधिकारी के हस्ताक्षर। बाकी सब आपके पास है।",
             "మీ పత్రాలలో ఇది అత్యంత అత్యవసరమైనది. ఆగస్టు 22లోపు కార్యాలయానికి మీ ఆదాయ ధ్రువీకరణ కావాలి, లేకపోతే మీరు ఇదివరకే చేసిన దరఖాస్తు మూసివేయబడుతుంది. మీ దగ్గర ఇంకా లేని మూడు విషయాలు కావాలి: ఆదాయ ధ్రువీకరణ, నింపిన ఫారం, గ్రామ లేదా వార్డు అధికారి సంతకం. మిగతావన్నీ మీ దగ్గర ఉన్నాయి."),
  gov: {
    what: "Notice for production of documents in support of the application for issuance of an income certificate.",
    why:  "The application submitted by you is presently deficient inasmuch as the requisite documentary evidence has not been produced before the undersigned.",
    doIt: "You are hereby called upon to produce the documents enumerated in the schedule below, duly attested by the competent revenue functionary, within a period of fifteen days from the date of receipt of this notice.",
    where:"The documents shall be produced before the Tahsildar during office hours or uploaded through the designated revenue portal."
  },
  original: "OFFICE OF THE TAHSILDAR\nNotice No. TSL/IC/2026/7732\nDated: 06.08.2026\n\nSub: Production of documents in support of application for issuance of income certificate — reg.\n\nWhereas an application for issuance of an income certificate has been submitted by you, and whereas the said application is presently deficient inasmuch as the requisite documentary evidence has not been produced before the undersigned, you are hereby called upon to produce the documents enumerated in the schedule below, duly attested by the competent revenue functionary, within a period of fifteen days from the date of receipt of this notice, failing which the application shall stand consigned to record without further reference to you.\n\nSCHEDULE: (i) Aadhaar; (ii) Ration card; (iii) Documentary proof of income from all sources; (iv) Proof of residence; (v) Application in the prescribed proforma.",
  pairs: [
    { gov: "The application shall stand consigned to record without further reference to you.",
      simple: L("Your application will be closed and nobody will contact you about it again.", "आपका आवेदन बंद कर दिया जाएगा और इस बारे में फिर कोई संपर्क नहीं करेगा।", "మీ దరఖాస్తు మూసివేయబడుతుంది, దీని గురించి మళ్లీ ఎవరూ సంప్రదించరు.") },
    { gov: "Duly attested by the competent revenue functionary.",
      simple: L("Signed and stamped by your village or ward officer.", "आपके गाँव या वार्ड अधिकारी के हस्ताक्षर और मुहर लगी हुई।", "మీ గ్రామ లేదా వార్డు అధికారి సంతకం, ముద్రతో.") }
  ],
  elig: null
},
{
  id: 'scholarship', cat: 'education', seeded: true, status: 'info',
  title: L("Post-Matric Scholarship — Notification", "मैट्रिक के बाद छात्रवृत्ति — अधिसूचना", "మెట్రిక్ అనంతర స్కాలర్‌షిప్ — నోటిఫికేషన్"),
  issuer: L("Directorate of Social Welfare (demo)", "समाज कल्याण निदेशालय (डेमो)", "సంక్షేమ శాఖ సంచాలకులు (డెమో)"),
  refNo: "DSW/PMS/2026/2210",
  received: "2026-07-15", deadline: "2026-11-20",
  what: L("This is a scholarship notification for students who have finished class 10.",
          "यह उन छात्रों के लिए छात्रवृत्ति अधिसूचना है जिन्होंने दसवीं पूरी कर ली है।",
          "పదవ తరగతి పూర్తి చేసిన విద్యార్థుల కోసం ఇది స్కాలర్‌షిప్ నోటిఫికేషన్."),
  why:  L("Families receive this so that a child or grandchild studying after class 10 can apply in time. It is only information — no money is being asked from you.",
          "यह परिवारों को इसलिए मिलती है ताकि दसवीं के बाद पढ़ रहा बच्चा या पोता-पोती समय पर आवेदन कर सके। यह सिर्फ़ जानकारी है — आपसे कोई पैसा नहीं माँगा जा रहा।",
          "పదవ తరగతి తర్వాత చదువుతున్న పిల్లలు లేదా మనవళ్లు సకాలంలో దరఖాస్తు చేసుకోవడానికి కుటుంబాలకు ఇది వస్తుంది. ఇది కేవలం సమాచారం — మీ నుండి డబ్బు అడగడం లేదు."),
  steps: [
    L("Create a login on the scholarship portal named in the notification.", "अधिसूचना में लिखे छात्रवृत्ति पोर्टल पर लॉगिन बनाइए।", "నోటిఫికేషన్‌లో పేర్కొన్న స్కాలర్‌షిప్ పోర్టల్‌లో లాగిన్ సృష్టించండి."),
    L("Fill the student's details exactly as they appear on the marksheet.", "छात्र का विवरण ठीक वैसे भरिए जैसे अंकपत्र में लिखा है।", "మార్క్‌షీట్‌లో ఉన్నట్లుగానే విద్యార్థి వివరాలను నింపండి."),
    L("Upload the marksheet, income certificate and bank passbook.", "अंकपत्र, आय प्रमाण पत्र और बैंक पासबुक अपलोड कीजिए।", "మార్క్‌షీట్, ఆదాయ ధ్రువీకరణ పత్రం, బ్యాంకు పాస్‌బుక్ అప్‌లోడ్ చేయండి."),
    L("Ask the college to verify the application, then save the application number.", "कॉलेज से आवेदन सत्यापित करवाइए, फिर आवेदन संख्या संभालकर रखिए।", "కళాశాల ద్వారా దరఖాస్తును ధృవీకరించుకుని, దరఖాస్తు నంబర్‌ను భద్రపరచుకోండి.")
  ],
  need: [
    L("Student's Aadhaar", "छात्र का आधार", "విద్యార్థి ఆధార్"),
    L("Class 10 marksheet", "दसवीं का अंकपत्र", "పదవ తరగతి మార్క్‌షీట్"),
    L("Income certificate", "आय प्रमाण पत्र", "ఆదాయ ధ్రువీకరణ పత్రం"),
    L("Bank passbook in the student's name", "छात्र के नाम की बैंक पासबुक", "విద్యార్థి పేరుతో బ్యాంకు పాస్‌బుక్"),
    L("Proof of admission from the college", "कॉलेज से प्रवेश का प्रमाण", "కళాశాల ప్రవేశ ధ్రువీకరణ")
  ],
  needDone: [false, false, false, false, false],
  where: L("Apply on the official scholarship portal named in the notification. The college office can help with the verification step.",
           "अधिसूचना में लिखे आधिकारिक छात्रवृत्ति पोर्टल पर आवेदन कीजिए। सत्यापन में कॉलेज कार्यालय मदद कर सकता है।",
           "నోటిఫికేషన్‌లో పేర్కొన్న అధికారిక స్కాలర్‌షిప్ పోర్టల్‌లో దరఖాస్తు చేయండి. ధృవీకరణ దశలో కళాశాల కార్యాలయం సాయపడుతుంది."),
  ifNot: L("Nothing happens to you if nobody applies. The student simply will not receive the scholarship for this year.",
           "अगर कोई आवेदन नहीं करता तो आपका कुछ नहीं होगा। बस छात्र को इस साल छात्रवृत्ति नहीं मिलेगी।",
           "ఎవరూ దరఖాస్తు చేయకపోతే మీకు ఏమీ కాదు. విద్యార్థికి ఈ సంవత్సరం స్కాలర్‌షిప్ రాదు, అంతే."),
  explain: L("You do not have to do anything about this letter yourself. It is for a student in the family who is studying after class 10. Applications are open until 20 November 2026 on the portal named in the letter. The student will need their marksheet, an income certificate and a bank passbook in their own name.",
             "इस पत्र के लिए आपको खुद कुछ नहीं करना है। यह परिवार के उस छात्र के लिए है जो दसवीं के बाद पढ़ रहा है। पत्र में लिखे पोर्टल पर 20 नवंबर 2026 तक आवेदन खुले हैं। छात्र को अपना अंकपत्र, आय प्रमाण पत्र और अपने नाम की बैंक पासबुक चाहिए होगी।",
             "ఈ లేఖ కోసం మీరు స్వయంగా ఏమీ చేయనవసరం లేదు. ఇది పదవ తరగతి తర్వాత చదువుతున్న కుటుంబ విద్యార్థి కోసం. లేఖలో పేర్కొన్న పోర్టల్‌లో 2026 నవంబర్ 20 వరకు దరఖాస్తులు తెరిచి ఉన్నాయి. విద్యార్థికి మార్క్‌షీట్, ఆదాయ ధ్రువీకరణ పత్రం, తన పేరుతో బ్యాంకు పాస్‌బుక్ కావాలి."),
  gov: {
    what: "Notification inviting online applications for post-matriculation scholarships for the academic session.",
    why:  "Applications are invited from bona fide students pursuing recognised courses subsequent to matriculation, subject to the prescribed income ceiling.",
    doIt: "Applicants shall register on the designated portal and submit the application together with scanned self-attested enclosures on or before 20.11.2026, followed by institutional verification.",
    where:"Applications shall be submitted online only through the designated scholarship portal; physical applications shall not be entertained."
  },
  original: "DIRECTORATE OF SOCIAL WELFARE\nNotification No. DSW/PMS/2026/2210\nDated: 15.07.2026\n\nNotification inviting online applications for post-matriculation scholarships for the academic session.\n\nApplications are invited from bona fide students pursuing recognised courses subsequent to matriculation in institutions duly approved by the competent authority, subject to the condition that the annual income of the parents or guardians from all sources does not exceed the prescribed ceiling. Applicants shall register on the designated portal and submit the application together with scanned self-attested enclosures on or before 20.11.2026, whereafter the application shall be forwarded for institutional verification.\n\nApplications not verified by the institution within the stipulated period shall lapse. Physical applications shall not be entertained under any circumstances.",
  pairs: [
    { gov: "Bona fide students pursuing recognised courses subsequent to matriculation.",
      simple: L("Students who are really studying a recognised course after class 10.", "वे छात्र जो दसवीं के बाद किसी मान्यता प्राप्त कोर्स में सचमुच पढ़ रहे हैं।", "పదవ తరగతి తర్వాత గుర్తింపు పొందిన కోర్సు నిజంగా చదువుతున్న విద్యార్థులు.") },
    { gov: "Applications not verified by the institution within the stipulated period shall lapse.",
      simple: L("If the college does not check the application in time, it becomes invalid.", "अगर कॉलेज ने समय पर आवेदन जाँचा नहीं, तो वह रद्द हो जाएगा।", "కళాశాల సకాలంలో దరఖాస్తును పరిశీలించకపోతే అది రద్దవుతుంది.") }
  ],
  elig: { maxAge: 30, maxIncome: 800000, work: ['student'], note: L("This scholarship is for students, so it usually applies to a younger member of the family.", "यह छात्रवृत्ति छात्रों के लिए है, इसलिए यह आमतौर पर परिवार के किसी युवा सदस्य पर लागू होती है।", "ఈ స్కాలర్‌షిప్ విద్యార్థుల కోసం, కాబట్టి ఇది సాధారణంగా కుటుంబంలోని యువ సభ్యులకు వర్తిస్తుంది.") }
},
{
  id: 'property', cat: 'property', seeded: true, status: 'action',
  title: L("Property Tax Notice", "संपत्ति कर सूचना", "ఆస్తి పన్ను నోటీసు"),
  issuer: L("Municipal Corporation, Revenue Wing (demo)", "नगर निगम, राजस्व शाखा (डेमो)", "మున్సిపల్ కార్పొరేషన్, రెవెన్యూ విభాగం (డెమో)"),
  refNo: "MC/PT/2026/58203",
  received: "2026-07-30", deadline: "2026-09-15",
  what: L("This is a property tax notice for this year.",
          "यह इस साल की संपत्ति कर सूचना है।",
          "ఇది ఈ సంవత్సరపు ఆస్తి పన్ను నోటీసు."),
  why:  L("The municipal office has worked out the tax for your house or land and is asking you to pay it before the last date.",
          "नगर निगम ने आपके घर या ज़मीन का कर निकाला है और अंतिम तारीख से पहले उसे जमा करने को कह रहा है।",
          "మున్సిపల్ కార్యాలయం మీ ఇల్లు లేదా భూమికి పన్ను లెక్కించి, చివరి తేదీలోపు చెల్లించమని కోరుతోంది."),
  steps: [
    L("Check that the property number and the amount on the notice are correct.", "देखिए कि सूचना पर लिखा संपत्ति नंबर और रकम सही है।", "నోటీసులోని ఆస్తి నంబరు, మొత్తం సరిగా ఉన్నాయో చూడండి."),
    L("Pay at the municipal office, an authorised bank, or the official portal named in the notice.", "नगर निगम कार्यालय, अधिकृत बैंक, या सूचना में लिखे आधिकारिक पोर्टल पर भुगतान कीजिए।", "మున్సిపల్ కార్యాలయం, అధీకృత బ్యాంకు, లేదా నోటీసులో పేర్కొన్న అధికారిక పోర్టల్‌లో చెల్లించండి."),
    L("Collect the receipt immediately after paying.", "भुगतान के तुरंत बाद रसीद लीजिए।", "చెల్లించిన వెంటనే రసీదు తీసుకోండి."),
    L("Keep the receipt safely — it is proof for next year.", "रसीद संभालकर रखिए — यह अगले साल का प्रमाण है।", "రసీదును భద్రపరచండి — అది వచ్చే సంవత్సరానికి ఆధారం.")
  ],
  need: [
    L("Property tax number", "संपत्ति कर नंबर", "ఆస్తి పన్ను నంబరు"),
    L("Last year's receipt", "पिछले साल की रसीद", "గత సంవత్సరం రసీదు"),
    L("Aadhaar card", "आधार कार्ड", "ఆధార్ కార్డు"),
    L("Money for the payment", "भुगतान के लिए राशि", "చెల్లింపు కోసం డబ్బు")
  ],
  needDone: [true, false, true, false],
  where: L("Pay at the municipal office counter, at an authorised bank branch, or on the official portal printed on the notice. Do not pay to anyone who comes to your door.",
           "नगर निगम काउंटर, अधिकृत बैंक शाखा, या सूचना पर छपे आधिकारिक पोर्टल पर भुगतान कीजिए। घर आए किसी व्यक्ति को पैसे न दें।",
           "మున్సిపల్ కార్యాలయ కౌంటర్‌లో, అధీకృత బ్యాంకు శాఖలో, లేదా నోటీసుపై ముద్రించిన అధికారిక పోర్టల్‌లో చెల్లించండి. ఇంటికి వచ్చిన వ్యక్తికి డబ్బు ఇవ్వకండి."),
  ifNot: L("If the amount is not paid before the last date, extra charges can be added every month until it is paid.",
           "अगर अंतिम तारीख से पहले भुगतान नहीं हुआ, तो भुगतान होने तक हर महीने अतिरिक्त शुल्क जुड़ सकता है।",
           "చివరి తేదీలోపు చెల్లించకపోతే, చెల్లించే వరకు ప్రతి నెలా అదనపు రుసుము చేరవచ్చు."),
  explain: L("This is a bill for your property tax for this year. It has to be paid before 15 September 2026. You can pay at the municipal office, at an authorised bank, or on the official portal written on the notice. Please take a receipt every time, and do not hand money to anyone who visits your home claiming to collect it.",
             "यह इस साल के संपत्ति कर का बिल है। इसे 15 सितंबर 2026 से पहले भरना है। आप नगर निगम कार्यालय, अधिकृत बैंक, या सूचना पर लिखे आधिकारिक पोर्टल पर भुगतान कर सकते हैं। हर बार रसीद ज़रूर लीजिए, और घर आकर कर वसूलने का दावा करने वाले किसी व्यक्ति को पैसे न दीजिए।",
             "ఇది ఈ సంవత్సరపు ఆస్తి పన్ను బిల్లు. దీన్ని 2026 సెప్టెంబర్ 15లోపు చెల్లించాలి. మున్సిపల్ కార్యాలయంలో, అధీకృత బ్యాంకులో, లేదా నోటీసుపై ఉన్న అధికారిక పోర్టల్‌లో చెల్లించవచ్చు. ప్రతిసారీ రసీదు తీసుకోండి, ఇంటికి వచ్చి పన్ను వసూలు చేస్తామనే వారికి డబ్బు ఇవ్వకండి."),
  gov: {
    what: "Demand notice issued under the municipal taxation rules in respect of the property described herein.",
    why:  "The assessed property tax in respect of the aforesaid holding has been determined for the current assessment year and stands due for payment.",
    doIt: "The assessee is required to remit the demanded amount at the designated counter, authorised banking channel, or online facility on or before 15.09.2026.",
    where:"Payment shall be tendered only through the authorised channels notified by the Corporation; a receipt shall be obtained in every case."
  },
  original: "MUNICIPAL CORPORATION — REVENUE WING\nDemand Notice No. MC/PT/2026/58203\nDated: 30.07.2026\n\nDemand notice issued under the municipal taxation rules in respect of the property described herein.\n\nThe assessed property tax in respect of the aforesaid holding has been determined for the current assessment year on the basis of the prevailing annual rental value and stands due for payment. The assessee is required to remit the demanded amount at the designated counter, authorised banking channel, or online facility on or before 15.09.2026.\n\nIn the event of non-payment within the aforesaid period, interest at the notified rate shall accrue on the outstanding demand for every month or part thereof, without prejudice to such recovery proceedings as may be initiated under the applicable provisions. Objections, if any, to the assessment may be preferred before the assessing authority within thirty days of receipt of this notice.",
  pairs: [
    { gov: "Interest at the notified rate shall accrue for every month or part thereof.",
      simple: L("Extra charges will be added every month until you pay.", "जब तक आप नहीं भरते, हर महीने अतिरिक्त शुल्क जुड़ता रहेगा।", "మీరు చెల్లించే వరకు ప్రతి నెలా అదనపు రుసుము చేరుతుంది.") },
    { gov: "Objections may be preferred before the assessing authority within thirty days.",
      simple: L("If you think the amount is wrong, you can complain at the same office within 30 days.", "अगर आपको रकम गलत लगे, तो 30 दिन के भीतर उसी कार्यालय में शिकायत कर सकते हैं।", "మొత్తం తప్పు అనిపిస్తే, 30 రోజుల్లోపు అదే కార్యాలయంలో ఫిర్యాదు చేయవచ్చు.") }
  ],
  elig: null
}
];
