const { GoogleGenAI } = require('@google/genai');
const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// Helper to execute the requested tool
async function executeTool(name, args, patientId) {
  try {
    switch (name) {
      case 'get_available_hospitals':
        const hospitals = await Hospital.find({}).select('_id name address');
        return { hospitals };

      case 'get_doctors':
        const query = {};
        if (args.hospitalId) query.hospital = args.hospitalId;
        const doctors = await Doctor.find(query).populate('hospital', 'name');
        return { doctors };

      case 'check_my_appointments':
        // Get all upcoming/pending appointments for this patient
        const appointments = await Appointment.find({
          patient: patientId,
          status: { $in: ['pending', 'approved'] },
        })
          .populate('doctor', 'name department')
          .populate('hospital', 'name')
          .sort({ date: 1 });

        // Calculate queue info for today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const enhancedAppointments = await Promise.all(
          appointments.map(async (app) => {
            let queueInfo = null;
            if (new Date(app.date).getTime() === today.getTime() && app.tokenNumber) {
              const currentTurnApp = await Appointment.findOne({
                doctor: app.doctor._id,
                date: app.date,
                status: 'completed',
              }).sort({ tokenNumber: -1 });

              const currentTurn = currentTurnApp ? currentTurnApp.tokenNumber : 0;
              const patientsAhead = Math.max(0, app.tokenNumber - currentTurn - 1);
              const estimatedWaitMinutes = patientsAhead * 15; // Assume 15 mins per patient

              queueInfo = {
                currentOngoingToken: currentTurn + 1,
                yourToken: app.tokenNumber,
                patientsAhead,
                estimatedWaitMinutes
              };
            }
            return {
              id: app._id,
              date: app.date,
              timeSlot: app.timeSlot,
              doctor: app.doctor ? app.doctor.name : 'Unknown',
              hospital: app.hospital ? app.hospital.name : 'Unknown',
              status: app.status,
              queueInfo
            };
          })
        );
        return { my_appointments: enhancedAppointments };

      case 'book_appointment':
        if (!args.doctorId || !args.date || !args.timeSlot) {
          return { error: 'Missing required fields: doctorId, date, timeSlot' };
        }
        
        let hospitalId = args.hospitalId;
        if (!hospitalId) {
            const doc = await Doctor.findById(args.doctorId);
            if (doc) hospitalId = doc.hospital;
        }

        const dateObj = new Date(args.date);
        
        // Find latest token for this doctor on this date
        const lastApp = await Appointment.findOne({
          doctor: args.doctorId,
          date: dateObj,
        }).sort({ tokenNumber: -1 });
        
        const nextToken = (lastApp && lastApp.tokenNumber) ? lastApp.tokenNumber + 1 : 1;

        const newApp = await Appointment.create({
          patient: patientId,
          hospital: hospitalId,
          doctor: args.doctorId,
          date: dateObj,
          timeSlot: args.timeSlot,
          tokenNumber: nextToken,
          status: 'pending'
        });
        
        return { 
          success: true, 
          message: 'Appointment booked successfully!',
          appointmentId: newApp._id,
          tokenNumber: nextToken
        };

      case 'cancel_appointment':
        if (!args.appointmentId) return { error: 'Missing appointmentId' };
        const appToCancel = await Appointment.findOne({ _id: args.appointmentId, patient: patientId });
        if (!appToCancel) return { error: 'Appointment not found or you do not have permission to cancel it.' };
        
        appToCancel.status = 'cancelled';
        await appToCancel.save();
        return { success: true, message: 'Appointment cancelled successfully.' };

      default:
        return { error: `Tool ${name} not found` };
    }
  } catch (error) {
    return { error: error.message };
  }
}

const chatMemory = new Map();

const SYSTEM_INSTRUCTION = `You are a helpful AI Receptionist for a Smart Hospital Queue & Appointment System.
You can help patients book appointments, check their queue status, and cancel appointments using the provided tools.

CRITICAL RULES:
1. Always ask clarifying questions before booking (which doctor? which hospital? what date/time?).
2. When asked about queue or wait times, always call 'check_my_appointments', read the patientsAhead and estimatedWaitMinutes, and tell the user!
3. If they want to cancel, use 'check_my_appointments' to find the ID, then use 'cancel_appointment'.
4. Be concise and friendly. Keep responses short and conversational.`;

const tools = [{
  functionDeclarations: [
    {
      name: 'get_available_hospitals',
      description: 'Fetch the list of all available hospitals in the network.',
      parameters: { type: 'OBJECT', properties: {} }
    },
    {
      name: 'get_doctors',
      description: 'Fetch the list of doctors. Optionally filter by hospitalId.',
      parameters: {
        type: 'OBJECT',
        properties: {
          hospitalId: { type: 'STRING', description: 'The MongoDB ObjectId of the hospital' }
        }
      }
    },
    {
      name: 'check_my_appointments',
      description: 'Fetch the users currently booked appointments and live queue status (patients ahead, wait time).',
      parameters: { type: 'OBJECT', properties: {} }
    },
    {
      name: 'book_appointment',
      description: 'Book an appointment for the user with a specific doctor.',
      parameters: {
        type: 'OBJECT',
        properties: {
          hospitalId: { type: 'STRING', description: 'The MongoDB ObjectId of the hospital' },
          doctorId: { type: 'STRING', description: 'The MongoDB ObjectId of the doctor' },
          date: { type: 'STRING', description: 'The date in YYYY-MM-DD format (e.g., 2026-07-10)' },
          timeSlot: { type: 'STRING', description: 'The time slot (e.g. 10:00 AM)' }
        },
        required: ['doctorId', 'date', 'timeSlot']
      }
    },
    {
      name: 'cancel_appointment',
      description: 'Cancel an existing appointment by ID.',
      parameters: {
        type: 'OBJECT',
        properties: {
          appointmentId: { type: 'STRING', description: 'The MongoDB ObjectId of the appointment to cancel' }
        },
        required: ['appointmentId']
      }
    }
  ]
}];

async function generateAIResponse(patientId, userMessage, res) {
  if (!process.env.GEMINI_API_KEY) {
    return res.write(`data: ${JSON.stringify({ error: 'GEMINI_API_KEY is missing in backend .env' })}\n\n`);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  if (!chatMemory.has(patientId)) {
    chatMemory.set(patientId, []);
  }
  const history = chatMemory.get(patientId);
  history.push({ role: 'user', parts: [{ text: userMessage }] });

  try {
    let finalResponseSent = false;
    
    for (let i = 0; i < 5; i++) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: history,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: tools,
          temperature: 0.3,
        }
      });

      const messageContent = response.candidates[0].content;
      history.push(messageContent); 

      const functionCalls = response.functionCalls;
      
      if (functionCalls && functionCalls.length > 0) {
        res.write(`data: ${JSON.stringify({ token: "*(Checking system...)* " })}\n\n`);
        
        const toolResponses = [];
        for (const call of functionCalls) {
          const result = await executeTool(call.name, call.args, patientId);
          toolResponses.push({
            name: call.name,
            response: result
          });
        }
        
        history.push({
          role: 'user',
          parts: toolResponses.map(tr => ({
            functionResponse: {
              name: tr.name,
              response: tr.response
            }
          }))
        });
        
        continue;
      } else {
        const text = response.text;
        res.write(`data: ${JSON.stringify({ fullResponse: text })}\n\n`);
        finalResponseSent = true;
        break;
      }
    }

    if (!finalResponseSent) {
      res.write(`data: ${JSON.stringify({ fullResponse: "I'm sorry, I couldn't complete that action." })}\n\n`);
    }

    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (err) {
    console.error('Gemini Error:', err);
    res.write(`data: ${JSON.stringify({ error: 'AI Error: ' + err.message })}\n\n`);
    res.end();
  }
}

async function analyzeTriage(transcript, language) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is missing. Using local rule-based triage simulator...');
    
    const text = transcript.toLowerCase();
    const severeKeywords = [
      'chest pain', 'breathing difficulty', 'unconscious', 'bleeding', 'fracture', 'heart',
      'stroke', 'accident', 'injury', 'severe', 'pain in chest', 'breath', 'die', 'emergency',
      'सीना', 'दर्द', 'सांस', 'खून', 'दुर्घटना', 'गंभीर'
    ];
    
    const isSevere = severeKeywords.some(keyword => text.includes(keyword));
    
    let advice = '';
    if (language.startsWith('hi')) {
      advice = isSevere
        ? 'सिम्युलेटर अलर्ट: आपके लक्षण गंभीर प्रतीत होते हैं। कृपया तुरंत नजदीकी अस्पताल के आपातकालीन कक्ष (Emergency Room) में जाएं।'
        : 'सिम्युलेटर सलाह: आपके लक्षण सामान्य लग रहे हैं। आराम करें, पर्याप्त मात्रा में पानी पिएं और यदि स्थिति बिगड़ती है तो डॉक्टर से संपर्क करें।';
    } else if (language.startsWith('mr')) {
      advice = isSevere
        ? 'सिम्युलेटर अलर्ट: तुमची लक्षणे गंभीर वाटतात. कृपया तातडीने जवळच्या रुग्णालयाच्या आपत्कालीन विभागात जा.'
        : 'सिम्युलेटर सल्ला: तुमची लक्षणे सौम्य वाटतात. विश्रांती घ्या, भरपूर पाणी प्या आणि त्रास वाढल्यास डॉक्टरांचा सल्ला घ्या.';
    } else if (language.startsWith('ta')) {
      advice = isSevere
        ? 'சிமுலேட்டர் எச்சரிக்கை: உங்கள் அறிகுறிகள் தீவிரமாகத் தெரிகின்றன. தயவுசெய்து உடனடியாக அவசர சிகிச்சை பிரிவுக்குச் செல்லவும்.'
        : 'சிமுலேட்டர் ஆலோசனை: உங்கள் அறிகுறிகள் லேசானவை. ஓய்வெடுங்கள், போதுமான அளவு தண்ணீர் குடிக்கவும், அறிகுறிகள் தொடர்ந்தால் மருத்துவரை அணுகவும்.';
    } else {
      advice = isSevere
        ? 'SIMULATOR ALERT: Your symptoms suggest a potentially severe condition. Please proceed to the nearest emergency clinic or call for medical help immediately.'
        : 'SIMULATOR ADVICE: Your symptoms appear mild. Get adequate rest, stay hydrated, and consult a physician if your condition persists or worsens.';
    }
    
    return {
      severity: isSevere ? 'Severe' : 'Minor',
      advice,
      needsClinic: isSevere
    };
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const systemPrompt = `You are Jeevika, an AI Healthcare Triage Assistant.
Analyze the following patient symptoms provided via voice transcript.
Language code provided: ${language}. You MUST respond in the language corresponding to this code (e.g., hi-IN = Hindi, mr-IN = Marathi, ta-IN = Tamil, en-IN = English).

Rules:
1. Classify severity as exactly "Minor" or "Severe".
   - "Severe" = chest pain, breathing difficulty, unconsciousness, heavy bleeding, deep cuts, severe injuries, etc.
   - "Minor" = mild headache, stomach ache, mild fever, cold, etc.
2. Provide short, practical medical advice in the requested language.
3. If "Severe", set needsClinic to true and advise them to visit an emergency room or clinic immediately.
4. Output EXACTLY valid JSON and nothing else.

Schema:
{
  "severity": "Minor" | "Severe",
  "advice": "string",
  "needsClinic": boolean
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: transcript }] }],
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (err) {
    console.error("Failed to parse JSON from Gemini", err);
    return {
      severity: "Minor",
      advice: "Please consult a doctor if symptoms persist.",
      needsClinic: false
    };
  }
}

module.exports = { generateAIResponse, analyzeTriage };
