import React, { useState, useRef, useEffect } from 'react';
import { X, Bot, User, Send, Loader2 } from 'lucide-react';

export default function AIChatModal({ isOpen, onClose, currentTrack, callLLM }) {
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: "Welcome to the booth. I'm SaadiQ's AI assistant. Ask me anything about the tracks or the session." }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput("");
    setChatHistory(p => [...p, { role: 'user', text: msg }]);
    setIsAiLoading(true);
    try {
      const res = await callLLM(
        `Album: 'THE AFTER PARTY' by SaadiQ. Current track: ${currentTrack.title}. Question: ${msg}`,
        "SaadiQ's AI Assistant."
      );
      setChatHistory(p => [...p, { role: 'bot', text: res }]);
    } catch {
      setChatHistory(p => [...p, { role: 'bot', text: "Lost signal." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-in fade-in">
      <div className="bg-[#0a0a10] border border-white/10 w-full max-w-2xl h-[600px] rounded-[3.5rem] shadow-3xl flex flex-col overflow-hidden relative">
        <div className="p-6 lg:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-600 rounded-[1rem] flex items-center justify-center">
              <Bot size={20} className="lg:w-6 lg:h-6 text-white" />
            </div>
            <h3 className="text-lg lg:text-xl font-black uppercase tracking-widest">Studio AI</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-white/10 rounded-full transition-all bg-white/5"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 no-scrollbar flex flex-col">
          {chatHistory.map((msg, i) => (
            <div 
              key={i} 
              className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse self-end' : 'self-start'} max-w-[90%] animate-in slide-in-from-bottom-2`}
            >
              <div className={`w-8 h-8 rounded-[0.8rem] flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-orange-600' : 'bg-white/10'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-4 lg:p-5 rounded-[2rem] text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-orange-600/20 rounded-tr-none text-white' 
                  : 'bg-white/5 rounded-tl-none text-white/90 border border-white/5 shadow-inner'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isAiLoading && (
            <div className="text-orange-500 font-mono text-[10px] uppercase tracking-widest px-4 flex items-center gap-3">
              <Loader2 size={12} className="animate-spin" /> Mixing response...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        <div className="p-6 lg:p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
          <input 
            type="text" 
            placeholder="Message the booth..." 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendChat()}
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 lg:px-6 py-3 lg:py-4 outline-none focus:border-orange-500 transition-colors text-sm"
          />
          <button 
            onClick={sendChat} 
            disabled={isAiLoading || !chatInput.trim()} 
            className="w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0 bg-orange-600 rounded-full flex items-center justify-center active:scale-90 transition-all disabled:opacity-50 shadow-xl"
          >
            <Send size={20} className="lg:w-6 lg:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}