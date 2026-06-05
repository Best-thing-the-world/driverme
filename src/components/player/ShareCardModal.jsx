import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Share2, Loader2, ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

const ROLE_COLORS = {
  Intro: '#ea580c', Vibe: '#a855f7', Peak: '#ef4444', Transition: '#3b82f6',
  Deep: '#06b6d4', Lead: '#f59e0b', Mood: '#ec4899', Outro: '#84cc16',
};

const ARTIST_IMAGE_URL = "https://www.dropbox.com/scl/fi/5gkp1mpyuraj0n9frtvvs/ChatGPT-Image-Mar-3-2026-03_28_32-AM.png?rlkey=73k6ue9e4b5wfeexufr50247x&st=moa8i7i5&raw=1";

export default function ShareCardModal({ isOpen, onClose, track }) {
  const cardRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captured, setCaptured] = useState(null);
  // Blob URL to bypass CORS for html2canvas
  const [blobImageUrl, setBlobImageUrl] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [captureError, setCaptureError] = useState(null);

  const roleColor = ROLE_COLORS[track?.role] || '#ea580c';

  // Fetch artist image as blob on open to avoid CORS taint issues with html2canvas
  useEffect(() => {
    if (!isOpen) return;
    setCaptured(null);
    setCaptureError(null);
    setImageLoaded(false);
    setBlobImageUrl(null);

    fetch(ARTIST_IMAGE_URL)
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setBlobImageUrl(url);
      })
      .catch(() => {
        // Fallback: use original URL, canvas may be tainted but we try anyway
        setBlobImageUrl(ARTIST_IMAGE_URL);
      });

    return () => {
      if (blobImageUrl && blobImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobImageUrl);
      }
    };
  }, [isOpen]);

  const capture = async () => {
    if (!cardRef.current || !imageLoaded) return;
    setIsCapturing(true);
    setCaptureError(null);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#0a0a0a',
        logging: false,
        imageTimeout: 15000,
      });
      const dataUrl = canvas.toDataURL('image/png');
      setCaptured(dataUrl);
    } catch (e) {
      console.error('[ShareCard] html2canvas error:', e);
      setCaptureError('Could not generate card. Try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const download = () => {
    if (!captured) return;
    const a = document.createElement('a');
    a.href = captured;
    a.download = `${(track?.title || 'track').replace(/\s+/g, '_')}_SaadiQ.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareNative = async () => {
    if (!captured) return;
    try {
      // Convert data URL to blob without re-fetching
      const byteString = atob(captured.split(',')[1]);
      const mimeString = captured.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], `${track?.title || 'track'}_SaadiQ.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${track?.title} — SaadiQ`,
          text: `🎵 Listening to "${track?.title}" from THE AFTER PARTY by SaadiQ`,
        });
      } else {
        // Fallback to URL share or download
        if (navigator.share) {
          await navigator.share({
            title: `${track?.title} — SaadiQ`,
            text: `🎵 Listening to "${track?.title}" from THE AFTER PARTY by SaadiQ`,
            url: window.location.href,
          });
        } else {
          download();
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.error('[ShareCard] share error:', e);
    }
  };

  const reset = () => { setCaptured(null); setCaptureError(null); };

  if (!isOpen) return null;

  const imgSrc = blobImageUrl || ARTIST_IMAGE_URL;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl">
      <div className="w-full max-w-sm flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Share Track</span>
          <button onClick={() => { reset(); onClose(); }} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Card to capture / captured preview */}
        {!captured ? (
          <div
            ref={cardRef}
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, #0a0a0a 0%, #111 60%, ${roleColor}22 100%)`,
              border: `1px solid ${roleColor}33`,
              aspectRatio: '1 / 1',
            }}
          >
            {/* Background art blur */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url(${imgSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(40px)',
              }}
            />

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${roleColor}30 0%, transparent 70%)` }}
            />

            <div className="relative z-10 flex flex-col h-full p-8 justify-between">
              {/* Top branding */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: roleColor }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Now Playing</span>
                </div>
                <span
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ backgroundColor: roleColor, color: '#000' }}
                >
                  {track?.role}
                </span>
              </div>

              {/* Album art */}
              <div className="flex justify-center">
                <div
                  className="w-44 h-44 rounded-[2rem] overflow-hidden"
                  style={{ boxShadow: `0 20px 60px ${roleColor}44` }}
                >
                  <img
                    src={imgSrc}
                    alt={track?.title}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)} // still allow capture attempt
                  />
                </div>
              </div>

              {/* Track info */}
              <div className="text-center">
                <h2
                  className="text-3xl font-black uppercase tracking-tighter leading-none mb-2 text-white"
                  style={{ textShadow: `0 0 40px ${roleColor}88` }}
                >
                  {track?.title}
                </h2>
                <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-white/40 mb-1">SaadiQ</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">THE AFTER PARTY</p>
              </div>

              {/* Bottom waveform bars */}
              <div className="flex items-end gap-0.5 h-6 justify-center">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-full"
                    style={{
                      backgroundColor: i % 3 === 0 ? roleColor : i % 3 === 1 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                      height: `${20 + Math.sin(i * 0.8) * 60}%`,
                      minWidth: 2,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl overflow-hidden">
            <img src={captured} alt="Share card" className="w-full rounded-3xl" />
          </div>
        )}

        {/* Error state */}
        {captureError && (
          <p className="text-center text-red-400 text-xs font-bold">{captureError}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {!captured ? (
            <button
              onClick={capture}
              disabled={isCapturing || !imageLoaded}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-black transition-all active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: roleColor }}
            >
              {isCapturing
                ? <><Loader2 size={16} className="animate-spin" /> Generating...</>
                : !imageLoaded
                  ? <><Loader2 size={16} className="animate-spin" /> Loading...</>
                  : <><ImageIcon size={16} /> Generate Card</>
              }
            </button>
          ) : (
            <>
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white/50 border border-white/10 transition-all active:scale-95"
              >
                <X size={16} />
              </button>
              <button
                onClick={download}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest border transition-all active:scale-95"
                style={{ borderColor: `${roleColor}55`, color: roleColor }}
              >
                <Download size={16} /> Save
              </button>
              <button
                onClick={shareNative}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-black transition-all active:scale-95"
                style={{ backgroundColor: roleColor }}
              >
                <Share2 size={16} /> Share
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}