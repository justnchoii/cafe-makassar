'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getCafeChatResponse } from '../../lib/cafeChat';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Halo! 👋 Saya asisten AI Cafe Makassar. Tanyakan apa saja tentang cafe di Makassar — rekomendasi, menu, suasana, atau apapun! Saya siap membantu ☕',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 400));

    const aiResponse = getCafeChatResponse(userMessage);
    setMessages(prev => [...prev, {
      role: 'ai',
      content: aiResponse,
      timestamp: new Date().toISOString()
    }]);
    setIsLoading(false);
  };

  const quickQuestions = [
    "Cafe aesthetic yang instagramable?",
    "Cafe buat kerja dengan WiFi cepat?",
    "Cafe murah tapi enak dimana?",
    "Rooftop cafe dengan view bagus?",
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 pt-24 pb-4">
        {/* Chat Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-600">AI Online</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-primary">
            🤖 AI Cafe Assistant
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Tanyakan rekomendasi cafe, menu, atau apapun tentang cafe di Makassar!
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 rounded-2xl bg-warm/50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                {msg.role === 'ai' && (
                  <p className="text-xs text-secondary font-medium mb-1">🤖 AI Assistant</p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className="text-[10px] opacity-50 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="chat-bubble-ai">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-secondary rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                  <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="whitespace-nowrap text-xs px-3 py-2 rounded-full bg-white border border-secondary/30 text-primary hover:bg-secondary/10 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya tentang cafe di Makassar..."
            className="flex-1 px-5 py-3.5 rounded-full bg-white border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-sm transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-primary px-6 disabled:opacity-50 disabled:scale-100"
          >
            {isLoading ? '⏳' : '🚀'}
          </button>
        </form>
      </div>
    </main>
  );
}
