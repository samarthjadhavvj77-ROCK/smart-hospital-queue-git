"use client";

type HistoryItem = {
  id: string;
  title: string;
  date: string;
  transcript: string;
  summary: string;
};

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "1",
    title: "Cough & Cold",
    date: "Oct 15",
    transcript: "I have a persistent dry cough and nasal congestion for the last three days, no breathing difficulty.",
    summary: "Persistent dry cough, nasal congestion."
  },
  {
    id: "2",
    title: "Mild Fever",
    date: "Oct 12",
    transcript: "My body temperature is 100.2°F, and I have a mild headache but no chest pain.",
    summary: "Body temperature 100.2°F, headache."
  },
  {
    id: "3",
    title: "Back Pain",
    date: "Sep 28",
    transcript: "I am experiencing lower lumbar strain after doing squats at the gym yesterday.",
    summary: "Lower lumbar strain after exercise."
  }
];

export default function MedicationHistory({
  onSelectSymptom
}: {
  onSelectSymptom: (transcript: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2 px-2">
        <span className="material-symbols-outlined text-white/60">history</span>
        <h2 className="font-label-sm uppercase tracking-widest text-white/60">Medication History</h2>
      </div>
      <div className="space-y-3">
        {MOCK_HISTORY.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectSymptom(item.transcript)}
            className="liquid-glass p-4 hover:scale-[1.02] transition-all cursor-pointer hover:bg-white/10 active:scale-95 group"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-headline-md text-base text-white group-hover:text-primary transition-colors">
                {item.title}
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-tighter">
                {item.date}
              </span>
            </div>
            <p className="text-xs text-white/60 line-clamp-1">
              Analyzed: {item.summary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
