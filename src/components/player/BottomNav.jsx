import React from 'react';
import { Home, MessageCircle, Mic2, Crown } from 'lucide-react';

export default function BottomNav({ roleColor, onComments, onLyrics, showLyrics, isPremium, onUpgrade, isCheckoutLoading }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 pb-safe"
      style={{ background: 'linear-gradient(to top, #000000ee, #000000aa, transparent)', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <button
        className="flex flex-col items-center gap-1 px-4 py-2"
        style={{ color: roleColor }}
      >
        <Home size={20} />
        <span className="text-[9px] font-black uppercase tracking-widest">Now</span>
      </button>

      <button
        onClick={onLyrics}
        className="flex flex-col items-center gap-1 px-4 py-2 transition-all"
        style={{ color: showLyrics ? roleColor : 'rgba(255,255,255,0.35)' }}
      >
        <Mic2 size={20} />
        <span className="text-[9px] font-black uppercase tracking-widest">Lyrics</span>
      </button>

      <button
        onClick={onComments}
        className="flex flex-col items-center gap-1 px-4 py-2 transition-all"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        <MessageCircle size={20} />
        <span className="text-[9px] font-black uppercase tracking-widest">Fan</span>
      </button>

      {!isPremium ? (
        <button
          onClick={onUpgrade}
          disabled={isCheckoutLoading}
          className="flex flex-col items-center gap-1 px-4 py-2 transition-all"
          style={{ color: roleColor }}
        >
          <Crown size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">$4.99</span>
        </button>
      ) : (
        <div className="flex flex-col items-center gap-1 px-4 py-2" style={{ color: roleColor }}>
          <Crown size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">VIP</span>
        </div>
      )}
    </div>
  );
}