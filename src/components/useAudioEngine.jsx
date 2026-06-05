import { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { TRACKLIST, HOWLER_CDN, HOWLER_SRI } from '@/components/constants';

/**
 * Manages all Howler.js audio state: loading, playback, seeking, looping,
 * shuffle, and play-count tracking. Returns only what the UI needs.
 */
export function useAudioEngine() {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [loopMode, setLoopMode] = useState('none');
  const [shuffleOrder, setShuffleOrder] = useState([]);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [trackStats, setTrackStats] = useState({});

  const soundRef = useRef(null);
  const rafRef = useRef(null);
  const mounted = useRef(true);
  const loopRef = useRef('none');
  const indexRef = useRef(0);
  const volumeRef = useRef(0.8);
  const isMutedRef = useRef(false);
  const trackStatsRef = useRef({});

  // Keep refs in sync with state so Howl callbacks always read fresh values
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Load track stats once on mount
  useEffect(() => {
    base44.entities.TrackStat.list().then(stats => {
      const map = {};
      stats.forEach(s => { map[s.track_id] = s; });
      trackStatsRef.current = map;
      setTrackStats(map);
    }).catch(() => {});
  }, []);

  const incrementPlayCount = useCallback(async (trackId) => {
    const existing = trackStatsRef.current[trackId];
    if (existing) {
      const updated = await base44.entities.TrackStat.update(existing.id, { play_count: (existing.play_count || 0) + 1 });
      trackStatsRef.current = { ...trackStatsRef.current, [trackId]: updated };
      setTrackStats(p => ({ ...p, [trackId]: updated }));
    } else {
      const created = await base44.entities.TrackStat.create({ track_id: trackId, play_count: 1 });
      trackStatsRef.current = { ...trackStatsRef.current, [trackId]: created };
      setTrackStats(p => ({ ...p, [trackId]: created }));
    }
  }, []);

  const updateProgress = useCallback(() => {
    if (soundRef.current && !isDragging) {
      const s = soundRef.current.seek();
      if (typeof s === 'number') setSeek(s);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isDragging]);

  const initHowl = useCallback((idx, autoPlay = false) => {
    if (!window.Howl) return;
    if (soundRef.current) {
      soundRef.current.off();
      soundRef.current.stop();
      soundRef.current.unload();
      soundRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setError(null);
    setIsLoading(true);
    setSeek(0);
    indexRef.current = idx;
    const t = TRACKLIST[idx];
    soundRef.current = new window.Howl({
      src: [t.url],
      html5: true,
      pool: 1,
      volume: isMutedRef.current ? 0 : volumeRef.current,
      onload: () => {
        if (!mounted.current) return;
        setDuration(soundRef.current.duration());
        setIsLoading(false);
        if (autoPlay) soundRef.current.play();
      },
      onplay: () => {
        setIsPlaying(true);
        rafRef.current = requestAnimationFrame(updateProgress);
        incrementPlayCount(TRACKLIST[idx].id);
      },
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => {
        setIsPlaying(false);
        if (loopRef.current === 'one') { soundRef.current.play(); return; }
        if (loopRef.current === 'none' && indexRef.current === TRACKLIST.length - 1) return;
        const next = (indexRef.current + 1) % TRACKLIST.length;
        setTrackIndex(next);
        indexRef.current = next;
        setTimeout(() => initHowl(next, true), 0);
      },
      onloaderror: () => { setError('Network error.'); setIsLoading(false); },
    });
  }, [updateProgress, incrementPlayCount]);

  // Bootstrap Howler.js from CDN once
  useEffect(() => {
    mounted.current = true;
    if (window.Howl) { initHowl(0); return; }
    const script = document.createElement('script');
    script.src = HOWLER_CDN;
    script.integrity = HOWLER_SRI;
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.onload = () => { if (mounted.current) initHowl(0); };
    script.onerror = () => {
      console.error('Failed to load Howler.js');
      setError('Audio library failed to load');
      setIsLoading(false);
    };
    document.head.appendChild(script);
    return () => {
      mounted.current = false;
      if (soundRef.current) soundRef.current.unload();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = useCallback(() => {
    if (isLoading || error || !soundRef.current) return;
    if (window.Howler?.ctx?.state === 'suspended') window.Howler.ctx.resume();
    isPlaying ? soundRef.current.pause() : soundRef.current.play();
  }, [isLoading, error, isPlaying]);

  const getNext = useCallback(() => {
    if (isShuffled && shuffleOrder.length) {
      const pos = shuffleOrder.indexOf(trackIndex);
      return shuffleOrder[(pos + 1) % shuffleOrder.length];
    }
    return (trackIndex + 1) % TRACKLIST.length;
  }, [trackIndex, isShuffled, shuffleOrder]);

  const getPrev = useCallback(() => {
    if (isShuffled && shuffleOrder.length) {
      const pos = shuffleOrder.indexOf(trackIndex);
      return shuffleOrder[(pos - 1 + shuffleOrder.length) % shuffleOrder.length];
    }
    return (trackIndex - 1 + TRACKLIST.length) % TRACKLIST.length;
  }, [trackIndex, isShuffled, shuffleOrder]);

  const next = useCallback(() => {
    const idx = getNext();
    setTrackIndex(idx);
    initHowl(idx, true);
  }, [getNext, initHowl]);

  const prev = useCallback(() => {
    if (seek > 3 && soundRef.current) { soundRef.current.seek(0); setSeek(0); return; }
    const idx = getPrev();
    setTrackIndex(idx);
    initHowl(idx, true);
  }, [seek, getPrev, initHowl]);

  const selectTrack = useCallback((idx) => {
    setTrackIndex(idx);
    initHowl(idx, true);
  }, [initHowl]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(s => {
      if (!s) {
        requestIdleCallback(() => {
          const order = [...Array(TRACKLIST.length).keys()].sort(() => Math.random() - 0.5);
          setShuffleOrder(order);
        });
      }
      return !s;
    });
  }, []);

  const cycleLoop = useCallback(() => {
    setLoopMode(m => {
      const n = m === 'none' ? 'all' : m === 'all' ? 'one' : 'none';
      loopRef.current = n;
      return n;
    });
  }, []);

  const onSeekStart = useCallback(() => setIsDragging(true), []);
  const onSeekChange = useCallback((e) => setSeek(parseFloat(e.target.value)), []);
  const onSeekEnd = useCallback((e) => {
    const val = parseFloat(e.target.value);
    setIsDragging(false);
    if (soundRef.current) {
      soundRef.current.seek(val);
      setSeek(val);
    }
  }, []);

  const changeVolume = useCallback((v) => {
    setVolume(v);
    setIsMuted(false);
    if (soundRef.current) soundRef.current.volume(v);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(m => {
      const next = !m;
      if (soundRef.current) soundRef.current.volume(next ? 0 : volumeRef.current);
      return next;
    });
  }, []);

  const refreshStats = useCallback(async () => {
    const stats = await base44.entities.TrackStat.list();
    const map = {};
    stats.forEach(s => { map[s.track_id] = s; });
    trackStatsRef.current = map;
    setTrackStats(map);
  }, []);

  return {
    trackIndex, isPlaying, isLoading, error, seek, duration, isDragging,
    isShuffled, loopMode, volume, isMuted, trackStats,
    togglePlay, next, prev, selectTrack,
    toggleShuffle, cycleLoop,
    onSeekStart, onSeekChange, onSeekEnd,
    changeVolume, toggleMute, refreshStats,
  };
}