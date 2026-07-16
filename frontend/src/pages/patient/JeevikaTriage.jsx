import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';

const LANGUAGES = [
  { code: 'en-IN', name: 'English' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
  { code: 'mr-IN', name: 'मराठी (Marathi)' },
  { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
];

const TriageResult = ({ data }) => {
  if (!data) return null;
  const isSevere = data.severity === 'Severe';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-2xl mx-auto p-6 rounded-2xl border ${
        isSevere
          ? 'bg-red-900/20 border-red-500/30 text-red-100'
          : 'bg-green-900/20 border-green-500/30 text-green-100'
      } liquid-glass-strong`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSevere ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
          <span className="material-symbols-outlined text-2xl">
            {isSevere ? 'emergency' : 'check_circle'}
          </span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest opacity-70 mb-0.5">Triage Result</p>
          <h3 className={`text-xl font-bold ${isSevere ? 'text-red-300' : 'text-green-300'}`}>
            {isSevere ? '🚨 Severe – Needs Immediate Attention' : '✅ Minor – Home Care Advised'}
          </h3>
        </div>
      </div>
      <p className="text-white/80 leading-relaxed text-base">{data.advice}</p>
      {isSevere && (
        <div className="mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-400">local_hospital</span>
          <span className="text-red-300 text-sm font-medium">Please visit a clinic or emergency room immediately.</span>
        </div>
      )}
    </motion.div>
  );
};

const JeevikaTriage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en-IN');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [triageData, setTriageData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlaybackRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.012;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.012;
      setParallaxOffset({ x: moveX, y: moveY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const selectedLangName = LANGUAGES.find(l => l.code === language)?.name || 'English';

  const startRecording = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsRecording(true);
          setTranscript('');
        };

        recognition.onresult = (event) => {
          const text = event.results[0][0].transcript;
          if (text) {
            setTranscript(text);
            analyzeSymptooms(text);
          }
        };

        recognition.onerror = (err) => {
          console.error('Speech recognition error, falling back to server-side recording:', err);
          startServerRecording();
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error('Failed to start SpeechRecognition, trying server-side:', err);
        startServerRecording();
      }
    } else {
      console.warn('SpeechRecognition not supported in browser, trying server-side recording.');
      startServerRecording();
    }
  };

  const startServerRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('language', language);
        
        setIsAnalyzing(true);
        try {
          const { data } = await API.post('/ai/stt', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (data.transcript) {
             setTranscript(data.transcript);
             analyzeSymptooms(data.transcript);
          }
        } catch (err) {
          console.error('STT Error', err);
          alert('Failed to process voice. Please try typing instead.');
        } finally {
          setIsAnalyzing(false);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied', err);
      alert('Microphone access is required to use voice input.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const analyzeSymptooms = async (text) => {
    if (!text?.trim()) return;
    setIsAnalyzing(true);
    setTriageData(null);
    try {
      const { data } = await API.post('/ai/triage', { transcript: text, language });
      setTriageData(data);
      // Synthesize speech using Gnani TTS via backend
      if (data.advice) {
        try {
          if (audioPlaybackRef.current) {
             audioPlaybackRef.current.pause();
          }
          const ttsRes = await API.post('/ai/tts', { text: data.advice, language }, { responseType: 'blob' });
          const audioUrl = URL.createObjectURL(ttsRes.data);
          const audio = new Audio(audioUrl);
          audioPlaybackRef.current = audio;
          audio.play();
        } catch (ttsErr) {
          console.error("TTS Endpoint Error, falling back to browser speechSynthesis:", ttsErr);
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any active speech
            const utterance = new SpeechSynthesisUtterance(data.advice);
            utterance.lang = language;
            window.speechSynthesis.speak(utterance);
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickAction = (type) => {
    let text = '';
    if (type === 'emergency') {
      text = language === 'hi-IN'
        ? 'मुझे छाती में बहुत तेज दर्द हो रहा है और सांस लेने में कठिनाई है।'
        : 'I am experiencing sudden severe chest pain, shortness of breath, and sweating.';
    } else {
      text = language === 'hi-IN'
        ? 'मुझे हल्का सिरदर्द और थकान है।'
        : 'I have a mild headache and feel a bit tired since this morning.';
    }
    setTranscript(text);
    analyzeSymptooms(text);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-x-hidden">
      {/* Background video */}
      <div className="video-container">
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{ transform: `scale(1.1) translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)` }}
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-10 py-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="liquid-glass w-10 h-10 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-white">arrow_back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 liquid-glass flex items-center justify-center border border-white/10">
                <span className="material-symbols-outlined text-white text-xl">health_metrics</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white uppercase">JEEVIKA AI</span>
            </div>
            <span className="text-xs text-white/40 uppercase tracking-widest hidden md:block">Powered by Gnani.ai</span>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Language selector */}
            <div
              onClick={() => setIsLangOpen(v => !v)}
              className="liquid-glass px-4 py-2 flex items-center gap-2 cursor-pointer border border-white/10 hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-white/80">language</span>
              <span className="text-xs uppercase tracking-widest text-white/90">{selectedLangName}</span>
              <span className="material-symbols-outlined text-xs text-white/60">expand_more</span>
            </div>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-12 right-0 w-48 liquid-glass-strong border border-white/10 p-2 z-50 flex flex-col gap-1 shadow-2xl"
                >
                  {LANGUAGES.map(lang => (
                    <div
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
                      className={`px-3 py-2 text-xs rounded-xl cursor-pointer transition-colors ${
                        language === lang.code ? 'bg-white/15 text-white font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {lang.name}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-10 py-8 gap-8 text-center">
          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              How are you <br />
              <span className="italic font-light text-white/70">feeling today?</span>
            </h1>
            <p className="text-white/60 text-base md:text-lg max-w-md mx-auto">
              Tap the microphone and describe your symptoms. Jeevika will analyze them using AI and guide you.
            </p>
          </motion.div>

          {/* Mic Button */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative py-4">
            {isRecording && (
              <div className="absolute inset-4 rounded-full bg-white/5 animate-ping -z-10" />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isAnalyzing}
              className={`w-40 h-40 md:w-44 md:h-44 rounded-full flex items-center justify-center transition-all duration-300 border ${
                isRecording
                  ? 'liquid-glass-strong bg-red-500/20 text-red-400 border-red-500/30 scale-105 pulse-ripple'
                  : 'liquid-glass hover:bg-white/10 text-white border-white/10 hover:scale-105 shadow-2xl'
              } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
            >
              {isAnalyzing ? (
                <span className="material-symbols-outlined text-5xl animate-spin text-white/70">sync</span>
              ) : isRecording ? (
                <span className="material-symbols-outlined text-5xl md:text-6xl text-red-400">square</span>
              ) : (
                <span className="material-symbols-outlined text-5xl md:text-6xl">mic</span>
              )}
            </button>
          </motion.div>

          {/* Transcript Box */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full max-w-2xl">
            <div className="liquid-glass border border-white/10 p-4 md:p-5 flex flex-col gap-3">
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder={isRecording ? 'Listening to your voice...' : 'Tap the mic and describe your symptoms, or type them here...'}
                rows={3}
                className="w-full bg-transparent text-white/90 placeholder-white/40 text-sm md:text-base border-none outline-none resize-none text-center leading-relaxed"
                disabled={isRecording || isAnalyzing}
              />
              {transcript.trim() && !isRecording && !isAnalyzing && (
                <button
                  onClick={() => analyzeSymptooms(transcript)}
                  className="self-center px-8 py-2.5 bg-white text-black hover:bg-white/90 font-semibold rounded-full text-xs uppercase tracking-widest transition-all cursor-pointer active:scale-95 shadow-lg"
                >
                  Analyze Symptoms
                </button>
              )}
            </div>
          </motion.div>

          {/* Analyzing indicator */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-white/60 animate-pulse bg-white/5 px-6 py-3 rounded-full border border-white/10"
              >
                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                Jeevika is analyzing your symptoms...
              </motion.div>
            )}
          </AnimatePresence>

          {/* Triage Result */}
          <AnimatePresence>
            {triageData && <TriageResult data={triageData} />}
          </AnimatePresence>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleQuickAction('emergency')}
              disabled={isAnalyzing}
              className="liquid-glass px-6 py-3 rounded-full flex items-center gap-2 text-xs border border-white/10 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-white cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm text-red-400">emergency</span>
              Emergency Triage
            </button>
            <button
              onClick={() => navigate('/patient/appointments/book')}
              className="liquid-glass px-6 py-3 rounded-full flex items-center gap-2 text-xs border border-white/10 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-blue-400">event</span>
              Book Appointment
            </button>
          </motion.div>
        </main>

        {/* Footer Disclaimer */}
        <footer className="px-6 md:px-10 py-5">
          <div className="liquid-glass border border-white/10 p-4 md:p-6 w-full max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white/40">info</span>
              <p className="text-xs uppercase tracking-widest text-white/40">Medical Disclaimer</p>
            </div>
            <p className="text-xs text-white/50 italic text-center md:text-right">
              "Jeevika AI provides preliminary triage powered by Gnani.ai and is not a substitute for professional medical care."
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default JeevikaTriage;
