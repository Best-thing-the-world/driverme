import React, { useState, useEffect } from 'react';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EMOJIS = ['🔥', '💜', '🎵', '🙌', '😍', '💃', '🤯', '👑'];

export default function CommentsModal({ isOpen, onClose, track, roleColor }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState(() => localStorage.getItem('afterparty_name') || '');
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState('🔥');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isOpen || !track) return;
    setIsLoading(true);
    base44.entities.TrackComment.filter({ track_id: track.id }, '-created_date', 50)
      .then(setComments)
      .finally(() => setIsLoading(false));
  }, [isOpen, track]);

  const submit = async () => {
    if (!message.trim()) return;
    localStorage.setItem('afterparty_name', name);
    const optimistic = {
      id: `optimistic-${Date.now()}`,
      track_id: track.id,
      name: name.trim() || 'Anonymous',
      message: message.trim(),
      emoji,
    };
    setComments(p => [optimistic, ...p]);
    setMessage('');
    setIsSending(true);
    const saved = await base44.entities.TrackComment.create({
      track_id: track.id,
      name: optimistic.name,
      message: optimistic.message,
      emoji,
    });
    setComments(p => p.map(c => c.id === optimistic.id ? saved : c));
    setIsSending(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-xl">
      <div className="w-full max-w-lg bg-[#0d0d0d] border-t border-white/10 rounded-t-[2.5rem] flex flex-col" style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <MessageCircle size={18} style={{ color: roleColor }} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Fan Comments</p>
              <p className="text-sm font-black uppercase tracking-tight">{track?.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-white/30" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-white/20 text-[12px] font-bold uppercase tracking-widest py-8">Be the first to comment</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-base flex-shrink-0">
                  {c.emoji || '🔥'}
                </div>
                <div className="flex-1 bg-white/5 rounded-2xl px-4 py-2.5">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: roleColor }}>
                    {c.name || 'Anonymous'}
                  </p>
                  <p className="text-[13px] text-white/80 leading-snug">{c.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="px-6 pb-6 pt-3 border-t border-white/5 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-base transition-all"
                style={{ backgroundColor: emoji === e ? `${roleColor}33` : 'rgba(255,255,255,0.05)', outline: emoji === e ? `1px solid ${roleColor}` : 'none' }}
              >
                {e}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-orange-500 placeholder:text-white/20"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Leave a comment..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 placeholder:text-white/20"
            />
            <button
              onClick={submit}
              disabled={isSending || !message.trim()}
              className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 transition-all active:scale-90"
              style={{ backgroundColor: roleColor }}
            >
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="text-black" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}