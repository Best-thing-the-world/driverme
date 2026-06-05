import React from 'react';
import { X } from 'lucide-react';

export default function FullscreenArt({ isOpen, onClose, src, track, roleColor, isPlaying }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black cursor-pointer"
      onClick={onClose}
    >
      <img
        src={src}
        alt={track?.title}
        className="w-full h-full object-cover object-center"
        style={{ filter: isPlaying ? 'brightness(0.95) saturate(1.1)' : 'brightness(0.6) saturate(0.8)' }}
      />
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${roleColor}22 0%, transparent 60%, #00000088 100%)` }} />
      <div className="absolute top-6 right-6">
        <button className="w-10 h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center">
          <X size={20} className="text-white" />
        </button>
      </div>
      <div className="absolute bottom-10 left-0 right-0 text-center px-8">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-white" style={{ textShadow: `0 0 80px ${roleColor}99` }}>
          {track?.title}
        </h2>
        <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-2">SaadiQ · THE AFTER PARTY</p>
      </div>
    </div>
  );
}