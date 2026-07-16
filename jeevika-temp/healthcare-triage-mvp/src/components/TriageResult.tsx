"use client";

import { useEffect, useState } from "react";

export type TriageData = {
  severity: "Minor" | "Severe";
  advice: string;
  needsClinic: boolean;
};

export default function TriageResult({ 
  data, 
  language 
}: { 
  data: TriageData | null;
  language: string;
}) {
  const [bookedClinics, setBookedClinics] = useState<Record<number, boolean>>({});
  const [bookingLoading, setBookingLoading] = useState<Record<number, number>>({});

  // Reset booking state when data changes
  useEffect(() => {
    setBookedClinics({});
    setBookingLoading({});
  }, [data]);

  // TTS effect
  useEffect(() => {
    if (data && typeof window !== "undefined") {
      const utterance = new SpeechSynthesisUtterance(data.advice);
      utterance.lang = language;
      utterance.rate = 0.95;
      
      window.speechSynthesis.cancel(); // clear previous speech
      window.speechSynthesis.speak(utterance);
    }
  }, [data, language]);

  if (!data) return null;

  const isSevere = data.severity === "Severe";

  const handleBook = (clinicId: number) => {
    if (bookedClinics[clinicId]) return;

    setBookingLoading(prev => ({ ...prev, [clinicId]: 1 }));
    
    // Simulate booking API call
    setTimeout(() => {
      setBookingLoading(prev => {
        const copy = { ...prev };
        delete copy[clinicId];
        return copy;
      });
      setBookedClinics(prev => ({ ...prev, [clinicId]: true }));
    }, 1200);
  };

  return (
    <div className="w-full max-w-2xl mt-8 animate-fade-in-up">
      <div 
        className={`liquid-glass-strong p-6 md:p-8 border-2 shadow-2xl transition-all duration-500 relative overflow-hidden ${
          isSevere 
            ? 'border-red-500/20 shadow-red-500/5 bg-gradient-to-br from-red-500/5 to-transparent' 
            : 'border-green-500/20 shadow-green-500/5 bg-gradient-to-br from-green-500/5 to-transparent'
        }`}
      >
        {/* Glow effect */}
        <div 
          className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px] pointer-events-none ${
            isSevere ? 'bg-red-500/20' : 'bg-green-500/20'
          }`} 
        />

        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div 
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isSevere ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}
          >
            <span className="material-symbols-outlined text-2xl font-bold">
              {isSevere ? 'emergency' : 'info'}
            </span>
          </div>
          <div>
            <h3 className={`text-xl font-bold tracking-tight ${isSevere ? 'text-red-400' : 'text-green-400'}`}>
              {isSevere ? 'Severe Condition' : 'Minor Symptoms'}
            </h3>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">Triage Assessment</p>
          </div>
        </div>
        
        <p className="text-base md:text-lg text-white/90 mb-6 font-medium leading-relaxed bg-white/5 border border-white/5 p-5 rounded-2xl relative z-10">
          "{data.advice}"
        </p>

        {data.needsClinic && (
          <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
            <h4 className="font-bold flex items-center gap-2 mb-4 text-white/80 text-sm md:text-base">
              <span className="material-symbols-outlined text-primary text-xl">map</span>
              Suggested Clinics Nearby
            </h4>
            <div className="space-y-3">
              {[1, 2].map((i) => {
                const isBooked = bookedClinics[i];
                const isLoading = bookingLoading[i];

                return (
                  <div 
                    key={i} 
                    className="flex justify-between items-center p-4 liquid-glass hover:bg-white/10 rounded-xl transition-all border border-white/5 hover:border-white/10 group"
                  >
                    <div>
                      <p className="font-semibold text-sm text-white group-hover:text-primary transition-colors">
                        City Care Clinic {i}
                      </p>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        {i * 1.8} km away • Open Now
                      </p>
                    </div>
                    <button 
                      onClick={() => handleBook(i)}
                      disabled={!!isLoading || !!isBooked}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 min-w-[80px] justify-center ${
                        isBooked 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                          : isLoading
                            ? 'bg-white/10 text-white/50 cursor-wait'
                            : 'bg-white/10 text-white hover:bg-primary hover:text-black border border-white/10 cursor-pointer active:scale-95'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                          Booking
                        </>
                      ) : isBooked ? (
                        <>
                          <span className="material-symbols-outlined text-xs font-bold">check_circle</span>
                          Booked
                        </>
                      ) : (
                        'Book'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
