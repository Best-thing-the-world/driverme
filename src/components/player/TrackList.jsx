import React from 'react';

export default function TrackList({ tracklist, currentTrackIndex, isPlaying, onTrackSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] lg:max-h-none overflow-y-auto no-scrollbar scroll-smooth p-2">
      {tracklist.map((track, i) => (
        <div 
          key={track.id}
          onClick={() => onTrackSelect(i)}
          className={`flex items-center justify-between p-5 lg:p-6 rounded-[2.5rem] transition-all cursor-pointer group ${
            i === currentTrackIndex 
              ? 'bg-orange-600 border border-orange-500' 
              : 'hover:bg-white/10 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-4 lg:gap-6">
            <span className={`text-[12px] font-mono font-black ${i === currentTrackIndex ? 'text-white' : 'text-white/20'}`}>
              {track.id.toString().padStart(2, '0')}
            </span>
            <span className={`block text-[13px] lg:text-[14px] font-black uppercase truncate ${i === currentTrackIndex ? 'text-white' : 'text-white/80'}`}>
              {track.title}
            </span>
          </div>
          {i === currentTrackIndex && isPlaying && (
            <div className="flex gap-[3px] items-end h-4 w-4">
              <div className="w-1 bg-white animate-pulse-fast h-full"></div>
              <div className="w-1 bg-white animate-pulse-slow h-2/3"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}