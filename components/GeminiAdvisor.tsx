import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { ProjectInputs, CalculationResult } from '../types';
import { formatCurrencyShort } from '../utils/finance';

interface GeminiAdvisorProps {
  inputs: ProjectInputs;
  results: CalculationResult;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ inputs, results }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am your Mine Finance Architect. I can help you interpret these results, suggest optimization strategies, or explain complex mining finance terms. Ask me anything!' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    if (!process.env.API_KEY) {
        setApiKeyError(true);
        return;
    }

    const userMessage = inputText;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputText('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const contextPrompt = `
        You are a Senior Mine Finance Software Architect.
        Context: The user is analyzing a mining project with the following parameters:
        - Initial Investment (P): ${formatCurrencyShort(inputs.initialInvestment)}
        - Life of Mine (n): ${inputs.lifeOfMine} years
        - Annual Revenue (A): ${formatCurrencyShort(inputs.annualRevenue)}
        - Discount Rate (i): ${inputs.discountRate}%
        
        Calculated Results:
        - NPV: ${formatCurrencyShort(results.npv)}
        
        User Question: "${userMessage}"
        
        Provide a concise, professional financial answer. If the NPV is negative, explain the implications. If positive, highlight the value. Use LaTeX formatting for math if necessary, but keep it readable text mostly.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contextPrompt,
      });

      const text = response.text || "I apologize, I couldn't generate a response at this time.";
      setMessages(prev => [...prev, { role: 'model', text: text }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I encountered an error connecting to the financial knowledge base. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (apiKeyError) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400">
              <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
              <p>API Key not configured.</p>
          </div>
      )
  }

  return (
    <div className="flex flex-col h-[600px] bg-slate-850 rounded-xl border border-slate-700/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center gap-2">
        <Sparkles className="text-gold-500 w-5 h-5" />
        <h3 className="font-semibold text-slate-200">AI Financial Advisor</h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-700' : 'bg-gold-600'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-slate-700 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gold-600 flex items-center justify-center flex-shrink-0">
               <Loader2 className="animate-spin text-white" size={16} />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-3 text-sm text-slate-400">
              Analyzing scenario...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/50 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about NPV sensitivity, break-even..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:ring-1 focus:ring-gold-500 outline-none transition-all"
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gold-600 text-white rounded-md hover:bg-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};