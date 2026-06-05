import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Heart, Volume2, VolumeX, Shuffle, Repeat, Repeat1, Loader2 } from 'lucide-react';
import { formatTime } from '@/components/constants';

export default function PlayerControls({
  isPlaying, isLoading, error,
  seek, duration, isDragging,
  isShuffled, loopMode,
  volume, isMuted,
  liked, trackId,
  roleColor,
  onTogglePlay,
  onNext, onPrev,
  onToggleShuffle, onCycleLoop,
  onSeekStart, onSeekChange, onSeekEnd,
  onChangeVolume, onToggleMute,
  onToggleLike,
}) {
  const progress = duration > 0 ? (seek / duration) * 100 : 0;

  return (
    <div className="px-5 mt-5">
      {/* Seek bar */}
      <div className="mb-3">
        <div className="relative h-1 rounded-full mb-2 cursor-pointer" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <input
            type="range" min="0" max={duration || 100} value={seek} step="0.01"
            onPointerDown={onSeekStart} onChange={onSeekChange} onPointerUp={onSeekEnd}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="absolute left-0 top-0 h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: roleColor, boxShadow: `0 0 10px ${roleColor}88` }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg"
            style={{ left: `calc(${progress}% - 7px)` }} />
        </div>
        <div className="flex justify-between text-[11px] font-mono font-bold">
          <span style={{ color: roleColor }}>{formatTime(seek)}</span>
          <span className="text-white/30">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Transport */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onToggleShuffle} className="p-2"
          style={{ color: isShuffled ? roleColor : 'rgba(255,255,255,0.25)' }}>
          <Shuffle size={20} />
        </button>
        <button onClick={onPrev} className="p-2 text-white/60 active:scale-90 transition-transform">
          <SkipBack size={30} fill="currentColor" />
        </button>
        <button
          onClick={onTogglePlay}
          disabled={isLoading || !!error}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 shadow-xl"
          style={{ backgroundColor: roleColor, boxShadow: `0 0 40px ${roleColor}55` }}
        >
          {isLoading
            ? <Loader2 size={28} className="animate-spin text-white" />
            : isPlaying
              ? <Pause size={28} fill="white" className="text-white" />
              : <Play size={28} fill="white" className="text-white ml-1" />
          }
        </button>
        <button onClick={onNext} className="p-2 text-white/60 active:scale-90 transition-transform">
          <SkipForward size={30} fill="currentColor" />
        </button>
        <button onClick={onCycleLoop} className="p-2"
          style={{ color: loopMode !== 'none' ? roleColor : 'rgba(255,255,255,0.25)' }}>
          {loopMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
        </button>
      </div>

      {/* Like + Volume */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={onToggleLike} className="transition-all active:scale-125 p-1"
          style={{ color: liked ? '#ef4444' : 'rgba(255,255,255,0.3)' }}>
          <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onToggleMute} style={{ color: isMuted ? '#ef4444' : 'rgba(255,255,255,0.3)' }}>
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range" min="0" max="1" step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-24 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              accentColor: roleColor,
              background: `linear-gradient(to right, ${roleColor} ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) 0%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}