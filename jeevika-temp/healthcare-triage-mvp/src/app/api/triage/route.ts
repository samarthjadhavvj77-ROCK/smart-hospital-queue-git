import { NextResponse } from "next/server";

const TRANSLATIONS: Record<string, Record<string, string>> = {
  "en-IN": {
    "minor_default": "Please monitor your symptoms. If they persist or worsen, consider seeing a doctor.",
    "minor_headache": "For a mild headache, rest in a quiet, dark room and ensure you are hydrated.",
    "minor_stomach": "Eat light meals, avoid spicy food, and stay hydrated.",
    "minor_fever": "Rest and drink plenty of fluids. Take paracetamol if you have a fever.",
    "severe_cut": "Please apply pressure to the wound to stop any bleeding. You should visit a clinic to get it properly cleaned and checked for stitches.",
    "severe_default": "This sounds like a severe condition. Please visit a nearby clinic immediately or call an ambulance."
  },
  "hi-IN": {
    "minor_default": "कृपया अपने लक्षणों पर नज़र रखें। यदि वे बने रहते हैं या बिगड़ते हैं, तो डॉक्टर को दिखाने पर विचार करें।",
    "minor_headache": "हल्के सिरदर्द के लिए, एक शांत, अंधेरे कमरे में आराम करें और सुनिश्चित करें कि आप हाइड्रेटेड हैं।",
    "minor_stomach": "हल्का भोजन करें, मसालेदार भोजन से बचें और हाइड्रेटेड रहें।",
    "minor_fever": "आराम करें और खूब तरल पदार्थ पिएं। बुखार होने पर पेरासिटामोल लें।",
    "severe_cut": "रक्तस्राव को रोकने के लिए कृपया घाव पर दबाव डालें। इसे ठीक से साफ करने और टांके की जांच के लिए आपको क्लिनिक जाना चाहिए।",
    "severe_default": "यह एक गंभीर स्थिति लगती है। कृपया तुरंत नजदीकी क्लिनिक पर जाएँ या एम्बुलेंस बुलाएँ।"
  },
  "mr-IN": {
    "minor_default": "कृपया तुमच्या लक्षणांवर लक्ष ठेवा. जर ते टिकून राहिले किंवा बिघडले तर डॉक्टरांचा सल्ला घेण्याचा विचार करा.",
    "minor_headache": "सौम्य डोकेदुखीसाठी, शांत, अंधाऱ्या खोलीत विश्रांती घ्या आणि हायड्रेटेड राहा.",
    "minor_stomach": "हलके अन्न खा, मसालेदार पदार्थ टाळा आणि हायड्रेटेड राहा.",
    "minor_fever": "विश्रांती घ्या आणि भरपूर द्रव प्या. ताप असल्यास पॅरासिटामॉल घ्या.",
    "severe_cut": "रक्तस्राव थांबवण्यासाठी कृपया जखमेवर दाब द्या. तुम्ही ते व्यवस्थित स्वच्छ करण्यासाठी आणि टाके तपासण्यासाठी क्लिनिकला भेट द्यावी.",
    "severe_default": "ही गंभीर स्थिती वाटते. कृपया ताबडतोब जवळच्या क्लिनिकला भेट द्या किंवा रुग्णवाहिका बोलावून घ्या."
  },
  "ta-IN": {
    "minor_default": "தயவுசெய்து உங்கள் அறிகுறிகளைக் கண்காணிக்கவும். அவை தொடர்ந்தால் அல்லது மோசமடைந்தால், மருத்துவரைப் பார்க்கவும்.",
    "minor_headache": "லேசான தலைவலிக்கு, அமைதியான, இருண்ட அறையில் ஓய்வெடுக்கவும், போதுமான தண்ணீர் குடிக்கவும்.",
    "minor_stomach": "எளிதில் செரிமானமாகும் உணவை உண்ணுங்கள், காரமான உணவுகளைத் தவிர்க்கவும், போதுமான நீர் அருந்தவும்.",
    "minor_fever": "ஓய்வெடுத்து நிறைய திரவங்களை குடிக்கவும். காய்ச்சல் இருந்தால் பாராசிட்டமால் எடுத்துக்கொள்ளவும்.",
    "severe_cut": "இரத்தப்போக்கை நிறுத்த காயத்தின் மீது அழுத்தம் கொடுக்கவும். காயத்தை சுத்தம் செய்து தையல் தேவையா என பார்க்க நீங்கள் மருத்துவமனைக்கு செல்ல வேண்டும்.",
    "severe_default": "இது கடுமையான நிலையாகத் தெரிகிறது. தயவுசெய்து உடனடியாக அருகில் உள்ள மருத்துவமனைக்குச் செல்லவும் அல்லது ஆம்புலன்ஸை அழைக்கவும்."
  }
};

export async function POST(request: Request) {
  try {
    const { transcript, language } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }

    const langCode = TRANSLATIONS[language] ? language : "en-IN";
    const texts = TRANSLATIONS[langCode];

    // Mock LLM logic: simple keyword matching for the MVP
    const lowerTranscript = transcript.toLowerCase();
    
    let severity: "Minor" | "Severe" = "Minor";
    let adviceKey = "minor_default";
    let needsClinic = false;

    // A real LLM would be used here, but for MVP demo purposes we use basic keyword detection
    const severeKeywords = ['severe', 'chest pain', 'breathing', 'unconscious', 'bleeding', 'fracture', 'heart', 'emergency', 'cut', 'accident', 'छाती', 'रक्त', 'सांस'];
    
    for (const keyword of severeKeywords) {
      if (lowerTranscript.includes(keyword)) {
        severity = "Severe";
        if (keyword === 'cut' || keyword === 'bleeding' || keyword === 'रक्त') {
            adviceKey = "severe_cut";
        } else {
            adviceKey = "severe_default";
        }
        needsClinic = true;
        break;
      }
    }

    if (severity === "Minor") {
        if (lowerTranscript.includes("headache") || lowerTranscript.includes("सर दर्द") || lowerTranscript.includes("डोकेदुखी")) {
            adviceKey = "minor_headache";
        } else if (lowerTranscript.includes("stomach") || lowerTranscript.includes("पेट") || lowerTranscript.includes("पोट")) {
            adviceKey = "minor_stomach";
        } else if (lowerTranscript.includes("fever") || lowerTranscript.includes("cold") || lowerTranscript.includes("बुखार") || lowerTranscript.includes("ताप")) {
            adviceKey = "minor_fever";
        }
    }

    // Simulate network latency of API call
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({
      severity,
      advice: texts[adviceKey],
      needsClinic
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
