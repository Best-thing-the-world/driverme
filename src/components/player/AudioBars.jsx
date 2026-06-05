import React, { useEffect, useRef } from 'react';

export default function AudioBars({ isPlaying, count = 28 }) {
  const bars = Array.from({ length: count });
  return (
    <div className="flex items-end gap-[3px] h-12 w-full justify-center">
      {bars.map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-full"
          style={{
            backgroundColor: i % 3 === 0 ? '#ea580c' : i % 3 === 1 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
            height: isPlaying ? undefined : '20%',
            minWidth: 3,
            animation: isPlaying
              ? `bar-bounce ${0.5 + (i % 7) * 0.13}s ease-in-out ${(i % 5) * 0.07}s infinite alternate`
              : 'none',
            transition: 'height 0.4s ease',
          }}
        />
      ))}
      <style>{`
        @keyframes bar-bounce {
          0% { height: 15%; }
          100% { height: ${90}%; }
        }
      `}</style>
    </div>
  );
}