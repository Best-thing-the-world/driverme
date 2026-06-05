import React from 'react';
import { Disc, Music, Loader2 } from 'lucide-react';

export default function VinylVisualizer({ isPlaying, isLoading, error }) {
  return (
    <div className="relative aspect-square w-full max-w-[280px] lg:max-w-[340px] mb-8 lg:mb-12">
      <div className={`absolute inset-[-20px] rounded-full blur-[60px] bg-orange-600/20 transition-all duration-2000 ${isPlaying ? 'opacity-100 scale-125' : 'opacity-0 scale-90'}`}></div>
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-orange-600/40 via-white/5 to-indigo-900/40 p-[2px] transition-all duration-3000 ${isPlaying ? 'rotate-3 scale-105 shadow-2xl' : 'opacity-70'}`}>
        <div className="w-full h-full bg-[#050508] rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div 
            className="w-[92%] h-[92%] rounded-full border-[12px] border-white/5 flex items-center justify-center relative shadow-2xl"
            style={{ 
              animation: 'spin 30s linear infinite',
              animationPlayState: isPlaying ? 'running' : 'paused',
              opacity: isPlaying ? 1 : 0.4
            }}
          >
            <Disc size={160} className="lg:w-[200px] lg:h-[200px] text-white/5" />
            <div className="absolute w-28 h-28 lg:w-36 lg:h-36 bg-orange-600 rounded-full shadow-2xl flex flex-col items-center justify-center border border-white/10">
              <Music size={44} className="lg:w-14 lg:h-14 text-white/60" />
            </div>
          </div>
          
          {isLoading && (
            <div className="absolute inset-0 bg-[#020205]/95 backdrop-blur-3xl flex flex-col items-center justify-center z-50">
              <Loader2 size={48} className="lg:w-16 lg:h-16 text-orange-500 animate-spin" />
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 bg-red-950/90 flex items-center justify-center p-6 text-center z-50">
              <p className="text-[10px] font-black uppercase">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}