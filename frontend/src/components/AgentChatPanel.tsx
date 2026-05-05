import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { Send, Bot, User, Loader2, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../utils/graphqlFetcher';

export const AgentChatPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { selectedApis, sourceData, schemaInfo, setFilters } = useAppStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const primaryApi = selectedApis[0];
      const data = sourceData[primaryApi?.id];

      const response = await axios.post(`${BACKEND_URL}/ai/analyze`, {
        action: 'chat',
        context: {
          message: userMessage,
          history: messages,
          schema: schemaInfo,
          fieldSummary: data?.fieldSummary || [],
          currentApi: primaryApi?.name
        }
      });

      const assistantMsg = response.data.answer || "I've analyzed the data for you.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }]);

      if (response.data.action === 'filter' && response.data.filters) {
        setFilters(response.data.filters);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error connecting to the intelligence core." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 p-4 bg-indigo-600 text-white rounded-full shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-110 transition-all z-[100] animate-bounce"
      >
        <Bot className="w-8 h-8" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-8 right-8 glass rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col transition-all z-[100] ${isMinimized ? 'h-20 w-64' : 'h-[600px] w-[400px] animate-in slide-in-from-bottom-8'}`}>
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Gravity AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[8px] text-slate-500 font-bold uppercase">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 transition-colors">
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-900/10">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <Bot className="w-12 h-12 text-slate-800" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                  I am the Gravity Intelligence Agent.<br/>Ask me about data quality or request visual filters.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-2 rounded-xl h-fit ${msg.role === 'user' ? 'bg-indigo-600/10 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-3xl text-xs font-medium leading-relaxed ${
                    msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'glass border border-white/5 text-slate-300 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="glass p-4 rounded-3xl rounded-tl-none border border-white/5">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-6 border-t border-white/5 bg-slate-900/50">
            <div className="relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask intelligence core..."
                className="w-full bg-slate-950 text-white pl-4 pr-12 py-3 rounded-2xl border border-white/10 outline-none focus:ring-1 focus:ring-indigo-500/50 text-xs"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
