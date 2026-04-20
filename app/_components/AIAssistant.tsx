'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getAIResponse, getQuickQuestions } from '@/lib/ai/engine';

type Msg = { role: 'user' | 'ai'; text: string; ts: string };

function parseMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });
    const isEmpty = line.trim() === '';
    return isEmpty
      ? <div key={i} className="h-2" />
      : <div key={i} className="leading-relaxed">{parts}</div>;
  });
}

function now() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{
    role: 'ai',
    text: '**Halo! Saya AI Assistant Lunomi** 👋\n\nSaya bisa bantu analisis semua aspek bisnis kamu — stok, penjualan, karyawan, pelanggan, promosi, keuangan, dan lainnya.\n\nTanyakan apa saja atau pilih pertanyaan cepat di bawah.',
    ts: now(),
  }]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [pulse, setPulse] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const quickQ = getQuickQuestions(pathname);

  // Listen for external openAI events (from page buttons)
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setOpen(true);
      if (e.detail?.message) {
        setTimeout(() => sendMessage(e.detail.message), 100);
      }
    };
    window.addEventListener('openAI', handler as EventListener);
    return () => window.removeEventListener('openAI', handler as EventListener);
  }, []);

  // Pulse the button every 30s to attract attention
  useEffect(() => {
    const id = setInterval(() => { setPulse(true); setTimeout(() => setPulse(false), 2000); }, 30000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, thinking]);

  // Focus input when open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function sendMessage(text: string) {
    const q = text.trim();
    if (!q || thinking) return;
    setInput('');
    setMsgs(prev => [...prev, { role: 'user', text: q, ts: now() }]);
    setThinking(true);
    const response = await getAIResponse(q, pathname);
    setThinking(false);
    setMsgs(prev => [...prev, { role: 'ai', text: response, ts: now() }]);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-[#0d8a6a] shadow-lg flex items-center justify-center transition-all hover:scale-110 ${pulse ? 'animate-pulse' : ''} ${open ? 'rotate-90' : ''}`}
        title="AI Assistant"
      >
        {open ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
          </svg>
        )}
      </button>

      {/* Notification badge */}
      {!open && (
        <div className="fixed bottom-14 right-4 z-40 bg-[#0d8a6a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
          AI
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-40 w-[380px] h-[560px] bg-[#071220] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#0d2137] border-b border-white/10 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#0d8a6a] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">AI Assistant Lunomi</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0d8a6a]" />
                <p className="text-[9px] text-gray-400">Online · Analisis real-time</p>
              </div>
            </div>
            <button onClick={() => {
              setMsgs([{ role: 'ai', text: '**Percakapan direset.** Tanyakan apa saja!', ts: now() }]);
            }} className="text-gray-500 hover:text-gray-300 text-[9px] transition-colors">Reset</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {msgs.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-[#0d8a6a] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                    </svg>
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-[#0d8a6a] text-white' : 'bg-[#0d2137] text-gray-300'} rounded-2xl px-3 py-2.5`}>
                  <div className="text-[11px] leading-relaxed">
                    {parseMarkdown(msg.text)}
                  </div>
                  <p className="text-[9px] text-right mt-1 opacity-50">{msg.ts}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {thinking && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-[#0d8a6a] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                  </svg>
                </div>
                <div className="bg-[#0d2137] rounded-2xl px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-[#0d8a6a] rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick suggestions after last AI message */}
            {!thinking && msgs[msgs.length - 1]?.role === 'ai' && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickQ.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    className="px-2.5 py-1 bg-[#0d2137] border border-white/10 rounded-full text-[10px] text-gray-400 hover:border-[#0d8a6a] hover:text-[#0d8a6a] transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex-shrink-0 px-3 py-3 border-t border-white/10 bg-[#0d2137]">
            <div className="flex items-center gap-2 bg-[#071220] border border-white/10 rounded-xl px-3 py-2 focus-within:border-[#0d8a6a] transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Tanyakan apa saja..."
                disabled={thinking}
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 outline-none"
              />
              <button type="submit" disabled={!input.trim() || thinking}
                className="w-7 h-7 rounded-lg bg-[#0d8a6a] flex items-center justify-center disabled:opacity-40 hover:bg-[#0a7059] transition-colors flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-[8px] text-center text-gray-600 mt-1.5">AI berbasis data real-time toko Anda</p>
          </form>
        </div>
      )}
    </>
  );
}

// Helper untuk dispatch event dari halaman mana pun
export function askAI(message: string) {
  window.dispatchEvent(new CustomEvent('openAI', { detail: { message } }));
}
