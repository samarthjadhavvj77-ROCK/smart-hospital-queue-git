"use client";

import { useState, useEffect } from "react";
import VoiceAgent from "@/components/VoiceAgent";
import TriageResult, { TriageData } from "@/components/TriageResult";
import MedicationHistory from "@/components/MedicationHistory";

const LANGUAGES = [
  { code: "en-IN", name: "English" },
  { code: "hi-IN", name: "हिन्दी (Hindi)" },
  { code: "mr-IN", name: "मराठी (Marathi)" },
  { code: "ta-IN", name: "தமிழ் (Tamil)" }
];

export default function Home() {
  const [language, setLanguage] = useState("en-IN");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [triageData, setTriageData] = useState<TriageData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [externalTranscript, setExternalTranscript] = useState("");
  
  // Daily reminders state
  const [reminders, setReminders] = useState([
    { id: 1, text: "Take Vitamin D", time: "9:00 AM • Daily", icon: "pill", completed: false },
    { id: 2, text: "Hydration Check", time: "2:00 PM • Goal: 3L", icon: "water_drop", completed: false },
    { id: 3, text: "Morning Walk", time: "7:30 AM", icon: "check_circle", completed: true }
  ]);

  // Parallax video state
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Background parallax offset
      const moveX = (e.clientX - window.innerWidth / 2) * 0.012;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.012;
      setParallaxOffset({ x: moveX, y: moveY });

      // Highlight dynamic coordinates for glass glow effects
      const elements = document.querySelectorAll(".liquid-glass, .liquid-glass-strong");
      elements.forEach((el: any) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty("--mouse-x", `${x}px`);
        el.style.setProperty("--mouse-y", `${y}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleTranscriptionComplete = async (transcriptText: string) => {
    if (!transcriptText.trim()) return;
    
    setIsAnalyzing(true);
    setTriageData(null);
    setExternalTranscript(transcriptText); // ensure synchrony
    
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transcript: transcriptText, language })
      });
      
      const data = await res.json();
      setTriageData(data);
    } catch (error) {
      console.error("Error analyzing transcript", error);
      alert("Failed to analyze symptoms. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectHistoryItem = (transcriptText: string) => {
    setExternalTranscript(transcriptText);
    handleTranscriptionComplete(transcriptText);
  };

  const handleQuickAction = (actionType: "emergency" | "book") => {
    let symptomText = "";
    if (actionType === "emergency") {
      symptomText = language === "hi-IN" 
        ? "मुझे छाती में बहुत तेज दर्द हो रहा है और सांस लेने में कठिनाई है।"
        : "I am experiencing sudden severe chest pain, shortness of breath, and sweating.";
    } else {
      symptomText = language === "hi-IN"
        ? "मुझे पीठ में दर्द है और एक डॉक्टर के साथ अपॉइंटमेंट बुक करना है।"
        : "I have mild lower back pain after exercise and would like to book a clinic consultation.";
    }
    setExternalTranscript(symptomText);
    handleTranscriptionComplete(symptomText);
  };

  const toggleReminder = (id: number) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const selectedLangName = LANGUAGES.find(l => l.code === language)?.name || "English";

  return (
    <>
      {/* BACKGROUND VIDEO WITH PARALLAX */}
      <div className="video-container">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          style={{
            transform: `scale(1.1) translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`
          }}
        >
          <source 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4" 
            type="video/mp4" 
          />
        </video>
      </div>

      <main className="main-container">
        {/* HEADER */}
        <header className="w-full flex items-center justify-between p-container-padding z-20">
          <div className="flex items-center gap-stack-sm select-none">
            <div className="w-10 h-10 liquid-glass flex items-center justify-center border border-white/5">
              <span className="material-symbols-outlined text-white text-2xl">health_metrics</span>
            </div>
            <span className="text-2xl font-semibold tracking-tighter uppercase font-headline-md text-white">
              JEEVIKA AI
            </span>
          </div>

          <div className="flex gap-4 relative">
            {/* Custom styled language dropdown */}
            <div 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="liquid-glass px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/10 border border-white/5 transition-colors select-none"
            >
              <span className="material-symbols-outlined text-sm text-white/80">language</span>
              <span className="font-label-sm text-[10px] uppercase tracking-widest text-white/90">
                {selectedLangName}
              </span>
              <span className="material-symbols-outlined text-xs text-white/60">expand_more</span>
            </div>

            {isLangOpen && (
              <div className="absolute top-12 right-12 w-44 liquid-glass-strong border border-white/10 p-2 z-50 flex flex-col gap-1 shadow-2xl">
                {LANGUAGES.map((lang) => (
                  <div
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                      language === lang.code 
                        ? 'bg-white/10 text-primary font-bold' 
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {lang.name}
                  </div>
                ))}
              </div>
            )}

            <button className="liquid-glass w-10 h-10 flex items-center justify-center hover:scale-105 border border-white/5 transition-transform cursor-pointer">
              <span className="material-symbols-outlined text-xl text-white">menu</span>
            </button>
          </div>
        </header>

        {/* MAIN INTERACTION AREA */}
        <section className="flex flex-col items-center justify-center px-container-padding text-center gap-stack-lg py-12">
          <div className="max-w-2xl space-y-4 select-none">
            <h1 className="text-display-lg-mobile md:text-display-lg font-headline-md leading-tight text-white">
              How are you <br/>
              <span className="italic font-body-accent">feeling today?</span>
            </h1>
            <p className="text-body-lg text-white/70 max-w-lg mx-auto">
              Tap the microphone and describe your symptoms. Jeevika will analyze them and guide you to the right care.
            </p>
          </div>

          {/* VOICE INPUT OR MANUAL ENTRY */}
          <VoiceAgent 
            onTranscriptionComplete={handleTranscriptionComplete} 
            language={language}
            externalTranscript={externalTranscript}
            isAnalyzing={isAnalyzing}
          />

          {isAnalyzing && (
            <div className="text-white/60 animate-pulse mt-4 flex items-center gap-2 font-medium bg-white/5 px-6 py-3 rounded-full border border-white/5 shadow-inner">
              <span className="material-symbols-outlined animate-spin text-sm">sync</span> 
              Analyzing symptoms...
            </div>
          )}

          {/* TRIAGE REPORT DISPLAY */}
          <TriageResult data={triageData} language={language} />

          {/* QUICK ACTIONS */}
          <div className="flex flex-wrap justify-center gap-3 max-w-xl relative z-10">
            <button 
              onClick={() => handleQuickAction("emergency")}
              className="liquid-glass px-6 py-3 rounded-full flex items-center gap-2 text-label-sm border border-white/5 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-white cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-sm text-red-400">emergency</span>
              Emergency Triage
            </button>
            <button 
              onClick={() => handleQuickAction("book")}
              className="liquid-glass px-6 py-3 rounded-full flex items-center gap-2 text-label-sm border border-white/5 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-white cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-sm text-blue-400">event</span>
              Book Appointment
            </button>
          </div>
        </section>

        {/* DASHBOARD SECTIONS */}
        <section className="px-container-padding pb-stack-lg flex flex-col md:flex-row gap-6 max-w-6xl mx-auto w-full relative z-10">
          {/* Medication History Column */}
          <div className="flex-1">
            <MedicationHistory onSelectSymptom={handleSelectHistoryItem} />
          </div>

          {/* Daily Reminders Column */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2 select-none">
              <span className="material-symbols-outlined text-white/60">notifications</span>
              <h2 className="font-label-sm uppercase tracking-widest text-white/60">Daily Reminders</h2>
            </div>
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div 
                  key={reminder.id}
                  onClick={() => toggleReminder(reminder.id)}
                  className={`p-4 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-white/5 select-none ${
                    reminder.completed 
                      ? 'liquid-glass opacity-50 grayscale' 
                      : 'liquid-glass-strong'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      reminder.completed ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-white/80'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {reminder.completed ? 'check_circle' : reminder.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className={`font-label-sm text-sm text-white ${reminder.completed ? 'line-through text-white/60' : ''}`}>
                        {reminder.text}
                      </h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">
                        {reminder.completed ? 'Completed' : reminder.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER / MEDICAL DISCLAIMER */}
        <footer className="p-container-padding pt-0 z-20 mt-auto select-none">
          <div className="liquid-glass p-6 md:p-8 w-full max-w-4xl mx-auto border border-white/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white/40">info</span>
                <p className="text-label-sm uppercase tracking-[0.15em] text-white/40 text-xs text-center md:text-left">
                  Medical Disclaimer
                </p>
              </div>
              <p className="text-body-accent italic text-xs md:text-sm text-white/60 text-center md:text-right flex-1 md:max-w-2xl leading-relaxed">
                "Jeevika AI provides preliminary triage only and is not a substitute for professional medical care."
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
