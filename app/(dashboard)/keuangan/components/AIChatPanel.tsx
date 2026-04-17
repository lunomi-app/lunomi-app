'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatPanelProps {
  businessId: string;
  period?: string;
}

const SUGGESTED_QUESTIONS = [
  'Berapa profit bersih saya bulan ini setelah dikurangi semua pengeluaran?',
  'Pengeluaran terbesar saya bulan ini apa saja?',
  'Apakah kondisi keuangan bisnis saya sehat?',
  'Bandingkan pemasukan bulan ini vs bulan lalu',
  'Kategori pengeluaran mana yang bisa saya pangkas?',
];

export default function AIChatPanel({ businessId, period }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading || !businessId) return;

    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session tidak ditemukan');

      const response = await fetch('/api/ai-analyst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ question, businessId, period }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Gagal mendapat respons AI');
      }

      const data = await response.json();
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: data.answer };
        return updated;
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: `⚠️ ${errorMessage}` };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <>
      {/* ── Floating Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white w-14 h-14 rounded-full shadow-lg shadow-cyan-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Tanya AI Analis"
        >
          <span className="text-2xl">🤖</span>
        </button>
      )}

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[600px] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-sm">
                🤖
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Lunomi AI Analyst</p>
                <p className="text-slate-400 text-xs">
                  {isLoading ? (
                    <span className="text-cyan-400 animate-pulse">Sedang menganalisis...</span>
                  ) : (
                    'Tanya apapun soal keuangan bisnis'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-slate-500 hover:text-slate-300 text-xs transition"
                  title="Hapus riwayat"
                >
                  🗑
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition text-xl leading-none pb-0.5"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-slate-300 text-sm font-medium">
                    Halo! Saya siap menganalisis data keuangan bisnis Anda.
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Coba pertanyaan di bawah, atau ketik sendiri
                  </p>
                </div>
                <div className="space-y-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      disabled={isLoading}
                      className="w-full text-left text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 text-slate-300 px-3 py-2 rounded-lg transition"
                    >
                      <span className="text-cyan-400 mr-1.5">→</span>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-cyan-500 text-white rounded-br-sm'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' && msg.content === '' ? (
                      <div className="flex gap-1 items-center py-1">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-slate-700 bg-slate-900">
            <div className="flex gap-2 items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-cyan-500/50 transition">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanya soal keuangan bisnis..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="text-cyan-400 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed transition flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-slate-600 text-[10px] text-center mt-1.5">
              Max 30 pertanyaan/hari · Data diproses secara aman
            </p>
          </div>
        </div>
      )}
    </>
  );
}
