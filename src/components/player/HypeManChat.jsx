import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function HypeManChat({ isOpen, onClose, roleColor }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen && !conversationId) {
      const conv = base44.agents.createConversation({ agent_name: 'hype_man' });
      conv.then(c => {
        setConversationId(c.id);
        setMessages(c.messages || []);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!conversationId) return;
    const unsub = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      setIsLoading(false);
    });
    return unsub;
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || isLoading || !conversationId) return;
    const text = input;
    setInput('');
    setIsLoading(true);
    await base44.agents.addMessage({ id: conversationId }, { role: 'user', content: text });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-xl">
      <div
        className="w-full max-w-lg h-[75vh] rounded-t-[2.5rem] flex flex-col overflow-hidden"
        style={{ backgroundColor: '#0d0d14', border: `1px solid ${roleColor}30`, borderBottom: 'none' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg" style={{ backgroundColor: `${roleColor}25` }}>
              🎤
            </div>
            <div>
              <p className="text-[13px] font-black uppercase tracking-widest text-white">Hype Man</p>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">SaadiQ's Official AI</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={base44.agents.getWhatsAppConnectURL('hype_man')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all"
              style={{ borderColor: `${roleColor}40`, color: roleColor }}
            >
              <MessageCircle size={10} /> WhatsApp
            </a>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-3xl mb-3">🔥</p>
              <p className="text-[12px] font-black uppercase tracking-widest text-white/40">Ask me anything about SaadiQ</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[80%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed"
                  style={{
                    backgroundColor: isUser ? roleColor : 'rgba(255,255,255,0.06)',
                    color: isUser ? '#000' : 'rgba(255,255,255,0.88)',
                    borderRadius: isUser ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                    fontWeight: 600,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-white/5 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" style={{ color: roleColor }} />
                <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Hyping up...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-white/5 flex gap-3">
          <input
            type="text"
            placeholder="Ask about SaadiQ or the album..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-[13px] outline-none placeholder:text-white/20 text-white"
            style={{ focusBorderColor: roleColor }}
          />
          <button
            onClick={send}
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
            style={{ backgroundColor: roleColor }}
          >
            <Send size={16} className="text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}