"use client";

import { useState, useEffect, useRef } from "react";

export default function VoiceAgent({ 
  onTranscriptionComplete,
  language,
  externalTranscript = "",
  isAnalyzing = false
}: { 
  onTranscriptionComplete: (text: string) => void;
  language: string;
  externalTranscript?: string;
  isAnalyzing?: boolean;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  // Synchronize external transcripts (e.g. from history cards or quick actions)
  useEffect(() => {
    if (externalTranscript) {
      setTranscript(externalTranscript);
    }
  }, [externalTranscript]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;
        
        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript("");
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    } else {
      alert("Voice recognition is not supported in this browser. Please try using Google Chrome.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Failed to stop speech recognition:", err);
      }
      setIsRecording(false);
      setIsProcessing(true);
      
      // Pass the final transcript up to the parent component after state settles
      setTimeout(() => {
        setIsProcessing(false);
        onTranscriptionComplete(transcript);
      }, 600);
    }
  };

  const handleAnalyzeClick = () => {
    if (transcript.trim()) {
      onTranscriptionComplete(transcript);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl mx-auto relative z-10">
      {/* MASSIVE MIC BUTTON CONTAINER */}
      <div className="relative py-4">
        {isRecording && (
          <div className="absolute inset-4 rounded-full bg-white/5 animate-ping -z-10" />
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || isAnalyzing}
          className={`w-40 h-40 md:w-44 md:h-44 rounded-full flex items-center justify-center transition-all duration-300 relative cursor-pointer active:scale-95 border border-white/10 ${
            isRecording 
              ? 'liquid-glass-strong bg-red-500/20 text-red-400 border-red-500/30 scale-105 pulse-ripple' 
              : 'liquid-glass hover:bg-white/10 text-white hover:scale-105 shadow-xl'
          } ${isProcessing || isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing || isAnalyzing ? (
            <span className="material-symbols-outlined text-5xl animate-spin text-white/70">
              sync
            </span>
          ) : isRecording ? (
            <span className="material-symbols-outlined text-5xl md:text-6xl text-red-400">
              square
            </span>
          ) : (
            <span className="material-symbols-outlined text-5xl md:text-6xl group-hover:scale-110 transition-transform">
              mic
            </span>
          )}
        </button>
      </div>

      {/* SYMPTOM INPUT AND LIVE TRANSCRIPT DISPLAY */}
      <div className="w-full liquid-glass p-4 md:p-5 flex flex-col gap-3 border border-white/5">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={isRecording ? "Listening to your voice..." : "Tap the mic and describe your symptoms, or type them directly here..."}
          className="w-full min-h-[100px] bg-transparent text-white/90 placeholder-white/40 text-sm md:text-base border-none outline-none resize-none text-center focus:ring-0 leading-relaxed font-medium"
          disabled={isRecording || isProcessing || isAnalyzing}
        />
        
        {transcript.trim() && !isRecording && !isProcessing && !isAnalyzing && (
          <button
            onClick={handleAnalyzeClick}
            className="self-center px-6 py-2.5 bg-white text-black hover:bg-white/90 font-semibold rounded-full text-xs uppercase tracking-widest transition-all cursor-pointer active:scale-95 shadow-lg shadow-white/5"
          >
            Analyze Symptoms
          </button>
        )}
      </div>
    </div>
  );
}
