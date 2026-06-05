import React, { useEffect, useRef, useMemo } from 'react';
import { Mic2 } from 'lucide-react';

// Lyrics data: each line has a `t` (start time in seconds) and `text`
export const LYRICS = {
  1: [ // SAUCY
    { t: 0,   text: "Yeah, yeah..." },
    { t: 4,   text: "Saucy with it, can't nobody stop me" },
    { t: 8,   text: "Dripping on 'em, got the whole crowd watching" },
    { t: 12,  text: "Every step I take it's like a statement" },
    { t: 16,  text: "Moving through the city, no replacement" },
    { t: 20,  text: "Saucy — you can feel it in the air" },
    { t: 24,  text: "Confidence so loud, they stop and stare" },
    { t: 28,  text: "Sauce on sauce, never running low" },
    { t: 32,  text: "Watch me set the stage and run the show" },
    { t: 36,  text: "Yeah, saucy..." },
  ],
  2: [ // Wasabi
    { t: 0,   text: "Hit 'em with the wasabi" },
    { t: 5,   text: "Got that heat they can't describe" },
    { t: 10,  text: "Something different, something spicy" },
    { t: 15,  text: "Keep it fresh from side to side" },
    { t: 20,  text: "Wasabi — burning through the night" },
    { t: 25,  text: "Can't tame it, turn it up" },
    { t: 30,  text: "Unexpected, cut you right" },
    { t: 35,  text: "Wasabi feeling in my soul" },
    { t: 40,  text: "Spice of life, that's how we roll" },
  ],
  3: [ // Wet Wet
    { t: 0,   text: "Toni Macaroni, looking good" },
    { t: 5,   text: "Wet wet dripping like she should" },
    { t: 10,  text: "Every curve a masterpiece" },
    { t: 15,  text: "Got me on my knees, oh please" },
    { t: 20,  text: "Wet wet, soaking to the bone" },
    { t: 25,  text: "Can't leave her alone" },
    { t: 30,  text: "Toni got me going crazy" },
    { t: 35,  text: "Wet wet, driving me insane" },
    { t: 40,  text: "Come back, baby, do it again" },
  ],
  4: [ // Aggressive
    { t: 0,   text: "Aggressive, no apology" },
    { t: 5,   text: "Coming through with full velocity" },
    { t: 10,  text: "Can't slow down, won't hold back" },
    { t: 15,  text: "Staying on that winning track" },
    { t: 20,  text: "Aggressive — it's in my blood" },
    { t: 25,  text: "Rising like a flood" },
    { t: 30,  text: "Every move calculated" },
    { t: 35,  text: "Haters left frustrated" },
    { t: 40,  text: "Aggressive to the end" },
  ],
  5: [ // POGO
    { t: 0,   text: "Jump up, jump up — pogo!" },
    { t: 5,   text: "Can't stop the motion, let it flow" },
    { t: 10,  text: "Everybody in the building" },
    { t: 15,  text: "Feel the beat, start fulfilling" },
    { t: 20,  text: "Pogo — bounce until the morning" },
    { t: 25,  text: "No sleep, no warning" },
    { t: 30,  text: "Bodies moving, lights low" },
    { t: 35,  text: "All I know is pogo" },
  ],
  6: [ // Slo_Motion
    { t: 0,   text: "Slow motion, take your time" },
    { t: 6,   text: "Every moment, so divine" },
    { t: 12,  text: "Watch the world fade away" },
    { t: 18,  text: "In slow motion, come and stay" },
    { t: 24,  text: "Breathe it in, don't rush" },
    { t: 30,  text: "Feel the quiet, feel the hush" },
    { t: 36,  text: "Slow motion got me deep" },
    { t: 42,  text: "Drifting off to sleep" },
  ],
  7: [ // Late Night
    { t: 0,   text: "Late night, city lights" },
    { t: 5,   text: "Everything's electric" },
    { t: 10,  text: "You and I, feels so right" },
    { t: 15,  text: "Something magnetic" },
    { t: 20,  text: "Late night — can we stay?" },
    { t: 25,  text: "Don't let the sunrise take you away" },
    { t: 30,  text: "In the dark we find the truth" },
    { t: 35,  text: "Late night, just me and you" },
    { t: 40,  text: "Don't go, stay a little longer" },
  ],
  8: [ // Jealousy
    { t: 0,   text: "Jealousy eating at my soul" },
    { t: 5,   text: "Watching you, losing all control" },
    { t: 10,  text: "Why does someone else get your smile?" },
    { t: 15,  text: "I've been waiting all this while" },
    { t: 20,  text: "Jealousy — I can't fight it" },
    { t: 25,  text: "Every look ignites it" },
    { t: 30,  text: "Green-eyed and burning" },
    { t: 35,  text: "My heart is yearning" },
    { t: 40,  text: "Just say you're mine" },
  ],
  9: [ // Barry White
    { t: 0,   text: "Deep voice, smooth like Barry White" },
    { t: 6,   text: "Love songs on a Saturday night" },
    { t: 12,  text: "Candlelight and red wine" },
    { t: 18,  text: "Everything about you is divine" },
    { t: 24,  text: "Barry White had the right idea" },
    { t: 30,  text: "Pull you close, keep you near" },
    { t: 36,  text: "Let the music move us slow" },
    { t: 42,  text: "Nowhere else I'd rather go" },
  ],
  10: [ // Show U Real
    { t: 0,   text: "Let me show you real" },
    { t: 5,   text: "No games, no pretending" },
    { t: 10,  text: "Everything I feel" },
    { t: 15,  text: "It's never ending" },
    { t: 20,  text: "Show you real — open up the doors" },
    { t: 25,  text: "Give you something more" },
    { t: 30,  text: "This love is authentic" },
    { t: 35,  text: "Can't you see it's magnetic?" },
    { t: 40,  text: "Let me show you real" },
  ],
  11: [ // 1 on 1
    { t: 0,   text: "Just me and you, one on one" },
    { t: 5,   text: "No distractions when we're done" },
    { t: 10,  text: "Conversations in the dark" },
    { t: 15,  text: "That's when things really start" },
    { t: 20,  text: "One on one — that's how I like it" },
    { t: 25,  text: "No crowd, just ignite it" },
    { t: 30,  text: "You and me, face to face" },
    { t: 35,  text: "Can't nobody take your place" },
  ],
  12: [ // Dance On Me
    { t: 0,   text: "Come and dance on me tonight" },
    { t: 5,   text: "Feel the rhythm, feel it right" },
    { t: 10,  text: "Move your body side to side" },
    { t: 15,  text: "Let the music be your guide" },
    { t: 20,  text: "Dance on me — don't stop now" },
    { t: 25,  text: "Show me what you're about" },
    { t: 30,  text: "Every beat, a new connection" },
    { t: 35,  text: "Dance in my direction" },
    { t: 40,  text: "Come and dance on me" },
  ],
};

export default function LyricsView({ trackId, seek, isPlaying, roleColor }) {
  const lyrics = LYRICS[trackId] || [];
  const containerRef = useRef(null);
  const activeRef = useRef(null);

  const activeIndex = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (seek >= lyrics[i].t) idx = i;
      else break;
    }
    return idx;
  }, [seek, lyrics]);

  // Auto-scroll active line into view
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  if (lyrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Mic2 size={28} className="text-white/15" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/20">No lyrics available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto px-6 py-6 flex flex-col gap-1"
      style={{ maxHeight: 260 }}
    >
      {lyrics.map((line, i) => {
        const isActive = i === activeIndex;
        const isPast = i < activeIndex;
        return (
          <div
            key={i}
            ref={isActive ? activeRef : null}
            className="py-1.5 transition-all duration-300 cursor-default select-none"
          >
            <p
              className="text-left font-black uppercase tracking-tight leading-snug transition-all duration-300"
              style={{
                fontSize: isActive ? 20 : 15,
                color: isActive ? '#fff' : isPast ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.35)',
                textShadow: isActive ? `0 0 40px ${roleColor}99` : 'none',
                transform: isActive ? 'translateX(4px)' : 'none',
              }}
            >
              {isActive && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-2 mb-0.5 align-middle animate-pulse"
                  style={{ backgroundColor: roleColor }}
                />
              )}
              {line.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}