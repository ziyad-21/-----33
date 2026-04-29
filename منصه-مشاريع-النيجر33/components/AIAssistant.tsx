
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Language, RawMaterial, Product, Order } from '../types';
import { TRANSLATIONS } from '../constants';

interface AIAssistantProps {
  lang: Language;
  materials: RawMaterial[];
  products: Product[];
  orders: Order[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ lang, materials, products, orders }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: lang === Language.AR ? 'أهلاً بك يا مدير! أنا المساعد الذكي لمصنع الكرتون. يمكنني تحليل المخزون، توقع الإنتاج، أو حتى إعطاؤك نصائح لزيادة المبيعات. كيف أخدمك؟' : 'Welcome manager! I am your Egg Carton Factory AI assistant. I can analyze stock, predict production, or give sales tips. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isRTL = lang === Language.AR;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const context = {
        inventory: materials.map(m => ({ name: m.nameAr, qty: m.quantity, unit: m.unit, status: m.quantity < m.maxQuantity * 0.2 ? 'CRITICAL' : 'OK' })),
        products: products.map(p => ({ name: p.nameAr, stock: p.quantity, price: p.price })),
        salesSummary: {
          totalOrders: orders.length,
          totalRevenue: orders.reduce((s,o) => s + o.totalAmount, 0)
        }
      };

      const prompt = `
        You are a World-Class Factory Consultant for "Niger Projects Group", specifically the Egg Tray/Carton Factory.
        Current Language: ${lang === Language.AR ? 'Arabic' : 'French'}. Respond in the user's language.
        
        FACTORY DATA: ${JSON.stringify(context)}.
        
        INSTRUCTIONS:
        1. Be a professional, data-driven expert.
        2. If materials are low, recommend ordering more immediately.
        3. Provide specific advice for improving factory efficiency.
        4. Use a tone that is helpful, slightly formal, and business-oriented.
        
        USER QUESTION: "${userMessage}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const botReply = response.text || (lang === Language.AR ? 'عذراً، واجهت مشكلة في معالجة طلبك.' : 'Sorry, I had trouble processing your request.');
      setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: lang === Language.AR ? 'فشل الاتصال بالخادم الذكي.' : 'AI Server connection failed.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-[100] print:hidden">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 border border-white/10 group overflow-hidden"
        >
          <div className="bg-blue-600 p-2.5 rounded-2xl group-hover:rotate-[360deg] transition-transform duration-700">
            <BrainCircuit size={24} className="text-white" />
          </div>
          <div className="text-right">
             <span className="block font-black text-[10px] uppercase tracking-[0.3em] text-blue-400">System AI</span>
             <span className="block font-black text-xs uppercase tracking-widest">{isRTL ? 'المساعد الذكي' : 'Smart Assistant'}</span>
          </div>
        </button>
      ) : (
        <div className="bg-slate-900 w-[400px] h-[650px] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-slate-800 p-8 text-white flex justify-between items-center border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Bot size={28} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-[0.2em]">Factory Brain</h3>
                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active Analysis
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/5 text-slate-500 hover:text-white rounded-full p-2 transition-all"><X size={24} /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-950/30 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-sm ${
                  m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none shadow-blue-600/10' 
                  : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 p-5 rounded-[2rem] border border-white/5 flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                  <Loader2 size={18} className="animate-spin text-blue-500" />
                  Processing Factory Intelligence...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-8 bg-slate-900 border-t border-white/5">
            <div className="relative flex items-center gap-3">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isRTL ? "اسأل المساعد عن أي شيء..." : "Ask AI anything..."}
                className="flex-1 bg-slate-800 border-2 border-slate-700 text-white rounded-[1.5rem] px-6 py-4 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-slate-500 font-bold"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-blue-600/20 active:scale-90"
              >
                <Send size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
