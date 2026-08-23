import { L } from '@/types';

/** Phrases the assistant uses when it answers. */
export const A = {
  deadlineIs:   L("The last date is {d}.", "अंतिम तारीख {d} है।", "చివరి తేదీ {d}."),
  daysToGo:     L("That is {n} days from today.", "आज से {n} दिन बाकी हैं।", "ఈ రోజు నుండి {n} రోజులు మిగిలాయి."),
  stepsIntro:   L("Here is what you need to do:", "आपको यह करना है:", "మీరు చేయవలసినవి ఇవి:"),
  needIntro:    L("You will need these papers:", "आपको ये कागज़ चाहिए होंगे:", "మీకు ఈ పత్రాలు కావాలి:"),
  whereIntro:   L("Where to submit:", "कहाँ जमा करना है:", "ఎక్కడ సమర్పించాలి:"),
  progressIs:   L("You have finished {a} of {b} steps for {t}.", "{t} के {b} में से {a} काम पूरे हो चुके हैं।", "{t} కోసం {b} పనుల్లో {a} పూర్తయ్యాయి."),
  progressLeft: L("The next one is: {s}", "अगला काम है: {s}", "తదుపరి పని: {s}"),
  allFinished:  L("Everything on this list is finished.", "इस सूची का हर काम पूरा हो गया है।", "ఈ జాబితాలోని అన్ని పనులు పూర్తయ్యాయి."),
  catIntro:     L("Here are your documents in that group:", "उस श्रेणी के आपके दस्तावेज़:", "ఆ విభాగంలోని మీ పత్రాలు:"),
  actionIntro:  L("These documents still need something from you:", "इन दस्तावेज़ों में अभी आपका काम बाकी है:", "ఈ పత్రాలలో ఇంకా మీ పని మిగిలి ఉంది:"),
  monthIntro:   L("These last dates fall within the next 30 days:", "अगले 30 दिनों में ये अंतिम तिथियाँ हैं:", "వచ్చే 30 రోజుల్లో ఈ చివరి తేదీలు ఉన్నాయి:"),
  nothingFound: L("I could not find a document for that. You can add one from the Documents page.", "उसके लिए कोई दस्तावेज़ नहीं मिला। आप दस्तावेज़ पेज से एक जोड़ सकते हैं।", "దాని కోసం పత్రం దొరకలేదు. పత్రాల పేజీ నుండి ఒకటి జోడించవచ్చు."),
  eligHint:     L("Open the document and use \u201cDoes this apply to me?\u201d. Tell me your age and income there, and I will compare them with the conditions written in the document.", "दस्तावेज़ खोलकर \u201cक्या यह मुझ पर लागू होता है?\u201d चुनिए। वहाँ अपनी उम्र और आय बताइए, मैं दस्तावेज़ में लिखी शर्तों से मिलान कर दूँगा।", "పత్రాన్ని తెరిచి \u201cఇది నాకు వర్తిస్తుందా?\u201d ఎంచుకోండి. అక్కడ మీ వయస్సు, ఆదాయం చెప్పండి, పత్రంలోని షరతులతో పోల్చి చెబుతాను."),
  langSwitched: L("I have switched to English. I will explain everything in English from now on.", "मैंने हिन्दी चुन ली है। अब से मैं सब कुछ हिन्दी में बताऊँगा।", "నేను తెలుగుకు మారాను. ఇప్పటి నుండి అంతా తెలుగులో వివరిస్తాను."),
  greetBack:    L("Namaste. How can I help you today?", "नमस्ते। आज मैं आपकी क्या मदद करूँ?", "నమస్తే. ఈ రోజు మీకు ఎలా సాయపడగలను?"),
  thanks:       L("You are welcome. Take your time, I am here whenever you need me.", "आपका स्वागत है। आराम से कीजिए, मैं यहीं हूँ।", "మీకు స్వాగతం. తీరికగా చేయండి, నేను ఇక్కడే ఉన్నాను."),
  notSure:      L("I did not understand that fully. Here are some things I can answer:", "मैं यह पूरी तरह समझ नहीं पाया। ये बातें मैं बता सकता हूँ:", "అది నాకు పూర్తిగా అర్థం కాలేదు. ఈ విషయాలు నేను చెప్పగలను:"),
  noDocOpen:    L("Open a document first and then ask me about it.", "पहले कोई दस्तावेज़ खोलिए, फिर उसके बारे में पूछिए।", "ముందు ఒక పత్రాన్ని తెరిచి, ఆ తర్వాత అడగండి."),
  safety:       L("Please confirm important details with the office named in your document.", "ज़रूरी बातें अपने दस्तावेज़ में लिखे कार्यालय से जाँच लीजिए।", "ముఖ్యమైన వివరాలను మీ పత్రంలో పేర్కొన్న కార్యాలయంలో నిర్ధారించుకోండి.")
};

/** Prompts offered to someone who does not know what to ask. */
export const SUGGESTED = [
  L("What is this document?", "यह दस्तावेज़ क्या है?", "ఈ పత్రం ఏమిటి?"),
  L("What do I need to do?", "मुझे क्या करना है?", "నేను ఏమి చేయాలి?"),
  L("When is the last date?", "अंतिम तारीख कब है?", "చివరి తేదీ ఎప్పుడు?"),
  L("Which papers do I need?", "मुझे कौन से कागज़ चाहिए?", "నాకు ఏ పత్రాలు కావాలి?"),
  L("Where do I submit it?", "इसे कहाँ जमा करूँ?", "దీన్ని ఎక్కడ సమర్పించాలి?"),
  L("What happens if I do nothing?", "अगर मैं कुछ न करूँ तो क्या होगा?", "నేను ఏమీ చేయకపోతే ఏమవుతుంది?"),
  L("Show my pension documents", "मेरे पेंशन दस्तावेज़ दिखाइए", "నా పింఛను పత్రాలు చూపించండి"),
  L("Which documents need action?", "किन दस्तावेज़ों में काम बाकी है?", "ఏ పత్రాలలో పని మిగిలి ఉంది?"),
  L("Explain this in Telugu", "इसे तेलुगु में समझाइए", "దీన్ని ఇంగ్లీషులో వివరించండి")
];
