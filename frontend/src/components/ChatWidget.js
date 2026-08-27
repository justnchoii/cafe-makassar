'use client';

import { useState, useRef, useEffect } from 'react';
import { streamCafeChat } from '../lib/chatApi';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Halo! Ada yang bisa saya bantu tentang cafe di Makassar? ☕' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const chatHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // The AI bubble is only added once the first chunk arrives, so the typing
    // indicator stays visible (instead of an empty bubble) while waiting.
    let aiMessageIndex = -1;

    await streamCafeChat({
      message: userMessage,
      history: chatHistory,
      onChunk: (_delta, fullTextSoFar) => {
        setIsLoading(false); // swap the typing dots for the live-streamed bubble
        setMessages(prev => {
          if (aiMessageIndex === -1) {
            aiMessageIndex = prev.length;
            return [...prev, { role: 'ai', content: fullTextSoFar }];
          }
          const next = [...prev];
          next[aiMessageIndex] = { role: 'ai', content: fullTextSoFar };
          return next;
        });
      },
      onError: (errMsg) => {
        setIsLoading(false);
        setMessages(prev => {
          if (aiMessageIndex === -1) {
            aiMessageIndex = prev.length;
            return [...prev, { role: 'ai', content: errMsg }];
          }
          const next = [...prev];
          next[aiMessageIndex] = { role: 'ai', content: errMsg };
          return next;
        });
      },
    });

    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-cafe text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-[28rem] glass-card flex flex-col overflow-hidden shadow-2xl animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-cafe text-white px-4 py-3 flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <div>
              <p className="text-sm font-medium">AI Assistant</p>
              <p className="text-[10px] opacity-70">Online • Siap membantu</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-cream/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-gradient-cafe text-white rounded-2xl rounded-br-md px-3 py-2 max-w-[75%]' 
                    : 'bg-white rounded-2xl rounded-bl-md px-3 py-2 max-w-[75%] shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-3 py-2 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></span>
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 px-3 py-2 rounded-full bg-warm border-none text-xs outline-none focus:ring-1 focus:ring-secondary"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-8 h-8 bg-gradient-cafe text-white rounded-full text-xs flex items-center justify-center disabled:opacity-50"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
