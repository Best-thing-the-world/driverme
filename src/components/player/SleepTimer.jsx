import React, { useState, useEffect, useRef } from 'react';
import { Timer, X } from 'lucide-react';

const OPTIONS = [15, 30, 45, 60, 90];

export default function SleepTimer({ onStop, roleColor }) {
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const timerRef = useRef(null);

  const start = (mins) => {
    clearInterval(timerRef.current);
    setMinutes(mins);
    setRemaining(mins * 60);
    setOpen(false);
  };

  const cancel = () => {
    clearInterval(timerRef.current);
    setMinutes(null);
    setRemaining(null);
  };

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) { onStop(); cancel(); return; }
    timerRef.current = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [remaining]);

  const fmt = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {remaining !== null ? (
        <button
          onClick={cancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest"
          style={{ borderColor: roleColor, color: roleColor }}
        >
          <Timer size={10} /> {fmt(remaining)} <X size={9} />
        </button>
      ) : (
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all"
          style={{ borderColor: open ? roleColor : 'rgba(255,255,255,0.15)', color: open ? roleColor : 'rgba(255,255,255,0.4)' }}
        >
          <Timer size={10} /> Sleep
        </button>
      )}
      {open && (
        <div className="absolute right-0 top-9 z-50 bg-[#111] border border-white/10 rounded-2xl p-2 flex flex-col gap-1 min-w-[100px] shadow-2xl">
          {OPTIONS.map(m => (
            <button
              key={m}
              onClick={() => start(m)}
              className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white text-left transition-all hover:bg-white/10"
            >
              {m} min
            </button>
          ))}
        </div>
      )}
    </div>
  );
}