import React, { useState } from 'react';
import { Zap, Mic2, MessageCircle, Table2, Share2, Crown, BarChart2, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import SleepTimer from './SleepTimer';

export default function PlayerToolbar({
  roleColor,
  isPremium,
  isCheckoutLoading,
  onUpgrade,
  onOpenModal,
  showMoodBar,
  onToggleMoodBar,
  showLyrics,
  onToggleLyrics,
  onShareCard,
  onSleepStop,
}) {
  const [sheetsUrl, setSheetsUrl] = useState(null);
  const [isSheetsLoading, setIsSheetsLoading] = useState(false);

  const handleSheetsSetup = async () => {
    setIsSheetsLoading(true);
    try {
      const res = await base44.functions.invoke('sheetsExport', { action: 'setup' });
      if (res.data?.url) setSheetsUrl(res.data.url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSheetsLoading(false);
    }
  };

  const btnBase = "flex items-center justify-center gap-1 px-2 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all";
  const dimStyle = { borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)' };

  return (
    <div className="px-3 pt-5 pb-0 flex flex-col gap-2">
      {/* Branding */}
      <div className="flex items-center gap-2 px-2">
        <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: roleColor }} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">SaadiQ · Now Playing</span>
      </div>

      {/* Row 1: Core features */}
      <div className="grid grid-cols-4 gap-1.5 w-full">
        <button
          onClick={onToggleMoodBar}
          className={btnBase}
          style={{ borderColor: showMoodBar ? roleColor : 'rgba(255,255,255,0.12)', color: showMoodBar ? roleColor : 'rgba(255,255,255,0.4)', backgroundColor: showMoodBar ? `${roleColor}15` : 'transparent' }}
        >
          <Zap size={11} /> AI
        </button>
        <button
          onClick={onToggleLyrics}
          className={btnBase}
          style={{ borderColor: showLyrics ? roleColor : 'rgba(255,255,255,0.12)', color: showLyrics ? roleColor : 'rgba(255,255,255,0.4)', backgroundColor: showLyrics ? `${roleColor}15` : 'transparent' }}
        >
          <Mic2 size={11} /> Lyrics
        </button>
        <button onClick={() => onOpenModal('comments')} className={btnBase} style={dimStyle}>
          <MessageCircle size={11} /> Fan
        </button>
        <button
          onClick={() => onOpenModal('hype')}
          className={btnBase}
          style={{ borderColor: `${roleColor}40`, color: roleColor, backgroundColor: `${roleColor}10` }}
        >
          🎤 Hype
        </button>
      </div>

      {/* Row 2: Utility & premium */}
      <div className="grid grid-cols-5 gap-1.5 w-full mt-1.5">
        {sheetsUrl ? (
          <a href={sheetsUrl} target="_blank" rel="noopener noreferrer" className={btnBase}
            style={{ borderColor: '#22c55e55', color: '#22c55e', backgroundColor: '#22c55e10' }}>
            <Table2 size={11} /> Sheets
          </a>
        ) : (
          <button onClick={handleSheetsSetup} disabled={isSheetsLoading} className={btnBase} style={dimStyle}>
            {isSheetsLoading ? <Loader2 size={11} className="animate-spin" /> : <><Table2 size={11} /> Export</>}
          </button>
        )}

        <div className="flex items-center justify-center">
          <SleepTimer onStop={onSleepStop} roleColor={roleColor} />
        </div>

        <button onClick={onShareCard} className={btnBase} style={dimStyle}>
          <Share2 size={11} /> Share
        </button>

        {!isPremium ? (
          <button
            onClick={onUpgrade}
            disabled={isCheckoutLoading}
            className="flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black transition-all"
            style={{ backgroundColor: roleColor, boxShadow: `0 0 12px ${roleColor}55` }}
          >
            {isCheckoutLoading ? <Loader2 size={11} className="animate-spin" /> : <><Crown size={11} /> VIP</>}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
            style={{ color: roleColor, border: `1px solid ${roleColor}55`, backgroundColor: `${roleColor}10` }}>
            <Crown size={11} /> VIP
          </div>
        )}

        <a href={createPageUrl('Monitor')} className={btnBase}
          style={{ borderColor: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.3)' }}>
          <BarChart2 size={11} />
        </a>
      </div>
    </div>
  );
}