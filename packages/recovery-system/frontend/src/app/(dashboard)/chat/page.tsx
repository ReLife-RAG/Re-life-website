'use client';

import React, { useState, useEffect, useRef } from 'react';
import { chatService, ChatMessage } from '@/lib/chat-client';
import { 
  Send, 
  Search, 
  Bell, 
  MoreHorizontal, 
  History,
  AlertTriangle,
  User,
  Sparkles,
  FileText
} from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const { messages: history } = await chatService.getChatHistory();
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatService.sendMessage(input);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen flex flex-col">
      
      {/* ── Page Header ── */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-1">Portal &gt; AI Assistant</p>
        <h1 className="text-3xl font-bold text-slate-900">AI Relief Chat</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        
        {/* ─── LEFT COLUMN: CHAT AREA ─── */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Chat Top Banner */}
          <div className="bg-[#4A7C7C] p-4 flex items-center justify-between m-4 rounded-2xl text-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles size={20} className="text-[#86D293]" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">Relief AI Assistant</h2>
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#86D293]" />
                  Always Online - Secure & Private
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition">
                <History size={16} />
                History
              </button>
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Initial Welcome Message (Optional placeholder if history is empty) */}
            {messages.length === 0 && (
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-8 h-8 rounded-lg bg-[#E8F4E8] flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles size={16} className="text-[#86D293]" />
                </div>
                <div className="space-y-2">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-700 text-sm">
                    Hello. I'm your recovery assistant, trained on clinical CBT guides and addiction recovery resources. How can I support your journey today?
                  </div>
                  <div className="flex gap-2">
                    <button className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-[#E8F4E8] text-[#4A7C7C] rounded-full hover:bg-[#d5ecd5] transition">
                      Breathing Exercises
                    </button>
                    <button className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition">
                      Coping Strategies
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mapped Messages */}
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} max-w-[85%] ${isUser ? 'ml-auto' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${isUser ? 'bg-[#4A7C7C] text-white' : 'bg-[#E8F4E8] text-[#86D293]'}`}>
                    {isUser ? <User size={16} /> : <Sparkles size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm ${
                    isUser 
                      ? 'bg-[#CFE1E1] text-[#4A7C7C] rounded-tr-none' 
                      : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none'
                  }`}>
                    {/* Render message content. Consider using a markdown renderer here in the future if the AI returns bullet points */}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    
                    {/* Example of Source Tag rendering (Optional: implement logic to detect sources in the future) */}
                    {!isUser && msg.content.includes('Source:') && (
                      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-[#86D293]">
                          <FileText size={14} />
                          <span>Source matched</span>
                        </div>
                        <button className="text-[#86D293] font-medium hover:underline">View Source</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-8 h-8 rounded-lg bg-[#E8F4E8] flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles size={16} className="text-[#86D293]" />
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-500 text-sm flex gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Emergency Alert Banner */}
          <div className="mx-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3">
              <AlertTriangle size={20} className="text-red-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-red-700">Need Immediate Help?</h3>
                <p className="text-xs text-red-500/80 mt-0.5">
                  If you feel you are at high risk of relapse or harm, our AI detected distress patterns. Please call your counselor or the 24/7 hotline: 1-800-RELIEF-NOW.
                </p>
              </div>
            </div>
            <button className="whitespace-nowrap px-4 py-2 bg-red-400 hover:bg-red-500 text-white text-xs font-bold rounded-full transition shadow-sm">
              EMERGENCY SESSION
            </button>
          </div>

          {/* Input Area */}
          <div className="p-6">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything about recovery..."
                className="w-full pl-4 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#86D293]/30 transition"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-2 p-2 bg-[#86D293] hover:bg-[#75c082] text-white rounded-xl transition disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-3">
              AI may generate clinical guidance; always consult Dr. Sarah for medical decisions.
            </p>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: SIDEBAR ─── */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6">
          
          {/* Top Nav (Search & Profile) */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm outline-none focus:border-[#86D293]"
              />
            </div>
            <button className="text-slate-400 hover:text-slate-600 transition relative">
              <Bell size={20} />
              <span className="absolute 0 top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
              <img src="/api/placeholder/32/32" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 text-sm">Recent Activity</h3>
            <div className="space-y-2">
              <div className="bg-white border border-slate-100 p-3 rounded-xl flex items-center justify-between shadow-sm">
                <span className="text-sm font-medium text-slate-700">Meditation</span>
                <span className="text-xs font-bold text-[#86D293] bg-[#E8F4E8] px-2 py-1 rounded-md">20 min</span>
              </div>
              <div className="bg-white border border-slate-100 p-3 rounded-xl flex items-center justify-between shadow-sm">
                <span className="text-sm font-medium text-slate-700">Journaling</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Completed</span>
              </div>
            </div>
          </div>

          {/* Base Recovery Points Card */}
          <div className="mt-auto bg-[#4A7C7C] rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full inline-block mb-6">
              Base Recovery
            </span>
            
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-white/70 mb-1">Progress Level</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">2,540</span>
                  <span className="text-sm text-white/70">pts</span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#86D293]">Gold Tier</span>
            </div>

            <button className="w-full py-3 bg-[#86D293] hover:bg-[#75c082] text-white rounded-xl text-sm font-bold transition shadow-sm">
              Redeem Rewards
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}