import React, { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';

const ADS = [
  { text: "🎧 Love the music? Support SaadiQ!", cta: "Go Ad-Free $4.99" },
  { text: "🔥 Unlock the full experience", cta: "Remove Ads Now" },
  { text: "💿 Own the vibe. No interruptions.", cta: "Go Premium $4.99" },
];

export default function AdBanner({ onUpgrade, onDismiss }) {
  const [ad] = useState(() => ADS[Math.floor(Math.random() * ADS.length)]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 400);
  };

  return (
    <div
      className="transition-all duration-500 overflow-hidden"
      style={{ maxHeight: visible ? 80 : 0, opacity: visible ? 1 : 0 }}
    >
      <div className="mx-5 mb-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 flex items-center gap-3">
        <Zap size={14} className="text-orange-400 flex-shrink-0" />
        <p className="text-[11px] font-bold text-white/70 flex-1">{ad.text}</p>
        <button
          onClick={onUpgrade}
          className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide text-black bg-orange-500 flex-shrink-0"
        >
          {ad.cta}
        </button>
        <button onClick={dismiss} className="text-white/30 hover:text-white/60 flex-shrink-0">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}