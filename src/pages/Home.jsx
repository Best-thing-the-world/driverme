import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Loader2, Maximize2, Flame } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PullToRefresh from 'react-simple-pull-to-refresh';

import { TRACKLIST, ROLE_COLORS, ARTIST_IMAGE } from '@/components/constants';
import { useAudioEngine } from '@/components/useAudioEngine';
import PlayerToolbar from '@/components/player/PlayerToolbar';
import PlayerControls from '@/components/player/PlayerControls';
import AIChatModal from '@/components/player/AIChatModal';
import AdBanner from '@/components/player/AdBanner';
import LyricsView from '@/components/player/LyricsView';
import HypeManChat from '@/components/player/HypeManChat';
import SleepTimer from '@/components/player/SleepTimer';
import CommentsModal from '@/components/player/CommentsModal';
import FullscreenArt from '@/components/player/FullscreenArt';
import BottomNav from '@/components/player/BottomNav';
import ShareCardModal from '@/components/player/ShareCardModal';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // URL search-param modal routing — back button naturally closes modals
  const activeModal = new URLSearchParams(location.search).get('modal');
  const openModal = (name) => navigate(`?modal=${name}`);
  const closeModal = () => navigate(-1);

  // UI-only state
  const [liked, setLiked] = useState(new Set());
  const [showMoodBar, setShowMoodBar] = useState(false);
  const [userMood, setUserMood] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('afterparty_premium') === 'true');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [adCount, setAdCount] = useState(0);

  const mounted = useRef(true);
  const touchStartX = useRef(null);

  const audio = useAudioEngine();
  const track = TRACKLIST[audio.trackIndex];
  const roleColor = ROLE_COLORS[track.role] || '#ea580c';
  const maxPlays = Math.max(0, ...Object.values(audio.trackStats).map((s) => s.play_count || 0));

  // Show ad every 3 track changes for free users
  useEffect(() => {
    if (!isPremium && adCount > 0 && adCount % 3 === 0) setShowAd(true);
  }, [adCount, isPremium]);

  // Verify premium on return from Stripe checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      window.history.replaceState({}, '', window.location.pathname);
      base44.functions.invoke('verifyPremium', { sessionId }).
      then((res) => {
        if (res.data?.verified) {
          localStorage.setItem('afterparty_premium', 'true');
          setIsPremium(true);
        }
      }).
      catch(console.error);
    }
  }, []);

  // Log visitor analytics
  useEffect(() => {
    base44.functions.invoke('sheetsExport', {
      action: 'logVisitor',
      userAgent: navigator.userAgent,
      language: navigator.language,
      referrer: document.referrer,
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }).catch(() => {});
    return () => {mounted.current = false;};
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') {e.preventDefault();audio.togglePlay();}
      if (e.code === 'ArrowRight') nextWithAd();
      if (e.code === 'ArrowLeft') audio.prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [audio.isPlaying, audio.isLoading, audio.error]);

  const nextWithAd = useCallback(() => {
    audio.next();
    if (!isPremium) setAdCount((c) => c + 1);
  }, [audio.next, isPremium]);

  const selectTrackWithAd = useCallback((idx) => {
    audio.selectTrack(idx);
    if (!isPremium) setAdCount((c) => c + 1);
  }, [audio.selectTrack, isPremium]);

  const handleUpgrade = async () => {
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app. Please open the app directly.');
      return;
    }
    setIsCheckoutLoading(true);
    try {
      const res = await base44.functions.invoke('createCheckout', { origin: window.location.origin });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const callLLM = async (prompt, sys = '') =>
  base44.integrations.Core.InvokeLLM({ prompt: `${sys}\n\n${prompt}`, response_json_schema: null });

  const matchMood = async () => {
    if (!userMood.trim()) return;
    setIsAiLoading(true);
    try {
      const list = TRACKLIST.map((t) => `${t.id}: ${t.title}`).join('\n');
      const res = await callLLM(`Mood: "${userMood}". Pick ID (1-12) from:\n${list}\nReturn ID ONLY.`, 'Music bot.');
      const id = parseInt(res.replace(/\D/g, ''));
      if (id >= 1 && id <= 12) {
        audio.selectTrack(id - 1);
        setUserMood('');
        setShowMoodBar(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (mounted.current) setIsAiLoading(false);
    }
  };

  const toggleLike = () => {
    setLiked((p) => {
      const n = new Set(p);
      n.has(track.id) ? n.delete(track.id) : n.add(track.id);
      requestIdleCallback(() => {
        base44.functions.invoke('backupToDrive', { favorites: Array.from(n) }).catch(console.error);
      });
      return n;
    });
  };

  // Touch swipe navigation
  const onTouchStart = (e) => {touchStartX.current = e.touches[0].clientX;};
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 60) return;
    dx < 0 ? nextWithAd() : audio.prev();
  };

  return (
    <div
      className="min-h-[100svh] bg-[#0a0a0a] text-white flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}>

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 transition-all duration-[2000ms]"
        style={{ background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${roleColor}18 0%, transparent 70%)` }} />
        <div className="absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: `url(${ARTIST_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Toolbar */}
        <PlayerToolbar
          roleColor={roleColor}
          isPremium={isPremium}
          isCheckoutLoading={isCheckoutLoading}
          onUpgrade={handleUpgrade}
          onOpenModal={openModal}
          showMoodBar={showMoodBar}
          onToggleMoodBar={() => setShowMoodBar((s) => !s)}
          showLyrics={showLyrics}
          onToggleLyrics={() => setShowLyrics((s) => !s)}
          onShareCard={() => openModal('share')}
          onSleepStop={() => {if (audio.isPlaying) audio.togglePlay();}} />


        {/* Mood AI bar */}
        {showMoodBar &&
        <div className="px-5 mt-3 flex gap-2">
            <input
            type="text"
            placeholder="Describe your mood..."
            value={userMood}
            onChange={(e) => setUserMood(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && matchMood()}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-orange-500 placeholder:text-white/20" />

            <button
            onClick={matchMood}
            disabled={isAiLoading || !userMood.trim()}
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase text-black disabled:opacity-40"
            style={{ backgroundColor: roleColor }}>

              {isAiLoading ? <Loader2 size={12} className="animate-spin" /> : 'Go'}
            </button>
          </div>
        }

        {/* Album art */}
        <div className="flex justify-center mt-6 px-5">
          <div
            className="relative w-full max-w-[280px] aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl cursor-pointer"
            onClick={() => openModal('fullscreen')}>

            <img
              src={ARTIST_IMAGE}
              alt={track.title}
              className="w-full h-full object-cover object-center transition-all duration-700"
              style={{ filter: audio.isPlaying ? 'brightness(0.9) saturate(1.1)' : 'brightness(0.6) saturate(0.8)' }} />

            <div className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${roleColor}22 0%, transparent 60%, #00000066 100%)` }} />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg"
            style={{ backgroundColor: roleColor }}>
              {track.role}
            </div>
            <button
              onClick={(e) => {e.stopPropagation();openModal('fullscreen');}}
              className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center z-10">

              <Maximize2 size={13} className="text-white/70" />
            </button>
            {audio.isLoading &&
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <Loader2 size={40} className="animate-spin" style={{ color: roleColor }} />
              </div>
            }
            {/* Visualizer bars */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end gap-0.5 h-8 justify-center">
              {Array.from({ length: 20 }).map((_, i) =>
              <div key={i} className="flex-1 rounded-full" style={{
                backgroundColor: i % 3 === 0 ? roleColor : i % 3 === 1 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)',
                minWidth: 3,
                height: audio.isPlaying ? undefined : '20%',
                animation: audio.isPlaying ? `bar-bounce ${0.4 + i % 7 * 0.1}s ease-in-out ${i % 5 * 0.06}s infinite alternate` : 'none'
              }} />
              )}
            </div>
          </div>
        </div>

        {/* Track title */}
        <div className="text-center px-5 mt-5 mb-1">
          <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1 truncate"
          style={{ textShadow: `0 0 60px ${roleColor}66` }}>
            {track.title}
          </h2>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/30">SaadiQ · THE AFTER PARTY</p>
        </div>

        {/* Lyrics panel */}
        {showLyrics &&
        <div className="mx-5 mt-4 rounded-2xl border overflow-hidden"
        style={{ borderColor: `${roleColor}30`, backgroundColor: `${roleColor}08` }}>
            <div className="px-5 pt-4 pb-1 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: roleColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Lyrics</span>
              <span className="ml-auto text-[10px] font-bold text-white/20 uppercase tracking-widest">{track.title}</span>
            </div>
            <LyricsView trackId={track.id} seek={audio.seek} isPlaying={audio.isPlaying} roleColor={roleColor} />
          </div>
        }

        {/* Player controls */}
        <PlayerControls
          isPlaying={audio.isPlaying}
          isLoading={audio.isLoading}
          error={audio.error}
          seek={audio.seek}
          duration={audio.duration}
          isDragging={audio.isDragging}
          isShuffled={audio.isShuffled}
          loopMode={audio.loopMode}
          volume={audio.volume}
          isMuted={audio.isMuted}
          liked={liked.has(track.id)}
          trackId={track.id}
          roleColor={roleColor}
          onTogglePlay={audio.togglePlay}
          onNext={nextWithAd}
          onPrev={audio.prev}
          onToggleShuffle={audio.toggleShuffle}
          onCycleLoop={audio.cycleLoop}
          onSeekStart={audio.onSeekStart}
          onSeekChange={audio.onSeekChange}
          onSeekEnd={audio.onSeekEnd}
          onChangeVolume={audio.changeVolume}
          onToggleMute={audio.toggleMute}
          onToggleLike={toggleLike} />


        {/* Ad banner */}
        {!isPremium && showAd &&
        <AdBanner onUpgrade={handleUpgrade} onDismiss={() => setShowAd(false)} />
        }

        {/* Tracklist */}
        <div className="flex-1 overflow-y-auto border-t border-white/5 pb-24 sm:pb-4">
          <PullToRefresh
            onRefresh={audio.refreshStats}
            pullingContent=""
            refreshingContent={
            <div className="flex justify-center py-3">
                <Loader2 size={18} className="animate-spin text-white/40" />
              </div>
            }>

            <div>
              <div className="px-5 pt-4 pb-2 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-1">Tracklist</p>
                  <h3 className="text-xl font-black uppercase tracking-tight">THE AFTER PARTY</h3>
                </div>
                <span className="text-[11px] font-mono text-white/25">{TRACKLIST.length} tracks</span>
              </div>
              <div className="flex flex-col">
                {TRACKLIST.map((t) => {
                  const i = t.id - 1;
                  const active = i === audio.trackIndex;
                  const c = ROLE_COLORS[t.role] || '#ea580c';
                  return (
                    <button
                      key={t.id}
                      onClick={() => selectTrackWithAd(i)} className="px-5 py-4 text-left opacity-85 w-full flex items-center gap-4 transition-all"

                      style={{ backgroundColor: active ? `${c}18` : 'transparent' }}>

                      <div className="w-6 flex-shrink-0 flex items-center justify-center">
                        {active && audio.isPlaying ?
                        <div className="flex items-end gap-0.5 h-4">
                            {[1, 2, 3].map((b) =>
                          <div key={b} className="w-1 rounded-full" style={{
                            backgroundColor: c,
                            animation: `bar-bounce ${0.4 + b * 0.1}s ease-in-out ${b * 0.08}s infinite alternate`,
                            minHeight: 3
                          }} />
                          )}
                          </div> :

                        <span className="text-[11px] font-black font-mono"
                        style={{ color: active ? c : 'rgba(255,255,255,0.2)' }}>
                            {t.id.toString().padStart(2, '0')}
                          </span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black uppercase tracking-tight text-[13px] truncate"
                        style={{ color: active ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                          {t.title}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
                        style={{ color: active ? c : 'rgba(255,255,255,0.25)' }}>
                          {t.role}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {liked.has(t.id) && <Heart size={11} fill="#ef4444" className="text-red-500" />}
                        {audio.trackStats[t.id]?.play_count > 0 && maxPlays > 0 && audio.trackStats[t.id].play_count === maxPlays &&
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#f59e0b22' }}>
                            <Flame size={9} className="text-amber-400" />
                            <span className="text-[9px] font-black text-amber-400">HOT</span>
                          </div>
                        }
                        {audio.trackStats[t.id]?.play_count > 0 &&
                        <span className="text-[10px] font-mono text-white/20">{audio.trackStats[t.id].play_count}</span>
                        }
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c, opacity: 0.7 }} />
                      </div>
                    </button>);

                })}
              </div>
            </div>
          </PullToRefresh>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden">
        <BottomNav
          roleColor={roleColor}
          onComments={() => openModal('comments')}
          onLyrics={() => setShowLyrics((s) => !s)}
          showLyrics={showLyrics}
          isPremium={isPremium}
          onUpgrade={handleUpgrade}
          isCheckoutLoading={isCheckoutLoading} />

      </div>

      {/* Modals */}
      <AIChatModal isOpen={activeModal === 'chat'} onClose={closeModal} currentTrack={track} callLLM={callLLM} />
      <HypeManChat isOpen={activeModal === 'hype'} onClose={closeModal} roleColor={roleColor} />
      <CommentsModal isOpen={activeModal === 'comments'} onClose={closeModal} track={track} roleColor={roleColor} />
      <FullscreenArt isOpen={activeModal === 'fullscreen'} onClose={closeModal} src={ARTIST_IMAGE} track={track} roleColor={roleColor} isPlaying={audio.isPlaying} />
      <ShareCardModal isOpen={activeModal === 'share'} onClose={closeModal} track={track} />

      <style>{`
        @keyframes bar-bounce { 0% { height: 3px; } 100% { height: 20px; } }
        * { -ms-overflow-style: none; scrollbar-width: none; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
        input[type=range] { -webkit-appearance: none; background: transparent; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: white; cursor: pointer; }
      `}</style>
    </div>);

}